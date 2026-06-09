import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let studentId = searchParams.get('studentId');

    // Default to the first student (Alex) if none specified
    if (!studentId) {
      const alex = await prisma.studentProfile.findFirst({
        where: { studentCode: 'STU001' }
      });
      if (alex) {
        studentId = alex.id;
      } else {
        return NextResponse.json({ error: 'No students found' }, { status: 404 });
      }
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { department: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 1. Calculate Attendance Summary
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId }
    });

    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(r => r.status === 'PRESENT').length;
    const lateClasses = attendanceRecords.filter(r => r.status === 'LATE').length;
    
    // Late counts as 0.75 present or we can treat it as present for % but note it
    const attendanceRate = totalClasses > 0 
      ? Math.round(((presentClasses + lateClasses * 0.7) / totalClasses) * 100) 
      : 80;

    // Subject-wise attendance
    const subjectWiseMap: Record<string, { present: number, total: number, name: string }> = {};
    attendanceRecords.forEach(r => {
      if (!subjectWiseMap[r.subjectId]) {
        subjectWiseMap[r.subjectId] = { present: 0, total: 0, name: r.subjectName };
      }
      subjectWiseMap[r.subjectId].total += 1;
      if (r.status === 'PRESENT') {
        subjectWiseMap[r.subjectId].present += 1;
      } else if (r.status === 'LATE') {
        subjectWiseMap[r.subjectId].present += 0.7;
      }
    });

    const subjectWiseAttendance = Object.keys(subjectWiseMap).map(key => ({
      subjectId: key,
      name: subjectWiseMap[key].name,
      percentage: Math.round((subjectWiseMap[key].present / subjectWiseMap[key].total) * 100),
      total: subjectWiseMap[key].total,
      present: Math.round(subjectWiseMap[key].present)
    }));

    // 2. Fees due
    const feeAssignments = await prisma.feeAssignment.findMany({
      where: { studentId }
    });
    const outstandingFees = feeAssignments.reduce((sum, fee) => {
      if (fee.status !== 'PAID') {
        return sum + (fee.amountDue - fee.amountPaid);
      }
      return sum;
    }, 0);

    // 3. Library & Support
    const overdueBooksCount = await prisma.bookRequest.count({
      where: { studentId, status: 'OVERDUE' }
    });

    const openTicketsCount = await prisma.supportTicket.count({
      where: { studentId, status: { in: ['OPEN', 'IN_PROGRESS'] } }
    });

    // 4. Timetable (Mock for today)
    const todayTimetable = [
      { id: 1, time: '09:00 AM - 10:30 AM', subject: 'CS-301: Software Engineering', room: 'Block A, LH-204', faculty: 'Dr. Sarah Jenkins' },
      { id: 2, time: '11:00 AM - 12:30 PM', subject: 'CS-302: Database Systems', room: 'Block A, LH-102', faculty: 'Prof. R. Sharma' },
      { id: 3, time: '02:00 PM - 03:30 PM', subject: 'CS-303: Computer Networks', room: 'Block C, Lab-3', faculty: 'Dr. K. Verma' }
    ];

    // 5. Action Items
    const actionRequired: any[] = [];
    if (outstandingFees > 0) {
      actionRequired.push({
        id: 'fee_due',
        type: 'FINANCE',
        title: 'Outstanding Fees',
        description: `You have $${outstandingFees.toLocaleString()} pending fee payment due soon.`,
        actionUrl: '/student/finance'
      });
    }
    if (overdueBooksCount > 0) {
      actionRequired.push({
        id: 'library_overdue',
        type: 'LIBRARY',
        title: 'Overdue Books',
        description: `You have ${overdueBooksCount} library book(s) past their due date.`,
        actionUrl: '/student/services'
      });
    }
    if (attendanceRate < 75) {
      actionRequired.push({
        id: 'attendance_warning',
        type: 'ACADEMIC',
        title: 'Low Attendance Alert',
        description: `Your attendance is currently ${attendanceRate}%, which is below the 75% threshold.`,
        actionUrl: '/student/academics'
      });
    }

    // 6. Announcements
    const announcements = [
      { id: 1, date: 'May 18, 2026', title: 'End Semester Exam Schedule Published', body: 'The exam schedule for May/June 2026 is now available in the portal. Exams start from June 5th.', author: 'Registrar Office' },
      { id: 2, date: 'May 16, 2026', title: 'TechFest 2026 Registration Open', body: 'Annual inter-college technology festival registrations are open. Submit your project proposals by May 25th.', author: 'Student Council' },
      { id: 3, date: 'May 14, 2026', title: 'Library Timings Extended', body: 'In view of exams, the campus central library will remain open 24/7 from next Monday.', author: 'Librarian' }
    ];

    return NextResponse.json({
      student,
      attendanceSummary: {
        overallPercentage: attendanceRate,
        totalClasses,
        subjectWise: subjectWiseAttendance
      },
      todayTimetable,
      feeDue: outstandingFees,
      actionRequired,
      announcements,
      libraryCount: overdueBooksCount,
      openTicketsCount
    });
  } catch (error: any) {
    console.error('Student dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
