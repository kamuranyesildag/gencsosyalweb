import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq, or } from 'drizzle-orm';

async function main() {
  try {
    const allUsers = await db.select({ id: users.id, username: users.username, email: users.email, role: users.role }).from(users);
    console.log('Current users in DB:', allUsers);

    const targetUser = allUsers.find(u => u.username === 'gencsosyal' || u.email === 'imranyesildag123@gmail.com');
    if (targetUser) {
      await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, targetUser.id));
      console.log('SUCCESS: Updated user to ADMIN:', targetUser.username);
    } else {
      console.log('WARNING: User still not registered.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main().then(() => process.exit(0));
