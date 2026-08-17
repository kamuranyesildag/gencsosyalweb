const fs = require('fs');

const path = 'server/routes/messages.ts';
let content = fs.readFileSync(path, 'utf8');

const replacement = `
    const userConvs = await db.select({ convId: conversationMembers.conversationId }).from(conversationMembers).where(eq(conversationMembers.userId, currentUserId));
    const userConvIds = userConvs.map(c => c.convId);
    if (userConvIds.length > 0) {
      const targetConvs = await db.select({ convId: conversationMembers.conversationId }).from(conversationMembers).where(and(eq(conversationMembers.userId, targetUserId), inArray(conversationMembers.conversationId, userConvIds))).limit(1);
      if (targetConvs.length > 0) {
        const [existing] = await db.select().from(conversations).where(eq(conversations.id, targetConvs[0].convId)).limit(1);
        return res.json({ success: true, data: existing });
      }
    }

    const [conv] = await db.insert(conversations).values({}).returning();`;

content = content.replace('const [conv] = await db.insert(conversations).values({}).returning();', replacement);
fs.writeFileSync(path, content);
