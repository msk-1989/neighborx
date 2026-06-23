/**
 * Seed demo data for the Hyperlocal Yellow Pages (Phase 5, discovery layer).
 * Idempotent: uses deleteMany() first.
 *
 * Usage:
 *   cd /home/z/my-project && unset DATABASE_URL && bun prisma/seed-yellow-pages.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type Entry = {
  name: string;
  category: string;
  subcategory: string;
  description?: string;
  address: string;
  area: string;
  city: string;
  phone: string;
  email?: string;
  website?: string;
  hours: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
};

const ENTRIES: Entry[] = [
  // ── HEALTHCARE ──
  { name: "Dr. Suresh Patil — Physician", category: "HEALTHCARE", subcategory: "Doctors", description: "MBBS, MD — General physician & family doctor. 20+ years experience. OPD consultation.", address: "Shop 4, Shivaji Chowk, Near Hanuman Temple", area: "Shivaji Chowk", city: "Udgir", phone: "9822011111", hours: "10 AM - 2 PM, 6 PM - 9 PM", rating: 4.8, reviewCount: 234, verified: true },
  { name: "Dr. Kavita Deshmukh — Pediatrician", category: "HEALTHCARE", subcategory: "Doctors", description: "Child specialist. Vaccination, newborn care, growth monitoring.", address: "Sai Plaza, Midc Road", area: "Midc Road", city: "Udgir", phone: "9822022222", hours: "9 AM - 1 PM, 5 PM - 8 PM", rating: 4.9, reviewCount: 189, verified: true },
  { name: "Udgir Civil Hospital", category: "HEALTHCARE", subcategory: "Hospitals", description: "Government hospital. 24x7 emergency, ICU, maternity, surgery. Free for BPL families.", address: "Hospital Road, Udgir", area: "Hospital Road", city: "Udgir", phone: "02383-220088", hours: "24x7", rating: 3.9, reviewCount: 412, verified: true },
  { name: "Sai Multispeciality Hospital", category: "HEALTHCARE", subcategory: "Hospitals", description: "Private multi-speciality. Cardiology, orthopedics, maternity, ICU. Cashless insurance.", address: "Latur Road, Opp. MSEDC Office", area: "Latur Road", city: "Udgir", phone: "9822033333", website: "https://saihospital-udgir.in", hours: "24x7", rating: 4.5, reviewCount: 321, verified: true },
  { name: "Pathkind Diagnostic Center", category: "HEALTHCARE", subcategory: "Labs", description: "Blood tests, MRI, CT scan, X-ray, USG. Home sample collection available.", address: "Shop 12, Royal Residency Complex", area: "Khair Nagar", city: "Udgir", phone: "9822044444", hours: "7 AM - 10 PM", rating: 4.6, reviewCount: 156, verified: true },
  { name: "Apollo Pharmacy — Udgir", category: "HEALTHCARE", subcategory: "Pharmacies", description: "24x7 pharmacy. All medicines, surgical, baby care. Free home delivery above ₹500.", address: "Station Road, Near Bus Stand", area: "Station Road", city: "Udgir", phone: "9822055555", hours: "24x7", rating: 4.4, reviewCount: 98, verified: true },
  { name: "Medical Hall Khair Nagar", category: "HEALTHCARE", subcategory: "Pharmacies", description: "Local pharmacy since 1995. Discount on monthly refills.", address: "Plot 7, Khair Nagar", area: "Khair Nagar", city: "Udgir", phone: "9822066666", hours: "8 AM - 11 PM", rating: 4.2, reviewCount: 67, verified: false },

  // ── EDUCATION ──
  { name: "Zilla Parishad School", category: "EDUCATION", subcategory: "Schools", description: "Govt primary school (Marathi medium). Std 1-8. Free education, midday meal.", address: "ZP Ground, Shivaji Chowk", area: "Shivaji Chowk", city: "Udgir", phone: "02383-220100", hours: "8 AM - 3 PM", rating: 3.8, reviewCount: 145, verified: true },
  { name: "Sunrise English Medium School", category: "EDUCATION", subcategory: "Schools", description: "CBSE affiliated. Nursery to Std 10. Smart classes, sports academy.", address: "Sunrise Campus, Latur Road", area: "Latur Road", city: "Udgir", phone: "9822077777", website: "https://sunriseudgir.edu.in", hours: "8 AM - 4 PM", rating: 4.5, reviewCount: 287, verified: true },
  { name: "Maharashtra College Udgir", category: "EDUCATION", subcategory: "Colleges", description: "Arts, Commerce, Science junior & senior college. Affiliated to SRTMU Nanded.", address: "College Road, Udgir", area: "College Road", city: "Udgir", phone: "02383-220200", hours: "9 AM - 5 PM", rating: 4.1, reviewCount: 198, verified: true },
  { name: "Aakash Coaching Center", category: "EDUCATION", subcategory: "Coaching Centers", description: "JEE/NEET/CET coaching. Experienced faculty, weekly tests, doubt sessions.", address: "2nd Floor, Sai Plaza, Midc Road", area: "Midc Road", city: "Udgir", phone: "9822088888", hours: "7 AM - 9 PM", rating: 4.3, reviewCount: 112, verified: false },
  { name: "T.I.M.E. Udgir", category: "EDUCATION", subcategory: "Coaching Centers", description: "MBA/CAT, Bank PO, SSC coaching. Study material + mock tests.", address: "Shop 3, Station Road", area: "Station Road", city: "Udgir", phone: "9822099999", hours: "9 AM - 8 PM", rating: 4.2, reviewCount: 76, verified: false },
  { name: "Sneha Patil — Math & Science Tutor", category: "EDUCATION", subcategory: "Tutors", description: "Home tutor for Std 8-12. Math, Physics, Chemistry. 8+ yrs experience.", address: "Flat 302, Royal Residency", area: "Khair Nagar", city: "Udgir", phone: "9822012345", hours: "4 PM - 8 PM", rating: 4.9, reviewCount: 43, verified: false },

  // ── HOME_SERVICES ──
  { name: "Ravi Electric Works", category: "HOME_SERVICES", subcategory: "Electricians", description: "Licensed electrician. Wiring, repairs, inverters, solar installation. Same-day service.", address: "Shop 1, Industrial Estate", area: "Industrial Estate", city: "Udgir", phone: "9822010001", hours: "8 AM - 8 PM", rating: 4.6, reviewCount: 134, verified: true },
  { name: "Shinde Plumbing Services", category: "HOME_SERVICES", subcategory: "Plumbers", description: "All plumbing work — leakage, fittings, motor repair, bathroom renovation.", address: "Plot 22, Khair Nagar", area: "Khair Nagar", city: "Udgir", phone: "9822010002", hours: "9 AM - 7 PM", rating: 4.4, reviewCount: 89, verified: false },
  { name: "ColorTron Painters", category: "HOME_SERVICES", subcategory: "Painters", description: "Interior, exterior, texture painting. Free site visit & quote.", address: "Shop 15, Midc Road", area: "Midc Road", city: "Udgir", phone: "9822010003", hours: "9 AM - 6 PM", rating: 4.3, reviewCount: 56, verified: false },
  { name: "Mahesh Jadhav — Cab Driver", category: "HOME_SERVICES", subcategory: "Drivers", description: "Outstation + local cab. Latur, Nanded, Pune, Mumbai. AC sedan. 24x7.", address: "Royal Residency, Khair Nagar", area: "Khair Nagar", city: "Udgir", phone: "9822010004", hours: "24x7", rating: 4.7, reviewCount: 78, verified: false },

  // ── BUSINESS ──
  { name: "Hotel Shivshakti", category: "BUSINESS", subcategory: "Restaurants", description: "Pure veg family restaurant. Thali, South Indian, Chinese. AC family hall.", address: "Shivaji Chowk, Opp. Bus Stand", area: "Shivaji Chowk", city: "Udgir", phone: "9822020001", hours: "7 AM - 11 PM", rating: 4.4, reviewCount: 342, verified: true },
  { name: "Karnataka Meals House", category: "BUSINESS", subcategory: "Restaurants", description: "Authentic North Karnataka meals. Jowar roti, ennegayi. Unlimited thali ₹120.", address: "Station Road", area: "Station Road", city: "Udgir", phone: "9822020002", hours: "12 PM - 3:30 PM, 7 PM - 10:30 PM", rating: 4.6, reviewCount: 198, verified: false },
  { name: "Sai Lodge", category: "BUSINESS", subcategory: "Hotels", description: "Budget AC/non-AC rooms. Daily, weekly, monthly tariff. Family-friendly.", address: "Near Bus Stand, Station Road", area: "Station Road", city: "Udgir", phone: "9822020003", hours: "24x7", rating: 3.9, reviewCount: 67, verified: false },
  { name: "Sharma Kirana Store", category: "BUSINESS", subcategory: "Shops", description: "Daily groceries, provisions, fresh vegetables. Free home delivery above ₹500.", address: "Shop 1, Royal Residency Complex", area: "Khair Nagar", city: "Udgir", phone: "9822020004", hours: "7 AM - 10 PM", rating: 4.5, reviewCount: 234, verified: true },
  { name: "Anand General Stores", category: "BUSINESS", subcategory: "Shops", description: "Groceries, household items, stationery. Monthly credit facility for society members.", address: "Plot 5, Khair Nagar", area: "Khair Nagar", city: "Udgir", phone: "9822020005", hours: "8 AM - 9:30 PM", rating: 4.3, reviewCount: 112, verified: false },
  { name: "Royal Super Bazaar", category: "BUSINESS", subcategory: "Retailers", description: "Hypermarket. Groceries, electronics, clothing, home needs. Weekend offers.", address: "Midc Road, Udgir", area: "Midc Road", city: "Udgir", phone: "9822020006", website: "https://royalsuperbazaar.in", hours: "9 AM - 10 PM", rating: 4.4, reviewCount: 456, verified: true },
  { name: "Udgir Wholesale Market", category: "BUSINESS", subcategory: "Wholesalers", description: "Bulk groceries, grains, pulses. Supply to retailers & hotels. Min order ₹5000.", address: "APMC Market Yard, Udgir", area: "APMC Yard", city: "Udgir", phone: "9822020007", hours: "6 AM - 6 PM", rating: 4.2, reviewCount: 89, verified: false },

  // ── GOVERNMENT ──
  { name: "Udgir Police Station", category: "GOVERNMENT", subcategory: "Police", description: "Udgir City police station. FIR, complaints, passport verification. 24x7 helpline 100.", address: "Station Road, Udgir", area: "Station Road", city: "Udgir", phone: "100", hours: "24x7", rating: 4.0, reviewCount: 123, verified: true },
  { name: "Khair Nagar Beat Office", category: "GOVERNMENT", subcategory: "Police", description: "Beat chowky for Khair Nagar area. Local complaints, night patrol.", address: "Khair Nagar Main Road", area: "Khair Nagar", city: "Udgir", phone: "02383-220300", hours: "8 AM - 10 PM", rating: 3.8, reviewCount: 34, verified: true },
  { name: "Udgir Municipal Council", category: "GOVERNMENT", subcategory: "Municipality", description: "Property tax, water tax, birth/death certificates, trade licenses, garbage collection.", address: "Municipal Building, Shivaji Chowk", area: "Shivaji Chowk", city: "Udgir", phone: "02383-220400", hours: "10 AM - 5:30 PM (Mon-Sat)", rating: 3.6, reviewCount: 234, verified: true },
  { name: "MSEDC Office Udgir", category: "GOVERNMENT", subcategory: "Electricity", description: "Maharashtra State Electricity Distribution. Bill payment, new connection, complaints.", address: "Latur Road, Udgir", area: "Latur Road", city: "Udgir", phone: "1912", website: "https://mahadiscom.in", hours: "10 AM - 5 PM (Mon-Sat)", rating: 3.5, reviewCount: 345, verified: true },
  { name: "Water Works Department Udgir", category: "GOVERNMENT", subcategory: "Water Department", description: "Water supply, tanker booking, leakage complaints, new water connection.", address: "Municipal Building, Shivaji Chowk", area: "Shivaji Chowk", city: "Udgir", phone: "02383-220500", hours: "10 AM - 5 PM (Mon-Sat)", rating: 3.4, reviewCount: 156, verified: true },

  // ── RELIGIOUS ──
  { name: "Jama Masjid Udgir", category: "RELIGIOUS", subcategory: "Mosques", description: "Friday prayers, Eid celebrations, madrasa classes. Community iftar in Ramadan.", address: "Mohalla Road, Udgir", area: "Old City", city: "Udgir", phone: "9822030001", hours: "5 AM - 9 PM", rating: 4.8, reviewCount: 89, verified: true },
  { name: "Hanuman Temple Khair Nagar", category: "RELIGIOUS", subcategory: "Temples", description: "Daily aarti 7 AM & 7 PM. Tuesday special bhajan. Hanuman Jayanti mahotsav.", address: "Khair Nagar Main Road", area: "Khair Nagar", city: "Udgir", phone: "9822030002", hours: "6 AM - 9 PM", rating: 4.9, reviewCount: 176, verified: true },
  { name: "Ganesh Mandir", category: "RELIGIOUS", subcategory: "Temples", description: "Ganesh festival pandal hub. Daily darshan, Satyanarayan pooja bookings.", address: "Shivaji Chowk", area: "Shivaji Chowk", city: "Udgir", phone: "9822030003", hours: "6 AM - 10 PM", rating: 4.7, reviewCount: 134, verified: false },
  { name: "St. Mary's Church", category: "RELIGIOUS", subcategory: "Churches", description: "Sunday mass 8 AM. Confession, baptism, wedding ceremonies.", address: "Church Road, Udgir", area: "Church Road", city: "Udgir", phone: "9822030004", hours: "7 AM - 8 PM", rating: 4.8, reviewCount: 56, verified: true },
  { name: "Madrasa Islamia Udgir", category: "RELIGIOUS", subcategory: "Madrasas", description: "Islamic education for children. Quran, Hadith, Arabic, Urdu. Free education.", address: "Mohalla Road, Old City", area: "Old City", city: "Udgir", phone: "9822030005", hours: "6 AM - 12 PM, 3 PM - 6 PM", rating: 4.6, reviewCount: 43, verified: false },

  // ── EMERGENCY ──
  { name: "Udgir Ambulance Service", category: "EMERGENCY", subcategory: "Ambulance", description: "Private ambulance. Basic + Adv life support. Dead body freezer van. 24x7.", address: "Station Road, Udgir", area: "Station Road", city: "Udgir", phone: "9822040001", hours: "24x7", rating: 4.5, reviewCount: 67, verified: true },
  { name: "108 Free Ambulance", category: "EMERGENCY", subcategory: "Ambulance", description: "Govt free ambulance service for emergencies + maternity. Dial 108.", address: "Civil Hospital, Hospital Road", area: "Hospital Road", city: "Udgir", phone: "108", hours: "24x7", rating: 4.3, reviewCount: 234, verified: true },
  { name: "Udgir Civil Blood Bank", category: "EMERGENCY", subcategory: "Blood Banks", description: "Govt blood bank. All blood groups. Free for BPL. Voluntary donor registration.", address: "Civil Hospital, Hospital Road", area: "Hospital Road", city: "Udgir", phone: "02383-220600", hours: "24x7", rating: 4.2, reviewCount: 89, verified: true },
  { name: "Udgir Fire Brigade", category: "EMERGENCY", subcategory: "Fire Stations", description: "Fire, rescue, flood response. Free service. Dial 101.", address: "Station Road, Udgir", area: "Station Road", city: "Udgir", phone: "101", hours: "24x7", rating: 4.4, reviewCount: 45, verified: true },
];

async function main() {
  console.log("🌱 Seeding Yellow Pages (discovery directory)...");

  await db.yellowPageEntry.deleteMany();

  for (const e of ENTRIES) {
    await db.yellowPageEntry.create({ data: e });
  }

  console.log(`✅ Seeded ${ENTRIES.length} Yellow Pages entries.`);
  const byCat: Record<string, number> = {};
  for (const e of ENTRIES) byCat[e.category] = (byCat[e.category] || 0) + 1;
  console.log("By category:", byCat);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
