/**
 * Seed demo Reels (Phase 5 — Instagram-style short videos).
 * Idempotent: deleteMany() on ReelLike, ReelComment, Reel first.
 *
 * Usage:
 *   cd /home/z/my-project && bun prisma/seed-reels.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
];

async function main() {
  console.log("🌱 Seeding Reels (8 demo videos)...");

  const emails = [
    "arjun@nx.in",
    "priya@nx.in",
    "ravi@nx.in",
    "sneha@nx.in",
    "mahesh@nx.in",
    "anita@nx.in",
    "vijay@nx.in",
    "sunita@nx.in",
  ];
  const users = await db.user.findMany({ where: { email: { in: emails } } });
  const byEmail = (e: string) => users.find((u) => u.email === e)!;
  const u = {
    arjun: byEmail("arjun@nx.in"),
    priya: byEmail("priya@nx.in"),
    ravi: byEmail("ravi@nx.in"),
    sneha: byEmail("sneha@nx.in"),
    mahesh: byEmail("mahesh@nx.in"),
    anita: byEmail("anita@nx.in"),
    vijay: byEmail("vijay@nx.in"),
    sunita: byEmail("sunita@nx.in"),
  };
  if (!u.arjun) throw new Error("Run the main seed first (prisma/seed.ts) — no users found.");

  // ── Clean up previous Reel seed data (order matters: children first) ──
  await db.reelLike.deleteMany();
  await db.reelComment.deleteMany();
  await db.reel.deleteMany();

  // 8 reels: caption, music, hashtags, category, author, likes, views
  type ReelSpec = {
    videoUrl: string;
    caption: string;
    music: string;
    hashtags: string;
    category: string;
    authorId: string;
    likes: number;
    views: number;
    likedBy: string[]; // user emails who liked this reel
    comments: { authorEmail: string; content: string }[];
  };

  const specs: ReelSpec[] = [
    {
      videoUrl: VIDEOS[0],
      caption:
        "Ganesh festival setup in our society 🙏 modak prasad for everyone tonight! Bappa moriya 🌸",
      music: "Arijit Singh — Tum Hi Ho",
      hashtags: "ganesh,udgir,festival,society",
      category: "FESTIVAL",
      authorId: u.priya.id,
      likes: 248,
      views: 4320,
      likedBy: ["arjun@nx.in", "sneha@nx.in", "mahesh@nx.in"],
      comments: [
        { authorEmail: "arjun@nx.in", content: "Bappa moriya 🙏 modak khana bhejna bhai!" },
        { authorEmail: "sneha@nx.in", content: "Society goals 🙌 decoration fire hai 🔥" },
      ],
    },
    {
      videoUrl: VIDEOS[1],
      caption:
        "Morning walk at the lake — best part of living in Khair Nagar 🌅 sunrise hits different yahan",
      music: "lata mangeshkar — lag ja gale",
      hashtags: "morningroutine,nature,udgir,lake",
      category: "NATURE",
      authorId: u.ravi.id,
      likes: 89,
      views: 1240,
      likedBy: ["arjun@nx.in", "anita@nx.in"],
      comments: [
        { authorEmail: "anita@nx.in", content: "Subah subah motivation mil gaya 😍" },
        { authorEmail: "arjun@nx.in", content: "Bhai next time muje bhi le jana 😄" },
        { authorEmail: "sunita@nx.in", content: "Lake view 🔥 pure vibes" },
      ],
    },
    {
      videoUrl: VIDEOS[2],
      caption:
        "Tried the new vada pav stall near Shivaji Chowk — 10/10 🔥 only ₹15 and chatni is next level",
      music: "Vishal-Shekhar — Desi Girl",
      hashtags: "streetfood,udgir,vadapav,foodie",
      category: "FOOD",
      authorId: u.mahesh.id,
      likes: 312,
      views: 5380,
      likedBy: ["priya@nx.in", "arjun@nx.in", "vijay@nx.in"],
      comments: [
        { authorEmail: "vijay@nx.in", content: "Looking great! 🔥 address bhej de bhai" },
        { authorEmail: "priya@nx.in", content: "Kal evening chalte hain 🙌" },
      ],
    },
    {
      videoUrl: VIDEOS[3],
      caption:
        "DIY rangoli for Diwali using flower petals from our garden ✨ zero cost, full vibes #diwali",
      music: "Shreya Ghoshal — Deewani Mastani",
      hashtags: "diwali,rangoli,diy,decoration",
      category: "FESTIVAL",
      authorId: u.anita.id,
      likes: 174,
      views: 2980,
      likedBy: ["sneha@nx.in", "sunita@nx.in"],
      comments: [
        { authorEmail: "sunita@nx.in", content: "So pretty! Tutorial banao didi 🙏" },
        { authorEmail: "sneha@nx.in", content: "Society goals 🙌" },
      ],
    },
    {
      videoUrl: VIDEOS[4],
      caption:
        "Society cricket tournament finals — last ball six 🏏 MVP = our 12-yr-old neighbor Aarav 🔥",
      music: "A.R. Rahman — Jai Ho",
      hashtags: "cricket,society,tournament,udgir",
      category: "EVENT",
      authorId: u.vijay.id,
      likes: 198,
      views: 3650,
      likedBy: ["arjun@nx.in", "mahesh@nx.in", "ravi@nx.in"],
      comments: [
        { authorEmail: "arjun@nx.in", content: "Aarav future Dhoni 🏏🔥" },
        { authorEmail: "mahesh@nx.in", content: "Next tournament muje bhi daalna bhai" },
      ],
    },
    {
      videoUrl: VIDEOS[5],
      caption:
        "POV: when the society lift is finally repaired after 3 weeks 😂 comedy = waiting for it daily",
      music: "Badshah —DJ Waley Babu",
      hashtags: "comedy,society,relatable,udgir",
      category: "COMEDY",
      authorId: u.sunita.id,
      likes: 267,
      views: 4920,
      likedBy: ["arjun@nx.in", "ravi@nx.in", "vijay@nx.in"],
      comments: [
        { authorEmail: "ravi@nx.in", content: "Haha exactly my daily struggle 😂😂" },
        { authorEmail: "arjun@nx.in", content: "Bhai next time muje bhi le jana 😄" },
        { authorEmail: "anita@nx.in", content: "Looking great! 🔥" },
      ],
    },
    {
      videoUrl: VIDEOS[6],
      caption:
        "Quick tip: segregate wet and dry waste at home — society swachh bharat drive starts Monday 🌱",
      music: "Salim-Sulaiman — Aaj Ki Raat",
      hashtags: "swachhbharat,tips,society,environment",
      category: "TIPS",
      authorId: u.arjun.id,
      likes: 56,
      views: 780,
      likedBy: ["priya@nx.in", "sneha@nx.in"],
      comments: [
        { authorEmail: "priya@nx.in", content: "Great initiative Arjun 🙏 will share in society group" },
      ],
    },
    {
      videoUrl: VIDEOS[7],
      caption:
        "Evening aarti at Ganesh mandal — full society gathered, pandal decoration this year is 🔥🔥",
      music: "Arijit Singh — Kabira",
      hashtags: "ganesh,aarti,community,udgir,festival",
      category: "COMMUNITY",
      authorId: u.sneha.id,
      likes: 142,
      views: 2180,
      likedBy: ["arjun@nx.in", "priya@nx.in", "anita@nx.in"],
      comments: [
        { authorEmail: "anita@nx.in", content: "Pandal decoration next level hai 🙌" },
        { authorEmail: "priya@nx.in", content: "Aaj 7 baje aarti 😍 coming!" },
      ],
    },
  ];

  let reelCount = 0;
  let likeCount = 0;
  let commentCount = 0;

  for (const spec of specs) {
    const reel = await db.reel.create({
      data: {
        videoUrl: spec.videoUrl,
        caption: spec.caption,
        music: spec.music,
        hashtags: spec.hashtags,
        category: spec.category,
        status: "ACTIVE",
        likes: spec.likes,
        views: spec.views,
        authorId: spec.authorId,
      },
    });
    reelCount++;

    // Likes
    for (const email of spec.likedBy) {
      const liker = byEmail(email);
      if (!liker) continue;
      await db.reelLike.create({
        data: { reelId: reel.id, userId: liker.id },
      });
      likeCount++;
    }

    // Comments
    for (const c of spec.comments) {
      const author = byEmail(c.authorEmail);
      if (!author) continue;
      await db.reelComment.create({
        data: { content: c.content, reelId: reel.id, authorId: author.id },
      });
      commentCount++;
    }
  }

  console.log(
    `✅ Seeded ${reelCount} reels, ${likeCount} likes, ${commentCount} comments.`
  );
}

main()
  .catch((e) => {
    console.error("❌ seed-reels failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
