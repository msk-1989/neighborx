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
      // 🏢 BUSINESS — local shop showcase
      videoUrl: VIDEOS[0],
      caption:
        "Behind the scenes at Sharma Kirana Store 🏪 fresh stock arrived — daily essentials at best prices in Khair Nagar! Free home delivery above ₹500 🛵",
      music: "Arijit Singh — Tum Hi Ho",
      hashtags: "kirana,business,udgir,khairnagar,delivery",
      category: "BUSINESS",
      authorId: u.ravi.id,
      likes: 248,
      views: 4320,
      likedBy: ["arjun@nx.in", "sneha@nx.in", "mahesh@nx.in"],
      comments: [
        { authorEmail: "arjun@nx.in", content: "Bhai 1kg toor dal price kya hai aaj?" },
        { authorEmail: "sneha@nx.in", content: "Free delivery 🔥 order kar rahi hu" },
      ],
    },
    {
      // 🏠 PROPERTY — walkthrough
      videoUrl: VIDEOS[1],
      caption:
        "2BHK walkthrough — Royal Residency Tower B, 3rd floor 🏠 semi-furnished, society pool view, ready to move in. DM for site visit 📞",
      music: "Lata Mangeshkar — Lag Ja Gale",
      hashtags: "2bhk,rent,royalresidency,udgir,property",
      category: "PROPERTY",
      authorId: u.priya.id,
      likes: 89,
      views: 1240,
      likedBy: ["arjun@nx.in", "anita@nx.in"],
      comments: [
        { authorEmail: "anita@nx.in", content: "Rent kitni hai didi?" },
        { authorEmail: "arjun@nx.in", content: "Site visit sat ko chalega" },
      ],
    },
    {
      // 🍔 FOOD — restaurant showcase
      videoUrl: VIDEOS[2],
      caption:
        "Tried the new vada pav stall near Shivaji Chowk — 10/10 🔥 only ₹15 and chatni is next level. Tagging @UdgirFoodies 🤤",
      music: "Vishal-Shekhar — Desi Girl",
      hashtags: "streetfood,udgir,vadapav,foodie,shivajichowk",
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
      // 🎥 COMMUNITY — society life
      videoUrl: VIDEOS[3],
      caption:
        "Society Swachh Bharat drive — 40+ neighbors turned up Saturday morning 🧹 our Royal Residency is spotless now! Community power 🙌",
      music: "Shreya Ghoshal — Deewani Mastani",
      hashtags: "swachhbharat,community,royalresidency,udgir",
      category: "COMMUNITY",
      authorId: u.anita.id,
      likes: 174,
      views: 2980,
      likedBy: ["sneha@nx.in", "sunita@nx.in", "arjun@nx.in"],
      comments: [
        { authorEmail: "sunita@nx.in", content: "Proud of our society 🙏 next drive kab hai?" },
        { authorEmail: "sneha@nx.in", content: "Society goals 🙌" },
      ],
    },
    {
      // 🎉 EVENTS — society function
      videoUrl: VIDEOS[4],
      caption:
        "Society cricket tournament finals — last ball six 🏏 MVP = our 12-yr-old neighbor Aarav 🔥 trophy distribution Sunday 6pm @ clubhouse",
      music: "A.R. Rahman — Jai Ho",
      hashtags: "cricket,society,tournament,udgir,event",
      category: "EVENTS",
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
      // 💼 JOBS — local hiring
      videoUrl: VIDEOS[5],
      caption:
        "Hiring alert 💼 Mahesh Enterprises (Industrial Estate) needs 2 delivery boys + 1 accountant. Bike + license must. Salary ₹18k-25k. DM resume 📋",
      music: "Badshah — DJ Waley Babu",
      hashtags: "jobs,hiring,udgir,delivery,accountant",
      category: "JOBS",
      authorId: u.mahesh.id,
      likes: 267,
      views: 4920,
      likedBy: ["arjun@nx.in", "ravi@nx.in", "vijay@nx.in"],
      comments: [
        { authorEmail: "ravi@nx.in", content: "Accountant post ke liye apply karna hai 🙏" },
        { authorEmail: "vijay@nx.in", content: "Part time option hai kya bhai?" },
      ],
    },
    {
      // 📢 ANNOUNCEMENTS — lost & found
      videoUrl: VIDEOS[6],
      caption:
        "LOST 🐕 brown Labrador named 'Sheru' near Hanuman Temple yesterday evening. Red collar, responds to name. Reward ₹2000. Please DM if found 🙏",
      music: "Salim-Sulaiman — Aaj Ki Raat",
      hashtags: "lost,lostfound,udgir,sheru,dog,hanumantemple",
      category: "ANNOUNCEMENTS",
      authorId: u.arjun.id,
      likes: 156,
      views: 2780,
      likedBy: ["priya@nx.in", "sneha@nx.in", "sunita@nx.in"],
      comments: [
        { authorEmail: "priya@nx.in", content: "Sharing in all society groups 🙏 Sheru mil jayega" },
        { authorEmail: "sunita@nx.in", content: "Subah temple ke paas dekha tha kisi ko 😟" },
      ],
    },
    {
      // 📢 ANNOUNCEMENTS — traffic update
      videoUrl: VIDEOS[7],
      caption:
        "TRAFFIC UPDATE ⚠️ Midc Road flyover repair work — diversions till Friday. Two-wheelers use Latur Road bypass. Plan your commute 🚧",
      music: "Arijit Singh — Kabira",
      hashtags: "traffic,alert,udgir,midcroad,announcement",
      category: "ANNOUNCEMENTS",
      authorId: u.sneha.id,
      likes: 142,
      views: 2180,
      likedBy: ["arjun@nx.in", "priya@nx.in", "anita@nx.in"],
      comments: [
        { authorEmail: "anita@nx.in", content: "Thanks for the heads up 🙏 office ke liye nikalna padega jaldi" },
        { authorEmail: "priya@nx.in", content: "School bus route bhi change hua kya?" },
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
