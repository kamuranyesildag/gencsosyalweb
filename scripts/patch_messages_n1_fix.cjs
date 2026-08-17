const fs = require('fs');
const file = 'server/routes/messages.ts';
let content = fs.readFileSync(file, 'utf8');

// I will just revert to the original because PostgreSQL DISTINCT ON is not directly supported 
// out of the box in simple Drizzle ORM syntax without sql\`\` blocks, and fetching all messages is a memory leak.
const search = `    // Attach other member and last message
    const pConvIds = convs.map(c => c.id);
    let allOtherMembers: any[] = [];
    let allLastMsgs: any[] = [];
    
    if (pConvIds.length > 0) {
      allOtherMembers = await db.select({
        conversationId: conversationMembers.conversationId,
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(inArray(conversationMembers.conversationId, pConvIds), not(eq(conversationMembers.userId, currentUserId))));

      // For last messages, we could use a distinct or window function, 
      // but simple fetch works if the limit is small per conversation, or just fetch all and group by code
      // We will fetch all messages for these convs and sort them in JS to find the last one.
      allLastMsgs = await db.select().from(messages)
        .where(inArray(messages.conversationId, pConvIds))
        .orderBy(desc(messages.createdAt)); // In memory filter is fast enough for limited history or small pagination
    }

    for (let c of convs) {
      const members = allOtherMembers.filter(m => m.conversationId === c.id);
      (c as any).otherUser = members.length > 0 ? members[0] : null;

      const msgs = allLastMsgs.filter(m => m.conversationId === c.id);
      (c as any).lastMessage = msgs.length > 0 ? msgs[0] : null;
    }`;

const replace = `    // Attach other member and last message
    for (let c of convs) {
      const otherMembers = await db.select({
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(eq(conversationMembers.conversationId, c.id), not(eq(conversationMembers.userId, currentUserId))))
      .limit(1);

      (c as any).otherUser = otherMembers.length > 0 ? otherMembers[0] : null;

      const lastMsgs = await db.select().from(messages).where(eq(messages.conversationId, c.id)).orderBy(desc(messages.createdAt)).limit(1);
      (c as any).lastMessage = lastMsgs.length > 0 ? lastMsgs[0] : null;
    }`;

content = content.replace(search, replace);
fs.writeFileSync(file, content);
console.log("Reverted messages N+1 memory issue");
