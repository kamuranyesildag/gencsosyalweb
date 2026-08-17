import { db } from "./src/db/index.js";
import { users, posts } from "./src/db/schema.js";
import { eq } from "drizzle-orm";
import { verifyPostAccess } from "./server/utils/visibility.js";

async function runTest() {
  try {
    const allUsers = await db.select().from(users).limit(2);
    if (allUsers.length < 2) {
      console.log("Need at least 2 users");
      process.exit(0);
    }
    const userA = allUsers[0];
    const userB = allUsers[1];

    // Create a private post for user A
    const [newPost] = await db.insert(posts).values({
      userId: userA.id,
      content: "Private test",
      visibility: "PRIVATE"
    }).returning();

    // User B tries to access it
    const hasAccess = await verifyPostAccess(newPost.id, userB.id);
    console.log("User B access to User A's private post:", hasAccess);

    if (hasAccess) {
      console.error("IDOR VULNERABILITY FOUND: User B can access User A's private post!");
    } else {
      console.log("IDOR TEST PASSED: Access denied.");
    }

    // Clean up
    await db.delete(posts).where(eq(posts.id, newPost.id));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runTest();
