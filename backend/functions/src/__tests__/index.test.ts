process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.GCLOUD_PROJECT = "volt-test-e8e0b";

import { describe, expect, it, beforeEach, afterAll, jest } from "@jest/globals";
import { getFirestore } from "firebase-admin/firestore";
import { deleteApp, getApps } from "firebase-admin/app";
import {
  validatePassword,
  createUser,
  saveOnboardingProfile,
  logRecharge,
  getDashboardData,
  getHistoryData,
  getInsightsData,
  seedTariffRates,
  updateTariffRate,
  reportOutage,
  reportPowerBack,
  getOutageMap,
  exportOutageHistory
} from "../index";

const db = getFirestore();

function mockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.on = jest.fn().mockReturnValue(res);
  res.once = jest.fn().mockReturnValue(res);
  res.emit = jest.fn().mockReturnValue(res);
  res.removeListener = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.getHeader = jest.fn().mockReturnValue(res);
  res.writeHead = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
}

function mockRequest(body: any = {}, query: any = {}, method: string = "POST") {
  return {
    method,
    headers: {},
    body,
    query
  } as any;
}

describe("Backend Functions Tests", () => {
  jest.setTimeout(60000);
  afterAll(async () => {
    await db.terminate();
    const apps = getApps();
    for (const app of apps) {
      await deleteApp(app);
    }
  });

  beforeEach(async () => {
    const collections = [
      "users",
      "meters",
      "recharges",
      "electricity_profiles",
      "user_appliances",
      "power_supply_logs",
      "tariff_rates",
      "notifications",
      "outage_reports",
      "grid_states"
    ];
    for (const collName of collections) {
      const snap = await db.collection(collName).get();
      for (const doc of snap.docs) {
        await doc.ref.delete();
      }
    }
  });

  describe("validatePassword", () => {
    it("should accept valid passwords", () => {
      const req = mockRequest({ password: "ValidPassword123!" });
      const res = mockResponse();

      validatePassword(req, res);

      expect(res.status).not.toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        valid: true,
        criteria: {
          hasMinLength: true,
          hasCapital: true,
          hasNumber: true,
          hasSpecial: true
        }
      });
    });

    it("should reject weak passwords", () => {
      const req = mockRequest({ password: "weak" });
      const res = mockResponse();

      validatePassword(req, res);

      expect(res.send).toHaveBeenCalledWith({
        valid: false,
        criteria: {
          hasMinLength: false,
          hasCapital: false,
          hasNumber: false,
          hasSpecial: false
        }
      });
    });
  });

  describe("createUser", () => {
    it("should create a new user profile in firestore", async () => {
      const req = mockRequest({
        uid: "test-user-123",
        name: "Test User Name",
        email: "testuser@gmail.com",
        phone: "+2348000000000"
      });
      const res = mockResponse();

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: true });

      const doc = await db.collection("users").doc("test-user-123").get();
      expect(doc.exists).toBe(true);
      expect(doc.data()).toEqual(
        expect.objectContaining({
          uid: "test-user-123",
          name: "Test User Name",
          email: "testuser@gmail.com",
          phone: "+2348000000000",
          is_active: true
        })
      );
    });

    it("should return 400 if required fields are missing", async () => {
      const req = mockRequest({
        uid: "test-user-123"
      });
      const res = mockResponse();

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Missing required fields" });
    });
  });

  describe("saveOnboardingProfile", () => {
    it("should save onboarding profile and start power log if powerState is on", async () => {
      const req = mockRequest({
        uid: "test-user-123",
        meterNumber: "METER123",
        disco: "EKEDC",
        tariffBand: "Band A",
        meterType: "Prepaid",
        appliances: [{ name: "Fan", wattage: 75, hours: 8 }],
        currentUnits: 150.5,
        powerState: "on"
      });
      const res = mockResponse();

      await saveOnboardingProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: true });

      const profileDoc = await db.collection("electricity_profiles").doc("test-user-123").get();
      expect(profileDoc.exists).toBe(true);
      expect(profileDoc.data()?.disco).toBe("EKEDC");

      const meterDoc = await db.collection("meters").doc("METER123").get();
      expect(meterDoc.exists).toBe(true);
      expect(meterDoc.data()?.current_units).toBe(150.5);

      const logs = await db.collection("power_supply_logs")
        .where("user_id", "==", "test-user-123")
        .where("power_off", "==", null)
        .get();
      expect(logs.size).toBe(1);
    });

    it("should save onboarding profile and not start power log if powerState is off", async () => {
      const req = mockRequest({
        uid: "test-user-123",
        meterNumber: "METER123",
        disco: "EKEDC",
        tariffBand: "Band A",
        meterType: "Prepaid",
        appliances: [],
        currentUnits: 100,
        powerState: "off"
      });
      const res = mockResponse();

      await saveOnboardingProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      const logs = await db.collection("power_supply_logs")
        .where("user_id", "==", "test-user-123")
        .get();
      expect(logs.size).toBe(0);
    });
  });

  describe("logRecharge", () => {
    it("should record a recharge and update current units on the meter", async () => {
      await db.collection("meters").doc("METER123").set({
        user_id: "test-user-123",
        meter_number: "METER123",
        current_units: 10
      });

      const req = mockRequest({
        uid: "test-user-123",
        amount: 5000,
        units: 24.5,
        tariffRate: 209.5
      });
      const res = mockResponse();

      await logRecharge(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: true, newUnits: 34.5 });

      const meterDoc = await db.collection("meters").doc("METER123").get();
      expect(meterDoc.data()?.current_units).toBe(34.5);

      const recharges = await db.collection("recharges").where("user_id", "==", "test-user-123").get();
      expect(recharges.size).toBe(1);
      expect(recharges.docs[0].data()).toEqual(
        expect.objectContaining({
          user_id: "test-user-123",
          amount_paid: 5000,
          units_received: 24.5,
          tariff_rate: 209.5
        })
      );
    });
  });

  describe("getDashboardData", () => {
    it("should return onboarding status and remaining units", async () => {
      await db.collection("users").doc("test-user-123").set({
        uid: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      });

      await db.collection("electricity_profiles").doc("test-user-123").set({
        user_id: "test-user-123",
        disco: "EKEDC",
        tariff_band: "Band A",
        meter_type: "Prepaid"
      });

      await db.collection("meters").doc("METER123").set({
        user_id: "test-user-123",
        meter_number: "METER123",
        current_units: 45.2
      });

      const req = mockRequest({}, { uid: "test-user-123" }, "GET");
      const res = mockResponse();

      await getDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: "Test User",
          meterNumber: "METER123",
          disco: "EKEDC",
          meterType: "Prepaid",
          remainingUnits: 45.2,
          tariffBand: "Band A"
        })
      );
    });

    it("should return dailyBurnRate: 0 for a new user (<24h)", async () => {
      await db.collection("users").doc("test-user-123").set({
        uid: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        created_at: new Date().toISOString()
      });

      await db.collection("electricity_profiles").doc("test-user-123").set({
        user_id: "test-user-123",
        disco: "EKEDC",
        tariff_band: "Band A",
        meter_type: "Prepaid"
      });

      await db.collection("meters").doc("METER123").set({
        user_id: "test-user-123",
        meter_number: "METER123",
        current_units: 45.2
      });

      const req = mockRequest({}, { uid: "test-user-123" }, "GET");
      const res = mockResponse();

      await getDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.send.mock.calls[0][0];
      expect(data.dailyBurnRate).toBe(0);
      expect(data.daysRemaining).toBe(0);
    });
  });

  describe("seedTariffRates", () => {
    it("should seed the tariff rates in the database", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await seedTariffRates(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: true, count: 60 });

      const snap = await db.collection("tariff_rates").get();
      expect(snap.size).toBe(60);
    });
  });

  describe("getHistoryData", () => {
    it("should query database-driven tariff rates for the user", async () => {
      await db.collection("electricity_profiles").doc("test-user-123").set({
        user_id: "test-user-123",
        disco: "IKEDC",
        tariff_band: "Band B"
      });

      await db.collection("tariff_rates").doc("IKEDC_BandB").set({
        disco_id: "IKEDC",
        band: "Band B",
        rate_per_kwh: 63.20,
        is_active: true
      });

      await db.collection("power_supply_logs").doc("log-1").set({
        id: "log-1",
        user_id: "test-user-123",
        power_on: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        power_off: null,
        duration_hours: 8 * 24,
        source: "manual"
      });

      const req = mockRequest({}, { uid: "test-user-123" }, "GET");
      const res = mockResponse();

      await getHistoryData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.send.mock.calls[0][0];
      expect(data).toHaveProperty("recharges");
      expect(data).toHaveProperty("powerLogs");
      expect(data).toHaveProperty("usageLogs");

      const usageLogs = data.usageLogs;
      expect(usageLogs.length).toBe(7);
      const resolvedRate = usageLogs[0].cost / usageLogs[0].unitsUsed;
      expect(resolvedRate).toBeCloseTo(63.20, 1);
    });

    it("should filter out usage logs before onboarding date", async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      await db.collection("electricity_profiles").doc("test-user-123").set({
        user_id: "test-user-123",
        disco: "IKEDC",
        tariff_band: "Band B",
        created_at: twoDaysAgo.toISOString()
      });

      const req = mockRequest({}, { uid: "test-user-123" }, "GET");
      const res = mockResponse();

      await getHistoryData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.send.mock.calls[0][0];
      const usageLogs = data.usageLogs;
      expect(usageLogs.length).toBeLessThanOrEqual(3);
    });
  });

  describe("getInsightsData", () => {
    it("should return daily, weekly, monthly usage and insights using DB rates", async () => {
      await db.collection("users").doc("test-user-123").set({
        uid: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      });

      await db.collection("electricity_profiles").doc("test-user-123").set({
        user_id: "test-user-123",
        disco: "IKEDC",
        tariff_band: "Band B"
      });

      await db.collection("tariff_rates").doc("IKEDC_BandB").set({
        disco_id: "IKEDC",
        band: "Band B",
        rate_per_kwh: 63.20,
        is_active: true
      });

      await db.collection("user_appliances").doc("test-user-123_Fridge").set({
        user_id: "test-user-123",
        name: "Fridge",
        custom_wattage: 1000,
        hours_per_day: 4,
        is_active: true
      });

      await db.collection("power_supply_logs").doc("log-1").set({
        id: "log-1",
        user_id: "test-user-123",
        power_on: new Date(Date.now() - 6.9 * 24 * 3600 * 1000).toISOString(),
        power_off: new Date().toISOString(),
        duration_hours: 6.9 * 24.0,
        source: "manual"
      });

      const req = mockRequest({}, { uid: "test-user-123" }, "GET");
      const res = mockResponse();

      await getInsightsData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.send.mock.calls[0][0];
      expect(data).toHaveProperty("dailyUsage");
      expect(data).toHaveProperty("weeklyUsage");
      expect(data).toHaveProperty("monthlyUsage");
      expect(data).toHaveProperty("insights");
      expect(data).toHaveProperty("applianceBreakdown");

      const dailyUsage = data.dailyUsage;
      const resolvedRate = dailyUsage[0].cost / dailyUsage[0].kwh;
      expect(resolvedRate).toBeCloseTo(63.20, 1);
    });

    it("should filter out daily, weekly, monthly usage and insights before onboarding date", async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      await db.collection("users").doc("test-user-123").set({
        uid: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        created_at: twoDaysAgo.toISOString()
      });

      await db.collection("electricity_profiles").doc("test-user-123").set({
        user_id: "test-user-123",
        disco: "IKEDC",
        tariff_band: "Band B",
        created_at: twoDaysAgo.toISOString()
      });

      const req = mockRequest({}, { uid: "test-user-123" }, "GET");
      const res = mockResponse();

      await getInsightsData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.send.mock.calls[0][0];
      expect(data.dailyUsage.length).toBeLessThanOrEqual(3);
    });
  });

  describe("updateTariffRate", () => {
    it("should update rate, record history, and notify users", async () => {
      await db.collection("electricity_profiles").doc("test-user-123").set({
        user_id: "test-user-123",
        disco: "IKEDC",
        tariff_band: "Band B"
      });

      await db.collection("tariff_rates").doc("IKEDC_BandB").set({
        disco_id: "IKEDC",
        band: "Band B",
        rate_per_kwh: 63.20,
        is_active: true,
        history: [
          {
            rate: 63.20,
            effective_from: new Date(Date.now() - 1000000).toISOString()
          }
        ]
      });

      const req = mockRequest({
        disco: "IKEDC",
        band: "Band B",
        rate: 75.00
      });
      const res = mockResponse();

      await updateTariffRate(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: true, updated: true });

      const updatedDoc = await db.collection("tariff_rates").doc("IKEDC_BandB").get();
      const data = updatedDoc.data()!;
      expect(data.rate_per_kwh).toBe(75.00);
      expect(data.history.length).toBe(2);
      expect(data.history[1].rate).toBe(75.00);

      const notifs = await db.collection("notifications").where("user_id", "==", "test-user-123").get();
      expect(notifs.size).toBe(1);
      expect(notifs.docs[0].data()).toEqual(
        expect.objectContaining({
          notification_type: "tariff_adjustment",
          title: "IKEDC Band B Tariff Update",
          body: "Your tariff rate has been updated from ₦63.20 to ₦75.00/kWh."
        })
      );
    });
  });

  describe("getHistoryData historical calculation", () => {
    it("should resolve different rates for logs before and after a tariff change", async () => {
      await db.collection("electricity_profiles").doc("test-user-123").set({
        user_id: "test-user-123",
        disco: "IKEDC",
        tariff_band: "Band B"
      });

      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      await db.collection("tariff_rates").doc("IKEDC_BandB").set({
        disco_id: "IKEDC",
        band: "Band B",
        rate_per_kwh: 80.00,
        is_active: true,
        history: [
          {
            rate: 50.00,
            effective_from: sixDaysAgo.toISOString()
          },
          {
            rate: 80.00,
            effective_from: oneDayAgo.toISOString()
          }
        ]
      });

      await db.collection("power_supply_logs").doc("log-1").set({
        id: "log-1",
        user_id: "test-user-123",
        power_on: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        power_off: null,
        duration_hours: 8 * 24,
        source: "manual"
      });

      const req = mockRequest({}, { uid: "test-user-123" }, "GET");
      const res = mockResponse();

      await getHistoryData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.send.mock.calls[0][0];
      const usageLogs = data.usageLogs;

      const logToday = usageLogs[0];
      const logSixDaysAgo = usageLogs[6];

      const rateToday = logToday.cost / logToday.unitsUsed;
      const rateSixDaysAgo = logSixDaysAgo.cost / logSixDaysAgo.unitsUsed;

      expect(rateToday).toBeCloseTo(80.00, 1);
      expect(rateSixDaysAgo).toBeCloseTo(50.00, 1);
    });
  });

  describe("outage monitoring", () => {
    it("should handle reportOutage Rule of Three and notify neighbors", async () => {
      await db.collection("electricity_profiles").doc("test-user-1").set({
        user_id: "test-user-1",
        state: "Lagos",
        city: "Ikeja",
        neighbors_warned: 0
      });

      await db.collection("electricity_profiles").doc("test-user-2").set({
        user_id: "test-user-2",
        state: "Lagos",
        city: "Ikeja",
        neighbors_warned: 0
      });

      await db.collection("electricity_profiles").doc("test-user-3").set({
        user_id: "test-user-3",
        state: "Lagos",
        city: "Ikeja",
        neighbors_warned: 0
      });

      await reportOutage(mockRequest({
        uid: "test-user-1",
        latitude: 6.5244,
        longitude: 3.3792,
        state: "Lagos",
        city: "Ikeja"
      }), mockResponse());

      await reportOutage(mockRequest({
        uid: "test-user-2",
        latitude: 6.5245,
        longitude: 3.3793,
        state: "Lagos",
        city: "Ikeja"
      }), mockResponse());

      const res = mockResponse();
      await reportOutage(mockRequest({
        uid: "test-user-3",
        latitude: 6.5243,
        longitude: 3.3791,
        state: "Lagos",
        city: "Ikeja"
      }), res);

      expect(res.status).toHaveBeenCalledWith(200);

      const gridState = await db.collection("grid_states").doc("Lagos_Ikeja").get();
      expect(gridState.exists).toBe(true);
      expect(gridState.data()?.state).toBe("GRID_DOWN");

      const prof3 = await db.collection("electricity_profiles").doc("test-user-3").get();
      expect(prof3.data()?.neighbors_warned).toBeGreaterThan(0);

      const notifs = await db.collection("notifications").where("notification_type", "==", "grid_down_alert").get();
      expect(notifs.size).toBe(2);
    });

    it("should handle reportPowerBack Rule of Three", async () => {
      await db.collection("electricity_profiles").doc("test-user-1").set({
        user_id: "test-user-1",
        state: "Lagos",
        city: "Ikeja"
      });

      await db.collection("electricity_profiles").doc("test-user-2").set({
        user_id: "test-user-2",
        state: "Lagos",
        city: "Ikeja"
      });

      await db.collection("electricity_profiles").doc("test-user-3").set({
        user_id: "test-user-3",
        state: "Lagos",
        city: "Ikeja"
      });

      await db.collection("grid_states").doc("Lagos_Ikeja").set({
        id: "Lagos_Ikeja",
        state: "GRID_DOWN"
      });

      await reportPowerBack(mockRequest({
        uid: "test-user-1",
        latitude: 6.5244,
        longitude: 3.3792,
        state: "Lagos",
        city: "Ikeja"
      }), mockResponse());

      await reportPowerBack(mockRequest({
        uid: "test-user-2",
        latitude: 6.5245,
        longitude: 3.3793,
        state: "Lagos",
        city: "Ikeja"
      }), mockResponse());

      const res = mockResponse();
      await reportPowerBack(mockRequest({
        uid: "test-user-3",
        latitude: 6.5243,
        longitude: 3.3791,
        state: "Lagos",
        city: "Ikeja"
      }), res);

      expect(res.status).toHaveBeenCalledWith(200);

      const gridState = await db.collection("grid_states").doc("Lagos_Ikeja").get();
      expect(gridState.data()?.state).toBe("GRID_ACTIVE");
    });

    it("should retrieve outage map data", async () => {
      await db.collection("grid_states").doc("Lagos_Ikeja").set({
        id: "Lagos_Ikeja",
        state: "GRID_DOWN"
      });

      await db.collection("outage_reports").doc("report-1").set({
        id: "report-1",
        user_id: "test-user-1",
        status: "outage",
        state: "Lagos",
        city: "Ikeja",
        latitude: 6.5244,
        longitude: 3.3792,
        created_at: new Date().toISOString()
      });

      const req = mockRequest({}, { state: "Lagos", city: "Ikeja" }, "GET");
      const res = mockResponse();

      await getOutageMap(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.send.mock.calls[0][0];
      expect(data.gridState).toBe("GRID_DOWN");
      expect(data.reports.length).toBe(1);
    });

    it("should export outage supply history details", async () => {
      await db.collection("power_supply_logs").doc("log-1").set({
        id: "log-1",
        user_id: "test-user-1",
        power_on: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        power_off: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        duration_hours: 5.0,
        source: "manual"
      });

      const req = mockRequest({}, { uid: "test-user-1", days: 7 }, "GET");
      const res = mockResponse();

      await exportOutageHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.send.mock.calls[0][0];
      expect(data.totalSupplyHours).toBe(5.0);
      expect(data.totalDowntimeHours).toBeCloseTo(7 * 24 - 5.0, 1);
      expect(data.events.length).toBe(1);
    });
  });
});
