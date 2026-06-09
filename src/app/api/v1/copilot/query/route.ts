import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { query, moduleContext, studentId: reqStudentId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    let studentId = reqStudentId;
    
    // Default to Alex if none specified
    if (!studentId) {
      const alex = await prisma.studentProfile.findFirst({
        where: { studentCode: 'STU001' }
      });
      if (alex) {
        studentId = alex.id;
      }
    }

    const student = studentId ? await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { department: true }
    }) : null;

    const lowerQuery = query.toLowerCase();
    let answer = "";
    let suggestedActions: any[] = [];

    // Contextual responses based on keywords querying the database
    if (student && (lowerQuery.includes('assignment') || lowerQuery.includes('coursework') || lowerQuery.includes('pending') || lowerQuery.includes('submit'))) {
      answer = `Based on your LMS dashboard sync, ${student.fullName}, here is your assignment status:

### 🚨 Pending Coursework
1. **CS-302: Relational Database Schema Design**
   - **Due Date**: May 25, 2026 (6 days remaining)
   - **Priority**: HIGH
   - **Status**: PENDING

### ✓ Completed Submissions
- **CS-303: Dijkstras Routing Simulation Code**
  - **Status**: SUBMITTED on May 15, 2026
  - **AI Plagiarism Scan**: 8% Matches (Original Content)
- **CS-301: Agile Project Development Plan**
  - **Status**: GRADED (Grade: A, Verified by Prof. Sarah Jenkins)
  - **AI Plagiarism Scan**: 12% Matches (Original Content)

Would you like to analyze or submit your draft for **CS-302**?`;

      suggestedActions = [
        { label: 'Go to LMS Portal', url: '/student/lms', primary: true }
      ];

    } else if (student && (lowerQuery.includes('improve attendance') || lowerQuery.includes('attendance drop') || lowerQuery.includes('how to improve') || lowerQuery.includes('attendance insight'))) {
      // Find current attendance rate
      const records = await prisma.attendanceRecord.findMany({ where: { studentId: student.id } });
      const total = records.length;
      const present = records.filter(r => r.status === 'PRESENT').length;
      const late = records.filter(r => r.status === 'LATE').length;
      const rate = total > 0 ? Math.round(((present + late * 0.7) / total) * 100) : 85;

      answer = `Alex, let's analyze your attendance patterns to find actionable interventions:

### 📈 Current Attendance Summary
- **Overall Attendance**: **${rate}%** (debared threshold is 75%)
- **Critical Subject**: **CS-303: Computer Networks** is at **68%** (At Risk).

### 🔍 AI Smart Attendance Insights
- **Friday Drop Pattern**: Our analytics indicate your class attendance drops by **28% every Friday** compared to weekdays. 
- **Underlying Factor**: High concentration of late-night coding activity logged on Thursday nights in the portal.

### 💡 Suggested Interventions
1. **SMS Wake-Up Reminders**: Let's set up an automated SMS call alert at 7:30 AM every Friday.
2. **Peer Tutoring Support**: Attend the peer study group this Wednesday at 4:00 PM in Central Library Room 3 to review missed subnetting notes.
3. **Dean Office Check-in**: Schedule a brief academic office hour meeting with Dr. Sarah Jenkins to log a travel override excuse for your Friday commute.`;

      suggestedActions = [
        { label: 'Set Up Friday Reminders', url: '/student/support', primary: true },
        { label: 'View Subject Breakdown', url: '/student/academics', primary: false }
      ];

    } else if (student && (lowerQuery.includes('study plan') || lowerQuery.includes('study planner') || lowerQuery.includes('schedule') || lowerQuery.includes('planner') || lowerQuery.includes('exam prep'))) {
      answer = `I have generated a personalized **AI Study Planner** based on your courses:

### 📅 1. Daily Study Schedule (Today)
- **08:00 AM - 09:00 AM**: Revise Database normalization forms & transitive dependencies (CS-302)
- **04:00 PM - 05:30 PM**: Code Dijkstra's algorithm simulation in Python (CS-303)
- **07:00 PM - 08:30 PM**: Review Agile software design sprints and UML layouts (CS-301)

### 📝 2. Exam Preparation Plan (3-Day Revision Cycle)
- **Day 1 (May 20)**: Software Engineering (Agile methodology, User Stories, Testing phases)
- **Day 2 (May 21)**: Database Systems (SQL queries, transaction isolation, indexing structure)
- **Day 3 (May 22)**: Computer Networks (OSI model, TCP sliding window, IP subnet routing)

### 🚨 3. Weak-Subject Focus (Computer Networks)
- **Problem Area**: Subnet masking and CIDR computations.
- **Recommended Tip**: Complete the LMS practice quiz to unlock your **'Perfect Attender'** badge and gain **50 XP** points.`;

      suggestedActions = [
        { label: 'View Academic Calendar', url: '/student/academics', primary: true }
      ];

    } else if (student && (lowerQuery.includes('evaluator') || lowerQuery.includes('plagiarism') || lowerQuery.includes('grammar') || lowerQuery.includes('code check') || lowerQuery.includes('evaluation') || lowerQuery.includes('feedback'))) {
      answer = `Here is your auto-generated **AI Assignment Evaluation & Feedback Report**:

### 🔍 1. Plagiarism & Integrity Scan
- **Score**: **7% Similarity**
- **Status**: ✅ Safe. Matches are restricted to standard bibliographical citations.

### ✍️ 2. Grammar & Style Audit
- **Clarity Score**: **94/100**
- **Actionable Correction**: We detected 3 instances of passive voice in your introduction. Refactoring to active voice will improve readability.

### 💻 3. Coding Evaluation (CS-303 Routing Simulation)
- **Algorithmic Correctness**: Passed 8/8 edge test cases.
- **Complexity**: Optimal time complexity achieved: $O(E \\log V)$ using Min-Priority Heap.
- **Clean Code Check**: descriptive variable names were utilized; recommend refactoring the nested conditional statement in line 52 to avoid deep indentation.

### 💬 4. Auto Feedback
*Excellent structure and documentation. Your code execution matches industry standards. Recommended for final submission.*`;

      suggestedActions = [
        { label: 'Submit Coursework Draft', url: '/student/lms', primary: true }
      ];

    } else if (student && (lowerQuery.includes('resume') || lowerQuery.includes('career') || lowerQuery.includes('placement') || lowerQuery.includes('internship') || lowerQuery.includes('interview'))) {
      answer = `Here is your **AI Career Assistant & Placement Scorecard** based on your CSE course track:

### 🏆 1. Placement Readiness Score: **88%**
- **Strengths**: Strong GPA (${student.cgpa || 8.4}), 5 verified technical skills, and 2 completed portfolio projects.
- **Goal**: Add a Docker deployment configuration to your Campus Pilot project to increase cloud competency metrics.

### 💼 2. Tailored Internship Suggestions
1. **Software Engineer Intern** at Stripe
   - *Match index*: 92% (NodeJS, SQL, TypeScript)
2. **Full-Stack Developer Intern** at Microsoft
   - *Match index*: 87% (React, API Design, Algorithms)

### 📄 3. Generated Resume Draft (Markdown Outline)
\`\`\`markdown
# Alex Carter - CSE Candidate
- **Education**: B.Tech CSE (GPA: 8.4 / 10.0) | Semester 6
- **Skills**: React, NodeJS, SQL, TypeScript, Algorithms
- **Projects**: Campus Pilot Super App, Realtime Bus Tracking API
\`\`\`

### 🗣️ 4. Interview Preparation (Subject Specific)
- **Network Question**: *What is the difference between TCP and UDP?*
  - **Suggested Answer**: TCP is reliable and connection-oriented (guarantees packet arrival), whereas UDP is faster and connectionless (perfect for streaming).
- **Database Question**: *Explain 3rd Normal Form (3NF).*
  - **Suggested Answer**: A table is in 3NF if it is in 2NF and has no transitive dependencies on the primary key.`;

      suggestedActions = [
        { label: 'Open Placement Portal', url: '/student/placement', primary: true }
      ];

    } else if (student && (lowerQuery.includes('risk') || lowerQuery.includes('dropout') || lowerQuery.includes('wellness') || lowerQuery.includes('burnout') || lowerQuery.includes('stress') || lowerQuery.includes('mental') || lowerQuery.includes('predict'))) {
      // Find data to evaluate risk
      const fees = await prisma.feeAssignment.findMany({ where: { studentId: student.id } });
      const outstanding = fees.reduce((sum, f) => f.status !== 'PAID' ? sum + (f.amountDue - f.amountPaid) : sum, 0);

      const records = await prisma.attendanceRecord.findMany({ where: { studentId: student.id } });
      const total = records.length;
      const present = records.filter(r => r.status === 'PRESENT').length;
      const late = records.filter(r => r.status === 'LATE').length;
      const rate = total > 0 ? Math.round(((present + late * 0.7) / total) * 100) : 85;

      const tickets = await prisma.supportTicket.findMany({ where: { studentId: student.id } });
      const openFinanceTicket = tickets.some(t => t.category === 'FINANCE' && t.status !== 'RESOLVED');

      answer = `I have completed your **AI Risk Prediction & Emotional Wellness Audit**:

### ⚠️ 1. AI Risk Projections
- **Dropout Risk**: **LOW (15%)** (strong grade standing offsets low attendance).
- **Academic Failure Risk**: **LOW (10%)** (your cumulative GPA of ${student.cgpa} remains safe).
- **Fee Default Risk**: **MEDIUM (40%)** (you have $${outstanding.toLocaleString()} outstanding dues).
- **Low Engagement Risk**: **MEDIUM (35%)** (attendance of ${rate}% is below required 75% in computer networks).

### 🧠 2. Emotional Wellness Detection
- **Stress Indicator**: **MEDIUM** (flagged due to active ticket regarding tuition payment gateway failure).
- **Burnout Probability**: **LOW (22%)** (overall learning activity is well-balanced across weekdays).
- **Participation Level**: Average (canteen pre-orders and library transactions are high, but network lab logs show drops).
- **Suggested Wellness Action**: Schedule a counseling check-in if academic overload increases. Resolving your outstanding fees will lower your portal lock anxiety.`;

      suggestedActions = [
        { label: 'File Wellness Support Ticket', url: '/student/support', primary: true },
        { label: 'Check Fee Balance', url: '/student/finance', primary: false }
      ];

    } else if (student && (lowerQuery.includes('fee') || lowerQuery.includes('pay') || lowerQuery.includes('due') || lowerQuery.includes('outstanding'))) {
      const fees = await prisma.feeAssignment.findMany({
        where: { studentId: student.id }
      });
      
      const outstanding = fees.reduce((sum, f) => {
        if (f.status !== 'PAID') return sum + (f.amountDue - f.amountPaid);
        return sum;
      }, 0);

      const pendingFees = fees.filter(f => f.status !== 'PAID');

      if (outstanding > 0) {
        answer = `Hello ${student.fullName}, you have outstanding fees totaling **$${outstanding.toLocaleString()}**.\n\nHere are the details:\n` +
          pendingFees.map(f => `- **${f.feeType}**: $${(f.amountDue - f.amountPaid).toLocaleString()} due by ${new Date(f.dueDate).toLocaleDateString()} (${f.status})`).join('\n') +
          `\n\nWould you like to make a payment now?`;
        suggestedActions = [
          { label: 'Pay Outstanding Fees', url: '/student/finance', primary: true }
        ];
      } else {
        answer = `Good news, ${student.fullName}! All your fee assignments are fully paid. You have no outstanding dues.`;
        suggestedActions = [
          { label: 'View Payment History', url: '/student/finance', primary: false }
        ];
      }

    } else if (student && (lowerQuery.includes('attendance') || lowerQuery.includes('present') || lowerQuery.includes('absent') || lowerQuery.includes('late') || lowerQuery.includes('class'))) {
      const records = await prisma.attendanceRecord.findMany({
        where: { studentId: student.id }
      });

      const total = records.length;
      const present = records.filter(r => r.status === 'PRESENT').length;
      const late = records.filter(r => r.status === 'LATE').length;
      const rate = total > 0 ? Math.round(((present + late * 0.7) / total) * 100) : 85;

      answer = `Your overall attendance rate is **${rate}%** based on **${total}** sessions in this semester.\n\nSummary:\n- Present: ${present}\n- Late: ${late}\n- Absent: ${total - present - late}\n\n`;
      
      if (rate < 75) {
        answer += `⚠️ **Warning:** Your attendance is below the institutional requirement of 75%. You are at risk of debarment. Please contact your academic advisor.`;
      } else {
        answer += `✅ You meet the 75% attendance criteria. Keep it up!`;
      }

      suggestedActions = [
        { label: 'View Detailed Attendance', url: '/student/academics', primary: true }
      ];

    } else if (student && (lowerQuery.includes('timetable') || lowerQuery.includes('schedule') || lowerQuery.includes('today') || lowerQuery.includes('classes'))) {
      answer = `Here is your class schedule for today, **${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}**:\n\n` +
        `1. **09:00 AM - 10:30 AM**\n   CS-301: Software Engineering (Room: Block A, LH-204)\n\n` +
        `2. **11:00 AM - 12:30 PM**\n   CS-302: Database Systems (Room: Block A, LH-102)\n\n` +
        `3. **02:00 PM - 03:30 PM**\n   CS-303: Computer Networks (Room: Block C, Lab-3)\n\n` +
        `All classes are scheduled in-person.`;
      suggestedActions = [
        { label: 'View Weekly Schedule', url: '/student/academics', primary: false }
      ];

    } else if (student && (lowerQuery.includes('book') || lowerQuery.includes('library') || lowerQuery.includes('overdue'))) {
      const libraryBooks = await prisma.bookRequest.findMany({
        where: { studentId: student.id, status: { in: ['ISSUED', 'OVERDUE'] } }
      });

      if (libraryBooks.length > 0) {
        const overdue = libraryBooks.filter(b => b.status === 'OVERDUE');
        answer = `You currently have **${libraryBooks.length}** book(s) issued from the library.\n\n` +
          libraryBooks.map(b => `- **${b.bookTitle}** by ${b.author} (Due: ${new Date(b.dueDate).toLocaleDateString()}) ${b.status === 'OVERDUE' ? '🚨 **OVERDUE**' : ''}`).join('\n') +
          `\n\n`;
        
        if (overdue.length > 0) {
          answer += `Please return the overdue book(s) to avoid further fines.`;
        }
      } else {
        answer = `You do not have any library books currently issued.`;
      }
      suggestedActions = [
        { label: 'Browse Library Catalog', url: '/student/services', query: '?tab=library', primary: true }
      ];

    } else if (student && (lowerQuery.includes('ticket') || lowerQuery.includes('complaint') || lowerQuery.includes('support') || lowerQuery.includes('grievance'))) {
      const tickets = await prisma.supportTicket.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' }
      });

      if (tickets.length > 0) {
        const open = tickets.filter(t => t.status !== 'RESOLVED');
        answer = `You have submitted **${tickets.length}** support ticket(s). Here is the status of your active tickets:\n\n` +
          tickets.slice(0, 3).map(t => `- **[${t.status}]** ${t.title} (${t.category} - ${t.priority} Priority)`).join('\n') +
          `\n\n`;
        
        if (open.length > 0) {
          answer += `Our operations team is currently working on your tickets.`;
        }
      } else {
        answer = `You don't have any support tickets open. If you have an issue, I can help you file a ticket.`;
      }
      suggestedActions = [
        { label: 'File a Support Ticket', url: '/student/support', primary: true }
      ];

    } else if (lowerQuery.includes('wifi') || lowerQuery.includes('internet')) {
      answer = `To connect to the **Campus-Secure WiFi**:\n1. Select SSID: **Campus-Secure**\n2. Enter your student/admin email credentials as the identity.\n3. Use your portal password.\n\nIf you experience coverage gaps in hostels, please file a ticket in the Support section.`;
      suggestedActions = [
        { label: 'Report WiFi Issue', url: '/student/support', primary: false }
      ];

    } else if (lowerQuery.includes('canteen') || lowerQuery.includes('food') || lowerQuery.includes('lunch') || lowerQuery.includes('order')) {
      answer = `Today's canteen special is **Paneer Pizza** and **Veg Burgers**. You can pre-order food directly from the app and receive a notification when it's ready for pickup!`;
      suggestedActions = [
        { label: 'Order Canteen Food', url: '/student/services', primary: true }
      ];

    } else if (lowerQuery.includes('bus') || lowerQuery.includes('transport') || lowerQuery.includes('route')) {
      answer = `We have active bus tracking in the portal. Currently, Route 2B is experiencing a 12-minute delay due to traffic, but Route 1A and Route 3C are running on schedule.`;
      suggestedActions = [
        { label: 'Track Bus Routes', url: '/student/services', primary: true }
      ];

    } else {
      // Default general help
      answer = `Hello! I am your **Campus Pilot Copilot**, an AI-driven assistant.\n\nI have access to your academics, attendance rates, pending fees, canteen orders, library status, and ticket logs. \n\n**Try asking me things like:**\n- "What classes do I have today?"\n- "Which assignments are pending?"\n- "How can I improve attendance?"\n- "Do I have any outstanding fees?"\n- "Generate a study plan."\n- "Help me build my resume."\n- "Predict my academic risk."`;
    }

    return NextResponse.json({
      answer,
      suggestedActions
    });
  } catch (error: any) {
    console.error('Copilot API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
