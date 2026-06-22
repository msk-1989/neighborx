import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const AV = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1f4e0,ffd5dc,ffdfbf`;

async function main() {
  console.log("🌱 Seeding NeighborX...");

  // ----- Users -----
  const users = await Promise.all([
    db.user.create({ data: { name: "Arjun Deshmukh", email: "arjun@nx.in", phone: "9822012345", avatar: AV("Arjun"), bio: "Software engineer, society resident. Loves cricket.", role: "RESIDENT", verifyEmail: true, verifyAadhaar: true, verifyAddress: true, rewardPoints: 420, area: "Khair Nagar", society: "Royal Residency" } }),
    db.user.create({ data: { name: "Priya Kulkarni", email: "priya@nx.in", phone: "9822034567", avatar: AV("Priya"), bio: "Homemaker & community organizer.", role: "SOCIETY_ADMIN", verifyEmail: true, verifyAadhaar: true, verifyAddress: true, rewardPoints: 680, area: "Khair Nagar", society: "Royal Residency" } }),
    db.user.create({ data: { name: "Ravi Shinde", email: "ravi@nx.in", phone: "9822045678", avatar: AV("Ravi"), bio: "Runs Shinde Kirana Store. Local business owner.", role: "BUSINESS", verifyEmail: true, verifyAadhaar: true, verifyAddress: true, verifyBusiness: true, rewardPoints: 310, area: "Khair Nagar", society: "Royal Residency" } }),
    db.user.create({ data: { name: "Sneha Patil", email: "sneha@nx.in", phone: "9822056789", avatar: AV("Sneha"), bio: "Certified electrician & plumber. 8 yrs experience.", role: "SERVICE_PROVIDER", verifyEmail: true, verifyAadhaar: true, verifyAddress: true, rewardPoints: 250, area: "Shivaji Chowk", society: "Ganesh Nagar" } }),
    db.user.create({ data: { name: "Mahesh Jadhav", email: "mahesh@nx.in", phone: "9822067890", avatar: AV("Mahesh"), bio: "HR at Udgir Foods Pvt Ltd. Hiring locally.", role: "EMPLOYER", verifyEmail: true, verifyAadhaar: true, verifyAddress: true, verifyBusiness: true, rewardPoints: 180, area: "Midc Road", society: "Industrial Estate" } }),
    db.user.create({ data: { name: "Anita Desai", email: "anita@nx.in", phone: "9822078901", avatar: AV("Anita"), bio: "Teacher & tutor. Class 5-10 Maths & Science.", role: "SERVICE_PROVIDER", verifyEmail: true, verifyAadhaar: true, rewardPoints: 200, area: "Station Road", society: "Sai Apartments" } }),
    db.user.create({ data: { name: "Vijay More", email: "vijay@nx.in", phone: "9822089012", avatar: AV("Vijay"), bio: "Auto driver & delivery partner.", role: "RESIDENT", verifyMobile: true, verifyEmail: false, rewardPoints: 90, area: "Khair Nagar", society: "Royal Residency" } }),
    db.user.create({ data: { name: "Sunita Rao", email: "sunita@nx.in", phone: "9822090123", avatar: AV("Sunita"), bio: "Doctor at Rao Clinic. General physician.", role: "BUSINESS", verifyEmail: true, verifyAadhaar: true, verifyAddress: true, verifyBusiness: true, rewardPoints: 540, area: "Shivaji Chowk", society: "Medical Complex" } }),
  ]);

  const [arjun, priya, ravi, sneha, mahesh, anita, vijay, sunita] = users;

  // ----- Posts (Home Feed) -----
  await db.post.create({ data: { type: "TEXT", content: "Water supply will be cut tomorrow from 9 AM to 2 PM in Royal Residency due to tank cleaning. Please store water in advance! 💧", scope: "SOCIETY", tag: "Update", authorId: priya.id, likes: 34 } });
  await db.post.create({ data: { type: "TEXT", content: "Looking for a reliable car mechanic nearby. My Activa is making a weird sound from the front wheel. Any recommendations? 🛵", scope: "AREA", tag: "Question", authorId: arjun.id, likes: 12 } });
  await db.post.create({ data: { type: "POLL", content: "Where should we set up the new community garden in our society?", pollData: JSON.stringify({ question: "Where should we set up the new community garden?", options: [{ text: "Near Gate 2", votes: 28 }, { text: "Behind Block C", votes: 15 }, { text: "Rooftop of Block A", votes: 9 }] }), scope: "SOCIETY", tag: "Poll", authorId: priya.id, likes: 21 } });
  await db.post.create({ data: { type: "TEXT", content: "Saw a stray dog with a limp near Shivaji Chowk this morning. Called the local NGO 'Paws Udgir' — they're sending a team. ❤️🐾", scope: "AREA", tag: "Recommendation", authorId: anita.id, likes: 47 } });
  await db.post.create({ data: { type: "IMAGE", content: "Massive pothole on Midc Road near the flyover. Two-wheeler riders please be careful, especially at night. Tagging municipality.", imageUrl: "https://images.unsplash.com/photo-1597007030739-6d2e7172ee5b?w=800", scope: "CITY", tag: "Update", authorId: mahesh.id, likes: 63 } });
  await db.post.create({ data: { type: "TEXT", content: "Lost my brown leather wallet near the Hanuman Temple yesterday evening. Has Aadhaar card and some cash. Please DM if found. Reward assured. 🙏", scope: "AREA", tag: "Lost & Found", authorId: vijay.id, likes: 18 } });
  await db.post.create({ data: { type: "TEXT", content: "Congratulations to our society cricket team for winning the inter-society tournament! 🏆🎉 Great teamwork boys.", scope: "SOCIETY", tag: "Celebration", authorId: arjun.id, likes: 89 } });

  // comments
  const p1 = await db.post.findFirst({ where: { authorId: arjun.id } });
  if (p1) {
    await db.comment.create({ data: { content: "Try Ramesh Auto Works near bus stand. Honest guy, fair prices.", postId: p1.id, authorId: vijay.id } });
    await db.comment.create({ data: { content: "Second Ramesh, he fixed my Pulsar last month.", postId: p1.id, authorId: ravi.id } });
  }

  // ----- Marketplace listings -----
  await db.listing.create({ data: { title: "Samsung Galaxy M14 (6GB/128GB)", description: "8 months old, bill + box available. Battery health excellent. Selling as upgrading.", price: 11500, category: "ELECTRONICS", condition: "Like New", imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800", location: "Royal Residency, Udgir", sellerId: arjun.id, boosted: true } });
  await db.listing.create({ data: { title: "Wooden Sofa Set (3+1+1)", description: "Sheesham wood sofa with cushions. 3 years old, excellent condition. Moving abroad so selling.", price: 18500, category: "FURNITURE", condition: "Used", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800", location: "Ganesh Nagar, Udgir", sellerId: sneha.id } });
  await db.listing.create({ data: { title: "Honda Activa 4G (2019)", description: "Driven 24000 km. Regularly serviced. RC + Insurance valid. Single owner.", price: 42000, category: "VEHICLES", condition: "Used", imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800", location: "Station Road, Udgir", sellerId: vijay.id, boosted: true } });
  await db.listing.create({ data: { title: "Engineering Textbooks (Complete Set)", description: "SEM 1-8 mechanical engg books. Almost new. Whole set for the price of 2 books.", price: 2500, category: "BOOKS", condition: "Like New", imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800", location: "Midc Road, Udgir", sellerId: mahesh.id } });
  await db.listing.create({ data: { title: "Whirlpool Fridge 190L (Single Door)", description: "5 star rating. 2 years old. Cooling perfect. No repairs ever.", price: 9500, category: "APPLIANCES", condition: "Used", imageUrl: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800", location: "Khair Nagar, Udgir", sellerId: priya.id } });
  await db.listing.create({ data: { title: "Men's Formal Shoes (UK 9)", description: "Bought but wrong size. Never worn. Leather, brown color.", price: 1200, category: "FASHION", condition: "New", imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800", location: "Sai Apartments, Udgir", sellerId: anita.id } });

  // ----- Businesses -----
  await db.business.create({ data: { name: "Shinde Kirana Store", category: "GROCERY", description: "Daily groceries, fresh vegetables, household items. Home delivery within 2km. Monthly credit for residents.", address: "Shop 4, Khair Nagar Market, Udgir", phone: "9822011111", rating: 4.6, reviewCount: 124, imageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800", verified: true, featured: true, offer: "10% off on monthly groceries for NeighborX members", ownerId: ravi.id } });
  await db.business.create({ data: { name: "Rao Clinic", category: "CLINIC", description: "General physician & family doctor. OPD 10AM-2PM, 6PM-9PM. Home visits for elderly.", address: "Shivaji Chowk, Udgir", phone: "9822022222", rating: 4.9, reviewCount: 312, verified: true, featured: true, offer: "Free first consultation for senior citizens", ownerId: sunita.id } });
  await db.business.create({ data: { name: "Spice Garden Restaurant", category: "RESTAURANT", description: "Pure veg multi-cuisine. Famous for thali & South Indian. AC family section.", address: "Station Road, Udgir", phone: "9822033333", rating: 4.4, reviewCount: 256, imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", offer: "Flat 15% off dine-in on weekdays", ownerId: ravi.id } });
  await db.business.create({ data: { name: "Udgir Medical & General Stores", category: "PHARMACY", description: "All medicines available. 24x7 emergency. Genuine products.", address: "Near Civil Hospital, Udgir", phone: "9822044444", rating: 4.7, reviewCount: 98, verified: true, ownerId: sunita.id } });
  await db.business.create({ data: { name: "Glow Salon & Spa", category: "SALON", description: "Unisex salon. Haircut, facial, bridal makeup. At-home service available.", address: "Midc Road, Udgir", phone: "9822055555", rating: 4.5, reviewCount: 67, imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800", offer: "First haircut free for kids under 10", ownerId: anita.id } });
  await db.business.create({ data: { name: "FitZone Gym", category: "GYM", description: "Modern equipment, certified trainers. Morning 5-11, evening 4-10.", address: "Ganesh Nagar, Udgir", phone: "9822066666", rating: 4.6, reviewCount: 143, featured: true, offer: "0 joining fee + 1 month free on annual", ownerId: mahesh.id } });

  // ----- Services -----
  await db.service.create({ data: { category: "ELECTRICIAN", providerName: "Sneha Patil", bio: "Licensed electrician. Wiring, switchboard, inverter, fan repair. 8 years experience.", phone: "9822056789", rating: 4.8, jobsDone: 340, hourlyRate: 250, verified: true } });
  await db.service.create({ data: { category: "PLUMBER", providerName: "Suresh Kamble", bio: "All plumbing work. Leakage, taps, motor, geyser fitting.", phone: "9822077777", rating: 4.6, jobsDone: 210, hourlyRate: 200, verified: true } });
  await db.service.create({ data: { category: "TUTOR", providerName: "Anita Desai", bio: "Maths & Science for Class 5-10. ICSE & CBSE. Home tuition.", phone: "9822078901", rating: 4.9, jobsDone: 85, hourlyRate: 400, verified: true } });
  await db.service.create({ data: { category: "MAID", providerName: "Lakshmi B.", bio: "Cooking & house cleaning. Morning shift. References available.", phone: "9822088888", rating: 4.5, jobsDone: 60, hourlyRate: 150 } });
  await db.service.create({ data: { category: "DRIVER", providerName: "Vijay More", bio: "Auto & private driving. Airport drops, outstation. Safe & punctual.", phone: "9822089012", rating: 4.4, jobsDone: 150, hourlyRate: 300 } });
  await db.service.create({ data: { category: "CARPENTER", providerName: "Iqbal Khan", bio: "Furniture repair, door fitting, modular kitchen work.", phone: "9822099999", rating: 4.7, jobsDone: 175, hourlyRate: 350, verified: true } });
  await db.service.create({ data: { category: "PAINTER", providerName: "Deepak Pawar", bio: "Interior & exterior painting. Waterproofing. Free site visit.", phone: "9822100000", rating: 4.5, jobsDone: 95, hourlyRate: 280 } });
  await db.service.create({ data: { category: "CLEANING", providerName: "HomeCare Team", bio: "Deep home cleaning, sofa cleaning, pest control. Team of 3.", phone: "9822111111", rating: 4.6, jobsDone: 120, hourlyRate: 500, verified: true } });

  // ----- Jobs -----
  await db.job.create({ data: { title: "Delivery Executive", company: "Udgir Foods Pvt Ltd", description: "Delivery of groceries & food orders within city. Bike + license must. Incentives on each delivery.", jobType: "FULL_TIME", salary: "₹18,000 - ₹25,000", location: "Udgir", category: "DELIVERY", openings: 8, employerId: mahesh.id } });
  await db.job.create({ data: { title: "Shop Assistant", company: "Shinde Kirana Store", description: "Billing, stocking, customer handling. 9 AM - 7 PM. Local candidate preferred.", jobType: "FULL_TIME", salary: "₹12,000 - ₹15,000", location: "Khair Nagar, Udgir", category: "RETAIL", openings: 2, employerId: ravi.id } });
  await db.job.create({ data: { title: "Sales Executive (FMCG)", company: "Latur Distributors", description: "Field sales for FMCG products. Visit shops, take orders. Travel allowance + incentive.", jobType: "FULL_TIME", salary: "₹15,000 - ₹22,000 + incentive", location: "Udgir & nearby", category: "SALES", openings: 4, employerId: mahesh.id } });
  await db.job.create({ data: { title: "Maths Teacher (Part-time)", company: "Bright Future Classes", description: "Teach Maths to Class 9-10. Evening batches. 2 hours/day.", jobType: "PART_TIME", salary: "₹8,000 - ₹12,000", location: "Station Road, Udgir", category: "GENERAL", openings: 1, employerId: anita.id } });
  await db.job.create({ data: { title: "Accountant", company: "Udgir Foods Pvt Ltd", description: "Tally Prime, GST returns, bank reconciliation. Min 2 yrs exp. B.Com.", jobType: "FULL_TIME", salary: "₹20,000 - ₹28,000", location: "Midc Road, Udgir", category: "ACCOUNTS", openings: 1, employerId: mahesh.id } });

  // ----- Emergencies -----
  await db.emergency.create({ data: { category: "BLOOD", title: "O- Negative Blood Required Urgently", description: "Urgent need for O- blood at Udgir Civil Hospital for a surgery. Patient: 8 year old girl. Please share & help.", location: "Civil Hospital, Udgir", severity: "CRITICAL", reporterId: sunita.id, responders: 12 } });
  await db.emergency.create({ data: { category: "ACCIDENT", title: "Two-wheeler accident on Latur Road", description: "Biker hit by tempo near petrol pump. Need help transporting to hospital. Crowd gathered.", location: "Latur Road, near HP Pump", severity: "HIGH", reporterId: vijay.id, responders: 5 } });
  await db.emergency.create({ data: { category: "WOMEN_SAFETY", title: "Late night — feeling unsafe walking home", description: "Streetlight not working near my lane. Requesting a neighbor to walk with me from bus stop.", location: "Khair Nagar Lane 3", severity: "MEDIUM", reporterId: priya.id, responders: 3, status: "RESOLVED" } });

  // ----- Complaints -----
  await db.complaint.create({ data: { category: "ROAD", title: "Broken road near Govt School", description: "The road behind ZP School has deep cracks and a broken culvert. Dangerous for kids.", location: "Behind ZP School, Khair Nagar", imageUrl: "https://images.unsplash.com/photo-1597007030739-6d2e7172ee5b?w=800", status: "IN_PROGRESS", upvotes: 47, reporterId: arjun.id } });
  await db.complaint.create({ data: { category: "GARBAGE", title: "Garbage not collected for 4 days", description: "Our lane's garbage has not been picked up since Monday. Foul smell, mosquitoes increasing.", location: "Ganesh Nagar, Lane 2", status: "SUBMITTED", upvotes: 23, reporterId: sneha.id } });
  await db.complaint.create({ data: { category: "STREETLIGHT", title: "3 streetlights not working", description: "Streetlights near park are off since a week. Safety issue at night.", location: "Royal Residency Main Road", status: "RESOLVED", upvotes: 31, reporterId: priya.id } });
  await db.complaint.create({ data: { category: "WATER", title: "Dirty water supply", description: "Muddy water coming from tap since 2 days. Need tanker or filter check.", location: "Sai Apartments", status: "SUBMITTED", upvotes: 18, reporterId: anita.id } });

  // ----- Lost & Found -----
  await db.lostFound.create({ data: { type: "LOST", category: "PET", title: "Lost: Brown Labrador 'Simba'", description: "Simba went missing from Royal Residency gate on 14th evening. Wearing red collar. Very friendly. Family is devastated.", imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800", location: "Royal Residency, Udgir", reward: 5000, reporterId: priya.id } });
  await db.lostFound.create({ data: { type: "FOUND", category: "MOBILE", title: "Found: Redmi phone near temple", description: "Found a Redmi Note phone near Hanuman Temple. Locked. Owner please describe to claim.", location: "Hanuman Temple, Udgir", reporterId: vijay.id } });
  await db.lostFound.create({ data: { type: "LOST", category: "DOCUMENT", title: "Lost: Aadhaar card & PAN card", description: "Lost my wallet containing Aadhaar & PAN near bus stand. Name: Vijay More.", location: "Bus Stand, Udgir", reward: 500, reporterId: vijay.id } });
  await db.lostFound.create({ data: { type: "FOUND", category: "KEYS", title: "Found: bunch of keys with bike key", description: "Found near park gate. Has a Honda key and 3 other keys with red keychain.", location: "Central Park, Udgir", reporterId: arjun.id } });

  // ----- Events -----
  await db.event.create({ data: { title: "Society Diwali Get-together", description: "Annual Diwali celebration with rangoli competition, sweets distribution & cultural program. All residents invited!", category: "CULTURAL", date: "2025-10-20", time: "6:30 PM", venue: "Royal Residency Clubhouse", imageUrl: "https://images.unsplash.com/photo-1605021154424-7d44e6f1f0a1?w=800", organizerId: priya.id } });
  await db.event.create({ data: { title: "Morning Yoga Session", description: "Free community yoga session. Bring your own mat. Open to all ages.", category: "SPORTS", date: "2025-10-15", time: "6:00 AM", venue: "Central Park, Udgir", organizerId: sunita.id } });
  await db.event.create({ data: { title: "Blood Donation Camp", description: "Jointly organized with Civil Hospital. Healthy adults please donate. Refreshments provided. Certificate for donors.", category: "SOCIAL", date: "2025-10-18", time: "9:00 AM", venue: "Shivaji Chowk Community Hall", organizerId: sunita.id } });
  await db.event.create({ data: { title: "Career Guidance Workshop", description: "Free workshop for Class 10 & 12 students on career options after board exams. Expert speakers.", category: "EDUCATION", date: "2025-10-22", time: "11:00 AM", venue: "ZP School Hall, Khair Nagar", organizerId: anita.id } });

  // some RSVPs
  const ev1 = await db.event.findFirst({ where: { organizerId: priya.id } });
  if (ev1) {
    await db.rSVP.create({ data: { eventId: ev1.id, userId: arjun.id, status: "GOING" } });
    await db.rSVP.create({ data: { eventId: ev1.id, userId: ravi.id, status: "GOING" } });
    await db.rSVP.create({ data: { eventId: ev1.id, userId: vijay.id, status: "INTERESTED" } });
  }

  // ----- Notifications -----
  await db.notification.create({ data: { userId: arjun.id, title: "Emergency nearby", body: "O- blood required at Civil Hospital. Can you help?", type: "EMERGENCY" } });
  await db.notification.create({ data: { userId: arjun.id, title: "New listing in your area", body: "Samsung Galaxy M14 listed near you for ₹11,500", type: "MARKETPLACE" } });
  await db.notification.create({ data: { userId: arjun.id, title: "Comment on your post", body: "Vijay commented on your post about mechanic", type: "SOCIAL" } });
  await db.notification.create({ data: { userId: priya.id, title: "Water cut notice", body: "Tomorrow 9 AM - 2 PM water supply cut", type: "SYSTEM" } });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
