import { db } from "./src/db/index.js";
import { users } from "./src/db/schema.js";

async function test() {
  try {
    const allUsers = await db.select().from(users);
    console.log("DB test success:", allUsers);
  } catch (err) {
    console.error("DB test failed (Expected if not running Postgres):", err);
  }
}
test();
