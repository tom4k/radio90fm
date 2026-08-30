import { db } from "../lib/db";
import { programs } from "../db/schema";
import crypto from "crypto";

const rawScheduleCSV = `Time,SUNDAY,MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY
6.00am,vandhemataram,vandhemataram,vandhemataram,vandhemataram,vandhemataram,vandhemataram,vandhemataram
6.01am,Devasangeetham,Devasangeetham,Devasangeetham,Devasangeetham,Devasangeetham,Devasangeetham,Devasangeetham
6.20am,Dharsanam,Dharsanam,Dharsanam,Dharsanam,Dharsanam,Dharsanam,Dharsanam
6.25am,Calendar,Calendar,Calendar,Calendar,Calendar,Calendar,Calendar
6.30am,Keraleeyam,Keraleeyam,Keraleeyam,Keraleeyam,Keraleeyam,Keraleeyam,Keraleeyam
6.40am,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day
6.45am,For The People,Songs,Songs,Songs,For The People,For The People,For The People
7.00am,Songs,Songs,Songs,Songs,Songs,Songs,Songs
7.15am,Audio Book,Audio Book,Audio Book,Audio Book,Audio Book,Audio Book,Audio Book
7.22am,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam
7.25am,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News
7.35am,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT
7.38am,WordBook,WordBook,WordBook,WordBook,WordBook,WordBook,WordBook
7.40am,Frames,Songs,Songs,Nattile Thaaram,Songs,Songs,Raagaleyam
8.00am,Innariyan Live,Innariyan Live,Innariyan Live,Innariyan Live,Innariyan Live,Innariyan Live,Innariyan Live
8.28am,Quote Of The Day,Quote Of The Day,Quote Of The Day,Quote Of The Day,Quote Of The Day,Quote Of The Day,Quote Of The Day
8.30am,Ennu Swantham Live,Ennu Swantham Live,Ennu Swantham Live,Ennu Swantham Live,Ennu Swantham Live,Ennu Swantham Live,Ennu Swantham Live
9.28am,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT
9.30am,Student's Zone,Student's Zone,Student's Zone,Student's Zone,Student's Zone,Student's Zone,Student's Zone
9.58am,Did You Know,Did You Know,Did You Know,Did You Know,Did You Know,Did You Know,Did You Know
10.00am,Top 10@10,Top 10@10,Top 10@10,Top 10@10,Top 10@10,Top 10@10,Top 10@10
10.58am,WordBook,WordBook,WordBook,WordBook,WordBook,WordBook,WordBook
11.00am,Idam ClapBoard,vinjanaveedhi,Songs,Idam Eanam,Idam Krithi,Idam ClapBoard,Idam Eanam
11.30am,Jaalakam,vinjanaveedhi,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam
11.35am,Voice Of Innovators,vinjanaveedhi,Songs,Whole Note ,High Tech,Home,Niyamaveedhi
12.00pm,Pennidom,Pennidom,Pennidom,Pennidom,Pennidom,Pennidom,Pennidom
12.27pm,Did You Know,Did You Know,Did You Know,Did You Know,Did You Know,Did You Know,Did You Know
12.30pm,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News
12.45pm,Quote Of The Day,Quote Of The Day,Quote Of The Day,Quote Of The Day,Quote Of The Day,Quote Of The Day,Quote Of The Day
12.50pm,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News,Aakashavani News
01.00pm,Run Down,Nalla Onantharam Paattukal,Nalla Onantharam Paattukal,Nalla Onantharam Paattukal,Radio Grammam,Nalla Onantharam Paattukal,Nalla Onantharam Paattukal
01.57pm,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam
02.00pm,Ente Paattu Live,Ente Paattu Live,Ente Paattu Live,Ente Paattu Live,Ente Paattu Live,Ente Paattu Live,Ente Paattu Live
02.58pm,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT
03.00pm,Lalitha Sangeetha Paadam,Beyond Thoughts,Dewani,Dewani,Beyond Thoughts,Dewani,Dewani
03.30pm,Radio Grammam,Priya Geetham,Katrinmozhi,Priya Geetham,Katrinmozhi,Priya Geetham,Katrinmozhi
04.28pm,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam
04.30pm,Prime Hits,Prime Hits,Prime Hits,Prime Hits,Prime Hits,Prime Hits,Prime Hits
05.30pm,vinjanaveedhi,Prime Hits,Whole Note ,Prime Hits,Prime Hits,Niyamaveedhi,Prime Hits
06.00pm,vinjanaveedhi,Noorumeni,Noorumeni,Noorumeni,Noorumeni,Noorumeni,Noorumeni
06.30pm,Jaalakam,Jaalakam / Comedy Junction,Jaalakam / Comedy Junction,Jaalakam / Comedy Junction,Jaalakam / Comedy Junction,Jaalakam / Comedy Junction,Jaalakam / Comedy Junction
06.40pm,For The People,Songs,Songs,Songs,For The People,For The People,For The People
07.00pm,Student Zone,Student Zone,Student Zone,Student Zone,Student Zone,Student Zone,Student Zone
07.35pm,Did You Know,Did You Know,Did You Know,Did You Know,Did You Know,Did You Know,Did You Know
07.45pm,Audio Book,Audio Book,Audio Book,Audio Book,Audio Book,Audio Book,Audio Book
07.57pm,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT,Doctors Talk MMT
08.00pm,Run Down,Songs,Beyond Thoughts,Songs,Voice Of Innovators,Beyond Thoughts,
08.30pm,Run Down,WordBook,Nalla Onantharam Paattukal,WordBook,WordBook,Nalla Onantharam Paattukal,WordBook
08.35pm,Run Down,Hitech,Nalla Onantharam Paattukal,Nattile Thaaram,Songs,Nalla Onantharam Paattukal,Frames
08.58pm,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day
09.00pm,Priyaraagam,Katrinmozhi,Priyaraagam,Katrinmozhi,Priyaraagam,Katrinmozhi,Symphony
10.00pm,Shabdharekha,Lalitha Sangeetha Paadam,Indravalleri,Idam Eanam,Idam Krithi,Songs,Indravalleri
10.30pm,Shabdharekha,Songs,Indravalleri,Songs,Home,Raagaleyam,Indravalleri
10.55pm,Dharsanam,Dharsanam,Dharsanam,Dharsanam,Dharsanam,Dharsanam,Dharsanam
11.00pm,songs,Dewani,Dewani,Dewani,Dewani,Dewani,Songs
11.30pm,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam,Jaalakam
11.35pm,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day,Quote of  The Day
11.36pm,Songs,Songs,Songs,Songs,Songs,Songs,Songs
11.59pm,Jana Gana Mana,Jana Gana Mana,Jana Gana Mana,Jana Gana Mana,Jana Gana Mana,Jana Gana Mana,Jana Gana Mana
12.00am,Shubharaathri,Shubharaathri,Shubharaathri,Shubharaathri,Shubharaathri,Shubharaathri,Shubharaathri`;

