import { db } from "../index.js";
import { users } from "../schema.js";
import { hashPassword } from "../../utils/common.js";
import { UserRole } from "../../config/constants.js";
import { insertUserSchema } from "../validate-schema.js";

const admins = [
  {
    name: "Admin",
    email: "admin@example.com",
  },
  {
    name: "Kishan",
    email: "kishan.savani@weenggs.in",
  },
];

export async function seedAdmins() {
  for (const admin of admins) {
    const hashedPassword = await hashPassword("admin");

    const insertData = insertUserSchema.parse({
      name: admin.name,
      email: admin.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const [{ id: insertId }] = await db
      .insert(users)
      .values(insertData)
      .$returningId();

    console.log(`Admin seeded: ${insertId} ${admin.email}`);
  }
  return true;
}
