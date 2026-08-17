import { db } from "./src/db/index.js";
import { conversations, conversationMembers, messages, users } from "./src/db/schema.js";
import { eq } from "drizzle-orm";

async function test() {
  try {
    const userA = await db.insert(users).values({ username: "userA", email: "a@a.com", passwordHash: "123", role: "USER" }).returning();
    const userB = await db.insert(users).values({ username: "userB", email: "b@b.com", passwordHash: "123", role: "USER" }).returning();

    const conv = await db.insert(conversations).values({}).returning();
    await db.insert(conversationMembers).values([
      { conversationId: conv[0].id, userId: userA[0].id },
      { conversationId: conv[0].id, userId: userB[0].id }
    ]);

    const msg = await db.insert(messages).values({
      conversationId: conv[0].id,
      senderId: userA[0].id,
      content: "Hello User B"
    }).returning();

    console.log("Created message:", msg[0].id, "isRead:", msg[0].isRead);
  } catch (err) {
    console.error(err);
  }
}
test();
