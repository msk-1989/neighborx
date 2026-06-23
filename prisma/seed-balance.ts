/**
 * Seed demo data for the 8 balance-feature modules (Phase 3-4).
 * Idempotent: uses deleteMany() first to avoid duplicates on re-runs.
 *
 * Usage:
 *   DATABASE_URL=<neon pooled> DIRECT_DATABASE_URL=<neon direct> \
 *   npx tsx prisma/seed-balance.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding balance features (8 modules)...");

  // Look up existing users by email (created by the main seed)
  const emails = ["arjun@nx.in", "priya@nx.in", "ravi@nx.in", "sneha@nx.in", "mahesh@nx.in", "anita@nx.in", "vijay@nx.in", "sunita@nx.in"];
  const users = await db.user.findMany({ where: { email: { in: emails } } });
  const byEmail = (e: string) => users.find((u) => u.email === e)!;
  const arjun = byEmail("arjun@nx.in");
  const priya = byEmail("priya@nx.in");
  const ravi = byEmail("ravi@nx.in");
  const sneha = byEmail("sneha@nx.in");
  const mahesh = byEmail("mahesh@nx.in");
  const anita = byEmail("anita@nx.in");
  const vijay = byEmail("vijay@nx.in");
  const sunita = byEmail("sunita@nx.in");

  if (!arjun) throw new Error("Run the main seed first (prisma/seed.ts) — no users found.");

  // ── Clean up previous balance seed data ──
  await Promise.all([
    db.borrowItem.deleteMany(),
    db.skillListing.deleteMany(),
    db.carpoolRide.deleteMany(),
    db.volunteerSignup.deleteMany(),
    db.volunteerOpportunity.deleteMany(),
    db.fundraiserDonation.deleteMany(),
    db.fundraiser.deleteMany(),
    db.propertyListing.deleteMany(),
    db.commerceOrder.deleteMany(),
    db.commerceProduct.deleteMany(),
  ]);

  // ═══════════════════════════════════════════
  // 1. Borrow & Lend
  // ═══════════════════════════════════════════
  await db.borrowItem.createMany({ data: [
    { title: "Western Books Collection (15 books)", description: "Dan Brown, Sidney Sheldon, Jeffrey Archer novels. Great condition, barely used.", category: "BOOKS", type: "LEND", condition: "Good", dailyRate: 0, deposit: 200, duration: "14 days", location: "Khair Nagar, Udgir", ownerId: priya.id },
    { title: "Cordless Drill Machine (Bosch)", description: "Bosch GSB 12V cordless drill with full bit set. Perfect for home DIY projects.", category: "TOOLS", type: "LEND", condition: "Good", dailyRate: 50, deposit: 1500, duration: "3 days", location: "Shivaji Chowk, Udgir", ownerId: sneha.id },
    { title: "Wheelchair (Folding)", description: "Folding wheelchair, barely used. Free for anyone in need — medical emergency priority.", category: "MEDICAL", type: "LEND", condition: "Good", dailyRate: 0, deposit: 0, duration: "30 days", location: "Shivaji Chowk, Udgir", ownerId: sunita.id },
    { title: "Cricket Kit (Full Set)", description: "SG cricket kit with bat, pads, gloves, helmet. Need it for the inter-society tournament?", category: "SPORTS", type: "LEND", condition: "Fair", dailyRate: 30, deposit: 800, duration: "5 days", location: "Khair Nagar, Udgir", ownerId: arjun.id },
    { title: "Looking to borrow a pressure cooker (5L)", description: "Hosting a small family gathering this weekend. Need a 5L pressure cooker for a day.", category: "APPLIANCES", type: "BORROW", condition: "Any", dailyRate: 0, deposit: 0, duration: "1 day", location: "Khair Nagar, Udgir", ownerId: vijay.id },
    { title: "Python Programming Books (Class 11-12)", description: "Sumita Arora Python textbook + reference book. Lending for free to students.", category: "BOOKS", type: "LEND", condition: "Good", dailyRate: 0, deposit: 100, duration: "30 days", location: "Station Road, Udgir", ownerId: anita.id },
  ]});

  // ═══════════════════════════════════════════
  // 2. Skill Exchange
  // ═══════════════════════════════════════════
  await db.skillListing.createMany({ data: [
    { title: "Spoken English Classes", description: "Improve your spoken English & confidence. Focus on daily conversations, interview prep, and grammar basics.", category: "LANGUAGE", mode: "BOTH", level: "BEGINNER", rate: 200, location: "Station Road, Udgir", availability: "Mon-Sat, 5-7 PM", teacherId: anita.id },
    { title: "Class 5-10 Maths & Science Tuition", description: "Experienced teacher (10+ yrs). CBSE & State Board. Small batches, personal attention.", category: "ACADEMIC", mode: "OFFLINE", level: "BEGINNER", rate: 350, location: "Station Road, Udgir", availability: "Mon-Fri, 6-8 PM", teacherId: anita.id },
    { title: "Basic Computer & MS Office Training", description: "Learn computer basics, MS Word, Excel, PowerPoint, internet & email. Great for beginners and seniors.", category: "COMPUTER", mode: "OFFLINE", level: "BEGINNER", rate: 250, location: "Khair Nagar, Udgir", availability: "Weekends", teacherId: arjun.id },
    { title: "Harmonium & Vocal Music Lessons", description: "Learn harmonium and Indian classical vocal basics. Children & adults welcome.", category: "MUSIC", mode: "OFFLINE", level: "BEGINNER", rate: 300, location: "Khair Nagar, Udgir", availability: "Sun, 10 AM-12 PM", teacherId: priya.id },
    { title: "Marathi to English Translation Practice", description: "Free skill-swap! I help you with English, you help me improve my Hindi conversational skills.", category: "LANGUAGE", mode: "ONLINE", level: "INTERMEDIATE", rate: 0, location: "Online", availability: "Flexible", teacherId: sunita.id },
    { title: "Tally & Accounting Basics", description: "Learn Tally Prime + basic accounting for small business owners. Practical, job-oriented training.", category: "PROFESSIONAL", mode: "BOTH", level: "INTERMEDIATE", rate: 400, location: "Midc Road, Udgir", availability: "Weekends", teacherId: mahesh.id },
  ]});

  // ═══════════════════════════════════════════
  // 3. Carpool & Mobility
  // ═══════════════════════════════════════════
  await db.carpoolRide.createMany({ data: [
    { type: "OFFER", fromLocation: "Khair Nagar, Udgir", toLocation: "Latur MIDC", date: "2025-06-24", time: "08:30 AM", seats: 3, seatsFilled: 1, recurring: "Mon-Fri", notes: "Daily office commute. AC car. Reach Latur MIDC by 9:15 AM.", contribution: 40, driverId: arjun.id },
    { type: "OFFER", fromLocation: "Shivaji Chowk, Udgir", toLocation: "Solapur", date: "2025-06-26", time: "06:00 AM", seats: 4, seatsFilled: 2, recurring: "One-time", notes: "Solapur trip for family function. Sharing fuel cost.", contribution: 150, driverId: vijay.id },
    { type: "REQUEST", fromLocation: "Royal Residency, Udgir", toLocation: "Pune (Swargate)", date: "2025-06-28", time: "Flexible morning", seats: 1, seatsFilled: 0, recurring: "One-time", notes: "Need a ride to Pune for a job interview. Will share fuel cost.", contribution: 300, driverId: mahesh.id },
    { type: "OFFER", fromLocation: "Station Road, Udgir", toLocation: "Udgir College Campus", date: "2025-06-24", time: "07:45 AM", seats: 2, seatsFilled: 0, recurring: "Mon-Sat", notes: "College going students welcome. Free ride, just be on time!", contribution: 0, driverId: anita.id },
    { type: "REQUEST", fromLocation: "Medical Complex, Udgir", toLocation: "Khair Nagar, Udgir", date: "2025-06-24", time: "06:00 PM", seats: 1, seatsFilled: 0, recurring: "One-time", notes: "Need a ride back from clinic. Auto is expensive, looking to share.", contribution: 20, driverId: sunita.id },
  ]});

  // ═══════════════════════════════════════════
  // 4. Volunteer Network
  // ═══════════════════════════════════════════
  const bloodDrive = await db.volunteerOpportunity.create({ data: {
    type: "BLOOD_DONOR", title: "Urgent: B+ Blood Needed at Rao Clinic", description: "A patient at Rao Clinic needs B+ blood urgently for surgery tomorrow. Please step forward if you're healthy and eligible.", location: "Shivaji Chowk, Udgir", urgency: "CRITICAL", date: "2025-06-24", contactInfo: "9822090123 (Dr. Sunita Rao)", slots: 3, filled: 1, organizerId: sunita.id,
  }});
  await db.volunteerSignup.create({ data: { opportunityId: bloodDrive.id, userId: arjun.id, status: "CONFIRMED" } });

  await db.volunteerOpportunity.createMany({ data: [
    { type: "ELDERLY", title: "Weekly Grocery Shopping for Elderly Residents", description: "Help elderly residents of Royal Residency with their weekly grocery shopping. 2 hours every Saturday morning.", location: "Khair Nagar, Udgir", urgency: "MEDIUM", date: "Every Saturday", contactInfo: "9822034567 (Priya)", slots: 5, filled: 2, organizerId: priya.id },
    { type: "TEACHING", title: "Weekend Tuition for Underprivileged Kids", description: "Teach Maths & English to kids from low-income families. Materials provided. Every Sunday 10 AM-12 PM.", location: "Community Hall, Udgir", urgency: "LOW", date: "Every Sunday", contactInfo: "9822078901 (Anita)", slots: 4, filled: 1, organizerId: anita.id },
    { type: "ENVIRONMENT", title: "Neighborhood Tree Plantation Drive", description: "Join us for a tree plantation drive along Midc Road. 50 saplings to plant. Tools & refreshments provided.", location: "Midc Road, Udgir", urgency: "MEDIUM", date: "2025-07-01", contactInfo: "9822012345 (Arjun)", slots: 15, filled: 8, organizerId: arjun.id },
    { type: "ANIMALS", title: "Stray Dog Feeding Volunteers", description: "Help feed and care for stray dogs in Khair Nagar area. Food provided by Paws Udgir NGO. Daily morning shift.", location: "Khair Nagar, Udgir", urgency: "LOW", date: "Daily", contactInfo: "9822034567 (Priya)", slots: 7, filled: 3, organizerId: priya.id },
    { type: "DISASTER", title: "Flood Relief Volunteer Team", description: "Form a standby volunteer team for monsoon flood relief. Training provided by local authorities. On-call basis.", location: "Udgir", urgency: "HIGH", date: "On-call", contactInfo: "9822012345 (Arjun)", slots: 20, filled: 6, organizerId: arjun.id },
  ]});

  // ═══════════════════════════════════════════
  // 5. Fundraising
  // ═══════════════════════════════════════════
  const fund1 = await db.fundraiser.create({ data: {
    title: "Medical Fund for Ramesh Uncle's Heart Surgery", description: "Our neighbor Ramesh uncle needs urgent bypass surgery. Family needs help with hospital expenses.", story: "Ramesh uncle, a retired school teacher and beloved member of Royal Residency, has been diagnosed with severe coronary artery disease. He needs an urgent triple bypass surgery at Ruby Hall Clinic, Pune. The total cost is ₹4,50,000. His pension covers only ₹1,00,000. Let's come together as a community to help a man who taught so many of our children.", category: "MEDICAL", goal: 350000, raised: 127500, imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800", beneficiaryName: "Ramesh Patil", endDate: "2025-07-15", verified: true, organizerId: priya.id,
  }});
  await db.fundraiserDonation.createMany({ data: [
    { fundraiserId: fund1.id, donorId: arjun.id, amount: 5000, message: "Get well soon uncle! 🙏", anonymous: false },
    { fundraiserId: fund1.id, donorId: sunita.id, amount: 10000, message: "From all of us at Rao Clinic.", anonymous: false },
    { fundraiserId: fund1.id, donorId: ravi.id, amount: 2500, message: "", anonymous: true },
  ]});

  const fund2 = await db.fundraiser.create({ data: {
    title: "Sponsor Sneha's Engineering Education", description: "Bright student from a low-income family needs help with first-year engineering fees.", story: "Sneha is a brilliant student who scored 94% in her 12th science exams. She got admission to a reputed engineering college in Latur for Computer Science. Her father is an auto driver and cannot afford the ₹85,000 annual fees. She has a partial scholarship but needs ₹50,000 more. Let's invest in a bright future!", category: "EDUCATION", goal: 50000, raised: 18500, imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800", beneficiaryName: "Sneha Jadhav", endDate: "2025-08-30", verified: true, organizerId: anita.id,
  }});
  await db.fundraiserDonation.createMany({ data: [
    { fundraiserId: fund2.id, donorId: priya.id, amount: 5000, message: "All the best Sneha! Study well! 📚", anonymous: false },
    { fundraiserId: fund2.id, donorId: mahesh.id, amount: 10000, message: "Proud of you. From Udgir Foods family.", anonymous: false },
  ]});

  const fund3 = await db.fundraiser.create({ data: {
    title: "Community Garden Setup Fund", description: "Help us transform the empty plot behind Block C into a beautiful community garden for everyone.", story: "We've identified a 2000 sq ft empty plot behind Block C in Royal Residency. With ₹15,000 we can set up a community garden with vegetable beds, flowering plants, a composting unit, and seating. This will give children a place to learn about nature and give senior citizens a peaceful space. Let's make our society greener! 🌱", category: "COMMUNITY", goal: 15000, raised: 9200, imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800", beneficiaryName: "Royal Residency Community", endDate: "2025-07-10", verified: false, organizerId: arjun.id,
  }});

  await db.fundraiser.create({ data: {
    title: "Stray Animal Sterilization Campaign", description: "Help Paws Udgir sterilize 50 stray dogs to humanely control population and reduce rabies risk.", story: "Paws Udgir, our local animal welfare NGO, plans to sterilize 50 stray dogs this monsoon season. This is the most humane way to control stray population and reduces rabies risk for everyone. Each sterilization costs ₹1,500 including vaccination. Total needed: ₹75,000. Every contribution helps make Udgir safer for humans and animals alike. 🐾", category: "ANIMALS", goal: 75000, raised: 23100, imageUrl: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800", beneficiaryName: "Paws Udgir NGO", endDate: "2025-08-15", verified: true, organizerId: priya.id,
  }});

  // ═══════════════════════════════════════════
  // 6. Property
  // ═══════════════════════════════════════════
  await db.propertyListing.createMany({ data: [
    { title: "2BHK Apartment for Rent - Royal Residency", description: "Spacious 2BHK on 3rd floor with balcony facing garden. Modular kitchen, 2 bathrooms, covered parking. Family preferred.", type: "RENT", propertyType: "2BHK", price: 0, rent: 12000, deposit: 24000, area: "950 sq.ft", furnishing: "SEMI", address: "Flat 302, Royal Residency, Khair Nagar, Udgir", imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", bedrooms: 2, bathrooms: 2, amenities: "Parking, Lift, Garden, 24x7 Water, Security", location: "Khair Nagar, Udgir", ownerId: arjun.id },
    { title: "1BHK Fully Furnished PG for Working Professionals", description: "Fully furnished 1BHK available as PG for working professionals. Includes bed, wardrobe, AC, geyser, WiFi. Meals optional.", type: "PG", propertyType: "1BHK", price: 0, rent: 8000, deposit: 16000, area: "550 sq.ft", furnishing: "FURNISHED", address: "Sai Apartments, Station Road, Udgir", imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", bedrooms: 1, bathrooms: 1, amenities: "AC, WiFi, Meals, Laundry, Parking", location: "Station Road, Udgir", ownerId: anita.id },
    { title: "3BHK Row House for Sale - Ganesh Nagar", description: "Independent 3BHK row house with private terrace and parking. Gated society with clubhouse. Clear title, ready to move in.", type: "SELL", propertyType: "3BHK", price: 5200000, rent: 0, deposit: 0, area: "1450 sq.ft", furnishing: "UNFURNISHED", address: "Plot 12, Ganesh Nagar, Shivaji Chowk, Udgir", imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800", bedrooms: 3, bathrooms: 3, amenities: "Terrace, Parking, Clubhouse, Gated Society", location: "Shivaji Chowk, Udgir", ownerId: sneha.id },
    { title: "Commercial Shop for Rent - Main Road", description: "200 sq ft commercial shop on Shivaji Chowk main road. High footfall area, perfect for retail/clinic/office. 24x7 access.", type: "COMMERCIAL", propertyType: "SHOP", price: 0, rent: 25000, deposit: 100000, area: "200 sq.ft", furnishing: "UNFURNISHED", address: "Shop 4, Shivaji Chowk, Udgir", imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800", bedrooms: 0, bathrooms: 1, amenities: "Main Road Front, 24x7 Access, Power Backup", location: "Shivaji Chowk, Udgir", ownerId: sunita.id },
    { title: "4BHK Villa with Garden - Premium Location", description: "Luxury 4BHK villa with private garden, 2 car parking, and servant quarter. Premium location in Udgir. Price negotiable for genuine buyers.", type: "SELL", propertyType: "VILLA", price: 8500000, rent: 0, deposit: 0, area: "2200 sq.ft", furnishing: "SEMI", address: "Bungalow 5, VIP Road, Udgir", imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", bedrooms: 4, bathrooms: 4, amenities: "Garden, 2 Car Parking, Servant Quarter, Solar Water", location: "VIP Road, Udgir", ownerId: mahesh.id },
  ]});

  // ═══════════════════════════════════════════
  // 7. Multinex Commerce
  // ═══════════════════════════════════════════
  await db.commerceProduct.createMany({ data: [
    { title: "Fresh Vegetables Combo (5kg)", description: "Mixed seasonal vegetables directly from local farms. Tomato, onion, potato, leafy greens & more. Farm fresh!", category: "GROCERY", price: 250, imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800", storeName: "Shinde Kirana Store", deliveryTime: "30 min", inStock: true, location: "Khair Nagar, Udgir", sellerId: ravi.id },
    { title: "Atta (Wheat Flour) 10kg - Freshly Milled", description: "Freshly milled whole wheat atta from local chakki. Soft rotis guaranteed. 10kg pack.", category: "GROCERY", price: 420, imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800", storeName: "Shinde Kirana Store", deliveryTime: "Same day", inStock: true, location: "Khair Nagar, Udgir", sellerId: ravi.id },
    { title: "Veg Thali (Full Meal)", description: "Complete veg thali: 2 sabzi, 4 roti, dal, rice, salad, papad, sweet. Home-style cooking, delivered hot.", category: "FOOD", price: 120, imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800", storeName: "Priya's Kitchen", deliveryTime: "45 min", inStock: true, location: "Khair Nagar, Udgir", sellerId: priya.id },
    { title: "Chicken Biryani (Family Pack)", description: "Authentic Hyderabadi-style chicken biryani for 3-4 people. Comes with raita and salan. Made to order.", category: "FOOD", price: 350, imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800", storeName: "Udgir Biryani House", deliveryTime: "1 hour", inStock: true, location: "Station Road, Udgir", sellerId: vijay.id },
    { title: "Paracetamol + Vitamin C Combo", description: "Paracetamol strip (10 tablets) + Vitamin C effervescent tablets (20). For fever & immunity. Prescription not required.", category: "MEDICINE", price: 85, imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800", storeName: "Rao Clinic Pharmacy", deliveryTime: "20 min", inStock: true, location: "Shivaji Chowk, Udgir", sellerId: sunita.id },
    { title: "Diabetes Care Kit (Glucometer + 25 strips)", description: "OneTouch glucometer with 25 test strips + lancets. Easy to use. Best price in Udgir.", category: "MEDICINE", price: 899, imageUrl: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800", storeName: "Rao Clinic Pharmacy", deliveryTime: "Same day", inStock: true, location: "Shivaji Chowk, Udgir", sellerId: sunita.id },
    { title: "Tent + Chairs Rental (Small Event)", description: "1 tent (10x10) + 20 chairs + 2 tables for small events/functions. Setup & pickup included within Udgir.", category: "RENTALS", price: 1500, imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800", storeName: "Udgir Event Rentals", deliveryTime: "Same day", inStock: true, location: "Udgir", sellerId: vijay.id },
    { title: "Mixer Grinder on Rent (Monthly)", description: "Bajaj 500W mixer grinder with 3 jars. Monthly rental. Great for bachelors & temporary stays.", category: "RENTALS", price: 300, imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800", storeName: "Udgir Event Rentals", deliveryTime: "2 hours", inStock: true, location: "Udgir", sellerId: vijay.id },
  ]});

  // ═══════════════════════════════════════════
  // 8. Society Notices (Society model already exists)
  // ═══════════════════════════════════════════
  let society = await db.society.findFirst({ where: { name: "Royal Residency" } });
  if (!society) {
    society = await db.society.create({ data: { name: "Royal Residency", address: "Khair Nagar, Udgir", area: "Khair Nagar", city: "Udgir", totalUnits: 48, adminId: priya.id } });
  }
  await db.societyNotice.deleteMany({ where: { societyId: society.id } });
  await db.societyNotice.createMany({ data: [
    { societyId: society.id, title: "Water Tank Cleaning - Schedule", body: "Water tank cleaning is scheduled for this Sunday from 9 AM to 2 PM. Please store sufficient water in advance. Water supply will resume by 2:30 PM.", type: "MAINTENANCE" },
    { societyId: society.id, title: "Annual General Meeting - 30th June", body: "The Annual General Meeting of Royal Residency will be held on 30th June at 6 PM in the clubhouse. Agenda: budget approval, new committee election, and facility updates. All residents requested to attend.", type: "MEETING" },
    { societyId: society.id, title: "Inter-Society Cricket Tournament Victory! 🏆", body: "Congratulations to our cricket team for winning the Udgir Inter-Society Tournament! Celebrations at the clubhouse on Saturday at 5 PM. Snacks for all residents.", type: "ANNOUNCEMENT" },
    { societyId: society.id, title: "EMERGENCY: Gas Leak Reported in Block B", body: "A gas leak was reported in Block B, Flat 401. The area has been secured and the gas company has been called. Residents of Block B please evacuate to the garden area immediately. Do NOT use elevators or switches.", type: "EMERGENCY" },
    { societyId: society.id, title: "New CCTV Cameras Installed", body: "We've installed 4 new CCTV cameras at the gates and parking area as part of our security upgrade. Please cooperate with the security team during the transition.", type: "ANNOUNCEMENT" },
  ]});

  console.log("✅ Balance features seeded successfully!");
  console.log(`  Borrow items: ${await db.borrowItem.count()}`);
  console.log(`  Skill listings: ${await db.skillListing.count()}`);
  console.log(`  Carpool rides: ${await db.carpoolRide.count()}`);
  console.log(`  Volunteer opportunities: ${await db.volunteerOpportunity.count()}`);
  console.log(`  Fundraisers: ${await db.fundraiser.count()}`);
  console.log(`  Property listings: ${await db.propertyListing.count()}`);
  console.log(`  Commerce products: ${await db.commerceProduct.count()}`);
  console.log(`  Society notices: ${await db.societyNotice.count()}`);
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
