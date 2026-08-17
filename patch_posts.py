import re

with open("server/routes/posts.ts", "r") as f:
    content = f.read()

# Add imports
import_target = "import { createPostSchema, createCommentSchema } from \"../validators/api.js\";"
import_replacement = "import { createPostSchema, createCommentSchema } from \"../validators/api.js\";\nimport { moderateContent } from \"../services/moderation/index.js\";\nimport { moderationLogs } from \"../../src/db/schema.js\";"
if "moderateContent" not in content:
    content = content.replace(import_target, import_replacement)

# Post creation block
post_create_target = """    let finalVisibility = visibility;
    if (!finalVisibility) { 
       const p = await db.select({ defaultPostVisibility: profiles.defaultPostVisibility }).from(profiles).where(eq(profiles.userId, currentUserId)).limit(1);
       finalVisibility = p.length > 0 ? p[0].defaultPostVisibility as any : "PUBLIC";
    }

    const result = await db.transaction(async (tx) => {
      const [newPost] = await tx.insert(posts).values({
        userId: currentUserId,
        content: content || null,
        visibility: finalVisibility as any,
        postType: parsed.data.postType,
        contentWarning: parsed.data.contentWarning || null,
      }).returning();"""

post_create_replacement = """    let finalVisibility = visibility;
    if (!finalVisibility) { 
       const p = await db.select({ defaultPostVisibility: profiles.defaultPostVisibility }).from(profiles).where(eq(profiles.userId, currentUserId)).limit(1);
       finalVisibility = p.length > 0 ? p[0].defaultPostVisibility as any : "PUBLIC";
    }

    const modResult = await moderateContent(content || "");
    const modStatus = modResult.riskLevel === 'HIGH_RISK' ? 'REJECTED' : (modResult.riskLevel === 'MEDIUM_RISK' ? 'PENDING' : 'APPROVED');
    
    if (modStatus === 'REJECTED') {
      return res.status(403).json({ success: false, error: { code: "POLICY_VIOLATION", message: "Bu içerik topluluk kurallarımızla uyumlu olmadığı için yayınlanamadı." }});
    }

    const result = await db.transaction(async (tx) => {
      const [newPost] = await tx.insert(posts).values({
        userId: currentUserId,
        content: content || null,
        visibility: finalVisibility as any,
        postType: parsed.data.postType,
        contentWarning: parsed.data.contentWarning || null,
        moderationStatus: modStatus
      }).returning();
      
      await tx.insert(moderationLogs).values({
         entityType: 'POST',
         entityId: newPost.id,
         userId: currentUserId,
         status: modStatus === 'PENDING' ? 'PENDING' : 'RESOLVED',
         actionTaken: modStatus === 'APPROVED' ? 'APPROVED' : null,
         riskLevel: modResult.riskLevel,
         category: modResult.category,
         reason: modResult.reason || null
      });"""

content = content.replace(post_create_target, post_create_replacement)

with open("server/routes/posts.ts", "w") as f:
    f.write(content)
