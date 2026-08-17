import { db } from "./src/db/index.js";
import { users } from "./src/db/schema.js";
import { generateAccessToken } from "./server/utils/jwt.js";

async function run() {
  const user = await db.insert(users).values({
    username: "testuploader",
    email: "upload@upload.com",
    passwordHash: "123",
    role: "USER"
  }).returning();

  const token = generateAccessToken(user[0].id, user[0].role);
  console.log(token);
}
run();
