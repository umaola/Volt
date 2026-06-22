const admin = require("firebase-admin");

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

admin.initializeApp({
  projectId: "volt-test-e8e0b"
});

const db = admin.firestore();

async function run() {
  const users = await db.collection("users").get();
  console.log(`=== USERS (${users.size}) ===`);
  users.forEach(doc => {
    console.log(doc.id, "=>", JSON.stringify(doc.data(), null, 2));
  });

  const meters = await db.collection("meters").get();
  console.log(`=== METERS (${meters.size}) ===`);
  meters.forEach(doc => {
    console.log(doc.id, "=>", JSON.stringify(doc.data(), null, 2));
  });

  const appliances = await db.collection("user_appliances").get();
  console.log(`=== USER APPLIANCES (${appliances.size}) ===`);
  appliances.forEach(doc => {
    console.log(doc.id, "=>", JSON.stringify(doc.data(), null, 2));
  });

  const logs = await db.collection("power_supply_logs").get();
  console.log(`=== POWER SUPPLY LOGS (${logs.size}) ===`);
  logs.forEach(doc => {
    console.log(doc.id, "=>", JSON.stringify(doc.data(), null, 2));
  });

  const profiles = await db.collection("electricity_profiles").get();
  console.log(`=== ELECTRICITY PROFILES (${profiles.size}) ===`);
  profiles.forEach(doc => {
    console.log(doc.id, "=>", JSON.stringify(doc.data(), null, 2));
  });
}

run().catch(console.error);
