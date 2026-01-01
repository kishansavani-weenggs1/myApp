import { seedAdmins } from "./seed-admins.js";

void (async () => {
  try {
    console.log("Seeding admins...");
    await seedAdmins();
    console.log("Seeding completed");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed", err);
    process.exit(1);
  }
})();
