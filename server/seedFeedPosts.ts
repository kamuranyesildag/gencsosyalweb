import { db } from "../src/db/index.js";
import { posts, postMedia, users } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

export async function seedFeedShowcasePosts() {
  try {
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log("No users found to seed posts.");
      return;
    }

    const officialUser = existingUsers.find((u: any) => u.username === "gencsosyal") || existingUsers[0];
    const adminUser = existingUsers.find((u: any) => u.username === "admin") || existingUsers[0];

    // Check if showcase posts already exist
    const currentPosts = await db.select().from(posts);
    if (currentPosts.length > 2) {
      console.log("Feed already has showcase posts.");
      return;
    }

    console.log("🚀 Seeding showcase posts for modern feed and media gallery...");

    // 1. Single Photo Post
    const [p1] = await db.insert(posts).values({
      userId: officialUser.id,
      content: "Genç Sosyal'in yeni nesil soft UI arayüzü ve akış galerisi yayında! ✨ Sade hatlar, doğal en-boy oranını koruyan fotoğraf görüntüleme ve akıcı tam ekran deneyimi ile karşınızdayız. #GençSosyal #Tasarım #Yazılım",
      visibility: "PUBLIC",
      postType: "NORMAL",
      moderationStatus: "APPROVED",
      baseScore: 25,
      viewCount: 142,
    }).returning();

    await db.insert(postMedia).values({
      postId: p1.id,
      mediaUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
      mediaType: "image",
      sortOrder: 0,
      width: 1200,
      height: 800,
    });

    // 2. Two Photos Post (Dual Column)
    const [p2] = await db.insert(posts).values({
      userId: adminUser.id,
      content: "Ofisimizin açık kaynak geliştirici köşesinden iki farklı an: Gündüz sprint planlaması ve akşam kod inceleme maratonu. ☕💻 #Geliştirici #AçıkKaynak",
      visibility: "PUBLIC",
      postType: "NORMAL",
      moderationStatus: "APPROVED",
      baseScore: 22,
      viewCount: 88,
    }).returning();

    await db.insert(postMedia).values([
      {
        postId: p2.id,
        mediaUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 0,
        width: 800,
        height: 600,
      },
      {
        postId: p2.id,
        mediaUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 1,
        width: 800,
        height: 600,
      },
    ]);

    // 3. Three Photos Post (Asymmetric Layout)
    const [p3] = await db.insert(posts).values({
      userId: officialUser.id,
      content: "TEKNOFEST 2026 İHA ve Otonom Araçlar takımımızın test uçuşu hazırlıkları! Solda yer istasyonu telemetri yazılımı, sağda gövde montajı ve aviyonik testleri. 🚀✈️ #TEKNOFEST #MilliTeknoloji #Havacılık",
      visibility: "PUBLIC",
      postType: "NORMAL",
      moderationStatus: "APPROVED",
      baseScore: 30,
      viewCount: 215,
    }).returning();

    await db.insert(postMedia).values([
      {
        postId: p3.id,
        mediaUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1000&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 0,
        width: 1000,
        height: 750,
      },
      {
        postId: p3.id,
        mediaUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 1,
        width: 800,
        height: 600,
      },
      {
        postId: p3.id,
        mediaUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 2,
        width: 800,
        height: 600,
      },
    ]);

    // 4. Four Photos Post (2x2 Balanced Grid)
    const [p4] = await db.insert(posts).values({
      userId: adminUser.id,
      content: "Yeni mobil arayüz prototipleri için hazırladığımız 4 farklı ekran kartı: Akış, Keşfet, Projeler ve Profil. Hangi renk dengesi daha çok hoşunuza gitti? 🎨📱 #UI #UX #MobilTasarım",
      visibility: "PUBLIC",
      postType: "NORMAL",
      moderationStatus: "APPROVED",
      baseScore: 20,
      viewCount: 164,
    }).returning();

    await db.insert(postMedia).values([
      {
        postId: p4.id,
        mediaUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 0,
        width: 800,
        height: 600,
      },
      {
        postId: p4.id,
        mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 1,
        width: 800,
        height: 600,
      },
      {
        postId: p4.id,
        mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 2,
        width: 800,
        height: 600,
      },
      {
        postId: p4.id,
        mediaUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 3,
        width: 800,
        height: 600,
      },
    ]);

    // 5. Six Photos Post (5+ Photos demonstrating +2 badge and full lightbox navigation)
    const [p5] = await db.insert(posts).values({
      userId: officialUser.id,
      content: "Genç Sosyal Geliştirici Zirvesi'nden kareler! Toplam 6 fotoğraf paylaştık; 4 tanesi akışta görünürken sonuncusunun üzerindeki +2 etiketine veya fotoğraflara tıklayarak tam ekran galeride tüm albümü inceleyebilirsiniz. 📸💡 #GençSosyalZirve #Etkinlik #Gençlik",
      visibility: "PUBLIC",
      postType: "NORMAL",
      moderationStatus: "APPROVED",
      baseScore: 35,
      viewCount: 310,
    }).returning();

    await db.insert(postMedia).values([
      {
        postId: p5.id,
        mediaUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 0,
        width: 800,
        height: 600,
      },
      {
        postId: p5.id,
        mediaUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 1,
        width: 800,
        height: 600,
      },
      {
        postId: p5.id,
        mediaUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 2,
        width: 800,
        height: 600,
      },
      {
        postId: p5.id,
        mediaUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 3,
        width: 800,
        height: 600,
      },
      {
        postId: p5.id,
        mediaUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 4,
        width: 800,
        height: 600,
      },
      {
        postId: p5.id,
        mediaUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
        mediaType: "image",
        sortOrder: 5,
        width: 800,
        height: 600,
      },
    ]);

    // 6. Video Post (Demonstrating PostVideoPlayer)
    const [p6] = await db.insert(posts).values({
      userId: officialUser.id,
      content: "Yapay zeka modelimizin simülasyon testi ve sensör veri akışı kaydı! 🎬 Oynat/duraklat, ses açma, zaman çubuğuyla arama ve tam ekran kontrollerini doğrudan kart üzerinden test edebilirsiniz. #Video #YapayZeka #Simülasyon",
      visibility: "PUBLIC",
      postType: "NORMAL",
      moderationStatus: "APPROVED",
      baseScore: 28,
      viewCount: 198,
    }).returning();

    await db.insert(postMedia).values({
      postId: p6.id,
      mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      mediaType: "video",
      sortOrder: 0,
      width: 1280,
      height: 720,
    });

    console.log("✅ Showcase feed posts successfully seeded!");
  } catch (err) {
    console.error("Error seeding feed showcase posts:", err);
  }
}

// Execute if run directly
seedFeedShowcasePosts().then(() => {
  console.log("Finished seeding.");
  process.exit(0);
}).catch(console.error);
