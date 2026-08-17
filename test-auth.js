const http = require('http');

async function testAuth() {
  console.log("Testing Register...");
  const registerRes = await fetch("http://localhost:3000/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      displayName: "Test User"
    })
  });
  const registerData = await registerRes.json();
  console.log("Register response:", registerData);

  console.log("\nTesting Login...");
  const loginRes = await fetch("http://localhost:3000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "testuser",
      password: "password123"
    })
  });
  
  const loginData = await loginRes.json();
  console.log("Login response:", loginData);
  
  const cookieHeader = loginRes.headers.get('set-cookie');
  console.log("Set-Cookie Header:", cookieHeader);

  if (loginData.success) {
    const token = loginData.data.accessToken;

    console.log("\nTesting ME...");
    const meRes = await fetch("http://localhost:3000/api/v1/auth/me", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log("ME response:", meData);
  }
}

testAuth();
