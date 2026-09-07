import { prisma } from "../../db";

export async function seedHostelDatabase() {
  console.log("Seeding CampusStay Hostel database...");

  // 1. Seed Blocks
  const blocksData = [
    { code: "BOYS-BLOCK-A", name: "Boys-Block-A", type: "Boys Hostel", letter: "B", capacity: 60, occupied: 60 },
    { code: "BOYS-BLOCK-B", name: "Boys-Block-B", type: "Boys Hostel", letter: "B", capacity: 61, occupied: 33 },
    { code: "BOYS-BLOCK-C", name: "Boys-Block-C", type: "Boys Hostel", letter: "B", capacity: 32, occupied: 10 },
    { code: "BOYS-BLOCK-D", name: "Boys-Block-D", type: "Boys Hostel", letter: "B", capacity: 48, occupied: 18 },
    { code: "GIRLS-BLOCK-A", name: "Girls-Block-A", type: "Girls Hostel", letter: "G", capacity: 170, occupied: 30 },
    { code: "GIRLS-BLOCK-B", name: "Girls-Block-B", type: "Girls Hostel", letter: "G", capacity: 169, occupied: 80 },
  ];

  for (const b of blocksData) {
    const existing = await prisma.hostelBlock.findUnique({ where: { blockCode: b.code } });
    if (!existing) {
      const block = await prisma.hostelBlock.create({
        data: {
          blockCode: b.code,
          blockName: b.name,
          type: b.type,
          letter: b.letter,
          totalCapacity: b.capacity,
          status: "Active",
        },
      });

      // Create 4 floors
      for (let f = 1; f <= 4; f++) {
        const floor = await prisma.hostelFloor.create({
          data: {
            blockId: block.id,
            floorNumber: f,
            floorName: `Floor ${f}`,
          },
        });

        // Create 5 rooms per floor
        for (let r = 1; r <= 5; r++) {
          const roomNum = `${f}0${r}`;
          const isFull = b.code === "BOYS-BLOCK-A";
          const occupiedCount = isFull ? 3 : (r <= 2 ? 2 : 0);
          const status = occupiedCount >= 3 ? "OCCUPIED" : "AVAILABLE";

          const room = await prisma.hostelRoom.create({
            data: {
              floorId: floor.id,
              roomNumber: roomNum,
              capacity: 3,
              occupiedCount,
              status,
            },
          });

          for (let bedIdx = 1; bedIdx <= 3; bedIdx++) {
            await prisma.hostelBed.create({
              data: {
                roomId: room.id,
                bedNumber: `Bed-${bedIdx}`,
                status: bedIdx <= occupiedCount ? "OCCUPIED" : "AVAILABLE",
              },
            });
          }
        }
      }
    }
  }

  // 2. Seed Meal Slots
  const mealSlotsData = [
    { name: "Breakfast", timeRange: "07:30 - 09:15", startTime: "07:30", endTime: "09:15" },
    { name: "Lunch", timeRange: "12:00 - 15:30", startTime: "12:00", endTime: "15:30" },
    { name: "Snacks", timeRange: "16:00 - 18:00", startTime: "16:00", endTime: "18:00" },
    { name: "Dinner", timeRange: "19:00 - 22:30", startTime: "19:00", endTime: "22:30" },
  ];

  for (const m of mealSlotsData) {
    await prisma.hostelMealSlot.upsert({
      where: { name: m.name },
      update: m,
      create: m,
    });
  }

  // 3. Seed 7-day Menu Schedule
  const menuDays = [
    { dateString: "26 Aug 2026", dayName: "Wednesday" },
    { dateString: "27 Aug 2026", dayName: "Thursday" },
    { dateString: "28 Aug 2026", dayName: "Friday" },
    { dateString: "29 Aug 2026", dayName: "Saturday" },
    { dateString: "30 Aug 2026", dayName: "Sunday" },
    { dateString: "31 Aug 2026", dayName: "Monday" },
    { dateString: "01 Sep 2026", dayName: "Tuesday" },
  ];

  for (const m of menuDays) {
    await prisma.hostelMenuSchedule.upsert({
      where: { dateString: m.dateString },
      update: {},
      create: {
        dateString: m.dateString,
        dayName: m.dayName,
        breakfastNonVeg: false,
        lunchNonVeg: false,
        snacksNonVeg: false,
        dinnerNonVeg: false,
        notes: "",
      },
    });
  }

  // 4. Seed Outing Requests
  const outings = [
    { studentName: "Sivaparvathi Gunturu", studentId: "24331A1249", fromDate: "2026-08-26 21:04", toDate: "2026-08-27 09:04", reason: "Going with friends" },
    { studentName: "Shriya Choudhury", studentId: "24331A4756", fromDate: "2026-08-22 13:00", toDate: "2026-08-23 13:00", reason: "Medical" },
    { studentName: "Yashaswini Naga Bhavani Saripella", studentId: "24331A07D0", fromDate: "2026-08-20 12:00", toDate: "2026-08-20 17:00", reason: "Birthday celebration" },
    { studentName: "NAKKA SUPRIYA", studentId: "23331A0782", fromDate: "2026-08-17 11:00", toDate: "2026-08-17 19:00", reason: "Family function" },
    { studentName: "Jahnavi Tatikella", studentId: "23331A0162", fromDate: "2026-08-15 08:00", toDate: "2026-08-15 15:00", reason: "My family is in hospital, I wanna visit them" },
  ];

  const existingOutings = await prisma.hostelOutingRequest.count();
  if (existingOutings === 0) {
    for (const o of outings) {
      await prisma.hostelOutingRequest.create({
        data: {
          studentName: o.studentName,
          studentId: o.studentId,
          destination: "City Outing",
          fromDate: o.fromDate,
          toDate: o.toDate,
          reason: o.reason,
          status: "PENDING",
          parentApproval: "PENDING",
          wardenApproval: "PENDING",
        },
      });
    }
  }

  // 5. Seed Biometric Devices
  const devices = [
    { code: "DEV-MG-A1", name: "Main Gate Turnstile A1", location: "Main Hostel Gate", ip: "192.168.1.101", type: "Biometric Turnstile" },
    { code: "DEV-GB-B1", name: "Girls Block B Turnstile B1", location: "Girls Block B Ground Entrance", ip: "192.168.1.102", type: "Biometric Turnstile" },
    { code: "DEV-MG-C1", name: "Mess Gate Reader C1", location: "Central Dining Hall", ip: "192.168.1.105", type: "RFID Gate" },
  ];

  for (const d of devices) {
    await prisma.hostelBiometricDevice.upsert({
      where: { deviceCode: d.code },
      update: {},
      create: {
        deviceCode: d.code,
        deviceName: d.name,
        location: d.location,
        ipAddress: d.ip,
        deviceType: d.type,
        status: "ONLINE",
      },
    });
  }

  // 6. Seed Attendance Events
  const attendanceLogs = [
    { name: "Reshma Borra", userId: "24331A0545", block: "Girls-Block-B", floor: "Floor 4", room: "Room 410" },
    { name: "Rajana Vaishnavi", userId: "24331A0505", block: "Girls-Block-B", floor: "Floor 4", room: "Room 414" },
    { name: "Sushma sri Reddi", userId: "24331A05P2", block: "Girls-Block-B", floor: "Floor 3", room: "Room 334" },
    { name: "sravani yadla", userId: "24331A05W2", block: "Girls-Block-B", floor: "Floor 3", room: "Room 328" },
  ];

  const existingLogs = await prisma.hostelAttendanceEvent.count();
  if (existingLogs === 0) {
    for (const l of attendanceLogs) {
      await prisma.hostelAttendanceEvent.create({
        data: {
          studentName: l.name,
          userId: l.userId,
          blockName: l.block,
          floorName: l.floor,
          roomNumber: l.room,
          deviceName: "Girls Hostel Biometric",
          eventType: "CHECK-IN",
          method: "Fingerprint",
        },
      });
    }
  }

  console.log("CampusStay Hostel database seeded successfully!");
}
