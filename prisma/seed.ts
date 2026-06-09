import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.canteenOrder.deleteMany({});
  await prisma.bookRequest.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.feeAssignment.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.adminProfile.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding departments...');
  const cse = await prisma.department.create({
    data: { name: 'Computer Science and Engineering', code: 'CSE' },
  });
  const ece = await prisma.department.create({
    data: { name: 'Electronics and Communication Engineering', code: 'ECE' },
  });
  const me = await prisma.department.create({
    data: { name: 'Mechanical Engineering', code: 'ME' },
  });

  const depts = [cse, ece, me];

  console.log('Seeding administrative users...');
  // Standard Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@campus.edu',
      passwordHash: 'admin123', // Raw for simplicity in mock login
      role: 'ADMIN',
      adminProfile: {
        create: {
          fullName: 'Dr. Sarah Jenkins',
          department: 'Academic Affairs',
          roleTitle: 'Dean of Academics',
        },
      },
    },
  });

  // Super Admin
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@campus.edu',
      passwordHash: 'super123',
      role: 'SUPER_ADMIN',
      adminProfile: {
        create: {
          fullName: 'Chief John Doe',
          department: 'Administration',
          roleTitle: 'Registrar',
        },
      },
    },
  });

  console.log('Seeding primary student user (Alex)...');
  const alexUser = await prisma.user.create({
    data: {
      email: 'student@campus.edu',
      passwordHash: 'student123',
      role: 'STUDENT',
      studentProfile: {
        create: {
          studentCode: 'STU001',
          fullName: 'Alex Carter',
          departmentId: cse.id,
          courseId: 'B.Tech CSE',
          currentSemester: 6,
          cgpa: 8.4,
        },
      },
    },
    include: { studentProfile: true },
  });

  const alexProfileId = alexUser.studentProfile!.id;

  console.log('Seeding multiple mock students...');
  const mockStudentNames = [
    'Emma Watson', 'Liam Neeson', 'Sophia Loren', 'Noah Centineo', 'Olivia Rodrigo',
    'William Wright', 'Ava DuVernay', 'James Bond', 'Isabella Swan', 'Benjamin Franklin',
    'Mia Thermopolis', 'Lucas Scott', 'Charlotte York', 'Henry Cavill', 'Amelia Earhart',
    'Alexander Hamilton', 'Evelyn Salt', 'Daniel Craig', 'Harper Lee', 'Mason Mount'
  ];

  const studentProfiles: any[] = [alexUser.studentProfile!];

  for (let i = 0; i < mockStudentNames.length; i++) {
    const email = `student${i + 2}@campus.edu`;
    const dept = depts[i % depts.length];
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: 'password123',
        role: 'STUDENT',
        studentProfile: {
          create: {
            studentCode: `STU${String(i + 2).padStart(3, '0')}`,
            fullName: mockStudentNames[i],
            departmentId: dept.id,
            courseId: `B.Tech ${dept.code}`,
            currentSemester: (i % 8) + 1,
            // Vary CGPAs for realistic distribution
            cgpa: parseFloat((6.0 + Math.random() * 4.0).toFixed(2)),
          },
        },
      },
      include: { studentProfile: true },
    });
    studentProfiles.push(user.studentProfile!);
  }

  console.log('Seeding attendance records (to simulate analytics & risk levels)...');
  const subjects = [
    { id: 'CS-301', name: 'Software Engineering' },
    { id: 'CS-302', name: 'Database Systems' },
    { id: 'CS-303', name: 'Computer Networks' },
    { id: 'CS-304', name: 'Theory of Computation' }
  ];

  const today = new Date();
  const attendanceRecords: any[] = [];

  for (const student of studentProfiles) {
    // Determine target attendance rate for this student to make some highly "At Risk"
    // Alex has 85% attendance
    // Students with low index have high attendance, students with high index have varying
    let attendanceChance = 0.85; 
    if (student.studentCode === 'STU002') attendanceChance = 0.52; // Very low
    if (student.studentCode === 'STU005') attendanceChance = 0.61; // Low
    if (student.studentCode === 'STU010') attendanceChance = 0.45; // Extremely low (At Risk)

    // Loop through the last 15 days
    for (let dayOffset = 15; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const sub of subjects) {
        const roll = Math.random();
        let status = 'PRESENT';
        if (roll > attendanceChance) {
          status = Math.random() > 0.3 ? 'ABSENT' : 'LATE';
        }

        attendanceRecords.push({
          studentId: student.id,
          date,
          status,
          subjectId: sub.id,
          subjectName: sub.name,
        });
      }
    }
  }

  // Create attendance records in chunks for SQLite compatibility
  const chunkSize = 100;
  for (let i = 0; i < attendanceRecords.length; i += chunkSize) {
    const chunk = attendanceRecords.slice(i, i + chunkSize);
    await prisma.attendanceRecord.createMany({ data: chunk });
  }

  console.log('Seeding fee assignments...');
  const feeTypes = ['Tuition Fee', 'Hostel Fee', 'Library Fee', 'Exam Fee'];
  const dueDates = [
    new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days later
    new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (overdue)
    new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
  ];

  for (const student of studentProfiles) {
    // Tuition Fee (High value)
    let tuitionPaid = 12000;
    let tuitionStatus = 'PAID';
    
    // Create outstanding fees for specific users to trigger risk scoring
    if (student.studentCode === 'STU001') { // Alex has a pending Tuition fee
      tuitionPaid = 4000;
      tuitionStatus = 'PARTIAL';
    } else if (student.studentCode === 'STU002' || student.studentCode === 'STU010') {
      tuitionPaid = 0;
      tuitionStatus = 'PENDING';
    }

    await prisma.feeAssignment.create({
      data: {
        studentId: student.id,
        feeType: 'Tuition Fee',
        amountDue: 12000,
        amountPaid: tuitionPaid,
        dueDate: dueDates[1], // Overdue
        status: tuitionStatus,
      }
    });

    // Hostel Fee (Only for some students)
    if (Math.random() > 0.5) {
      const unpaidHostel = Math.random() > 0.7;
      await prisma.feeAssignment.create({
        data: {
          studentId: student.id,
          feeType: 'Hostel Fee',
          amountDue: 3500,
          amountPaid: unpaidHostel ? 0 : 3500,
          dueDate: dueDates[0],
          status: unpaidHostel ? 'PENDING' : 'PAID',
        }
      });
    }

    // Exam Fee (Always paid except for a few)
    const unpaidExam = student.studentCode === 'STU010' || student.studentCode === 'STU015';
    await prisma.feeAssignment.create({
      data: {
        studentId: student.id,
        feeType: 'Exam Fee',
        amountDue: 150,
        amountPaid: unpaidExam ? 0 : 150,
        dueDate: dueDates[2],
        status: unpaidExam ? 'PENDING' : 'PAID',
      }
    });
  }

  console.log('Seeding support tickets...');
  // Seed ticket for Alex
  await prisma.supportTicket.create({
    data: {
      studentId: alexProfileId,
      title: 'Tuition payment portal failing',
      description: 'I tried to make the payment for my semester tuition fee twice, but the page timed out and returned an API error code 502.',
      category: 'FINANCE',
      priority: 'HIGH',
      status: 'OPEN',
    }
  });

  await prisma.supportTicket.create({
    data: {
      studentId: alexProfileId,
      title: 'Hostel WiFi speed slow',
      description: 'The WiFi connection in Block-B Room 302 is extremely slow (less than 1 Mbps) during evening hours. Please check the access point load.',
      category: 'HOSTEL',
      priority: 'LOW',
      status: 'IN_PROGRESS',
    }
  });

  // Seed other tickets
  for (let i = 2; i < 8; i++) {
    const student = studentProfiles[i];
    await prisma.supportTicket.create({
      data: {
        studentId: student.id,
        title: `Grievance from ${student.fullName}`,
        description: `This is an auto-generated support request regarding ${
          i % 2 === 0 ? 'library fine refund' : 'bus route delay on Route 4B'
        }. Please resolve quickly.`,
        category: i % 2 === 0 ? 'LIBRARY' : 'TRANSPORT',
        priority: i % 3 === 0 ? 'MEDIUM' : 'LOW',
        status: i % 4 === 0 ? 'RESOLVED' : 'OPEN',
        resolutionNotes: i % 4 === 0 ? 'Checked and resolved with student.' : null,
      }
    });
  }

  console.log('Seeding library book requests...');
  const books = [
    { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest' },
    { title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan' },
    { title: 'Computer Networking', author: 'Kurose, Ross' },
    { title: 'Design Patterns', author: 'Gang of Four' }
  ];

  // Request for Alex
  await prisma.bookRequest.create({
    data: {
      studentId: alexProfileId,
      bookTitle: books[0].title,
      author: books[0].author,
      status: 'ISSUED',
      dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
    }
  });

  await prisma.bookRequest.create({
    data: {
      studentId: alexProfileId,
      bookTitle: books[1].title,
      author: books[1].author,
      status: 'OVERDUE',
      dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // Overdue by 2 days
    }
  });

  // Other book requests
  for (let i = 1; i < 5; i++) {
    const student = studentProfiles[i];
    await prisma.bookRequest.create({
      data: {
        studentId: student.id,
        bookTitle: books[i % books.length].title,
        author: books[i % books.length].author,
        status: i % 2 === 0 ? 'RETURNED' : 'ISSUED',
        dueDate: new Date(today.getTime() + (i * 2) * 24 * 60 * 60 * 1000),
      }
    });
  }

  console.log('Seeding canteen orders...');
  // Seed canteen orders
  const items = [
    { name: 'Veg Burger', qty: 1, price: 2.50 },
    { name: 'French Fries', qty: 1, price: 1.50 },
    { name: 'Coca Cola', qty: 1, price: 1.00 }
  ];
  
  await prisma.canteenOrder.create({
    data: {
      studentId: alexProfileId,
      itemsJson: JSON.stringify(items),
      total: 5.00,
      status: 'READY',
    }
  });

  await prisma.canteenOrder.create({
    data: {
      studentId: alexProfileId,
      itemsJson: JSON.stringify([{ name: 'Paneer Pizza', qty: 1, price: 4.50 }]),
      total: 4.50,
      status: 'COMPLETED',
    }
  });

  for (let i = 1; i < 6; i++) {
    const student = studentProfiles[i];
    await prisma.canteenOrder.create({
      data: {
        studentId: student.id,
        itemsJson: JSON.stringify([{ name: 'Chiken Sandwich', qty: 2, price: 6.00 }]),
        total: 6.00,
        status: i % 2 === 0 ? 'PENDING' : 'PREPARING',
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
