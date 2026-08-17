import sys

new_routes = """
// --- OFFICIAL ACCOUNTS ---

adminRouter.get("/official-accounts", async (req, res) => {
  try {
    const data = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        isOfficialAccount: users.isOfficialAccount,
        officialNotifyEnabled: users.officialNotifyEnabled,
        officialPriority: users.officialPriority,
      })
      .from(users)
      .where(eq(users.isOfficialAccount, true))
      .orderBy(desc(users.createdAt));
      
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: "Resmi hesaplar alınamadı." } });
  }
});

adminRouter.put("/official-accounts/:id", async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);
    const { isOfficialAccount, officialNotifyEnabled, officialPriority } = req.body;
    
    await db.update(users)
      .set({ 
        isOfficialAccount: !!isOfficialAccount,
        officialNotifyEnabled: !!officialNotifyEnabled,
        officialPriority: officialPriority || 'normal',
        updatedAt: new Date()
      })
      .where(eq(users.id, targetId));
      
    res.json({ success: true, message: "Resmi hesap ayarları güncellendi." });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: "Ayarlar güncellenemedi." } });
  }
});

// --- AUTO FOLLOW ---

adminRouter.get("/auto-follow", async (req, res) => {
  try {
    const { systemSettings } = await import("../../src/db/schema.js");
    const setting = await db.select().from(systemSettings).where(eq(systemSettings.key, 'auto_follow_users')).limit(1);
    
    let userIds: number[] = [];
    if (setting.length > 0 && setting[0].value) {
      try {
        userIds = JSON.parse(setting[0].value);
      } catch (e) {}
    }
    
    let autoFollowUsers = [];
    if (userIds.length > 0) {
        autoFollowUsers = await db.select({
            id: users.id,
            username: users.username,
            email: users.email
        }).from(users).where(sql`${users.id} = ANY(${userIds})`);
    }
    
    res.json({ success: true, data: autoFollowUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: "Otomatik takip ayarları alınamadı." } });
  }
});

adminRouter.put("/auto-follow", async (req, res) => {
  try {
    const { systemSettings } = await import("../../src/db/schema.js");
    const { userIds } = req.body; // array of numbers
    
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ success: false, error: { message: "Geçersiz veri formatı." } });
    }
    
    await db.insert(systemSettings)
      .values({ key: "auto_follow_users", value: JSON.stringify(userIds), updatedBy: req.user!.userId })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value: JSON.stringify(userIds), updatedBy: req.user!.userId, updatedAt: new Date() }
      });
      
    res.json({ success: true, message: "Otomatik takip listesi güncellendi." });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: "Otomatik takip listesi güncellenemedi." } });
  }
});
"""

with open("server/routes/admin.ts", "a") as f:
    f.write(new_routes)
