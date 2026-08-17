import sys

with open("server/routes/users.ts", "r") as f:
    content = f.read()

old_get_user = """    const isFollowingRes = await db.select().from(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUser.id))).limit(1);

    const responseData: any = {
      ...targetUser,
      followersCount: followerCountRes[0].count,
      followingCount: followingCountRes[0].count,
      isFollowing: isFollowingRes.length > 0
    };"""

new_get_user = """    const isFollowingRes = await db.select().from(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUser.id))).limit(1);

    const responseData: any = {
      ...targetUser,
      followersCount: followerCountRes[0].count,
      followingCount: followingCountRes[0].count,
      isFollowing: isFollowingRes.length > 0,
      notificationPreference: isFollowingRes.length > 0 ? isFollowingRes[0].notificationPreference : null,
    };"""

if old_get_user in content:
    content = content.replace(old_get_user, new_get_user)
    print("Patched GET /:username successfully")
else:
    print("Could not find old_get_user block")

new_route = """

usersRouter.put("/:id/follow-preference", requireAuth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const currentUserId = req.user!.userId;
    const { preference } = req.body;
    
    if (isNaN(targetUserId) || !['none', 'standard', 'all'].includes(preference)) {
      return res.status(400).json({ success: false, error: { message: "Geçersiz istek." }});
    }

    const result = await db.update(follows)
      .set({ notificationPreference: preference })
      .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId)));
      
    if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: { message: "Kullanıcı takip edilmiyor." }});
    }
    
    res.json({ success: true, message: "Bildirim tercihi güncellendi." });
  } catch (error) {
    console.error("Follow preference error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." }});
  }
});
"""

content += new_route

with open("server/routes/users.ts", "w") as f:
    f.write(content)

