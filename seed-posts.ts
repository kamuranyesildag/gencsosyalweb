import { db, createPglite } from "./src/db/index.js";
import { posts, users } from "./src/db/schema.js";

async function run() {
  const pglite = createPglite();
  try {
    console.log("Seeding posts...");
    await db.insert(posts).values([
      {
        userId: 2,
        content: "Genç Sosyal'e hoş geldiniz! 🎉\nBurada yeni projeler keşfedebilir, topluluklarla etkileşime geçebilir ve fikirlerinizi özgürce paylaşabilirsiniz. Hep birlikte büyüyoruz!",
        visibility: "PUBLIC",
        postType: "NORMAL",
        moderationStatus: "APPROVED",
        baseScore: 10,
      },
      {
        userId: 1,
        content: "Platformumuzun geliştirme aşaması hızla devam ediyor. Yeni özellikler ve güncellemeler yolda! Geri bildirimleriniz bizim için çok değerli. 🚀",
        visibility: "PUBLIC",
        postType: "NORMAL",
        moderationStatus: "APPROVED",
        baseScore: 5,
      }
    ]);
    console.log("Posts seeded!");
  } catch(e) {
    console.error(e);
  } finally {
    pglite.close();
  }
}
run();
