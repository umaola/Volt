import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

setGlobalOptions({ maxInstances: 10 });

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
        const { uid, meterNumber, disco, tariffBand, meterType, appliances, currentUnits } = request.body;

        if (!uid || !meterNumber || !disco || !tariffBand || !meterType) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }

        const batch = db.batch();

        const profileRef = db.collection("electricity_profiles").doc(uid);
        batch.set(profileRef, {
            user_id: uid,
            disco,
            tariff_band: tariffBand,
            meter_type: meterType,
            updated_at: new Date().toISOString()
        });

        const meterRef = db.collection("meters").doc(meterNumber);
        batch.set(meterRef, {
            user_id: uid,
            meter_number: meterNumber,
            meter_type: meterType,
            current_units: Number(currentUnits) || 0,
            updated_at: new Date().toISOString()
        });

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
        const { uid, plan, cardLast4, cardBrand } = request.body;

        if (!uid || !plan) {
            response.status(400).send({ error: "Missing required fields" });
            return;
        }

        const batch = db.batch();

        const subscriptionId = db.collection("subscriptions").doc().id;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);

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
            provider_subscription_id: null,
            created_at: startDate.toISOString(),
            updated_at: startDate.toISOString()
        });

        const methodRef = db.collection("payment_methods").doc(uid);
        batch.set(methodRef, {
            id: db.collection("payment_methods").doc().id,
            user_id: uid,
            provider: "paystack",
            card_last4: cardLast4 || "4111",
            card_brand: cardBrand || "visa",
            authorization_code: "AUTH_mock_" + Math.random().toString(36).substring(7),
            is_default: true,
            created_at: startDate.toISOString()
        });

        const txRef = db.collection("payment_transactions").doc();
        batch.set(txRef, {
            id: txRef.id,
            user_id: uid,
            subscription_id: subscriptionId,
            amount: 0,
            currency: "NGN",
            status: "success",
            reference: "ref_mock_" + Math.random().toString(36).substring(7),
            created_at: startDate.toISOString()
        });

        await batch.commit();

        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error starting trial:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const paystackWebhook = onRequest({ cors: true }, async (request, response) => {
    try {
        const event = request.body;

        if (event && event.event === "charge.success") {
            const customerEmail = event.data.customer.email;
            const userQuery = await db.collection("users").where("email", "==", customerEmail).limit(1).get();
            
            if (!userQuery.empty) {
                const userDoc = userQuery.docs[0];
                const uid = userDoc.id;
                const subRef = db.collection("subscriptions").doc(uid);
                
                const nextBilling = new Date();
                nextBilling.setDate(nextBilling.getDate() + 30);

                await subRef.update({
                    status: "active",
                    next_billing_date: nextBilling.toISOString(),
                    updated_at: new Date().toISOString()
                });

                const eventRef = db.collection("analytics_events").doc();
                await eventRef.set({
                    id: eventRef.id,
                    user_id: uid,
                    event_type: "subscription_active",
                    metadata: {
                        plan_type: "Monthly",
                        amount: event.data.amount || 0
                    },
                    timestamp: new Date().toISOString()
                });
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
        const userDoc = await db.collection("users").doc(uid).get();
        let userName = "Amarachi Okafor";
        let phone = "";
        let email = "";
        if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData?.name || "Amarachi Okafor";
            phone = userData?.phone || "";
            email = userData?.email || "";
        }

        const profileDoc = await db.collection("electricity_profiles").doc(uid).get();
        let tariffBand = "Band A";
        let disco = "EKEDC";
        let meterType = "Prepaid";
        if (profileDoc.exists) {
            const profileData = profileDoc.data();
            tariffBand = profileData?.tariff_band || "Band A";
            disco = profileData?.disco || "EKEDC";
            meterType = profileData?.meter_type || "Prepaid";
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

        const metersQuery = await db.collection("meters").where("user_id", "==", uid).limit(1).get();
        let currentUnits = 18.4;
        let meterNumber = "";
        if (!metersQuery.empty) {
            const mDoc = metersQuery.docs[0];
            currentUnits = mDoc.data().current_units ?? 18.4;
            meterNumber = mDoc.data().meter_number || mDoc.id || "";
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
        const hasActive = logs.some(log => log.power_off === null);
        const powerState = hasActive ? "on" : "off";
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
        const dailyBurnRate = calculatedBurnRate > 0 ? calculatedBurnRate : 4.3;
        const daysRemaining = Math.max(0, Math.ceil(currentUnits / dailyBurnRate));
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

        const subDoc = await db.collection("subscriptions").doc(uid).get();
        let subscription = { planType: "Free Trial", status: "trialing", endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString() };
        if (subDoc.exists) {
            const subData = subDoc.data();
            subscription = {
                planType: subData?.plan_type || "Free Trial",
                status: subData?.status || "trialing",
                endDate: subData?.end_date || new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()
            };
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
            subscription
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

        await batch.commit();
        response.status(200).send({ success: true });
    } catch (error) {
        logger.error("Error executing alerts trigger:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export const getHistoryData = onRequest({ cors: true }, async (request, response) => {
    try {
        const uid = (request.query.uid as string) || request.body.uid;
        if (!uid) {
            response.status(400).send({ error: "Missing uid" });
            return;
        }

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
        let dailyBurn = 0;
        appliancesQuery.docs.forEach(doc => {
            const app = doc.data();
            dailyBurn += ((app.custom_wattage || 0) * (app.hours_per_day || 0)) / 1000;
        });
        if (dailyBurn === 0) dailyBurn = 4.3;

        const profileDoc = await db.collection("electricity_profiles").doc(uid).get();
        let tariffRate = 209.50;
        if (profileDoc.exists) {
            const profileData = profileDoc.data();
            const tariffBand = profileData?.tariff_band || "Band A";
            const ratesMap: Record<string, number> = {
                "Band A": 209.50,
                "Band B": 62.50,
                "Band C": 50.00,
                "Band D": 37.50,
                "Band E": 37.50
            };
            tariffRate = ratesMap[tariffBand] ?? 209.50;
        }

        const usageLogs: any[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const variance = 0.85 + Math.random() * 0.3;
            const unitsUsed = Number((dailyBurn * variance).toFixed(2));
            const cost = Number((unitsUsed * tariffRate).toFixed(2));
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

        const profileDoc = await db.collection("electricity_profiles").doc(uid).get();
        let tariffBand = "Band A";
        if (profileDoc.exists) {
            const profileData = profileDoc.data();
            tariffBand = profileData?.tariff_band || "Band A";
        }

        let tariffRate = 209.50;
        const ratesMap: Record<string, number> = {
            "Band A": 209.50,
            "Band B": 62.50,
            "Band C": 50.00,
            "Band D": 37.50,
            "Band E": 37.50
        };
        tariffRate = ratesMap[tariffBand] ?? 209.50;

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

        if (dailyBurn === 0) {
            dailyBurn = 4.3;
        }

        const dailyUsage: any[] = [];
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = days[d.getDay()];
            const variance = 0.85 + Math.random() * 0.3;
            const kwh = Number((dailyBurn * variance).toFixed(2));
            const cost = Number((kwh * tariffRate).toFixed(2));
            dailyUsage.push({
                label: dayName,
                kwh,
                cost
            });
        }

        const weeklyUsage: any[] = [];
        for (let i = 3; i >= 0; i--) {
            const variance = 0.9 + Math.random() * 0.2;
            const kwh = Number((dailyBurn * 7 * variance).toFixed(2));
            const cost = Number((kwh * tariffRate).toFixed(2));
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
            const monthName = months[d.getMonth()];
            const variance = 0.92 + Math.random() * 0.16;
            const kwh = Number((dailyBurn * 30 * variance).toFixed(2));
            const cost = Number((kwh * tariffRate).toFixed(2));
            monthlyUsage.push({
                label: monthName,
                kwh,
                cost
            });
        }

        const sortedApps = [...appliancesList].sort((a, b) => b.kwh - a.kwh);
        const applianceBreakdown = sortedApps.map(app => {
            const pct = dailyBurn > 0 ? (app.kwh / dailyBurn) * 100 : 0;
            return {
                name: app.name,
                percentage: Number(pct.toFixed(0)),
                kwh: Number(app.kwh.toFixed(1)),
                cost: Number((app.kwh * tariffRate).toFixed(2))
            };
        });

        if (applianceBreakdown.length === 0) {
            applianceBreakdown.push(
                { name: "Refrigerator", percentage: 58, kwh: 2.5, cost: Number((2.5 * tariffRate).toFixed(2)) },
                { name: "Fan", percentage: 23, kwh: 1.0, cost: Number((1.0 * tariffRate).toFixed(2)) },
                { name: "TV & Electronics", percentage: 19, kwh: 0.8, cost: Number((0.8 * tariffRate).toFixed(2)) }
            );
        }

        const insights: any[] = [];
        const weeklyPctChange = Math.floor(10 + Math.random() * 15);
        const moreOrLess = Math.random() > 0.4 ? "more" : "less";

        insights.push({
            text: `You used ${weeklyPctChange}% ${moreOrLess} electricity this week compared to last week.`,
            type: moreOrLess === "less" ? "positive" : "negative",
            icon: moreOrLess === "less" ? "trending-down" : "trending-up",
            impact: `${moreOrLess === "less" ? "Saved" : "Added"} ~${(dailyBurn * weeklyPctChange * 0.07).toFixed(1)} kWh`
        });

        const topApp = applianceBreakdown[0];
        const acSavings = Math.floor(topApp.cost * 30 * 0.2);
        insights.push({
            text: `Reducing your ${topApp.name} runtime by just 1 hour daily will save you approximately ₦${acSavings.toLocaleString()} monthly.`,
            type: "positive",
            icon: "bulb",
            impact: `Saves ₦${acSavings.toLocaleString()}/mo`
        });

        const thresholdUnits = 15;
        const lowUnitAlertDay = Math.ceil(thresholdUnits / dailyBurn);
        insights.push({
            text: `Your current burn rate (${dailyBurn.toFixed(1)} kWh/d) means a ₦10,000 recharge lasts ~${lowUnitAlertDay} days.`,
            type: "neutral",
            icon: "leaf",
            impact: `Target: ${lowUnitAlertDay}d`
        });

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
