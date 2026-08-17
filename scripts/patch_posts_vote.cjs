const fs = require('fs');
let content = fs.readFileSync('server/routes/posts.ts', 'utf8');

const targetVote = `export const postsRouter = Router();`;

const replacementVote = `export const postsRouter = Router();

postsRouter.post("/:id/poll/vote", requireAuth, strictLimiter, async (req, res) => {
  try {
    const postId = parseInt(req.params.id as string);
    const currentUserId = req.user!.userId;
    const { optionId } = req.body;
    
    if (!optionId) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "optionId gereklidir." } });
    }

    // Check if post is a poll
    const postRecord = await db.select({ postType: posts.postType }).from(posts).where(eq(posts.id, postId)).limit(1);
    if (postRecord.length === 0 || postRecord[0].postType !== 'POLL') {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Anket bulunamadı." } });
    }

    // Check if option belongs to this poll
    const optionRecord = await db.select().from(pollOptions).where(and(eq(pollOptions.id, optionId), eq(pollOptions.postId, postId))).limit(1);
    if (optionRecord.length === 0) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz seçenek." } });
    }

    try {
      await db.insert(pollVotes).values({
        postId,
        optionId,
        userId: currentUserId
      });
      return res.json({ success: true, data: { message: "Oy kullanıldı." } });
    } catch (dbError: any) {
      if (dbError.code === '23505') { // Unique violation
        return res.status(400).json({ success: false, error: { code: "ALREADY_VOTED", message: "Bu ankette zaten oy kullandınız." } });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Poll vote error:", error);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Sunucu hatası." } });
  }
});`;

content = content.replace(targetVote, replacementVote);
fs.writeFileSync('server/routes/posts.ts', content);
