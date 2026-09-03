import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function main() {
  try {
    const result = await db.update(users)
      .set({ role: 'ADMIN' })
      .where(eq(users.email, 'imranyesildag123@gmail.com'))
      .returning();
      
    if (result.length > 0) {
      console.log('Successfully updated user to ADMIN:', result[0].username, result[0].email);
    } else {
      console.log('User not found by email.');
      const allUsers = await db.select({ username: users.username, email: users.email }).from(users);
      console.log('Registered users:', allUsers);
    }
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

main().then(() => process.exit(0));