function parseTime(timeStr: string): number {
  const match = timeStr.trim().match(/^(\d{1,2})[\.:](\d{2})\s*(am|pm)$/i);
  if (!match) return 0;
  let hour = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  const period = match[3].toLowerCase();

  if (period === "pm" && hour < 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  return hour * 60 + min;
}

const dayMap: Record<string, number> = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
};

async function seed() {
  console.log("=== Seeding Initial Radio 90 FM Schedule ===");

  const lines = rawScheduleCSV.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  const slots: { timeStr: string; startMins: number; shows: Record<string, string> }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const timeStr = cols[0];
    const startMins = parseTime(timeStr);

    const shows: Record<string, string> = {};
    for (let j = 1; j < headers.length; j++) {
      shows[headers[j]] = cols[j] || "";
    }

    slots.push({ timeStr, startMins, shows });
  }

  const programInserts: any[] = [];

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  for (const day of days) {
    const dayOfWeek = dayMap[day];

    for (let k = 0; k < slots.length; k++) {
      const currentSlot = slots[k];
      const showTitle = currentSlot.shows[day];

      if (!showTitle) continue;

      const startMinutes = currentSlot.startMins;
      const endMinutes = k < slots.length - 1 ? slots[k + 1].startMins : 1440;

      // Determine presenter and call options for live shows
      let presenter = "Voice of Amal Jyothi";
      let enableCall = true;
      let enableWhatsapp = true;

      if (showTitle.toLowerCase().includes("live")) {
        presenter = "Live Radio Host";
      }

      programInserts.push({
        id: crypto.randomUUID(),
        title: showTitle,
        description: `Official Radio 90 FM broadcast - ${showTitle}`,
        presenter,
        dayOfWeek,
        startMinutes,
        endMinutes,
        phoneNumber: "9496345029",
        whatsappNumber: "9048389090",
        enableCall,
        enableWhatsapp,
        isActive: true,
        displayOrder: k,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  console.log(`Generated ${programInserts.length} weekly program entries from official schedule.`);

  try {
    // Delete old programs
    await db.delete(programs);
    
    // Batch insert programs
    await db.insert(programs).values(programInserts);
    console.log("Successfully seeded initial schedule into database!");
  } catch (err) {
    console.error("Error seeding schedule:", err);
  } finally {
    process.exit(0);
  }
}

seed();
