const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 1 }, "secret123", { expiresIn: '1h' });
try {
  jwt.verify(token, "wrongsecret");
} catch(e) {
  console.log("Error name:", e.name);
}
