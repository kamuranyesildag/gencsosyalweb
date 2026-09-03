const fs = require('fs');
const path = 'server/routes/auth.ts';
let content = fs.readFileSync(path, 'utf8');

// Insert a route before export default router;
const routeStr = `
router.get("/make-me-admin", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) return res.status(404).json({ success: false, message: "Not found" });
    
    if (user[0].username === 'gencsosyal' || user[0].email === 'imranyesildag123@gmail.com') {
      await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, userId));
      return res.json({ success: true, message: "You are now an admin. Please re-login to update your token." });
    }
    
    res.status(403).json({ success: false, message: "Not eligible" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
export default router;
`;

content = content.replace(/export default router;/, routeStr);
fs.writeFileSync(path, content);
console.log('Added make-me-admin route');
