const fs = require('fs');

let content = fs.readFileSync('server/routes/auth.ts', 'utf8');

// Replace forgot-password logic
const forgotOld = `    const userRecord = await db.select({ id: users.id, username: users.username, displayName: profiles.displayName })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.email, email))
      .limit(1);

    if (userRecord.length > 0) {
      const user = userRecord[0];
      const resetToken = generateEmailToken(user.id, "reset_password");`;

const forgotNew = `    const userRecord = await db.select({ id: users.id, username: users.username, displayName: profiles.displayName, passwordHash: users.passwordHash })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.email, email))
      .limit(1);

    if (userRecord.length > 0) {
      const user = userRecord[0];
      // Generate a single-use token by appending passwordHash to the secret
      const jwt = require("jsonwebtoken");
      const secret = (process.env.JWT_SECRET || "dev_secret_do_not_use_in_prod") + user.passwordHash;
      const resetToken = jwt.sign({ userId: user.id, purpose: "reset_password" }, secret, { expiresIn: "15m" });`;

content = content.replace(forgotOld, forgotNew);

// Replace reset-password logic
const resetOld = `    const { token, newPassword } = parsed.data;

    const decoded = verifyEmailToken(token);
    
    if (decoded.purpose !== "reset_password") {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz token türü." } });
    }

    const passwordHash = await argon2.hash(newPassword);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, decoded.userId));`;

const resetNew = `    const { token, newPassword } = parsed.data;
    const jwt = require("jsonwebtoken");

    // We must first decode without verification to get the userId
    const decodedUnverified = jwt.decode(token);
    if (!decodedUnverified || !decodedUnverified.userId || decodedUnverified.purpose !== "reset_password") {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz veya bozuk token." } });
    }

    const userRecord = await db.select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, decodedUnverified.userId))
      .limit(1);

    if (userRecord.length === 0) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz token." } });
    }

    const user = userRecord[0];
    const secret = (process.env.JWT_SECRET || "dev_secret_do_not_use_in_prod") + user.passwordHash;

    try {
      jwt.verify(token, secret);
    } catch (e) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Süresi dolmuş veya kullanılmış token." } });
    }

    const passwordHash = await argon2.hash(newPassword);
    
    // Invalidate all existing refresh tokens for security
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, user.id));
    
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));`;

content = content.replace(resetOld, resetNew);

fs.writeFileSync('server/routes/auth.ts', content);
console.log("Patched auth.ts for secure single-use reset tokens.");
