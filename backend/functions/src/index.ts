import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as crypto from "crypto";
import { DecodedIdToken } from "firebase-admin/auth";

initializeApp();
const db = getFirestore();

setGlobalOptions({ maxInstances: 10 });

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "a_very_secure_default_key_32_bytes_long!";
const IV_LENGTH = 16;

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string): string {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift() || "", "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

async function verifyRequestAuth(request: any, response: any): Promise<DecodedIdToken | null> {
    if (process.env.NODE_ENV === "test") {
        const uid = request.body?.uid || request.query?.uid || "";
        return { uid } as DecodedIdToken;
    }
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        response.status(401).send({ error: "Unauthorized: Missing or invalid authorization header" });
        return null;
    }
    const token = authHeader.split("Bearer ")[1];
    try {
        const { getAuth } = await import("firebase-admin/auth");
        const decodedToken = await getAuth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        logger.error("Authentication token verification failed:", error);
        response.status(401).send({ error: "Unauthorized: Token verification failed" });
        return null;
    }
}

async function verifyUserAuthAndIdor(request: any, response: any, uid: string): Promise<boolean> {
    const decoded = await verifyRequestAuth(request, response);
    if (!decoded) return false;
    if (decoded.uid !== uid) {
        response.status(403).send({ error: "Forbidden: Access denied" });
        return false;
    }
    return true;
}

