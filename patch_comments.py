import re

with open("server/routes/posts.ts", "r") as f:
    content = f.read()

comment_create_target = """    const comment = await db.transaction(async (tx) => {
      const [newComment] = await tx.insert(comments).values({
        postId,
        userId: currentUserId,
        content: parsed.data.content,
        parentId: parsed.data.parentId,
      }).returning();"""

comment_create_replacement = """    const modResult = await moderateContent(parsed.data.content);
    const modStatus = modResult.riskLevel === 'HIGH_RISK' ? 'REJECTED' : (modResult.riskLevel === 'MEDIUM_RISK' ? 'PENDING' : 'APPROVED');
    
    if (modStatus === 'REJECTED') {
      return res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "Bu içerik topluluk kurallarımızla uyumlu olmadığı için yayınlanamadı." }});
    }

    const comment = await db.transaction(async (tx) => {
      const [newComment] = await tx.insert(comments).values({
        postId,
        userId: currentUserId,
        content: parsed.data.content,
        parentId: parsed.data.parentId,
        moderationStatus: modStatus
      }).returning();
      
      await tx.insert(moderationLogs).values({
         entityType: 'COMMENT',
         entityId: newComment.id,
         userId: currentUserId,
         status: modStatus === 'PENDING' ? 'PENDING' : 'RESOLVED',
         actionTaken: modStatus === 'APPROVED' ? 'APPROVED' : null,
         riskLevel: modResult.riskLevel,
         category: modResult.category,
         reason: modResult.reason || null
      });"""

content = content.replace(comment_create_target, comment_create_replacement)

with open("server/routes/posts.ts", "w") as f:
    f.write(content)
