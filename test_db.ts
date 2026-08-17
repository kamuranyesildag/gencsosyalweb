import { db } from "./src/db/index.js";
import { stories, users } from "./src/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
    const res = await db.select().from(stories).innerJoin(users, eq(stories.userId, users.id));
    console.log("Total Stories:", res.length);
    process.exit(0);
}
main();