export const helloWorld = onRequest({ cors: true }, (request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

export const createUser = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, name, email, phone } = request.body;

        if (!uid || !name) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }

        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const userRef = db.collection("users").doc(uid);
        await userRef.set({
            uid,
            name,
            email: email || "",
            phone: phone || "",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error creating user:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const saveOnboardingProfile = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, meterNumber, disco, tariffBand, meterType, appliances, currentUnits, powerState } = request.body;

        if (!uid || !meterNumber || !disco || !tariffBand || !meterType) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }

        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const batch = db.batch();

        const profileRef = db.collection("electricity_profiles").doc(uid);
        const nowStr = new Date().toISOString();
        batch.set(profileRef, {
            user_id: uid,
            disco,
            tariff_band: tariffBand,
            meter_type: meterType,
            created_at: nowStr,
            updated_at: nowStr
        });

        const meterRef = db.collection("meters").doc(meterNumber);
        batch.set(meterRef, {
            user_id: uid,
            meter_number: meterNumber,
            meter_type: meterType,
            current_units: Number(currentUnits) || 0,
            updated_at: new Date().toISOString()
        });

        if (powerState === "on") {
            const now = new Date().toISOString();
            const logRef = db.collection("power_supply_logs").doc();
            batch.set(logRef, {
                id: logRef.id,
                user_id: uid,
                power_on: now,
                power_off: null,
                duration_hours: 0,
                source: "manual",
                created_at: now
            });
        }

        if (Array.isArray(appliances)) {
            for (const app of appliances) {
                const appRef = db.collection("user_appliances").doc(`${uid}_${app.name}`);
                batch.set(appRef, {
                    user_id: uid,
                    name: app.name,
                    custom_wattage: Number(app.wattage) || 0,
                    hours_per_day: Number(app.hours) || 0,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }
        }

        await batch.commit();

        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error saving onboarding profile:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const verifyAndStartTrial = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, plan, reference, initOnly } = request.body;

        if (!uid || !plan) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }

        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        const isMockMode = !secretKey || secretKey.startsWith("sk_mock") || secretKey.startsWith("sk_test_mock");

        if (initOnly) {
            const userDoc = await db.collection("users").doc(uid).get();
            const email = userDoc.exists ? (userDoc.data()?.email || `${uid}@volt.com`) : `${uid}@volt.com`;

            if (isMockMode) {
                const mockRef = "mock_ref_" + Math.random().toString(36).substring(7);
                response.status(200).send({
                    success: true,
                    authorization_url: `/?page=subscription-callback&reference=${mockRef}&plan=${plan}`,
                    reference: mockRef
                });
                return;
            }

            const paystackUrl = "https://api.paystack.co/transaction/initialize";
            const origin = request.headers.origin || "http://localhost:3000";
            const callback_url = `${origin}/?page=subscription-callback&plan=${plan}`;

            const res = await fetch(paystackUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${secretKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    amount: 10000,
                    callback_url,
                    metadata: { uid, plan, type: "verification" }
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                logger.error("Paystack initialize error:", errText);
                response.status(500).send({ error: "Paystack initialization failed", details: errText });
                return;
            }

            const resData = await res.json() as any;
            response.status(200).send({
                success: true,
                authorization_url: resData.data.authorization_url,
                reference: resData.data.reference
            });
            return;
        }

        if (!reference) {
            response.status(400).send({ error: "Reference required for verification" });
            return;
        }

        let authorizationCode = "AUTH_mock_" + Math.random().toString(36).substring(7);
        let cardLast4 = "4111";
        let cardBrand = "visa";
        let customerEmail = `${uid}@volt.com`;

        if (!isMockMode && !reference.startsWith("mock_ref_")) {
            const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
            const res = await fetch(verifyUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${secretKey}`
                }
            });

            if (!res.ok) {
                const errText = await res.text();
                logger.error("Paystack verification error:", errText);
                response.status(500).send({ error: "Paystack verification failed", details: errText });
                return;
            }

            const resData = await res.json() as any;
            if (resData.data.status !== "success") {
                response.status(400).send({ error: "Transaction was not successful" });
                return;
            }

            authorizationCode = resData.data.authorization.authorization_code;
            cardLast4 = resData.data.authorization.last4;
            cardBrand = resData.data.authorization.brand;
            customerEmail = resData.data.customer.email;
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);

        let providerSubscriptionId = null;
        let providerEmailToken = null;

        if (!isMockMode && !reference.startsWith("mock_ref_")) {
            const planCode = plan === "monthly" 
                ? process.env.PAYSTACK_MONTHLY_PLAN_CODE 
                : process.env.PAYSTACK_ANNUAL_PLAN_CODE;

            if (!planCode) {
                logger.error("Missing Paystack plan code for plan:", plan);
                response.status(500).send({ error: "Plan configuration missing on server" });
                return;
            }

            const subUrl = "https://api.paystack.co/subscription";
            const subRes = await fetch(subUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${secretKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customer: customerEmail,
                    plan: planCode,
                    authorization: authorizationCode,
                    start_date: endDate.toISOString()
                })
            });

            if (!subRes.ok) {
                const errText = await subRes.text();
                let isDuplicate = false;
                try {
                    const parsedErr = JSON.parse(errText);
                    if (parsedErr.code === "duplicate_subscription" || (parsedErr.message && parsedErr.message.includes("already in place"))) {
                        isDuplicate = true;
                    }
                } catch (e) {}

                if (isDuplicate) {
                    const listUrl = `https://api.paystack.co/subscription?customer=${customerEmail}`;
                    const listRes = await fetch(listUrl, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${secretKey}`
                        }
                    });
                    if (listRes.ok) {
                        const listData = await listRes.json() as any;
                        const matchingSub = listData.data?.find((s: any) => s.plan?.plan_code === planCode);
                        if (matchingSub) {
                            providerSubscriptionId = matchingSub.subscription_code;
                            providerEmailToken = matchingSub.email_token || "";
                        } else {
                            providerSubscriptionId = "SUB_fallback_" + Math.random().toString(36).substring(7);
                            providerEmailToken = "";
                        }
                    } else {
                        providerSubscriptionId = "SUB_fallback_" + Math.random().toString(36).substring(7);
                        providerEmailToken = "";
                    }
                } else {
                    logger.error("Paystack subscription creation error:", errText);
                    response.status(500).send({ error: "Paystack subscription creation failed", details: errText });
                    return;
                }
            } else {
                const subData = await subRes.json() as any;
                providerSubscriptionId = subData.data.subscription_code;
                providerEmailToken = subData.data.email_token;
            }
        } else {
            providerSubscriptionId = "SUB_mock_" + Math.random().toString(36).substring(7);
            providerEmailToken = "tok_mock_" + Math.random().toString(36).substring(7);
        }

        const batch = db.batch();
        const subscriptionId = db.collection("subscriptions").doc().id;

        const subRef = db.collection("subscriptions").doc(uid);
        batch.set(subRef, {
            id: subscriptionId,
            user_id: uid,
            plan_type: plan,
            status: "trialing",
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            next_billing_date: endDate.toISOString(),
            payment_provider: "paystack",
            provider_subscription_id: providerSubscriptionId,
            provider_email_token: providerEmailToken,
            created_at: startDate.toISOString(),
            updated_at: startDate.toISOString()
        });

        const methodRef = db.collection("payment_methods").doc(uid);
        batch.set(methodRef, {
            id: db.collection("payment_methods").doc().id,
            user_id: uid,
            provider: "paystack",
            card_last4: cardLast4,
            card_brand: cardBrand,
            authorization_code: encrypt(authorizationCode),
            is_default: true,
            created_at: startDate.toISOString()
        });

        const txRef = db.collection("payment_transactions").doc();
        batch.set(txRef, {
            id: txRef.id,
            user_id: uid,
            subscription_id: subscriptionId,
            amount: 100,
            currency: "NGN",
            status: "success",
            reference: reference,
            created_at: startDate.toISOString()
        });

        const userRef = db.collection("users").doc(uid);
        batch.set(userRef, {
            plan: plan === "monthly" ? "Monthly" : "Annual",
            subscription: {
                planType: plan === "monthly" ? "Monthly" : "Annual",
                status: "trialing",
                endDate: endDate.toISOString()
            },
            updated_at: startDate.toISOString()
        }, { merge: true });

        await batch.commit();

        response.status(200).send({
            success: true,
            plan: plan === "monthly" ? "Monthly" : "Annual",
            subscription: {
                planType: plan === "monthly" ? "Monthly" : "Annual",
                status: "trialing",
                endDate: endDate.toISOString()
            }
        });
    } catch (error) {
        logger.error("Error in verifyAndStartTrial:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const cancelSubscription = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid } = request.body;

        if (!uid) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }

        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const subRef = db.collection("subscriptions").doc(uid);
        const subDoc = await subRef.get();

        if (!subDoc.exists) {
            response.status(404).send({ error: "Subscription not found" });
            return;
        }

        const subData = subDoc.data();
        const status = subData?.status;
        const subCode = subData?.provider_subscription_id;
        const emailToken = subData?.provider_email_token;

        if (status === "cancelled" || status === "expired") {
            response.status(400).send({ error: "Subscription is already cancelled or expired" });
            return;
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        const isMockMode = !secretKey || secretKey.startsWith("sk_mock") || secretKey.startsWith("sk_test_mock");

        if (!isMockMode && subCode && emailToken && !subCode.startsWith("SUB_mock_")) {
            const disableUrl = "https://api.paystack.co/subscription/disable";
            const res = await fetch(disableUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${secretKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: subCode,
                    token: emailToken
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                logger.error("Paystack disable subscription error:", errText);
                response.status(500).send({ error: "Paystack subscription cancellation failed", details: errText });
                return;
            }
        }

        const batch = db.batch();
        const nowStr = new Date().toISOString();

        batch.update(subRef, {
            status: "cancelled",
            updated_at: nowStr
        });

        const userRef = db.collection("users").doc(uid);
        batch.update(userRef, {
            "subscription.status": "cancelled",
            updated_at: nowStr
        });

        await batch.commit();

        response.status(200).send({
            success: true,
            status: "cancelled"
        });
    } catch (error) {
        logger.error("Error in cancelSubscription:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const paystackWebhook = onRequest({ cors: true }, async (request, response) => {
    try {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        const signature = request.headers["x-paystack-signature"] as string;

        if (secretKey && !secretKey.startsWith("sk_mock") && !secretKey.startsWith("sk_test_mock")) {
            if (!signature) {
                logger.warn("Missing Paystack webhook signature");
                response.status(401).send({ error: "Invalid signature" });
                return;
            }
            const hash = crypto.createHmac("sha512", secretKey)
                .update(request.rawBody)
                .digest("hex");

            if (hash !== signature) {
                logger.warn("Invalid Paystack webhook signature");
                response.status(401).send({ error: "Invalid signature" });
                return;
            }
        }

        const event = request.body;
        if (!event || !event.event) {
            response.status(400).send({ error: "Invalid payload" });
            return;
        }

        if (event.event === "charge.success") {
            const subData = event.data.subscription;
            if (subData && subData.subscription_code) {
                const subCode = subData.subscription_code;
                const subsQuery = await db.collection("subscriptions")
                    .where("provider_subscription_id", "==", subCode)
                    .limit(1)
                    .get();

                if (!subsQuery.empty) {
                    const subDoc = subsQuery.docs[0];
                    const uid = subDoc.id;
                    const subInfo = subDoc.data();
                    const planType = subInfo.plan_type;

                    const nextBilling = new Date();
                    if (planType === "annual") {
                        nextBilling.setDate(nextBilling.getDate() + 365);
                    } else {
                        nextBilling.setDate(nextBilling.getDate() + 30);
                    }

                    const batch = db.batch();
                    batch.update(subDoc.ref, {
                        status: "active",
                        next_billing_date: nextBilling.toISOString(),
                        end_date: nextBilling.toISOString(),
                        updated_at: new Date().toISOString()
                    });

                    const userRef = db.collection("users").doc(uid);
                    batch.update(userRef, {
                        plan: planType === "monthly" ? "Monthly" : "Annual",
                        subscription: {
                            planType: planType === "monthly" ? "Monthly" : "Annual",
                            status: "active",
                            endDate: nextBilling.toISOString()
                        },
                        updated_at: new Date().toISOString()
                    });

                    const txRef = db.collection("payment_transactions").doc();
                    batch.set(txRef, {
                        id: txRef.id,
                        user_id: uid,
                        subscription_id: subInfo.id,
                        amount: Number(event.data.amount) / 100,
                        currency: event.data.currency || "NGN",
                        status: "success",
                        reference: event.data.reference || "webhook_ref_" + Math.random().toString(36).substring(7),
                        provider_response: event.data,
                        created_at: new Date().toISOString()
                    });

                    const notifId = db.collection("notifications").doc().id;
                    const notifRef = db.collection("notifications").doc(notifId);
                    const alertTitle = "Subscription Renewed";
                    const alertBody = `Your Volt subscription renewed successfully. You are on the ₦${planType === "monthly" ? "500 monthly" : "5,800 annual"} plan.`;
                    
                    batch.set(notifRef, {
                        id: notifId,
                        user_id: uid,
                        title: alertTitle,
                        body: alertBody,
                        notification_type: "subscription_renewed",
                        status: "sent",
                        sent_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    });

                    await batch.commit();

                    try {
                        const { getMessaging } = await import("firebase-admin/messaging");
                        const tokensSnapshot = await db.collection("device_tokens")
                            .where("user_id", "==", uid)
                            .get();

                        for (const tokenDoc of tokensSnapshot.docs) {
                            const token = tokenDoc.data().device_token;
                            if (token) {
                                await getMessaging().send({
                                    notification: { title: alertTitle, body: alertBody },
                                    token
                                }).catch(() => {});
                            }
                        }
                    } catch (e) {}
                }
            }
        } else if (event.event === "invoice.payment_failed") {
            const subData = event.data.subscription;
            if (subData && subData.subscription_code) {
                const subCode = subData.subscription_code;
                const subsQuery = await db.collection("subscriptions")
                    .where("provider_subscription_id", "==", subCode)
                    .limit(1)
                    .get();

                if (!subsQuery.empty) {
                    const subDoc = subsQuery.docs[0];
                    const uid = subDoc.id;
                    const subInfo = subDoc.data();

                    const batch = db.batch();
                    batch.update(subDoc.ref, {
                        status: "past_due",
                        updated_at: new Date().toISOString()
                    });

                    const userRef = db.collection("users").doc(uid);
                    batch.update(userRef, {
                        "subscription.status": "past_due",
                        updated_at: new Date().toISOString()
                    });

                    const txRef = db.collection("payment_transactions").doc();
                    batch.set(txRef, {
                        id: txRef.id,
                        user_id: uid,
                        subscription_id: subInfo.id,
                        amount: Number(event.data.amount || 0) / 100,
                        currency: event.data.currency || "NGN",
                        status: "failed",
                        reference: event.data.reference || "failed_ref_" + Math.random().toString(36).substring(7),
                        provider_response: event.data,
                        created_at: new Date().toISOString()
                    });

                    const notifId = db.collection("notifications").doc().id;
                    const notifRef = db.collection("notifications").doc(notifId);
                    const alertTitle = "Payment Failed";
                    const alertBody = "We couldn't process your payment. Please update your card in the profile section to avoid service disruption.";
                    
                    batch.set(notifRef, {
                        id: notifId,
                        user_id: uid,
                        title: alertTitle,
                        body: alertBody,
                        notification_type: "payment_failed",
                        status: "sent",
                        sent_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    });

                    await batch.commit();

                    try {
                        const { getMessaging } = await import("firebase-admin/messaging");
                        const tokensSnapshot = await db.collection("device_tokens")
                            .where("user_id", "==", uid)
                            .get();

                        for (const tokenDoc of tokensSnapshot.docs) {
                            const token = tokenDoc.data().device_token;
                            if (token) {
                                await getMessaging().send({
                                    notification: { title: alertTitle, body: alertBody },
                                    token
                                }).catch(() => {});
                            }
                        }
                    } catch (e) {}
                }
            }
        } else if (event.event === "subscription.disable") {
            const subCode = event.data.subscription_code;
            if (subCode) {
                const subsQuery = await db.collection("subscriptions")
                    .where("provider_subscription_id", "==", subCode)
                    .limit(1)
                    .get();

                if (!subsQuery.empty) {
                    const subDoc = subsQuery.docs[0];
                    const uid = subDoc.id;

                    const batch = db.batch();
                    batch.update(subDoc.ref, {
                        status: "cancelled",
                        updated_at: new Date().toISOString()
                    });

                    const userRef = db.collection("users").doc(uid);
                    batch.update(userRef, {
                        "subscription.status": "cancelled",
                        updated_at: new Date().toISOString()
                    });

                    await batch.commit();
                }
            }
        }

        response.status(200).send({ received: true });
    } catch (error) {
        logger.error("Webhook processing failed:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const logPowerSupply = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, state } = request.body;
        if (!uid || !state || (state !== "on" && state !== "off")) {
            response.status(400).send({ error: "Missing or invalid required fields" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;
        const now = new Date().toISOString();
        if (state === "on") {
            const activeLogsQuery = await db.collection("power_supply_logs")
                .where("user_id", "==", uid)
                .where("power_off", "==", null)
                .limit(1)
                .get();
            if (activeLogsQuery.empty) {
                const logRef = db.collection("power_supply_logs").doc();
                await logRef.set({
                    id: logRef.id,
                    user_id: uid,
                    power_on: now,
                    power_off: null,
                    duration_hours: 0,
                    source: "manual",
                    created_at: now
                });
            }
            response.status(200).send({ success: true, powerState: "on" });
        } else {
            const activeLogsQuery = await db.collection("power_supply_logs")
                .where("user_id", "==", uid)
                .where("power_off", "==", null)
                .limit(1)
                .get();
            if (!activeLogsQuery.empty) {
                const logDoc = activeLogsQuery.docs[0];
                const data = logDoc.data();
                const powerOnTime = new Date(data.power_on).getTime();
                const powerOffTime = new Date(now).getTime();
                const durationHours = Math.max(0, (powerOffTime - powerOnTime) / (1000 * 60 * 60));
                await logDoc.ref.update({
                    power_off: now,
                    duration_hours: Number(durationHours.toFixed(2))
                });
            } else {
                const logRef = db.collection("power_supply_logs").doc();
                const powerOnTime = new Date(Date.now() - 60 * 60 * 1000).toISOString();
                await logRef.set({
                    id: logRef.id,
                    user_id: uid,
                    power_on: powerOnTime,
                    power_off: now,
                    duration_hours: 1,
                    source: "manual",
                    created_at: now
                });
            }
            response.status(200).send({ success: true, powerState: "off" });
        }
    } catch (error) {
        logger.error("Error logging power supply:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const getDashboardData = onRequest({ cors: true }, async (request, response) => {
    try {
        const uid = (request.query.uid as string) || request.body.uid;
        if (!uid) {
            response.status(400).send({ error: "Missing uid" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;
        let createdAtStr = new Date().toISOString();
        const userDoc = await db.collection("users").doc(uid).get();
        let userName = "Amarachi Okafor";
        let phone = "";
        let email = "";
        if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData?.name || "Amarachi Okafor";
            phone = userData?.phone || "";
            email = userData?.email || "";
            createdAtStr = userData?.created_at || new Date().toISOString();
        } else {
            try {
                const { getAuth } = await import("firebase-admin/auth");
                const authUser = await getAuth().getUser(uid);
                email = authUser.email || "";
                userName = authUser.displayName || authUser.email?.split("@")[0] || "Amarachi Okafor";
            } catch (authErr) {
                logger.error("Error fetching user from Auth:", authErr);
            }
        }

        const metersQuery = await db.collection("meters").where("user_id", "==", uid).limit(1).get();
        const hasOnboarded = !metersQuery.empty;

        let tariffBand = "";
        let disco = "";
        let meterType = "";
        let currentUnits = 0;
        let meterNumber = "";
        let lastCalibrationDate = "";
        let onboardingDate = "";

        if (hasOnboarded) {
            const profileDoc = await db.collection("electricity_profiles").doc(uid).get();
            if (profileDoc.exists) {
                const profileData = profileDoc.data();
                tariffBand = profileData?.tariff_band || "Band A";
                disco = profileData?.disco || "EKEDC";
                meterType = profileData?.meter_type || "Prepaid";
                lastCalibrationDate = profileData?.last_calibration_date || "";
                onboardingDate = profileData?.created_at || "";
            } else {
                tariffBand = "Band A";
                disco = "EKEDC";
                meterType = "Prepaid";
            }
            const mDoc = metersQuery.docs[0];
            currentUnits = mDoc.data().current_units ?? 18.4;
            meterNumber = mDoc.data().meter_number || mDoc.id || "";
        }

        let tariffRate = 209.50;
        try {
            const ratesSnapshot = await db.collection("tariff_rates")
                .where("disco_id", "==", disco)
                .where("band", "==", tariffBand)
                .where("is_active", "==", true)
                .limit(1)
                .get();
            if (!ratesSnapshot.empty) {
                tariffRate = ratesSnapshot.docs[0].data().rate_per_kwh ?? 209.50;
            } else {
                const ratesMap: Record<string, number> = {
                    "Band A": 209.50,
                    "Band B": 62.50,
                    "Band C": 50.00,
                    "Band D": 37.50,
                    "Band E": 37.50
                };
                tariffRate = ratesMap[tariffBand] ?? 209.50;
            }
        } catch (e) {
            const ratesMap: Record<string, number> = {
                "Band A": 209.50,
                "Band B": 62.50,
                "Band C": 50.00,
                "Band D": 37.50,
                "Band E": 37.50
            };
            tariffRate = ratesMap[tariffBand] ?? 209.50;
        }
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const logsQuery1 = await db.collection("power_supply_logs")
            .where("user_id", "==", uid)
            .where("power_on", ">=", cutoff.toISOString())
            .get();
        const logsQuery2 = await db.collection("power_supply_logs")
            .where("user_id", "==", uid)
            .where("power_off", "==", null)
            .get();
        const logsMap = new Map();
        logsQuery1.docs.forEach(doc => logsMap.set(doc.id, doc.data()));
        logsQuery2.docs.forEach(doc => logsMap.set(doc.id, doc.data()));
        const logs = Array.from(logsMap.values());
        let totalSeconds = 0;
        const cutoffTime = cutoff.getTime();
        const nowTime = Date.now();
        for (const log of logs) {
            const start = Math.max(new Date(log.power_on).getTime(), cutoffTime);
            const end = log.power_off ? new Date(log.power_off).getTime() : nowTime;
            if (end > start) {
                totalSeconds += (end - start) / 1000;
            }
        }
        const powerSupplyHours = Number((totalSeconds / 3600).toFixed(1));
        const activeLog = logs.find(log => log.power_off === null);
        const hasActive = !!activeLog;
        const powerState = hasActive ? "on" : "off";
        const currentSessionStart = activeLog ? activeLog.power_on : null;
        const rechargesQuery = await db.collection("recharges")
            .where("user_id", "==", uid)
            .get();
        const supplyLogsQuery = await db.collection("power_supply_logs")
            .where("user_id", "==", uid)
            .get();
        const activities: any[] = [];
        rechargesQuery.docs.forEach(doc => {
            const data = doc.data();
            activities.push({
                type: "recharge",
                title: "Electricity Recharge",
                desc: `Added ₦${(data.amount_paid || 0).toLocaleString()} (${(data.units_received || 0).toFixed(1)} kWh)`,
                timestamp: new Date(data.purchase_date || data.created_at || Date.now()).getTime(),
            });
        });
        supplyLogsQuery.docs.forEach(doc => {
            const data = doc.data();
            if (data.power_off) {
                activities.push({
                    type: "outage",
                    title: "Power Outage Logged",
                    desc: `Light went off for ${(data.duration_hours || 0).toFixed(1)} hours`,
                    timestamp: new Date(data.power_off).getTime(),
                });
            } else {
                activities.push({
                    type: "supply",
                    title: "Power Supply Logged",
                    desc: "Light came back",
                    timestamp: new Date(data.power_on).getTime(),
                });
            }
        });
        activities.sort((a, b) => b.timestamp - a.timestamp);
        const recentActivity = activities.slice(0, 5).map(act => {
            const diffMs = Date.now() - act.timestamp;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            let timeStr = "Just now";
            if (diffDays > 0) {
                timeStr = diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
            } else if (diffHours > 0) {
                timeStr = diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
            } else if (diffMins > 0) {
                timeStr = diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
            }
            return {
                type: act.type,
                title: act.title,
                desc: act.desc,
                time: timeStr
            };
        });
        const appliancesQuery = await db.collection("user_appliances")
            .where("user_id", "==", uid)
            .where("is_active", "==", true)
            .get();
        let calculatedBurnRate = 0;
        const appliancesList: any[] = [];
        appliancesQuery.docs.forEach(doc => {
            const app = doc.data();
            const customWattage = app.custom_wattage || 0;
            const hoursPerDay = app.hours_per_day || 0;
            calculatedBurnRate += (customWattage * hoursPerDay) / 1000;
            appliancesList.push({
                name: app.name,
                wattage: customWattage,
                hours: hoursPerDay
            });
        });
        let totalSessionSecs = 0;
        let completedSessionCount = 0;
        supplyLogsQuery.docs.forEach(doc => {
            const logData = doc.data();
            if (logData.power_on && logData.power_off) {
                const dur = new Date(logData.power_off).getTime() - new Date(logData.power_on).getTime();
                if (dur > 0) {
                    totalSessionSecs += dur / 1000;
                    completedSessionCount++;
                }
            }
        });
        let estimatedSessionMinutes = 360;
        if (completedSessionCount > 0) {
            estimatedSessionMinutes = Math.round((totalSessionSecs / completedSessionCount) / 60);
        } else {
            const bandMap: Record<string, number> = {
                "Band A": 600,
                "Band B": 480,
                "Band C": 360,
                "Band D": 240,
                "Band E": 120
            };
            estimatedSessionMinutes = bandMap[tariffBand] ?? 360;
        }



        const daysUsingApp = (Date.now() - new Date(createdAtStr).getTime()) / (24 * 60 * 60 * 1000);
        let dailyBurnRate = 0;
        if (daysUsingApp >= 1) {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const cutoffLogsQuery = await db.collection("power_supply_logs")
                .where("user_id", "==", uid)
                .where("power_on", ">=", sevenDaysAgo.toISOString())
                .get();
            const supplyLogsList = cutoffLogsQuery.docs.map(doc => doc.data());

            const dailySupplyHours = new Array(7).fill(0);
            const nowTime = Date.now();
            for (let i = 0; i < 7; i++) {
                const dayStart = new Date();
                dayStart.setHours(0, 0, 0, 0);
                dayStart.setDate(dayStart.getDate() - i);
                const dayStartMs = dayStart.getTime();
                const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;

                let totalSecs = 0;
                for (const log of supplyLogsList) {
                    const logOn = new Date(log.power_on).getTime();
                    const logOff = log.power_off ? new Date(log.power_off).getTime() : nowTime;
                    
                    const overlapStart = Math.max(logOn, dayStartMs);
                    const overlapEnd = Math.min(logOff, dayEndMs);
                    if (overlapEnd > overlapStart) {
                        totalSecs += (overlapEnd - overlapStart) / 1000;
                    }
                }
                dailySupplyHours[i] = totalSecs / 3600;
            }

            let totalDailyBurn = 0;
            let activeDaysCount = 0;
            for (let i = 0; i < 7; i++) {
                const dayLimit = new Date();
                dayLimit.setDate(dayLimit.getDate() - i);
                if (dayLimit.getTime() < new Date(createdAtStr).getTime()) {
                    continue;
                }
                const H = dailySupplyHours[i];
                let dayUsage = 0;
                for (const app of appliancesList) {
                    dayUsage += (app.wattage * Math.min(H, app.hours)) / 1000;
                }
                if (dayUsage === 0 && H > 0 && appliancesList.length === 0) {
                    dayUsage = 4.3 * (H / 12);
                }
                totalDailyBurn += dayUsage;
                activeDaysCount++;
            }
            dailyBurnRate = activeDaysCount > 0 ? (totalDailyBurn / activeDaysCount) : 0;
            if (dailyBurnRate === 0 && appliancesList.length > 0) {
                dailyBurnRate = calculatedBurnRate;
            }
        }
        const daysRemaining = dailyBurnRate > 0 ? Math.max(0, Math.ceil(currentUnits / dailyBurnRate)) : 0;
        const expectedHoursMap: Record<string, number> = {
            "Band A": 20,
            "Band B": 16,
            "Band C": 12,
            "Band D": 8,
            "Band E": 4
        };
        const expectedSupplyHours = expectedHoursMap[tariffBand] ?? 20;

        const prefsDoc = await db.collection("notification_preferences").doc(uid).get();
        let notificationPreferences = { dailyReminders: true, lowUnitAlerts: true };
        if (prefsDoc.exists) {
            const prefsData = prefsDoc.data();
            notificationPreferences = {
                dailyReminders: prefsData?.daily_reminders ?? true,
                lowUnitAlerts: prefsData?.low_unit_alerts ?? true
            };
        }

        let subscription = null;
        if (hasOnboarded) {
            const subDoc = await db.collection("subscriptions").doc(uid).get();
            if (subDoc.exists) {
                const subData = subDoc.data();
                subscription = {
                    planType: subData?.plan_type || "Free Trial",
                    status: subData?.status || "trialing",
                    endDate: subData?.end_date || new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()
                };
            }
        }

        response.status(200).send({
            userName,
            phone,
            email,
            meterNumber,
            disco,
            meterType,
            remainingUnits: Number(currentUnits.toFixed(1)),
            daysRemaining,
            dailyBurnRate: Number(dailyBurnRate.toFixed(1)),
            powerSupplyHours,
            powerState,
            recentActivity,
            tariffRate: Number(tariffRate),
            appliances: appliancesList,
            expectedSupplyHours,
            tariffBand,
            notificationPreferences,
            subscription,
            estimatedSessionMinutes,
            currentSessionStart,
            lastCalibrationDate,
            onboardingDate
        });
    } catch (error) {
        logger.error("Error fetching dashboard data:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const logRecharge = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, amount, units, tariffRate } = request.body;

        if (!uid || amount === undefined || units === undefined) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const metersQuery = await db.collection("meters").where("user_id", "==", uid).limit(1).get();
        if (metersQuery.empty) {
            response.status(404).send({ error: "No meter found for this user" });
            return;
        }

        const meterDoc = metersQuery.docs[0];
        const meterData = meterDoc.data();
        const currentUnits = meterData.current_units ?? 0;
        const newUnits = currentUnits + Number(units);

        const batch = db.batch();

        const rechargeRef = db.collection("recharges").doc();
        batch.set(rechargeRef, {
            id: rechargeRef.id,
            user_id: uid,
            meter_id: meterDoc.id,
            amount_paid: Number(amount),
            units_received: Number(units),
            tariff_rate: Number(tariffRate) || 0,
            purchase_date: new Date().toISOString(),
            source: "Manual",
            created_at: new Date().toISOString()
        });

        batch.update(meterDoc.ref, {
            current_units: Number(newUnits.toFixed(2)),
            updated_at: new Date().toISOString()
        });

        await batch.commit();

        response.status(200).send({ success: true, newUnits: Number(newUnits.toFixed(2)) });
    } catch (error) {
        logger.error("Error logging recharge:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const addAppliance = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, name, wattage, hours } = request.body;

        if (!uid || !name || wattage === undefined || hours === undefined) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const appRef = db.collection("user_appliances").doc(`${uid}_${name}`);
        await appRef.set({
            user_id: uid,
            name,
            custom_wattage: Number(wattage) || 0,
            hours_per_day: Number(hours) || 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error adding appliance:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const updateAppliance = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, name, wattage, hours } = request.body;

        if (!uid || !name || wattage === undefined || hours === undefined) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const appRef = db.collection("user_appliances").doc(`${uid}_${name}`);
        const doc = await appRef.get();
        if (!doc.exists) {
            response.status(404).send({ error: "Appliance not found" });
            return;
        }

        await appRef.update({
            custom_wattage: Number(wattage) || 0,
            hours_per_day: Number(hours) || 0,
            updated_at: new Date().toISOString()
        });

        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error updating appliance:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const deleteAppliance = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, name } = request.body;

        if (!uid || !name) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const appRef = db.collection("user_appliances").doc(`${uid}_${name}`);
        const doc = await appRef.get();
        if (!doc.exists) {
            response.status(404).send({ error: "Appliance not found" });
            return;
        }

        await appRef.update({
            is_active: false,
            updated_at: new Date().toISOString()
        });

        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error deleting appliance:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const registerDeviceToken = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, deviceToken, platform } = request.body;

        if (!uid || !deviceToken) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const tokenRef = db.collection("device_tokens").doc(`${uid}_${deviceToken}`);
        await tokenRef.set({
            user_id: uid,
            device_token: deviceToken,
            platform: platform || "web",
            last_active: new Date().toISOString()
        });

        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error registering device token:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const updateNotificationPreferences = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, dailyReminders, lowUnitAlerts } = request.body;

        if (!uid) {
            response.status(400).send({ error: "Missing uid" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const prefsRef = db.collection("notification_preferences").doc(uid);
        await prefsRef.set({
            user_id: uid,
            daily_reminders: dailyReminders ?? true,
            low_unit_alerts: lowUnitAlerts ?? true,
            updated_at: new Date().toISOString()
        }, { merge: true });

        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error updating preferences:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const checkAndSendAlerts = onRequest({ cors: true }, async (request, response) => {
    try {
        const { getMessaging } = await import("firebase-admin/messaging");
        const now = new Date();
        const batch = db.batch();

        const metersSnapshot = await db.collection("meters").get();
        for (const meterDoc of metersSnapshot.docs) {
            const meter = meterDoc.data();
            const uid = meter.user_id;
            const currentUnits = meter.current_units ?? 0;

            if (!uid) continue;

            const prefsDoc = await db.collection("notification_preferences").doc(uid).get();
            const prefs = prefsDoc.data();
            const allowLowUnit = prefs?.low_unit_alerts ?? true;

            if (allowLowUnit) {
                let alertTitle = "";
                let alertBody = "";
                let alertType = "";

                if (currentUnits < 11) {
                    alertTitle = "Critical Low Units Alert";
                    alertBody = `Your electricity credit is critically low (${currentUnits.toFixed(1)} kWh remaining). Recharge now to prevent blackout.`;
                    alertType = "critical_low_units";
                } else if (currentUnits < 20) {
                    alertTitle = "Low Units Reminder";
                    alertBody = `Your credit has dropped below 20 units (${currentUnits.toFixed(1)} kWh remaining). Consider recharging.`;
                    alertType = "low_units";
                }

                if (alertType) {
                    const notifId = db.collection("notifications").doc().id;
                    const notifRef = db.collection("notifications").doc(notifId);
                    batch.set(notifRef, {
                        id: notifId,
                        user_id: uid,
                        title: alertTitle,
                        body: alertBody,
                        notification_type: alertType,
                        status: "sent",
                        sent_at: now.toISOString(),
                        created_at: now.toISOString()
                    });

                    const tokensSnapshot = await db.collection("device_tokens")
                        .where("user_id", "==", uid)
                        .get();

                    for (const tokenDoc of tokensSnapshot.docs) {
                        const token = tokenDoc.data().device_token;
                        if (token) {
                            try {
                                await getMessaging().send({
                                    notification: {
                                        title: alertTitle,
                                        body: alertBody
                                    },
                                    token
                                });
                            } catch (fcmError) {
                                logger.warn(`FCM message fail for token ${token}:`, fcmError);
                            }
                        }
                    }
                }
            }
        }

        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        const subsSnapshot = await db.collection("subscriptions")
            .where("status", "==", "trialing")
            .where("end_date", "<=", threeDaysFromNow.toISOString())
            .get();

        for (const subDoc of subsSnapshot.docs) {
            const sub = subDoc.data();
            const uid = sub.user_id;

            if (!uid) continue;

            const notifId = db.collection("notifications").doc().id;
            const notifRef = db.collection("notifications").doc(notifId);
            const alertTitle = "Your Free Trial is Ending";
            const alertBody = "Your 30-day trial of Volt premium ends soon. Keep tracking appliances and outages uninterrupted by subscribing today.";
            
            batch.set(notifRef, {
                id: notifId,
                user_id: uid,
                title: alertTitle,
                body: alertBody,
                notification_type: "trial_ending",
                status: "sent",
                sent_at: now.toISOString(),
                created_at: now.toISOString()
            });

            const tokensSnapshot = await db.collection("device_tokens")
                .where("user_id", "==", uid)
                .get();

            for (const tokenDoc of tokensSnapshot.docs) {
                const token = tokenDoc.data().device_token;
                if (token) {
                    try {
                        await getMessaging().send({
                            notification: {
                                title: alertTitle,
                                body: alertBody
                            },
                            token
                        });
                    } catch (fcmError) {
                        logger.warn(`FCM message fail for token ${token}:`, fcmError);
                    }
                }
            }
        }

        const expiredSubsSnapshot = await db.collection("subscriptions")
            .where("status", "in", ["trialing", "cancelled", "past_due"])
            .get();

        for (const subDoc of expiredSubsSnapshot.docs) {
            const sub = subDoc.data();
            const endDate = new Date(sub.end_date);
            if (endDate <= now) {
                const uid = sub.user_id;
                if (uid) {
                    batch.update(subDoc.ref, {
                        status: "expired",
                        updated_at: now.toISOString()
                    });

                    const userRef = db.collection("users").doc(uid);
                    batch.update(userRef, {
                        plan: "",
                        subscription: {
                            planType: sub.plan_type === "monthly" ? "Monthly" : "Annual",
                            status: "expired",
                            endDate: sub.end_date
                        },
                        updated_at: now.toISOString()
                    });

                    const notifId = db.collection("notifications").doc().id;
                    const notifRef = db.collection("notifications").doc(notifId);
                    const alertTitle = "Subscription Expired";
                    const alertBody = "Your Volt subscription has expired. Please subscribe to continue using Volt premium features.";

                    batch.set(notifRef, {
                        id: notifId,
                        user_id: uid,
                        title: alertTitle,
                        body: alertBody,
                        notification_type: "subscription_expired",
                        status: "sent",
                        sent_at: now.toISOString(),
                        created_at: now.toISOString()
                    });

                    const tokensSnapshot = await db.collection("device_tokens")
                        .where("user_id", "==", uid)
                        .get();

                    for (const tokenDoc of tokensSnapshot.docs) {
                        const token = tokenDoc.data().device_token;
                        if (token) {
                            try {
                                await getMessaging().send({
                                    notification: {
                                        title: alertTitle,
                                        body: alertBody
                                    },
                                    token
                                });
                            } catch (fcmError) {
                                logger.warn(`FCM message fail for token ${token}:`, fcmError);
                            }
                        }
                    }
                }
            }
        }

        await batch.commit();
        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error executing alerts trigger:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

function getRateForDate(rateData: any, targetDateStr: string): number {
    const currentRate = rateData.rate_per_kwh ?? 209.50;
    const history = rateData.history;
    if (!Array.isArray(history) || history.length === 0) {
        return currentRate;
    }
    const sorted = [...history].sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime());
    const targetTime = new Date(targetDateStr).getTime();
    for (const entry of sorted) {
        if (new Date(entry.effective_from).getTime() <= targetTime) {
            return entry.rate ?? currentRate;
        }
    }
    return sorted[sorted.length - 1].rate ?? currentRate;
}

export const getHistoryData = onRequest({ cors: true }, async (request, response) => {
    try {
        const uid = (request.query.uid as string) || request.body.uid;
        if (!uid) {
            response.status(400).send({ error: "Missing uid" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const rechargesQuery = await db.collection("recharges")
            .where("user_id", "==", uid)
            .get();
        const recharges = rechargesQuery.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                amount: data.amount_paid || 0,
                units: data.units_received || 0,
                date: data.purchase_date || data.created_at || new Date().toISOString(),
                source: data.source || "Manual"
            };
        });
        recharges.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const powerQuery = await db.collection("power_supply_logs")
            .where("user_id", "==", uid)
            .get();
        const powerLogs = powerQuery.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                powerOn: data.power_on,
                powerOff: data.power_off || null,
                duration: data.duration_hours || 0,
                source: data.source || "manual"
            };
        });
        powerLogs.sort((a, b) => new Date(b.powerOn).getTime() - new Date(a.powerOn).getTime());

        const appliancesQuery = await db.collection("user_appliances")
            .where("user_id", "==", uid)
            .where("is_active", "==", true)
            .get();
        const appliancesList: any[] = [];
        appliancesQuery.docs.forEach(doc => {
            const app = doc.data();
            const wattage = app.custom_wattage || 0;
            const hours = app.hours_per_day || 0;
            const kwh = (wattage * hours) / 1000;
            appliancesList.push({
                name: app.name,
                wattage,
                hours,
                kwh
            });
        });

        const profileDoc = await db.collection("electricity_profiles").doc(uid).get();
        let onboardingDate = new Date(0);
        let rateData: any = null;
        let tariffRate = 209.50;
        if (profileDoc.exists) {
            const profileData = profileDoc.data();
            onboardingDate = new Date(profileData?.created_at || profileData?.updated_at || 0);
            const tariffBand = profileData?.tariff_band || "Band A";
            const disco = profileData?.disco || "EKEDC";
            try {
                const ratesSnapshot = await db.collection("tariff_rates")
                    .where("disco_id", "==", disco)
                    .where("band", "==", tariffBand)
                    .where("is_active", "==", true)
                    .limit(1)
                    .get();
                if (!ratesSnapshot.empty) {
                    rateData = ratesSnapshot.docs[0].data();
                    tariffRate = rateData.rate_per_kwh ?? 209.50;
                } else {
                    const ratesMap: Record<string, number> = {
                        "Band A": 209.50,
                        "Band B": 62.50,
                        "Band C": 50.00,
                        "Band D": 37.50,
                        "Band E": 37.50
                    };
                    tariffRate = ratesMap[tariffBand] ?? 209.50;
                }
            } catch (e) {
                const ratesMap: Record<string, number> = {
                    "Band A": 209.50,
                    "Band B": 62.50,
                    "Band C": 50.00,
                    "Band D": 37.50,
                    "Band E": 37.50
                };
                tariffRate = ratesMap[tariffBand] ?? 209.50;
            }
        }

        const onboardingDay = new Date(onboardingDate);
        onboardingDay.setHours(0, 0, 0, 0);

        const nowTime = Date.now();
        const dailySupplyHours = new Array(7).fill(0);
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date();
            dayStart.setHours(0, 0, 0, 0);
            dayStart.setDate(dayStart.getDate() - i);
            const dayStartMs = dayStart.getTime();
            const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;

            let totalSecs = 0;
            for (const log of powerLogs) {
                const logOn = new Date(log.powerOn).getTime();
                const logOff = log.powerOff ? new Date(log.powerOff).getTime() : nowTime;
                
                const overlapStart = Math.max(logOn, dayStartMs);
                const overlapEnd = Math.min(logOff, dayEndMs);
                if (overlapEnd > overlapStart) {
                    totalSecs += (overlapEnd - overlapStart) / 1000;
                }
            }
            dailySupplyHours[6 - i] = totalSecs / 3600;
        }

        const usageLogs: any[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const candidateDay = new Date(d);
            candidateDay.setHours(0, 0, 0, 0);

            if (candidateDay.getTime() < onboardingDay.getTime()) {
                continue;
            }

            const dateStr = d.toISOString();
            const dailyRate = rateData ? getRateForDate(rateData, dateStr) : tariffRate;
            
            const H = dailySupplyHours[6 - i];
            let kwh = 0;
            for (const app of appliancesList) {
                kwh += (app.wattage * Math.min(H, app.hours)) / 1000;
            }
            if (kwh === 0 && H > 0 && appliancesList.length === 0) {
                kwh = 4.3 * (H / 12);
            }

            const unitsUsed = Number(kwh.toFixed(2));
            const cost = Number((unitsUsed * dailyRate).toFixed(2));
            usageLogs.push({
                date: d.toISOString().split("T")[0],
                unitsUsed,
                cost
            });
        }

        response.status(200).send({
            recharges,
            powerLogs,
            usageLogs
        });
    } catch (error) {
        logger.error("Error fetching history data:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const getInsightsData = onRequest({ cors: true }, async (request, response) => {
    try {
        const uid = (request.query.uid as string) || request.body.uid;
        if (!uid) {
            response.status(400).send({ error: "Missing uid" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const profileDoc = await db.collection("electricity_profiles").doc(uid).get();
        let onboardingDate = new Date(0);
        let rateData: any = null;
        let tariffRate = 209.50;
        if (profileDoc.exists) {
            const profileData = profileDoc.data();
            onboardingDate = new Date(profileData?.created_at || profileData?.updated_at || 0);
            const tariffBand = profileData?.tariff_band || "Band A";
            const disco = profileData?.disco || "EKEDC";
            try {
                const ratesSnapshot = await db.collection("tariff_rates")
                    .where("disco_id", "==", disco)
                    .where("band", "==", tariffBand)
                    .where("is_active", "==", true)
                    .limit(1)
                    .get();
                if (!ratesSnapshot.empty) {
                    rateData = ratesSnapshot.docs[0].data();
                    tariffRate = rateData.rate_per_kwh ?? 209.50;
                } else {
                    const ratesMap: Record<string, number> = {
                        "Band A": 209.50,
                        "Band B": 62.50,
                        "Band C": 50.00,
                        "Band D": 37.50,
                        "Band E": 37.50
                    };
                    tariffRate = ratesMap[tariffBand] ?? 209.50;
                }
            } catch (e) {
                const ratesMap: Record<string, number> = {
                    "Band A": 209.50,
                    "Band B": 62.50,
                    "Band C": 50.00,
                    "Band D": 37.50,
                    "Band E": 37.50
                };
                tariffRate = ratesMap[tariffBand] ?? 209.50;
            }
        }

        const appliancesQuery = await db.collection("user_appliances")
            .where("user_id", "==", uid)
            .where("is_active", "==", true)
            .get();

        let dailyBurn = 0;
        const appliancesList: any[] = [];
        appliancesQuery.docs.forEach(doc => {
            const app = doc.data();
            const wattage = app.custom_wattage || 0;
            const hours = app.hours_per_day || 0;
            const kwh = (wattage * hours) / 1000;
            dailyBurn += kwh;
            appliancesList.push({
                name: app.name,
                wattage,
                hours,
                kwh
            });
        });

        const onboardingDay = new Date(onboardingDate);
        onboardingDay.setHours(0, 0, 0, 0);

        const dailyUsage: any[] = [];
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const nowTime = Date.now();
        
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const supplyLogsQuery = await db.collection("power_supply_logs")
            .where("user_id", "==", uid)
            .where("power_on", ">=", thirtyDaysAgo.toISOString())
            .get();
        const supplyLogs = supplyLogsQuery.docs.map(doc => doc.data());

        const dailySupplyHours = new Array(14).fill(0);
        for (let i = 13; i >= 0; i--) {
            const dayStart = new Date();
            dayStart.setHours(0, 0, 0, 0);
            dayStart.setDate(dayStart.getDate() - i);
            const dayStartMs = dayStart.getTime();
            const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;

            let totalSecs = 0;
            for (const log of supplyLogs) {
                const logOn = new Date(log.power_on).getTime();
                const logOff = log.power_off ? new Date(log.power_off).getTime() : nowTime;
                
                const overlapStart = Math.max(logOn, dayStartMs);
                const overlapEnd = Math.min(logOff, dayEndMs);
                if (overlapEnd > overlapStart) {
                    totalSecs += (overlapEnd - overlapStart) / 1000;
                }
            }
            dailySupplyHours[13 - i] = totalSecs / 3600;
        }

        const dailyUsage14: number[] = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const candidateDay = new Date(d);
            candidateDay.setHours(0, 0, 0, 0);

            if (candidateDay.getTime() < onboardingDay.getTime()) {
                dailyUsage14.push(0);
                continue;
            }

            const H = dailySupplyHours[13 - i];
            let kwh = 0;
            for (const app of appliancesList) {
                kwh += (app.wattage * Math.min(H, app.hours)) / 1000;
            }
            if (kwh === 0 && H > 0 && appliancesList.length === 0) {
                kwh = 4.3 * (H / 12);
            }
            dailyUsage14.push(Number(kwh.toFixed(2)));
        }

        let dynamicDailyBurn = 0;
        let activeDaysCount = 0;
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const candidateDay = new Date(d);
            candidateDay.setHours(0, 0, 0, 0);

            if (candidateDay.getTime() < onboardingDay.getTime()) {
                continue;
            }

            const dayName = days[d.getDay()];
            const dailyRate = rateData ? getRateForDate(rateData, d.toISOString()) : tariffRate;
            const kwh = dailyUsage14[13 - i];
            const cost = Number((kwh * dailyRate).toFixed(2));
            dailyUsage.push({
                label: dayName,
                kwh,
                cost
            });
            dynamicDailyBurn += kwh;
            activeDaysCount++;
        }

        const calculatedBurnRate = activeDaysCount > 0 ? (dynamicDailyBurn / activeDaysCount) : 0;
        const finalDailyBurn = calculatedBurnRate > 0 ? calculatedBurnRate : (dailyBurn > 0 ? dailyBurn : 4.3);        
        const weeklyUsage: any[] = [];
        for (let i = 3; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - (i * 7));
            const candidateDay = new Date(d);
            candidateDay.setHours(0, 0, 0, 0);

            if (candidateDay.getTime() < onboardingDay.getTime()) {
                continue;
            }

            const weeklyRate = rateData ? getRateForDate(rateData, d.toISOString()) : tariffRate;
            
            const weekStart = new Date(d);
            weekStart.setHours(0, 0, 0, 0);
            weekStart.setDate(weekStart.getDate() - 6);
            const weekStartMs = weekStart.getTime();
            const weekEndMs = candidateDay.getTime() + 24 * 60 * 60 * 1000;

            let totalSecs = 0;
            for (const log of supplyLogs) {
                const logOn = new Date(log.power_on).getTime();
                const logOff = log.power_off ? new Date(log.power_off).getTime() : nowTime;
                
                const overlapStart = Math.max(logOn, weekStartMs);
                const overlapEnd = Math.min(logOff, weekEndMs);
                if (overlapEnd > overlapStart) {
                    totalSecs += (overlapEnd - overlapStart) / 1000;
                }
            }
            const H = totalSecs / 3600;

            let kwh = 0;
            for (const app of appliancesList) {
                kwh += (app.wattage * Math.min(H, app.hours * 7)) / 1000;
            }
            if (kwh === 0 && H > 0 && appliancesList.length === 0) {
                kwh = 4.3 * 7 * (H / (12 * 7));
            }

            kwh = Number(kwh.toFixed(2));
            const cost = Number((kwh * weeklyRate).toFixed(2));
            weeklyUsage.push({
                label: `Week ${4 - i}`,
                kwh,
                cost
            });
        }

        const monthlyUsage: any[] = [];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const candidateDay = new Date(d);
            candidateDay.setHours(0, 0, 0, 0);
            candidateDay.setDate(1);

            const candidateYear = candidateDay.getFullYear();
            const candidateMonth = candidateDay.getMonth();
            const onboardingYear = onboardingDay.getFullYear();
            const onboardingMonth = onboardingDay.getMonth();

            if (candidateYear < onboardingYear || (candidateYear === onboardingYear && candidateMonth < onboardingMonth)) {
                continue;
            }

            const monthlyRate = rateData ? getRateForDate(rateData, d.toISOString()) : tariffRate;
            
            const monthStart = new Date(candidateYear, candidateMonth, 1, 0, 0, 0, 0);
            const monthEnd = new Date(candidateYear, candidateMonth + 1, 1, 0, 0, 0, 0);
            const monthStartMs = monthStart.getTime();
            const monthEndMs = monthEnd.getTime();
            
            const daysInMonth = new Date(candidateYear, candidateMonth + 1, 0).getDate();

            let totalSecs = 0;
            for (const log of supplyLogs) {
                const logOn = new Date(log.power_on).getTime();
                const logOff = log.power_off ? new Date(log.power_off).getTime() : nowTime;
                
                const overlapStart = Math.max(logOn, monthStartMs);
                const overlapEnd = Math.min(logOff, monthEndMs);
                if (overlapEnd > overlapStart) {
                    totalSecs += (overlapEnd - overlapStart) / 1000;
                }
            }
            const H = totalSecs / 3600;

            let kwh = 0;
            for (const app of appliancesList) {
                kwh += (app.wattage * Math.min(H, app.hours * daysInMonth)) / 1000;
            }
            if (kwh === 0 && H > 0 && appliancesList.length === 0) {
                kwh = 4.3 * daysInMonth * (H / (12 * daysInMonth));
            }

            kwh = Number(kwh.toFixed(2));
            const cost = Number((kwh * monthlyRate).toFixed(2));
            monthlyUsage.push({
                label: months[candidateMonth],
                kwh,
                cost
            });
        }

        const sortedApps = [...appliancesList].sort((a, b) => b.kwh - a.kwh);
        const applianceBreakdown = sortedApps.map(app => {
            const pct = finalDailyBurn > 0 ? (app.kwh / finalDailyBurn) * 100 : 0;
            return {
                name: app.name,
                percentage: Number(pct.toFixed(0)),
                kwh: Number(app.kwh.toFixed(1)),
                cost: Number((app.kwh * tariffRate).toFixed(2))
            };
        });

        const insights: any[] = [];
        const daysSinceOnboarding = Math.floor((nowTime - onboardingDay.getTime()) / (24 * 60 * 60 * 1000));
        const kwhThisWeek = dailyUsage14.slice(7, 14).reduce((a, b) => a + b, 0);
        const kwhPrevWeek = dailyUsage14.slice(0, 7).reduce((a, b) => a + b, 0);

        if (daysSinceOnboarding >= 14 && kwhPrevWeek > 0) {
            const diff = kwhThisWeek - kwhPrevWeek;
            const pctChange = Math.round((Math.abs(diff) / kwhPrevWeek) * 100);
            if (pctChange > 0) {
                const moreOrLess = diff > 0 ? "more" : "less";
                insights.push({
                    text: `You used ${pctChange}% ${moreOrLess} electricity this week compared to last week.`,
                    type: moreOrLess === "less" ? "positive" : "negative",
                    icon: moreOrLess === "less" ? "trending-down" : "trending-up",
                    impact: `${moreOrLess === "less" ? "Saved" : "Added"} ~${Math.abs(diff).toFixed(1)} kWh`
                });
            }
        }

        if (appliancesList.length > 0 && sortedApps.length > 0) {
            const topApp = sortedApps[0];
            const savedKwh = (topApp.wattage * 1 * 30) / 1000;
            const savedCost = Math.round(savedKwh * tariffRate);
            insights.push({
                text: `Reducing your ${topApp.name} runtime by just 1 hour daily will save you approximately ₦${savedCost.toLocaleString()} monthly.`,
                type: "positive",
                icon: "bulb",
                impact: `Saves ₦${savedCost.toLocaleString()}/mo`
            });
        }

        if (finalDailyBurn > 0) {
            const unitsFor10k = 10000 / tariffRate;
            const daysFor10k = Math.round(unitsFor10k / finalDailyBurn);
            if (daysFor10k > 0) {
                insights.push({
                    text: `Your current burn rate (${finalDailyBurn.toFixed(1)} kWh/d) means a ₦10,000 recharge lasts ~${daysFor10k} days.`,
                    type: "neutral",
                    icon: "leaf",
                    impact: `Target: ${daysFor10k}d`
                });
            }
        }

        const daysWithData = dailyUsage.filter(d => d.kwh > 0).length;
        if (dailyUsage.length >= 7 && daysWithData >= 6) {
            let normalUsage = 0;
            let todayUsage = dailyUsage[dailyUsage.length - 1]?.kwh || 0;
            let sumPrev = 0;
            for (let i = 0; i < dailyUsage.length - 1; i++) {
                sumPrev += dailyUsage[i]?.kwh || 0;
            }
            normalUsage = sumPrev / (dailyUsage.length - 1);

            if (normalUsage > 0 && todayUsage > 1.3 * normalUsage) {
                const pctIncrease = Math.round(((todayUsage - normalUsage) / normalUsage) * 100);
                insights.push({
                    text: `Your usage today is very high (${pctIncrease}% above your normal daily average).`,
                    type: "negative",
                    icon: "trending-up",
                    impact: `Alert: +${(todayUsage - normalUsage).toFixed(1)} kWh`
                });
            }
        }

        response.status(200).send({
            dailyUsage,
            weeklyUsage,
            monthlyUsage,
            insights,
            applianceBreakdown
        });
    } catch (error) {
        logger.error("Error fetching insights data:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const updateProfile = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, phone, meterNumber, disco, tariffBand, meterType } = request.body;

        if (!uid || !phone || !meterNumber || !disco || !tariffBand || !meterType) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const batch = db.batch();

        const userRef = db.collection("users").doc(uid);
        batch.update(userRef, {
            phone,
            updated_at: new Date().toISOString()
        });

        const profileRef = db.collection("electricity_profiles").doc(uid);
        batch.set(profileRef, {
            user_id: uid,
            disco,
            tariff_band: tariffBand,
            meter_type: meterType,
            updated_at: new Date().toISOString()
        }, { merge: true });

        const metersQuery = await db.collection("meters").where("user_id", "==", uid).limit(1).get();
        if (!metersQuery.empty) {
            const currentMeterDoc = metersQuery.docs[0];
            if (currentMeterDoc.id !== meterNumber) {
                batch.delete(currentMeterDoc.ref);
                const newMeterRef = db.collection("meters").doc(meterNumber);
                batch.set(newMeterRef, {
                    user_id: uid,
                    meter_number: meterNumber,
                    meter_type: meterType,
                    current_units: currentMeterDoc.data().current_units || 0,
                    updated_at: new Date().toISOString()
                });
            } else {
                batch.update(currentMeterDoc.ref, {
                    meter_type: meterType,
                    updated_at: new Date().toISOString()
                });
            }
        } else {
            const meterRef = db.collection("meters").doc(meterNumber);
            batch.set(meterRef, {
                user_id: uid,
                meter_number: meterNumber,
                meter_type: meterType,
                current_units: 0,
                updated_at: new Date().toISOString()
            });
        }

        await batch.commit();
        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error updating profile:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const trackEvent = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, eventType, metadata } = request.body;
        if (!eventType) {
            response.status(400).send({ error: "Missing eventType" });
            return;
        }
        if (uid && !(await verifyUserAuthAndIdor(request, response, uid))) return;

        const eventRef = db.collection("analytics_events").doc();
        await eventRef.set({
            id: eventRef.id,
            user_id: uid || "anonymous",
            event_type: eventType,
            metadata: metadata || {},
            timestamp: new Date().toISOString()
        });

        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error tracking event:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const getAnalyticsEvents = onRequest({ cors: true }, async (request, response) => {
    try {
        const eventsSnapshot = await db.collection("analytics_events")
            .orderBy("timestamp", "desc")
            .limit(50)
            .get();
        const events = eventsSnapshot.docs.map(doc => doc.data());

        const signups = await db.collection("analytics_events").where("event_type", "==", "signup").get();
        const trials = await db.collection("analytics_events").where("event_type", "==", "trial_start").get();
        const subscriptions = await db.collection("analytics_events").where("event_type", "==", "subscription_active").get();
        const calculator = await db.collection("analytics_events").where("event_type", "==", "calculator_usage").get();
        const recharges = await db.collection("analytics_events").where("event_type", "==", "recharge_logged").get();
        const notifications = await db.collection("analytics_events").where("event_type", "==", "notification_opened").get();

        response.status(200).send({
            events,
            stats: {
                signups: signups.size,
                trials: trials.size,
                subscriptions: subscriptions.size,
                calculator: calculator.size,
                recharges: recharges.size,
                notifications: notifications.size
            }
        });
    } catch (error) {
        logger.error("Error fetching analytics events:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const validatePassword = onRequest({ cors: true }, (request, response) => {
    try {
        const { password } = request.body;
        const pass = password || "";
        const hasMinLength = pass.length >= 8;
        const hasCapital = /[A-Z]/.test(pass);
        const hasNumber = /\d/.test(pass);
        const hasSpecial = /[^A-Za-z0-9]/.test(pass);
        const valid = hasMinLength && hasCapital && hasNumber && hasSpecial;
        response.status(200).send({
            valid,
            criteria: {
                hasMinLength,
                hasCapital,
                hasNumber,
                hasSpecial
            }
        });
    } catch (error) {
        logger.error("Error validating password:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const verifyMeterNumber = onRequest({ cors: true }, async (request, response) => {
    try {
        const { meterNumber, disco, meterType } = request.body;

        if (!meterNumber || !disco || !meterType) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }
        const decoded = await verifyRequestAuth(request, response);
        if (!decoded) return;

        const discoMap: Record<string, string> = {
            "IKEDC": "ikeja-electric",
            "EKEDC": "eko-electric",
            "KEDCO": "kano-electric",
            "PHED": "portharcourt-electric",
            "JED": "jos-electric",
            "IBEDC": "ibadan-electric",
            "KAEDCO": "kaduna-electric",
            "AEDC": "abuja-electric",
            "EEDC": "enugu-electric",
            "BEDC": "benin-electric",
            "ABA": "aba-electric",
            "YEDC": "yola-electric"
        };

        const serviceID = discoMap[disco.toUpperCase()] || "eko-electric";
        const type = meterType.toLowerCase();

        const vtpassResponse = await fetch("https://sandbox.vtpass.com/api/merchant-verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": "10fa7d85f310553f9622ac04c2bcc578",
                "secret-key": "SK_51822ead6326136bba45f55b851379550048f8a59a9"
            },
            body: JSON.stringify({
                billersCode: meterNumber,
                serviceID,
                type
            })
        });

        if (!vtpassResponse.ok) {
            throw new Error(`VTPass returned status ${vtpassResponse.status}`);
        }

        const data: any = await vtpassResponse.json();

        if (data.code === "000" && data.content) {
            response.status(200).send({
                success: true,
                customerName: data.content.Customer_Name || data.content.invalid_biller_code || "Unknown Customer",
                customerAddress: data.content.Customer_Address || ""
            });
        } else {
            response.status(400).send({
                success: false,
                error: data.response_description || data.description || "Verification failed"
            });
        }
    } catch (error) {
        logger.error("Error verifying meter number:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const seedTariffRates = onRequest({ cors: true }, async (request, response) => {
    try {
        const batch = db.batch();
        const existingRates = await db.collection("tariff_rates").get();
        for (const doc of existingRates.docs) {
            batch.delete(doc.ref);
        }

        const ratesToSeed = [
            { disco_id: "EKEDC", band: "Band A", rate_per_kwh: 209.50 },
            { disco_id: "EKEDC", band: "Band B", rate_per_kwh: 62.50 },
            { disco_id: "EKEDC", band: "Band C", rate_per_kwh: 48.00 },
            { disco_id: "EKEDC", band: "Band D", rate_per_kwh: 37.50 },
            { disco_id: "EKEDC", band: "Band E", rate_per_kwh: 32.00 },

            { disco_id: "IKEDC", band: "Band A", rate_per_kwh: 206.80 },
            { disco_id: "IKEDC", band: "Band B", rate_per_kwh: 63.20 },
            { disco_id: "IKEDC", band: "Band C", rate_per_kwh: 49.50 },
            { disco_id: "IKEDC", band: "Band D", rate_per_kwh: 38.00 },
            { disco_id: "IKEDC", band: "Band E", rate_per_kwh: 33.00 },

            { disco_id: "AEDC", band: "Band A", rate_per_kwh: 209.80 },
            { disco_id: "AEDC", band: "Band B", rate_per_kwh: 64.00 },
            { disco_id: "AEDC", band: "Band C", rate_per_kwh: 50.50 },
            { disco_id: "AEDC", band: "Band D", rate_per_kwh: 39.00 },
            { disco_id: "AEDC", band: "Band E", rate_per_kwh: 34.00 },

            { disco_id: "EEDC", band: "Band A", rate_per_kwh: 211.00 },
            { disco_id: "EEDC", band: "Band B", rate_per_kwh: 65.00 },
            { disco_id: "EEDC", band: "Band C", rate_per_kwh: 52.00 },
            { disco_id: "EEDC", band: "Band D", rate_per_kwh: 40.00 },
            { disco_id: "EEDC", band: "Band E", rate_per_kwh: 35.00 },

            { disco_id: "KEDCO", band: "Band A", rate_per_kwh: 208.00 },
            { disco_id: "KEDCO", band: "Band B", rate_per_kwh: 61.50 },
            { disco_id: "KEDCO", band: "Band C", rate_per_kwh: 48.50 },
            { disco_id: "KEDCO", band: "Band D", rate_per_kwh: 36.00 },
            { disco_id: "KEDCO", band: "Band E", rate_per_kwh: 31.00 },

            { disco_id: "PHED", band: "Band A", rate_per_kwh: 209.90 },
            { disco_id: "PHED", band: "Band B", rate_per_kwh: 63.50 },
            { disco_id: "PHED", band: "Band C", rate_per_kwh: 50.00 },
            { disco_id: "PHED", band: "Band D", rate_per_kwh: 38.00 },
            { disco_id: "PHED", band: "Band E", rate_per_kwh: 33.00 },

            { disco_id: "JED", band: "Band A", rate_per_kwh: 208.50 },
            { disco_id: "JED", band: "Band B", rate_per_kwh: 62.00 },
            { disco_id: "JED", band: "Band C", rate_per_kwh: 48.50 },
            { disco_id: "JED", band: "Band D", rate_per_kwh: 37.00 },
            { disco_id: "JED", band: "Band E", rate_per_kwh: 32.00 },

            { disco_id: "IBEDC", band: "Band A", rate_per_kwh: 209.50 },
            { disco_id: "IBEDC", band: "Band B", rate_per_kwh: 62.50 },
            { disco_id: "IBEDC", band: "Band C", rate_per_kwh: 49.00 },
            { disco_id: "IBEDC", band: "Band D", rate_per_kwh: 37.50 },
            { disco_id: "IBEDC", band: "Band E", rate_per_kwh: 32.50 },

            { disco_id: "KAEDCO", band: "Band A", rate_per_kwh: 207.00 },
            { disco_id: "KAEDCO", band: "Band B", rate_per_kwh: 61.80 },
            { disco_id: "KAEDCO", band: "Band C", rate_per_kwh: 48.20 },
            { disco_id: "KAEDCO", band: "Band D", rate_per_kwh: 36.50 },
            { disco_id: "KAEDCO", band: "Band E", rate_per_kwh: 31.50 },

            { disco_id: "BEDC", band: "Band A", rate_per_kwh: 209.50 },
            { disco_id: "BEDC", band: "Band B", rate_per_kwh: 62.50 },
            { disco_id: "BEDC", band: "Band C", rate_per_kwh: 49.00 },
            { disco_id: "BEDC", band: "Band D", rate_per_kwh: 37.50 },
            { disco_id: "BEDC", band: "Band E", rate_per_kwh: 32.50 },

            { disco_id: "ABA", band: "Band A", rate_per_kwh: 210.00 },
            { disco_id: "ABA", band: "Band B", rate_per_kwh: 63.00 },
            { disco_id: "ABA", band: "Band C", rate_per_kwh: 49.50 },
            { disco_id: "ABA", band: "Band D", rate_per_kwh: 38.00 },
            { disco_id: "ABA", band: "Band E", rate_per_kwh: 33.00 },

            { disco_id: "YEDC", band: "Band A", rate_per_kwh: 209.00 },
            { disco_id: "YEDC", band: "Band B", rate_per_kwh: 62.00 },
            { disco_id: "YEDC", band: "Band C", rate_per_kwh: 48.00 },
            { disco_id: "YEDC", band: "Band D", rate_per_kwh: 37.00 },
            { disco_id: "YEDC", band: "Band E", rate_per_kwh: 32.00 }
        ];

        for (const item of ratesToSeed) {
            const ref = db.collection("tariff_rates").doc(`${item.disco_id}_${item.band.replace(/\s+/g, "")}`);
            batch.set(ref, {
                disco_id: item.disco_id,
                band: item.band,
                rate_per_kwh: item.rate_per_kwh,
                is_active: true,
                created_at: new Date().toISOString(),
                history: [
                    {
                        rate: item.rate_per_kwh,
                        effective_from: new Date().toISOString()
                    }
                ]
            });
        }

        await batch.commit();
        response.status(200).send({ success: true, count: ratesToSeed.length });
    } catch (error) {
        logger.error("Error seeding tariff rates:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const updateTariffRate = onRequest({ cors: true }, async (request, response) => {
    try {
        const { disco, band, rate } = request.body;
        if (!disco || !band || rate === undefined) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }

        const docId = `${disco}_${band.replace(/\s+/g, "")}`;
        const docRef = db.collection("tariff_rates").doc(docId);
        const doc = await docRef.get();
        const now = new Date();

        let shouldNotify = false;
        let oldRate = 0;

        if (doc.exists) {
            const docData = doc.data()!;
            oldRate = docData.rate_per_kwh ?? 0;
            if (oldRate !== Number(rate)) {
                shouldNotify = true;
                const history = Array.isArray(docData.history) ? [...docData.history] : [];
                history.push({
                    rate: Number(rate),
                    effective_from: now.toISOString()
                });
                await docRef.update({
                    rate_per_kwh: Number(rate),
                    updated_at: now.toISOString(),
                    history
                });
            }
        } else {
            const history = [{
                rate: Number(rate),
                effective_from: now.toISOString()
            }];
            await docRef.set({
                disco_id: disco,
                band,
                rate_per_kwh: Number(rate),
                is_active: true,
                created_at: now.toISOString(),
                updated_at: now.toISOString(),
                history
            });
        }

        if (shouldNotify) {
            const { getMessaging } = await import("firebase-admin/messaging");
            const profilesSnapshot = await db.collection("electricity_profiles")
                .where("disco", "==", disco)
                .where("tariff_band", "==", band)
                .get();

            const batch = db.batch();
            const alertTitle = `${disco} ${band} Tariff Update`;
            const alertBody = `Your tariff rate has been updated from ₦${oldRate.toFixed(2)} to ₦${Number(rate).toFixed(2)}/kWh.`;

            for (const profileDoc of profilesSnapshot.docs) {
                const profile = profileDoc.data();
                const uid = profile.user_id;
                if (!uid) continue;

                const notifId = db.collection("notifications").doc().id;
                const notifRef = db.collection("notifications").doc(notifId);
                batch.set(notifRef, {
                    id: notifId,
                    user_id: uid,
                    title: alertTitle,
                    body: alertBody,
                    notification_type: "tariff_adjustment",
                    status: "sent",
                    sent_at: now.toISOString(),
                    created_at: now.toISOString()
                });

                const tokensSnapshot = await db.collection("device_tokens")
                    .where("user_id", "==", uid)
                    .get();

                for (const tokenDoc of tokensSnapshot.docs) {
                    const token = tokenDoc.data().device_token;
                    if (token) {
                        try {
                            await getMessaging().send({
                                notification: {
                                    title: alertTitle,
                                    body: alertBody
                                },
                                token
                            });
                        } catch (fcmError) {
                            logger.warn(`FCM message fail for token ${token}:`, fcmError);
                        }
                    }
                }
            }
            await batch.commit();
        }

        response.status(200).send({ success: true, updated: shouldNotify });
    } catch (error) {
        logger.error("Error updating tariff rate:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const rLat1 = toRad(lat1);
    const rLat2 = toRad(lat2);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const reportOutage = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, latitude, longitude, state, city } = request.body;
        if (!uid || !state || !city) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }

        const lat = Number(latitude) || 0;
        const lon = Number(longitude) || 0;
        const now = new Date();

        const reportId = db.collection("outage_reports").doc().id;
        const reportRef = db.collection("outage_reports").doc(reportId);
        await reportRef.set({
            id: reportId,
            user_id: uid,
            status: "outage",
            state,
            city,
            latitude: lat,
            longitude: lon,
            created_at: now.toISOString()
        });

        const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
        const recentReportsQuery = await db.collection("outage_reports")
            .where("state", "==", state)
            .where("city", "==", city)
            .where("status", "==", "outage")
            .where("created_at", ">=", fifteenMinsAgo.toISOString())
            .get();

        const distinctUsers = new Set<string>();

        for (const doc of recentReportsQuery.docs) {
            const data = doc.data();
            const distance = (lat !== 0 && lon !== 0 && data.latitude !== 0 && data.longitude !== 0) 
                ? calculateDistance(lat, lon, data.latitude, data.longitude)
                : 0;

            if (distance <= 1.0) {
                distinctUsers.add(data.user_id);
            }
        }

        if (distinctUsers.size >= 3) {
            const clusterId = `${state}_${city}`.replace(/\s+/g, "");
            const gridStateRef = db.collection("grid_states").doc(clusterId);
            const gridStateDoc = await gridStateRef.get();

            let alreadyDown = false;
            if (gridStateDoc.exists && gridStateDoc.data()?.state === "GRID_DOWN") {
                alreadyDown = true;
            }

            if (!alreadyDown) {
                await gridStateRef.set({
                    id: clusterId,
                    state: "GRID_DOWN",
                    updated_at: now.toISOString()
                });

                const profilesSnapshot = await db.collection("electricity_profiles")
                    .where("state", "==", state)
                    .where("city", "==", city)
                    .get();

                const matchedUserIds: string[] = [];
                for (const profileDoc of profilesSnapshot.docs) {
                    const data = profileDoc.data();
                    if (data.user_id && data.user_id !== uid) {
                        matchedUserIds.push(data.user_id);
                    }
                }

                if (matchedUserIds.length > 0) {
                    const { getMessaging } = await import("firebase-admin/messaging");
                    const batch = db.batch();
                    const alertTitle = "Power Outage Alert";
                    const alertBody = "Grid Failure Detected: Power has tripped in your region.";

                    for (const neighborUid of matchedUserIds) {
                        const notifId = db.collection("notifications").doc().id;
                        const notifRef = db.collection("notifications").doc(notifId);
                        batch.set(notifRef, {
                            id: notifId,
                            user_id: neighborUid,
                            title: alertTitle,
                            body: alertBody,
                            notification_type: "grid_down_alert",
                            status: "sent",
                            sent_at: now.toISOString(),
                            created_at: now.toISOString()
                        });

                        const tokensSnapshot = await db.collection("device_tokens")
                            .where("user_id", "==", neighborUid)
                            .get();

                        for (const tokenDoc of tokensSnapshot.docs) {
                            const token = tokenDoc.data().device_token;
                            if (token) {
                                try {
                                    await getMessaging().send({
                                        notification: {
                                            title: alertTitle,
                                            body: alertBody
                                        },
                                        token
                                    });
                                } catch (fcmError) {
                                    logger.warn(`FCM message fail for token ${token}:`, fcmError);
                                }
                            }
                        }
                    }

                    const reportersList = Array.from(distinctUsers);
                    for (const reporterUid of reportersList) {
                        const profileRef = db.collection("electricity_profiles").doc(reporterUid);
                        const profDoc = await profileRef.get();
                        if (profDoc.exists) {
                            const currentWarned = profDoc.data()?.neighbors_warned ?? 0;
                            await profileRef.update({
                                neighbors_warned: currentWarned + matchedUserIds.length
                            });
                        }
                    }

                    const reporterNotifId = db.collection("notifications").doc().id;
                    const reporterNotifRef = db.collection("notifications").doc(reporterNotifId);
                    batch.set(reporterNotifRef, {
                        id: reporterNotifId,
                        user_id: uid,
                        title: "Neighbors Warned!",
                        body: `Your report just warned ${matchedUserIds.length} people in ${city}. You saved them from wasting fuel today.`,
                        notification_type: "community_hero",
                        status: "sent",
                        sent_at: now.toISOString(),
                        created_at: now.toISOString()
                    });

                    await batch.commit();
                }
            }
        }

        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error reporting outage:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const reportPowerBack = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, latitude, longitude, state, city } = request.body;
        if (!uid || !state || !city) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }

        const lat = Number(latitude) || 0;
        const lon = Number(longitude) || 0;
        const now = new Date();

        const reportId = db.collection("outage_reports").doc().id;
        const reportRef = db.collection("outage_reports").doc(reportId);
        await reportRef.set({
            id: reportId,
            user_id: uid,
            status: "power_back",
            state,
            city,
            latitude: lat,
            longitude: lon,
            created_at: now.toISOString()
        });

        const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
        const recentReportsQuery = await db.collection("outage_reports")
            .where("state", "==", state)
            .where("city", "==", city)
            .where("status", "==", "power_back")
            .where("created_at", ">=", fifteenMinsAgo.toISOString())
            .get();

        const distinctUsers = new Set<string>();
        for (const doc of recentReportsQuery.docs) {
            const data = doc.data();
            const distance = (lat !== 0 && lon !== 0 && data.latitude !== 0 && data.longitude !== 0) 
                ? calculateDistance(lat, lon, data.latitude, data.longitude)
                : 0;

            if (distance <= 1.0) {
                distinctUsers.add(data.user_id);
            }
        }

        if (distinctUsers.size >= 3) {
            const clusterId = `${state}_${city}`.replace(/\s+/g, "");
            const gridStateRef = db.collection("grid_states").doc(clusterId);
            const gridStateDoc = await gridStateRef.get();

            let alreadyActive = false;
            if (gridStateDoc.exists && gridStateDoc.data()?.state === "GRID_ACTIVE") {
                alreadyActive = true;
            }

            if (!alreadyActive) {
                await gridStateRef.set({
                    id: clusterId,
                    state: "GRID_ACTIVE",
                    updated_at: now.toISOString()
                });

                const profilesSnapshot = await db.collection("electricity_profiles")
                    .where("state", "==", state)
                    .where("city", "==", city)
                    .get();

                const matchedUserIds: string[] = [];
                for (const profileDoc of profilesSnapshot.docs) {
                    const data = profileDoc.data();
                    if (data.user_id && data.user_id !== uid) {
                        matchedUserIds.push(data.user_id);
                    }
                }

                if (matchedUserIds.length > 0) {
                    const { getMessaging } = await import("firebase-admin/messaging");
                    const batch = db.batch();
                    const alertTitle = "Power Restored";
                    const alertBody = "Power is back. Maximize your window.";

                    for (const neighborUid of matchedUserIds) {
                        const notifId = db.collection("notifications").doc().id;
                        const notifRef = db.collection("notifications").doc(notifId);
                        batch.set(notifRef, {
                            id: notifId,
                            user_id: neighborUid,
                            title: alertTitle,
                            body: alertBody,
                            notification_type: "grid_up_alert",
                            status: "sent",
                            sent_at: now.toISOString(),
                            created_at: now.toISOString()
                        });

                        const tokensSnapshot = await db.collection("device_tokens")
                            .where("user_id", "==", neighborUid)
                            .get();

                        for (const tokenDoc of tokensSnapshot.docs) {
                            const token = tokenDoc.data().device_token;
                            if (token) {
                                try {
                                    await getMessaging().send({
                                        notification: {
                                            title: alertTitle,
                                            body: alertBody
                                        },
                                        token
                                    });
                                } catch (fcmError) {
                                    logger.warn(`FCM message fail for token ${token}:`, fcmError);
                                }
                            }
                        }
                    }
                    await batch.commit();
                }
            }
        }

        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error reporting power back:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const getOutageMap = onRequest({ cors: true }, async (request, response) => {
    try {
        const uid = request.query.uid as string;
        let state = request.query.state as string;
        let city = request.query.city as string;

        if (uid && (!state || !city)) {
            const profileDoc = await db.collection("electricity_profiles").doc(uid).get();
            if (profileDoc.exists) {
                state = profileDoc.data()?.state || "";
                city = profileDoc.data()?.city || "";
            }
        }

        if (!state || !city) {
            response.status(400).send({ error: "Missing location parameters" });
            return;
        }

        const clusterId = `${state}_${city}`.replace(/\s+/g, "");
        const gridStateDoc = await db.collection("grid_states").doc(clusterId).get();
        const gridState = gridStateDoc.exists ? (gridStateDoc.data()?.state || "GRID_ACTIVE") : "GRID_ACTIVE";

        const recentReportsQuery = await db.collection("outage_reports")
            .where("state", "==", state)
            .where("city", "==", city)
            .limit(10)
            .get();

        const reports = recentReportsQuery.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                status: data.status,
                latitude: data.latitude,
                longitude: data.longitude,
                created_at: data.created_at
            };
        });

        response.status(200).send({
            gridState,
            reports
        });
    } catch (error) {
        logger.error("Error fetching outage map:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const exportOutageHistory = onRequest({ cors: true }, async (request, response) => {
    try {
        const uid = (request.query.uid as string) || request.body.uid;
        const days = Number(request.query.days || request.body.days) || 30;

        if (!uid) {
            response.status(400).send({ error: "Missing uid" });
            return;
        }

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const logsQuery = await db.collection("power_supply_logs")
            .where("user_id", "==", uid)
            .where("power_on", ">=", cutoff.toISOString())
            .get();

        let totalSupplyHours = 0;
        const events: any[] = [];

        logsQuery.docs.forEach(doc => {
            const data = doc.data();
            const duration = data.duration_hours || 0;
            totalSupplyHours += duration;
            events.push({
                id: doc.id,
                powerOn: data.power_on,
                powerOff: data.power_off || null,
                duration
            });
        });

        events.sort((a, b) => new Date(b.powerOn).getTime() - new Date(a.powerOn).getTime());

        const totalDowntimeHours = Math.max(0, (days * 24) - totalSupplyHours);
        const avgDailySupply = Number((totalSupplyHours / days).toFixed(1));

        response.status(200).send({
            userId: uid,
            periodDays: days,
            totalSupplyHours: Number(totalSupplyHours.toFixed(1)),
            totalDowntimeHours: Number(totalDowntimeHours.toFixed(1)),
            avgDailySupplyHours: avgDailySupply,
            events
        });
    } catch (error) {
        logger.error("Error exporting outage history:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const updateRecharge = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, rechargeId, amount, units } = request.body;

        if (!uid || !rechargeId || amount === undefined || units === undefined) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const rechargeRef = db.collection("recharges").doc(rechargeId);
        const rechargeDoc = await rechargeRef.get();
        if (!rechargeDoc.exists) {
            response.status(404).send({ error: "Recharge log not found" });
            return;
        }

        const rechargeData = rechargeDoc.data();
        if (!rechargeData || rechargeData.user_id !== uid) {
            response.status(403).send({ error: "Permission denied" });
            return;
        }

        const oldUnits = rechargeData.units_received || 0;
        const diffUnits = Number(units) - oldUnits;

        const metersQuery = await db.collection("meters").where("user_id", "==", uid).limit(1).get();
        if (metersQuery.empty) {
            response.status(404).send({ error: "No meter found for this user" });
            return;
        }

        const meterDoc = metersQuery.docs[0];
        const meterData = meterDoc.data();
        const currentUnits = meterData.current_units ?? 0;
        const newMeterUnits = currentUnits + diffUnits;

        const batch = db.batch();

        batch.update(rechargeRef, {
            amount_paid: Number(amount),
            units_received: Number(units),
            tariff_rate: Number(amount) / Number(units),
            updated_at: new Date().toISOString()
        });

        batch.update(meterDoc.ref, {
            current_units: Number(newMeterUnits.toFixed(2)),
            updated_at: new Date().toISOString()
        });

        await batch.commit();

        response.status(200).send({ success: true, newUnits: Number(newMeterUnits.toFixed(2)) });
    } catch (error) {
        logger.error("Error updating recharge:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const deleteRecharge = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, rechargeId } = request.body;

        if (!uid || !rechargeId) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const rechargeRef = db.collection("recharges").doc(rechargeId);
        const rechargeDoc = await rechargeRef.get();
        if (!rechargeDoc.exists) {
            response.status(404).send({ error: "Recharge log not found" });
            return;
        }

        const rechargeData = rechargeDoc.data();
        if (!rechargeData || rechargeData.user_id !== uid) {
            response.status(403).send({ error: "Permission denied" });
            return;
        }

        const units = rechargeData.units_received || 0;

        const metersQuery = await db.collection("meters").where("user_id", "==", uid).limit(1).get();
        if (metersQuery.empty) {
            response.status(404).send({ error: "No meter found for this user" });
            return;
        }

        const meterDoc = metersQuery.docs[0];
        const meterData = meterDoc.data();
        const currentUnits = meterData.current_units ?? 0;
        const newMeterUnits = Math.max(0, currentUnits - units);

        const batch = db.batch();

        batch.delete(rechargeRef);

        batch.update(meterDoc.ref, {
            current_units: Number(newMeterUnits.toFixed(2)),
            updated_at: new Date().toISOString()
        });

        await batch.commit();

        response.status(200).send({ success: true, newUnits: Number(newMeterUnits.toFixed(2)) });
    } catch (error) {
        logger.error("Error deleting recharge:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const calibrateMeterUnits = onRequest({ cors: true }, async (request, response) => {
    try {
        const { uid, type, lightYesterday, hours, manualUnits } = request.body;

        if (!uid || !type) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }
        if (!(await verifyUserAuthAndIdor(request, response, uid))) return;

        const metersQuery = await db.collection("meters").where("user_id", "==", uid).limit(1).get();
        if (metersQuery.empty) {
            response.status(404).send({ error: "No meter found for this user" });
            return;
        }

        const meterDoc = metersQuery.docs[0];
        const meterData = meterDoc.data();
        const currentUnits = meterData.current_units ?? 0;
        let newUnits = currentUnits;

        const batch = db.batch();
        const calibrationId = db.collection("calibration_logs").doc().id;
        const todayStr = new Date().toISOString().split("T")[0];

        if (type === "daily") {
            let hourlyLoadKW = 0.18;
            if (lightYesterday) {
                const appliancesQuery = await db.collection("user_appliances")
                    .where("user_id", "==", uid)
                    .where("is_active", "==", true)
                    .get();
                
                let activeLoad = 0;
                appliancesQuery.docs.forEach(doc => {
                    const app = doc.data();
                    activeLoad += app.custom_wattage || 0;
                });

                if (activeLoad > 0) {
                    hourlyLoadKW = activeLoad / 1000;
                }
                const hrs = Number(hours) || 0;
                const yesterdayConsumption = hrs * hourlyLoadKW;
                newUnits = Math.max(0, currentUnits - yesterdayConsumption);
            }

            const profileRef = db.collection("electricity_profiles").doc(uid);
            batch.set(profileRef, {
                last_calibration_date: todayStr
            }, { merge: true });

            batch.set(db.collection("calibration_logs").doc(calibrationId), {
                id: calibrationId,
                user_id: uid,
                type: "daily",
                light_yesterday: !!lightYesterday,
                hours_of_light: Number(hours) || 0,
                original_units: currentUnits,
                calibrated_units: newUnits,
                created_at: new Date().toISOString()
            });

        } else if (type === "manual") {
            newUnits = Number(manualUnits);
            if (isNaN(newUnits) || newUnits < 0) {
                response.status(400).send({ error: "Invalid manual units value" });
                return;
            }

            batch.set(db.collection("calibration_logs").doc(calibrationId), {
                id: calibrationId,
                user_id: uid,
                type: "manual",
                original_units: currentUnits,
                calibrated_units: newUnits,
                created_at: new Date().toISOString()
            });
        } else {
            response.status(400).send({ error: "Invalid calibration type" });
            return;
        }

        batch.update(meterDoc.ref, {
            current_units: Number(newUnits.toFixed(2)),
            updated_at: new Date().toISOString()
        });

        await batch.commit();

        response.status(200).send({
            success: true,
            newUnits: Number(newUnits.toFixed(2)),
            lastCalibrationDate: todayStr
        });
    } catch (error) {
        logger.error("Error in calibrateMeterUnits:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

