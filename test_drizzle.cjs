const { eq } = require('drizzle-orm');
try {
  const q = eq({ name: 'userId' }, null);
  console.log("Success:", q);
} catch (e) {
  console.log("Error:", e.message);
}
