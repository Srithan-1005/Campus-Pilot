'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './portal.module.css';

interface Student {
  id: string;
  fullName: string;
  studentCode: string;
  department: { name: string; code: string };
  courseId: string;
  currentSemester: number;
  cgpa: number;
}

interface Fee {
  id: string;
  feeType: string;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  status: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  resolutionNotes?: string;
}

interface Book {
  id: string;
  bookTitle: string;
  author: string;
  status: string;
  dueDate: string;
}

function StudentPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get('studentId');

  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [servicesSubTab, setServicesSubTab] = useState('canteen');

  // Core student data states
  const [student, setStudent] = useState<Student | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Canteen items & Shopping cart states
  const [menu, setMenu] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, { item: any; qty: number }>>({});
  const [canteenOrders, setCanteenOrders] = useState<any[]>([]);

  // Library catalog states
  const [catalog, setCatalog] = useState<any[]>([]);

  // Transport routes
  const [routes, setRoutes] = useState<any[]>([]);

  // Hostel blocks
  const [hostelBlocks, setHostelBlocks] = useState<any[]>([]);

  // AI Copilot state
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      sender: 'system',
      text: 'Hello! I am your Campus Pilot AI Copilot. Ask me anything about your timetable, outstanding fees, attendance rates, library books, or general campus WiFi access.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Forms states
  const [paymentModalFee, setPaymentModalFee] = useState<Fee | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr' | 'wallet'>('wallet');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketCategory, setTicketCategory] = useState('ACADEMIC');
  const [ticketPriority, setTicketPriority] = useState('LOW');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // ==========================================
  // NEW ADVANCED EXPERIENCE STATES
  // ==========================================
  
  // 1. Notifications Dropdown Toggler
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', title: 'Low Attendance Alert', text: 'Your attendance in Computer Networks is 68% (threshold is 75%).', read: false },
    { id: 2, type: 'danger', title: 'Fee Payment Pending', text: 'Tuition Fee balance of $4,000 is overdue by 10 days.', read: false },
    { id: 3, type: 'info', title: 'Upcoming Practical Exam', text: 'CS-303 Computer Networks Practical is scheduled for May 28, 2026.', read: false },
    { id: 4, type: 'success', title: 'Career Electives Suggested', text: 'Based on your high CGPA in Algorithms, we suggest Cloud Computing certification.', read: true },
  ]);

  // 2. Universal Search
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [voiceSearching, setVoiceSearching] = useState(false);

  // 3. Digital Wallet System
  const [walletBalance, setWalletBalance] = useState(250.00);
  const [walletTransactions, setWalletTransactions] = useState([
    { id: 'T1001', service: 'Cafeteria Pre-order', amount: -4.50, date: 'Today, 12:45 PM', status: 'SUCCESS' },
    { id: 'T1002', service: 'Library Overdue Waiver', amount: -2.00, date: 'Yesterday, 03:30 PM', status: 'SUCCESS' },
    { id: 'T1003', service: 'Event: TechFest Pass', amount: -15.00, date: 'May 16, 2026', status: 'SUCCESS' },
    { id: 'T1004', service: 'Refund: Library Double Charge', amount: 5.00, date: 'May 14, 2026', status: 'SUCCESS' },
    { id: 'T1005', service: 'Funds Top-up (NetBanking)', amount: 100.00, date: 'May 10, 2026', status: 'SUCCESS' }
  ]);
  const [walletTopUpAmount, setWalletTopUpAmount] = useState('');

  // 4. Personalized Study Planner
  const [selectedPlannerTab, setSelectedPlannerTab] = useState<'daily' | 'exam' | 'weak'>('daily');
  const [plannerSchedule, setPlannerSchedule] = useState({
    daily: [
      { time: '08:00 AM - 09:00 AM', task: 'Revise Database normalization forms & queries', priority: 'HIGH' },
      { time: '04:00 PM - 05:30 PM', task: 'Coding practice: Implement Dijkstra algorithm', priority: 'MEDIUM' },
      { time: '07:00 PM - 08:30 PM', task: 'Review Software Engineering design patterns', priority: 'LOW' }
    ],
    exam: [
      { day: 'Day 1 (May 20)', focus: 'Software Engineering - UML diagrams and Agile principles', hours: '4 Hours' },
      { day: 'Day 2 (May 21)', focus: 'Database Systems - Relational Algebra and SQL optimization', hours: '5 Hours' },
      { day: 'Day 3 (May 22)', focus: 'Computer Networks - OSI Model and TCP sliding windows', hours: '4.5 Hours' }
    ],
    weak: [
      { subject: 'Computer Networks', topic: 'IP Subnetting & Routing protocols', status: 'At Risk (68% Attendance)', tip: 'Watch recorded lectures on OSPF & BGP, resolve tutorial set 4' },
      { subject: 'Theory of Computation', topic: 'Pumping Lemma & Turing Machines', status: 'Average (76%)', tip: 'Attend Peer tutoring sessions this Wednesday at 4 PM in library room 3' }
    ]
  });

  // 5. LMS Integration
  const [lmsFiles] = useState([
    { name: 'CS-301 Syllabus & Objectives.pdf', size: '1.2 MB', category: 'CS-301' },
    { name: 'Unit 2: Relational Databases and SQL.pptx', size: '4.5 MB', category: 'CS-302' },
    { name: 'Lecture 12: Routing Algorithms Notes.pdf', size: '2.1 MB', category: 'CS-303' },
    { name: 'Practice Assignment 3 - Network Topology.docx', size: '850 KB', category: 'CS-303' }
  ]);
  
  const [assignments, setAssignments] = useState([
    { id: 'a1', title: 'Relational Database Schema Design', course: 'CS-302', status: 'PENDING', dueDate: 'May 25, 2026', plagiarismReport: null },
    { id: 'a2', title: 'Dijkstras Routing Simulation Code', course: 'CS-303', status: 'SUBMITTED', dueDate: 'May 15, 2026', plagiarismReport: '8% Plagiarism (Original)' },
    { id: 'a3', title: 'Agile Project Development Plan', course: 'CS-301', status: 'GRADED', dueDate: 'May 10, 2026', plagiarismReport: '12% Plagiarism (Original)' }
  ]);

  const [assignmentUploadFile, setAssignmentUploadFile] = useState<string>('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('a1');
  const [plagiarismChecking, setPlagiarismChecking] = useState(false);

  // LMS MCQ Online Exam System
  const [examActive, setExamActive] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [examQuestions] = useState([
    { q: 'Which layer of the OSI model is responsible for routing packets across networks?', a: ['Physical Layer', 'Data Link Layer', 'Network Layer', 'Transport Layer'], correct: 2 },
    { q: 'What is the primary objective of Database Normalization?', a: ['To increase redundancy', 'To eliminate anomalies and reduce redundancy', 'To increase query execution time', 'To merge different databases'], correct: 1 },
    { q: 'In Agile development methodology, what is a Sprint?', a: ['A running race', 'A design tool', 'A fixed, short iteration of development work', 'A stakeholder feedback report'], correct: 2 }
  ]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [examTimer, setExamTimer] = useState(60); // 60 seconds
  const [proctorLogs, setProctorLogs] = useState<string[]>([]);
  const [examScore, setExamScore] = useState<number | null>(null);

  // 6. Placement & Career Hub
  const [skills, setSkills] = useState(['React', 'NodeJS', 'SQL', 'Algorithms', 'TypeScript']);
  const [newSkill, setNewSkill] = useState('');
  const [projects, setProjects] = useState([
    { name: 'Campus Pilot Super App', description: 'Institutional system combining AI copilot, digital ID, and canteen pre-orders.', tech: 'Next.js, Prisma, SQLite' },
    { name: 'Realtime Bus Tracking API', description: 'IoT transit logger using web-sockets and geolocation updates.', tech: 'Node.js, Socket.io, Redis' }
  ]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');
  const [showResumeModal, setShowResumeModal] = useState(false);

  // 7. Services extensions: IoT Classroom and Smart Parking
  const [classroomIoT, setClassroomIoT] = useState({
    occupancy: '42%',
    projector: 'ACTIVE (ON)',
    acTemp: '22°C (Optimal)',
    energyUsage: '1.8 kWh',
    smartScheduling: 'Auto-Booked for CSE Sem-6 lecture'
  });
  const [parkingSlots, setParkingSlots] = useState([
    { id: 'P-01', reserved: true, studentCode: 'STU005' },
    { id: 'P-02', reserved: false, studentCode: null },
    { id: 'P-03', reserved: true, studentCode: 'STU003' },
    { id: 'P-04', reserved: false, studentCode: null },
    { id: 'P-05', reserved: false, studentCode: null },
    { id: 'P-06', reserved: true, studentCode: 'STU001' },
    { id: 'P-07', reserved: false, studentCode: null },
    { id: 'P-08', reserved: false, studentCode: null },
  ]);

  // 8. Gamification system
  const [xpPoints, setXpPoints] = useState(1250);
  const [badges, setBadges] = useState([
    { name: 'Perfect Attender', desc: 'Maintain overall attendance above 85% for two weeks', unlocked: true, icon: '📅' },
    { name: 'Library Scholar', desc: 'Successfully return 5 library books on time', unlocked: true, icon: '📚' },
    { name: 'Campus Helper', desc: 'Resolve a peer query or host a study group', unlocked: false, icon: '🤝' },
    { name: 'Finance Savvy', desc: 'Pay all semester dues on time', unlocked: false, icon: '💰' }
  ]);
  const [leaderboard] = useState([
    { rank: 1, name: 'Emma Watson (ECE)', points: '1,540 XP' },
    { rank: 2, name: 'Alex Carter (CSE)', points: '1,250 XP (You)' },
    { rank: 3, name: 'Sophia Loren (CSE)', points: '1,190 XP' },
    { rank: 4, name: 'Liam Neeson (ME)', points: '980 XP' }
  ]);

  // 9. Social feed & Marketplace
  const [feedPosts, setFeedPosts] = useState([
    { id: 1, author: 'Sophia Loren', avatar: '👩‍🎓', text: 'Successfully built Dijkstra’s routing algorithm visualization for my computer networks lab! Check it out in the CSE common room.', likes: 14, liked: false, comments: 3, date: '2 hrs ago' },
    { id: 2, author: 'Alex Carter', avatar: '👨‍🎓', text: 'Really enjoying the new Campus Pilot Digital Wallet. Pre-ordered my Veg Burger and skipped the line at the smart canteen completely! 🍔⚡', likes: 25, liked: true, comments: 5, date: '4 hrs ago' }
  ]);
  const [newPostText, setNewPostText] = useState('');

  const [marketplaceItems, setMarketplaceItems] = useState([
    { id: 'm1', name: 'Database System Concepts (Silberschatz)', seller: 'Emma Watson', price: 20, cond: 'Like New', desc: 'Perfect condition, no writings inside. HOD recommended.' },
    { id: 'm2', name: 'Intro to Algorithms (CLRS)', seller: 'Liam Neeson', price: 35, cond: 'Gently Used', desc: 'Slight cover wear but all pages intact. Great reference.' }
  ]);
  const [newMarketItemName, setNewMarketItemName] = useState('');
  const [newMarketItemPrice, setNewMarketItemPrice] = useState('');
  const [newMarketItemDesc, setNewMarketItemDesc] = useState('');

  // 10. QR code scanner mode switcher
  const [qrMode, setQrMode] = useState<'attendance' | 'library' | 'canteen' | 'hostel'>('attendance');
  const [scanSimulatorMsg, setScanSimulatorMsg] = useState('');

  // ==========================================
  // FETCH CORE DATA
  // ==========================================
  const fetchData = async () => {
    try {
      setLoading(true);
      const idQuery = studentIdParam ? `?studentId=${studentIdParam}` : '';
      
      const resDash = await fetch(`/api/v1/student-dashboard/overview${idQuery}`);
      const dataDash = await resDash.json();
      
      if (!resDash.ok) throw new Error(dataDash.error || 'Failed to fetch dashboard');

      setStudent(dataDash.student);
      setDashboardData(dataDash);

      const resolvedStudentId = dataDash.student.id;

      const resFees = await fetch(`/api/v1/fees?studentId=${resolvedStudentId}`);
      const dataFees = await resFees.json();
      if (resFees.ok) setFees(dataFees.fees);

      const resTickets = await fetch(`/api/v1/tickets?studentId=${resolvedStudentId}`);
      const dataTickets = await resTickets.json();
      if (resTickets.ok) setTickets(dataTickets.tickets);

      const resBooks = await fetch(`/api/v1/services?type=library&studentId=${resolvedStudentId}`);
      const dataBooks = await resBooks.json();
      if (resBooks.ok) setBooks(dataBooks.books);

      const resMenu = await fetch('/api/v1/services?type=canteen');
      const dataMenu = await resMenu.json();
      if (resMenu.ok) setMenu(dataMenu.menu);

      const resCantOrders = await fetch(`/api/v1/services?type=canteen&studentId=${resolvedStudentId}`);
      const dataCantOrders = await resCantOrders.json();
      if (resCantOrders.ok) setCanteenOrders(dataCantOrders.orders);

      const resCat = await fetch('/api/v1/services?type=library');
      const dataCat = await resCat.json();
      if (resCat.ok) setCatalog(dataCat.catalog);

      const resRoutes = await fetch('/api/v1/services?type=transport');
      const dataRoutes = await resRoutes.json();
      if (resRoutes.ok) setRoutes(dataRoutes.routes);

      const resHostel = await fetch('/api/v1/services?type=hostel');
      const dataHostel = await resHostel.json();
      if (resHostel.ok) setHostelBlocks(dataHostel.rooms);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentIdParam]);

  const handleLogout = () => {
    router.push('/');
  };

  // Exam Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (examActive && examTimer > 0) {
      interval = setInterval(() => {
        setExamTimer(prev => {
          if (prev <= 1) {
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examActive, examTimer]);

  // Proctoring tab focus-lost simulator
  useEffect(() => {
    const handleBlur = () => {
      if (examActive && !examFinished) {
        const timestamp = new Date().toLocaleTimeString();
        setProctorLogs(prev => [...prev, `[${timestamp}] ⚠️ WARNING: Tab focus lost! Proctoring software flagged window change.`]);
        setXpPoints(prev => Math.max(0, prev - 20)); // deduct XP points for cheating indicators
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [examActive, examFinished]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // ==========================================
  // HANDLERS AND HELPERS
  // ==========================================
  
  // Wallet Operations
  const handleTopUpWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(walletTopUpAmount);
    if (isNaN(amount) || amount <= 0) return;
    setWalletBalance(prev => prev + amount);
    setWalletTransactions([
      { id: `T${Date.now().toString().slice(-4)}`, service: 'Wallet Top-up (Sandbox)', amount: amount, date: 'Just now', status: 'SUCCESS' },
      ...walletTransactions
    ]);
    setWalletTopUpAmount('');
  };

  // Plagiarism checker simulator
  const handlePlagiarismCheck = () => {
    if (!assignmentUploadFile.trim()) return;
    setPlagiarismChecking(true);
    setTimeout(() => {
      setPlagiarismChecking(false);
      const randomPct = Math.round(5 + Math.random() * 20); // 5% to 25%
      const statusText = `${randomPct}% Plagiarism Detected (${randomPct < 15 ? 'Original' : 'Slight Match'})`;
      
      setAssignments(prev => prev.map(a => {
        if (a.id === selectedAssignmentId) {
          return { ...a, status: 'SUBMITTED', plagiarismReport: statusText };
        }
        return a;
      }));
      setAssignmentUploadFile('');
      setXpPoints(prev => prev + 50); // XP points rewarded
      alert(`Assignment submitted successfully. Plagiarism Scan complete: ${statusText}`);
    }, 2500);
  };

  // Online MCQ Test Execution
  const handleStartExam = () => {
    setExamActive(true);
    setExamFinished(false);
    setSelectedAnswers({});
    setExamTimer(30);
    setProctorLogs([`[${new Date().toLocaleTimeString()}] Proctoring started. Camera & Focus tracking active.`]);
  };

  const handleFinishExam = () => {
    setExamActive(false);
    setExamFinished(true);
    let correctCount = 0;
    examQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount += 1;
      }
    });
    setExamScore(correctCount);
    setXpPoints(prev => prev + (correctCount * 30)); // award points
  };

  // Skills & Projects
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim() || skills.includes(newSkill)) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
    setXpPoints(prev => prev + 15);
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setProjects([...projects, {
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      tech: newProjectTech.trim()
    }]);
    setNewProjectName('');
    setNewProjectDesc('');
    setNewProjectTech('');
    setXpPoints(prev => prev + 100);
  };

  // Parking simulation
  const handleReserveParking = (id: string) => {
    setParkingSlots(prev => prev.map(slot => {
      if (slot.id === id) {
        if (slot.reserved && slot.studentCode === 'STU001') {
          return { ...slot, reserved: false, studentCode: null };
        } else if (!slot.reserved) {
          return { ...slot, reserved: true, studentCode: 'STU001' };
        }
      }
      return slot;
    }));
  };

  // Social & Marketplace Handlers
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setFeedPosts([
      {
        id: Date.now(),
        author: student?.fullName || 'Alex Carter',
        avatar: '👨‍🎓',
        text: newPostText,
        likes: 0,
        liked: false,
        comments: 0,
        date: 'Just now'
      },
      ...feedPosts
    ]);
    setNewPostText('');
    setXpPoints(prev => prev + 25);
  };

  const handleLikePost = (postId: number) => {
    setFeedPosts(feedPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleCreateMarketItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarketItemName.trim() || !newMarketItemPrice) return;
    setMarketplaceItems([
      {
        id: `m${Date.now()}`,
        name: newMarketItemName,
        price: parseFloat(newMarketItemPrice),
        seller: student?.fullName || 'Alex Carter',
        cond: 'Good Condition',
        desc: newMarketItemDesc
      },
      ...marketplaceItems
    ]);
    setNewMarketItemName('');
    setNewMarketItemPrice('');
    setNewMarketItemDesc('');
    alert('Listing created on Campus Marketplace!');
  };

  // QR IoT Gate Simulator Scan Check-in
  const simulateQRScannerCheckIn = () => {
    setScanSimulatorMsg('Transmitting IoT authentication packet to campus servers...');
    setTimeout(() => {
      if (qrMode === 'attendance') {
        setScanSimulatorMsg('✅ SUCCESS: Attendance marked for CS-303 (Computer Networks).');
        setXpPoints(prev => prev + 15);
      } else if (qrMode === 'library') {
        setScanSimulatorMsg('✅ SUCCESS: Book catalog session initialized. Return window logged.');
      } else if (qrMode === 'canteen') {
        setScanSimulatorMsg('✅ SUCCESS: Canteen Order #1982 token scanned. Ready for pickup.');
      } else if (qrMode === 'hostel') {
        setScanSimulatorMsg('✅ SUCCESS: Block-B biometric check-in log written. Gate open.');
      }
    }, 1500);
  };

  // Search matches
  const getSearchMatches = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matches: any[] = [];
    
    // Search exams
    if (q.includes('exam') || q.includes('test') || q.includes('date') || q.includes('schedule')) {
      matches.push({ type: 'Academic Timetable', title: 'CS-303 Practical Exam', detail: 'Scheduled on May 28, 2026', link: 'academics' });
      matches.push({ type: 'Academic Timetable', title: 'CS-301 Theory Exam', detail: 'Scheduled on June 5, 2026', link: 'academics' });
    }
    // Search books
    if (q.includes('book') || q.includes('intro') || q.includes('network') || q.includes('algorithm') || q.includes('database') || q.includes('clrs')) {
      matches.push({ type: 'Library Catalog', title: 'Introduction to Algorithms (CLRS)', detail: '5 copies available in Central Library', link: 'services' });
      matches.push({ type: 'Library Catalog', title: 'Computer Networking (Kurose)', detail: '2 copies available', link: 'services' });
    }
    // Search notices
    if (q.includes('notice') || q.includes('pulse') || q.includes('techfest') || q.includes('admit')) {
      matches.push({ type: 'Campus Notice', title: 'TechFest 2026 Registration Open', detail: 'Proposal deadline May 25th', link: 'dashboard' });
      matches.push({ type: 'Campus Notice', title: 'Admit Card Generated', detail: 'Ready to print for final exams', link: 'academics' });
    }
    // Search courses
    if (q.includes('course') || q.includes('class') || q.includes('gpa') || q.includes('result')) {
      matches.push({ type: 'Academic Grade', title: 'Current CGPA: 8.4', detail: 'Verified by Dean', link: 'academics' });
      matches.push({ type: 'Course Materials', title: 'CS-303: OSI Layer OSI Lecture Notes', detail: 'Downloadable in LMS', link: 'lms' });
    }

    if (matches.length === 0) {
      matches.push({ type: 'General', title: `Search for "${searchQuery}"`, detail: 'No matches found. Try "exams", "books" or "wallet"', link: 'dashboard' });
    }
    return matches;
  };

  const handleVoiceSearch = () => {
    setVoiceSearching(true);
    const voiceKeywords = ['upcoming exams', 'library overdue books', 'canteen menu specials', 'wallet balance check'];
    const selectedKeyword = voiceKeywords[Math.floor(Math.random() * voiceKeywords.length)];
    setTimeout(() => {
      setSearchQuery(selectedKeyword);
      setVoiceSearching(false);
      setShowSearchPopup(true);
    }, 1800);
  };

  // Canteen Cart operations
  const addToCart = (item: any) => {
    setCart((prev) => {
      const current = prev[item.id] || { item, qty: 0 };
      return { ...prev, [item.id]: { item, qty: current.qty + 1 } };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[itemId].qty <= 1) {
        delete copy[itemId];
      } else {
        copy[itemId].qty -= 1;
      }
      return copy;
    });
  };

  const placeCanteenOrder = async () => {
    if (!student) return;
    const items = Object.values(cart).map(c => ({
      name: c.item.name,
      qty: c.qty,
      price: c.item.price
    }));
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Pay with Wallet directly
    if (walletBalance < total) {
      alert('Canteen Order exceeds wallet balance. Please top up funds!');
      return;
    }

    try {
      const res = await fetch(`/api/v1/services?type=canteen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, items, total }),
      });
      if (res.ok) {
        setWalletBalance(prev => prev - total);
        setWalletTransactions([
          { id: `T${Date.now().toString().slice(-4)}`, service: 'Canteen Food Pre-Order', amount: -total, date: 'Just now', status: 'SUCCESS' },
          ...walletTransactions
        ]);
        setCart({});
        // Reload canteen orders
        const resOrders = await fetch(`/api/v1/services?type=canteen&studentId=${student.id}`);
        const dataOrders = await resOrders.json();
        if (resOrders.ok) setCanteenOrders(dataOrders.orders);
        setXpPoints(prev => prev + 15);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Library Book Request
  const requestBook = async (book: any) => {
    if (!student) return;
    try {
      const res = await fetch(`/api/v1/services?type=library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          bookTitle: book.title,
          author: book.author
        }),
      });
      if (res.ok) {
        // Reload books
        const resBooks = await fetch(`/api/v1/services?type=library&studentId=${student.id}`);
        const dataBooks = await resBooks.json();
        if (resBooks.ok) setBooks(dataBooks.books);
        alert(`Requested "${book.title}". Pick it up from library reserve stack in 24 hours.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Support Ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !ticketTitle || !ticketDesc) return;

    try {
      const res = await fetch('/api/v1/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          title: ticketTitle,
          description: ticketDesc,
          category: ticketCategory,
          priority: ticketPriority
        })
      });

      if (res.ok) {
        setTicketTitle('');
        setTicketDesc('');
        setTicketSuccess(true);
        // Reload tickets
        const resTickets = await fetch(`/api/v1/tickets?studentId=${student.id}`);
        const dataTickets = await resTickets.json();
        if (resTickets.ok) setTickets(dataTickets.tickets);
        
        setTimeout(() => setTicketSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI Copilot Execution
  const sendCopilotMessage = async (customQuery?: string) => {
    const queryToSend = customQuery || chatInput;
    if (!queryToSend.trim() || !student) return;

    // Add user message
    setChatMessages(prev => [...prev, { sender: 'user', text: queryToSend }]);
    if (!customQuery) setChatInput('');

    try {
      const res = await fetch('/api/v1/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToSend,
          studentId: student.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        let answer = data.answer;
        
        // Handle specialized prompt extensions client-side for enhanced intelligence demonstration
        const lowerQ = queryToSend.toLowerCase();
        if (lowerQ.includes('study schedule') || lowerQ.includes('study planner') || lowerQ.includes('plan')) {
          answer = `Here is your dynamic study schedule customized for your CSE Semester-6 curriculum:

**08:00 AM - 10:00 AM**: Software Engineering (Focus: Agile & Sprint planning models)
**04:00 PM - 05:30 PM**: Data Structures & Coding practice (Focus: Graph traversal, Dijkstra & Bellman-Ford)
**07:00 PM - 08:30 PM**: Computer Networks (Focus: IP Subnetting review)

*Tip: Maintaining this for 5 days will unlock the 'Campus Helper' badge.*`;
        } else if (lowerQ.includes('resume') || lowerQ.includes('career')) {
          answer = `I have compiled your Campus Placement Readiness scorecard:
- **CGPA**: ${student.cgpa} / 10.0 (High eligibility)
- **Verified Skills**: ${skills.join(', ')}
- **Completed Projects**: ${projects.length}

**Resume Outline generated!**
Would you like to open the Career builder modal to copy the fully formatted markdown code?`;
        }

        setChatMessages(prev => [...prev, {
          sender: 'system',
          text: answer,
          suggestedActions: data.suggestedActions || [
            { label: 'View Study Planner', url: '/student/academics', primary: true }
          ]
        }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fee payments sandbox confirmation
  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalFee || !student) return;

    setProcessingPayment(true);
    const amountToPay = paymentModalFee.amountDue - paymentModalFee.amountPaid;

    if (paymentMethod === 'wallet' && walletBalance < amountToPay) {
      alert('Insufficient Digital Wallet balance! Please select Card/QR checkout or top up.');
      setProcessingPayment(false);
      return;
    }

    setTimeout(async () => {
      try {
        const res = await fetch('/api/v1/fees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feeId: paymentModalFee.id,
            amountPaid: amountToPay
          })
        });

        if (res.ok) {
          if (paymentMethod === 'wallet') {
            setWalletBalance(prev => prev - amountToPay);
            setWalletTransactions([
              { id: `T${Date.now().toString().slice(-4)}`, service: `Tuition Dues: ${paymentModalFee.feeType}`, amount: -amountToPay, date: 'Just now', status: 'SUCCESS' },
              ...walletTransactions
            ]);
          }

          setPaymentSuccessMessage(`Payment of $${amountToPay.toLocaleString()} completed successfully via ${paymentMethod === 'wallet' ? 'Student Digital Wallet' : paymentMethod === 'card' ? 'Credit Card' : 'QR Scan reconciliation'}!`);
          
          fetchData();
          
          setTimeout(() => {
            setPaymentModalFee(null);
            setPaymentSuccessMessage('');
            setCardNumber('');
            setCardExpiry('');
            setCardCvv('');
          }, 3000);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setProcessingPayment(false);
      }
    }, 2000);
  };

  if (loading || !student) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Campus Pilot Student Portal...</p>
      </div>
    );
  }

  const outstandingFeesTotal = fees.reduce((sum, f) => f.status !== 'PAID' ? sum + (f.amountDue - f.amountPaid) : sum, 0);
  const searchMatches = getSearchMatches();

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandLogo}>🧭</div>
          <span className={styles.brandText}>Campus Pilot</span>
        </div>

        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>
            {student.fullName.charAt(0)}
          </div>
          <div className={styles.userData}>
            <span className={styles.userName}>{student.fullName}</span>
            <span className={styles.userRole}>{student.studentCode} ({student.courseId})</span>
          </div>
        </div>

        <nav className={styles.sidebarMenu}>
          <div onClick={() => setActiveTab('dashboard')} className={`${styles.menuItem} ${activeTab === 'dashboard' ? styles.menuItemActive : ''}`}>
            📊 Dashboard
          </div>
          <div onClick={() => setActiveTab('academics')} className={`${styles.menuItem} ${activeTab === 'academics' ? styles.menuItemActive : ''}`}>
            📚 Academics & Planner
          </div>
          <div onClick={() => setActiveTab('lms')} className={`${styles.menuItem} ${activeTab === 'lms' ? styles.menuItemActive : ''}`}>
            💻 LMS & Exams
          </div>
          <div onClick={() => setActiveTab('finance')} className={`${styles.menuItem} ${activeTab === 'finance' ? styles.menuItemActive : ''}`}>
            💳 Wallet & Fees
          </div>
          <div onClick={() => setActiveTab('placement')} className={`${styles.menuItem} ${activeTab === 'placement' ? styles.menuItemActive : ''}`}>
            🚀 Placement Hub
          </div>
          <div onClick={() => setActiveTab('services')} className={`${styles.menuItem} ${activeTab === 'services' ? styles.menuItemActive : ''}`}>
            🏛️ Campus Services
          </div>
          <div onClick={() => setActiveTab('support')} className={`${styles.menuItem} ${activeTab === 'support' ? styles.menuItemActive : ''}`}>
            🎫 Help & Support
          </div>
          <div onClick={() => setActiveTab('copilot')} className={`${styles.menuItem} ${activeTab === 'copilot' ? styles.menuItemActive : ''}`}>
            🤖 AI Copilot
          </div>
          <div onClick={() => setActiveTab('id')} className={`${styles.menuItem} ${activeTab === 'id' ? styles.menuItemActive : ''}`}>
            🪪 Digital IoT ID
          </div>
          <div onClick={() => setActiveTab('gamification')} className={`${styles.menuItem} ${activeTab === 'gamification' ? styles.menuItemActive : ''}`}>
            🏆 Leaderboard & XP
          </div>
          <div onClick={() => setActiveTab('social')} className={`${styles.menuItem} ${activeTab === 'social' ? styles.menuItemActive : ''}`}>
            📣 Campus Life
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-glass)', marginBottom: '8px' }}>
            🏆 <strong>{xpPoints} XP</strong> Accumulation
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
            🚪 Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTitle} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Portal</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Universal Campus Search... (e.g. exams)"
                style={{ padding: '6px 12px 6px 32px', fontSize: '0.8rem', width: '260px' }}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchPopup(e.target.value.length > 0);
                }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '10px', fontSize: '0.8rem' }}>🔍</span>
              <button
                onClick={handleVoiceSearch}
                style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1rem', padding: '2px' }}
                title="Voice Query"
              >
                {voiceSearching ? '🎙️...' : '🎤'}
              </button>

              {/* Universal Search Popup */}
              {showSearchPopup && (
                <div className="glass-panel" style={{ position: 'absolute', top: '38px', left: 0, width: '320px', maxHeight: '300px', overflowY: 'auto', zIndex: 200, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Search Index Matches</span>
                    <span style={{ cursor: 'pointer' }} onClick={() => setShowSearchPopup(false)}>✖</span>
                  </div>
                  {searchMatches.map((match, mi) => (
                    <div
                      key={mi}
                      onClick={() => {
                        setActiveTab(match.link);
                        setShowSearchPopup(false);
                        setSearchQuery('');
                      }}
                      style={{ cursor: 'pointer', padding: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)' }}
                    >
                      <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '2px 4px', marginBottom: '2px' }}>{match.type}</span>
                      <strong style={{ display: 'block', fontSize: '0.8rem' }}>{match.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{match.detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.headerActions}>
            {/* Wallet quick indicator */}
            <div
              onClick={() => setActiveTab('finance')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '0.9rem' }}>💳 Wallet:</span>
              <strong style={{ color: 'var(--accent-success)' }}>${walletBalance.toFixed(2)}</strong>
            </div>

            {/* Smart Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', position: 'relative' }}
              >
                🔔 {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: 'var(--accent-danger)', borderRadius: '50%' }}></span>
                )}
              </button>

              {showNotifications && (
                <div className="glass-panel" style={{ position: 'absolute', right: 0, top: '42px', width: '340px', zIndex: 200, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                    <strong style={{ fontSize: '0.85rem' }}>Campus Smart Notifications</strong>
                    <span
                      style={{ cursor: 'pointer', fontSize: '0.75rem', color: 'var(--accent-primary)' }}
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                    >
                      Clear all
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ padding: '10px', borderRadius: '6px', background: n.read ? 'transparent' : 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${n.type === 'warning' ? 'var(--accent-warning)' : n.type === 'danger' ? 'var(--accent-danger)' : 'var(--accent-info)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600' }}>
                          <span>{n.title}</span>
                          {!n.read && <span style={{ color: 'var(--accent-primary)', fontSize: '0.65rem' }}>NEW</span>}
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.studentMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>GPA:</span>
                <span className={styles.metaValue}>{student.cgpa}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Sem:</span>
                <span className={styles.metaValue}>{student.currentSemester}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Dept:</span>
                <span className={styles.metaValue}>{student.department.code}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && dashboardData && (
            <div className={`${styles.overviewGrid} animate-fade-in`}>
              <div className={styles.widgetsCol}>
                <div className={styles.kpiGrid}>
                  <div className={`${styles.kpiCard} glass-panel`}>
                    <div className={styles.kpiInfo}>
                      <span className={styles.kpiLabel}>Attendance</span>
                      <span className={styles.kpiValue} style={{ color: dashboardData.attendanceSummary.overallPercentage < 75 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                        {dashboardData.attendanceSummary.overallPercentage}%
                      </span>
                    </div>
                    <span className={styles.kpiIcon}>📈</span>
                  </div>

                  <div className={`${styles.kpiCard} glass-panel`}>
                    <div className={styles.kpiInfo}>
                      <span className={styles.kpiLabel}>Outstanding Fees</span>
                      <span className={styles.kpiValue} style={{ color: outstandingFeesTotal > 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
                        ${outstandingFeesTotal.toLocaleString()}
                      </span>
                    </div>
                    <span className={styles.kpiIcon}>💳</span>
                  </div>

                  <div className={`${styles.kpiCard} glass-panel`}>
                    <div className={styles.kpiInfo}>
                      <span className={styles.kpiLabel}>Active Tickets</span>
                      <span className={styles.kpiValue}>{dashboardData.openTicketsCount}</span>
                    </div>
                    <span className={styles.kpiIcon}>🎫</span>
                  </div>
                </div>

                {/* Timetable Widget */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>📅 Today's Schedule</h3>
                  </div>
                  <div>
                    {dashboardData.todayTimetable.map((t: any) => (
                      <div key={t.id} className={styles.classItem}>
                        <div className={styles.classTime}>{t.time}</div>
                        <div className={styles.classDetails}>
                          <div className={styles.className}>{t.subject}</div>
                          <div className={styles.classRoom}>{t.room}</div>
                          <div className={styles.classFaculty}>{t.faculty}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ask Copilot Quick widget */}
                <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                  <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>🤖 Ask Campus Copilot AI</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>Ask about your study schedule, placement probability, or how to improve attendance rates.</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Generate study schedule"
                      style={{ flexGrow: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const targetValue = (e.target as HTMLInputElement).value;
                          if (targetValue) {
                            setActiveTab('copilot');
                            sendCopilotMessage(targetValue);
                          }
                        }
                      }}
                    />
                    <button className="btn btn-primary" onClick={() => setActiveTab('copilot')}>Ask AI</button>
                  </div>
                </div>
              </div>

              <div className={styles.sideCol}>
                {dashboardData.actionRequired.length > 0 && (
                  <div className={`${styles.actionsPanel} glass-panel`}>
                    <h4 style={{ marginBottom: '12px', color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>🚨 Action Items</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {dashboardData.actionRequired.map((act: any) => (
                        <div key={act.id} className={styles.actionRequiredItem}>
                          <div className={styles.actionInfo}>
                            <span className={styles.actionTitle}>{act.title}</span>
                            <span className={styles.actionDesc}>{act.description}</span>
                          </div>
                          <button onClick={() => setActiveTab(act.actionUrl.includes('finance') ? 'finance' : act.actionUrl.includes('academics') ? 'academics' : 'services')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                            Go
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campus Pulse */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>📢 Campus Pulse</h3>
                  <div className={styles.announcementsList}>
                    {dashboardData.announcements.map((ann: any) => (
                      <div key={ann.id} className={styles.noticeItem}>
                        <div className={styles.noticeHeader}>
                          <span>{ann.author}</span>
                          <span>{ann.date}</span>
                        </div>
                        <h4 className={styles.noticeTitle}>{ann.title}</h4>
                        <p className={styles.noticeBody}>{ann.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMICS & PLANNER */}
          {activeTab === 'academics' && dashboardData && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: '20px' }}>📊 Attendance Tracker</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {dashboardData.attendanceSummary.subjectWise.map((sub: any) => (
                      <div key={sub.subjectId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-glass)' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{sub.name}</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub.present} / {sub.total} classes present</p>
                        </div>
                        <span className={`badge ${sub.percentage < 75 ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.8rem' }}>
                          {sub.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Planner System */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: '12px' }}>📅 AI Personalized Study Planner</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Generate optimized study routines based on your upcoming exams and weak areas.</p>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <button onClick={() => setSelectedPlannerTab('daily')} className={selectedPlannerTab === 'daily' ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Daily Schedule</button>
                    <button onClick={() => setSelectedPlannerTab('exam')} className={selectedPlannerTab === 'exam' ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Exam Prep Plan</button>
                    <button onClick={() => setSelectedPlannerTab('weak')} className={selectedPlannerTab === 'weak' ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Weak-Subject Focus</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedPlannerTab === 'daily' && plannerSchedule.daily.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-info)' }}>{item.time}</span>
                          <p style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '2px' }}>{item.task}</p>
                        </div>
                        <span className="badge badge-warning" style={{ alignSelf: 'center', fontSize: '0.65rem' }}>{item.priority}</span>
                      </div>
                    ))}

                    {selectedPlannerTab === 'exam' && plannerSchedule.exam.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{item.day}</span>
                          <p style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '2px' }}>{item.focus}</p>
                        </div>
                        <span className="badge badge-success" style={{ alignSelf: 'center', fontSize: '0.65rem' }}>{item.hours}</span>
                      </div>
                    ))}

                    {selectedPlannerTab === 'weak' && plannerSchedule.weak.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ fontSize: '0.85rem' }}>{item.subject}</strong>
                          <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>{item.status}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Topic: {item.topic}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--accent-info)', fontStyle: 'italic' }}>💡 {item.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exam admit cards */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>📝 Exams & Academic Status</h3>
                <table className={styles.feesTable}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Type</th>
                      <th>Scheduled Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>CS-301: Software Engineering</td>
                      <td>End Semester Theory</td>
                      <td>June 5, 2026</td>
                      <td><span className="badge badge-success">Admit Card Generated</span></td>
                    </tr>
                    <tr>
                      <td>CS-302: Database Systems</td>
                      <td>End Semester Theory</td>
                      <td>June 8, 2026</td>
                      <td><span className="badge badge-success">Admit Card Generated</span></td>
                    </tr>
                    <tr>
                      <td>CS-303: Computer Networks</td>
                      <td>End Semester Practical</td>
                      <td>May 28, 2026</td>
                      <td><span className="badge badge-warning">Admit Card Pending (Clear Fees)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LMS & EXAMS */}
          {activeTab === 'lms' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
                
                {/* Course Materials */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>📚 Course Materials</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {lmsFiles.map((file, idx) => (
                      <div key={idx} className="glass-panel" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                        <div>
                          <strong style={{ fontSize: '0.8rem', display: 'block' }}>{file.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Class: {file.category} | Size: {file.size}</span>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => alert(`Downloading file: ${file.name}`)}>
                          📥 Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assignment Upload */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: '12px' }}>📤 Assignment Submission Portal</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Upload coursework and receive immediate AI plagiarism scans before final submission.</p>
                  
                  <div className="form-group">
                    <label className="form-label">Select Assignment Task</label>
                    <select className="form-input" value={selectedAssignmentId} onChange={(e) => setSelectedAssignmentId(e.target.value)}>
                      {assignments.map(a => (
                        <option key={a.id} value={a.id}>{a.course} - {a.title} ({a.status})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Provide Submission Text / Code Block</label>
                    <textarea
                      className="form-input"
                      rows={4}
                      placeholder="Paste your source code or assignment text here for AI scanning..."
                      value={assignmentUploadFile}
                      onChange={(e) => setAssignmentUploadFile(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handlePlagiarismCheck}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={plagiarismChecking || !assignmentUploadFile.trim()}
                  >
                    {plagiarismChecking ? 'Analyzing for Plagiarism & Grammar...' : 'Analyze & Submit Assignment'}
                  </button>

                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '0.85rem', marginBottom: '10px' }}>Your Submission History</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {assignments.map(a => (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                          <span>{a.title}</span>
                          <span className={`badge ${a.status === 'GRADED' ? 'badge-success' : a.status === 'SUBMITTED' ? 'badge-info' : 'badge-danger'}`}>
                            {a.plagiarismReport || a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Online MCQ Exam System */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '8px' }}>💻 Proctored Online Examination System</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Take examinations securely. Anti-cheat focuses on window changes and records browser focus logs.</p>

                {!examActive && !examFinished && (
                  <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: '6px' }}>
                    <strong>CS-303 Practical Exam Simulation</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0 16px' }}>Includes 3 questions. Duration: 30 seconds. Tab focus loss is recorded.</p>
                    <button onClick={handleStartExam} className="btn btn-primary">Start Examination</button>
                  </div>
                )}

                {examActive && (
                  <div style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                      <span style={{ color: 'var(--accent-danger)', fontWeight: '700' }}>⏱️ Time Remaining: {examTimer}s</span>
                      <span style={{ color: 'var(--accent-success)' }}>● SECURE PROCTOR LOG ACTIVE</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {examQuestions.map((eq, qIdx) => (
                        <div key={qIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <strong>Q{qIdx + 1}: {eq.q}</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {eq.a.map((opt, oIdx) => (
                              <label key={oIdx} className="glass-panel" style={{ display: 'flex', gap: '8px', padding: '10px', fontSize: '0.8rem', cursor: 'pointer', background: selectedAnswers[qIdx] === oIdx ? 'rgba(99, 102, 241, 0.1)' : 'transparent', borderColor: selectedAnswers[qIdx] === oIdx ? 'var(--accent-primary)' : 'var(--border-glass)' }}>
                                <input
                                  type="radio"
                                  name={`question-${qIdx}`}
                                  checked={selectedAnswers[qIdx] === oIdx}
                                  onChange={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })}
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
                      <button onClick={handleFinishExam} className="btn btn-primary">Submit Test</button>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', alignSelf: 'center' }}>Proctor Flags: {proctorLogs.length}</span>
                    </div>

                    {proctorLogs.length > 0 && (
                      <div style={{ marginTop: '16px', padding: '10px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '4px', fontSize: '0.75rem' }}>
                        <strong style={{ color: 'var(--accent-danger)' }}>Anti-Cheat Proctoring Logs:</strong>
                        {proctorLogs.map((log, li) => <p key={li} style={{ marginTop: '2px' }}>{log}</p>)}
                      </div>
                    )}
                  </div>
                )}

                {examFinished && (
                  <div style={{ padding: '20px', textAlign: 'center', border: '1px solid var(--accent-success)', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.02)' }}>
                    <span style={{ fontSize: '2.5rem' }}>📊</span>
                    <h4 style={{ marginTop: '10px' }}>Examination Completed!</h4>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-success)', margin: '8px 0' }}>
                      {examScore} / {examQuestions.length} Correct
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your score is auto-evaluated and registered to the Admin ledger.</p>
                    {proctorLogs.length > 0 ? (
                      <p style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', marginTop: '8px' }}>⚠️ Note: Focus violations were flagged during the session.</p>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--accent-success)', marginTop: '8px' }}>✓ Proctor scan confirmed 100% compliance rate.</p>
                    )}
                    <button onClick={() => setExamFinished(false)} className="btn btn-secondary" style={{ marginTop: '16px' }}>Retake Demo</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FINANCE & WALLET */}
          {activeTab === 'finance' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Wallet Header */}
              <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Digital Student Wallet</span>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
                      ${walletBalance.toFixed(2)}
                    </h1>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: PILOT-STU001-WALLET</p>
                  </div>
                  
                  <form onSubmit={handleTopUpWallet} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Add funds ($)"
                      style={{ width: '120px' }}
                      value={walletTopUpAmount}
                      onChange={(e) => setWalletTopUpAmount(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>+ Top Up</button>
                  </form>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
                {/* Fee assignments */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 className={styles.sectionTitle}>💳 Fee Assignments Ledger</h3>
                  <table className={styles.feesTable}>
                    <thead>
                      <tr>
                        <th>Fee Type</th>
                        <th>Due</th>
                        <th>Paid</th>
                        <th>Outstanding</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((fee) => {
                        const outstanding = fee.amountDue - fee.amountPaid;
                        return (
                          <tr key={fee.id}>
                            <td style={{ fontWeight: '600' }}>{fee.feeType}</td>
                            <td>${fee.amountDue.toLocaleString()}</td>
                            <td>${fee.amountPaid.toLocaleString()}</td>
                            <td style={{ color: outstanding > 0 ? 'var(--accent-warning)' : 'var(--text-muted)', fontWeight: '600' }}>
                              ${outstanding.toLocaleString()}
                            </td>
                            <td>
                              <span className={`badge ${fee.status === 'PAID' ? 'badge-success' : fee.status === 'PARTIAL' ? 'badge-info' : 'badge-danger'}`}>
                                {fee.status}
                              </span>
                            </td>
                            <td>
                              {outstanding > 0 ? (
                                <button onClick={() => setPaymentModalFee(fee)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                  Pay Now
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Settled</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Wallet Transactions */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>📋 Transaction History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                    {walletTransactions.map((tx, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid var(--border-glass)', fontSize: '0.8rem' }}>
                        <div>
                          <strong>{tx.service}</strong>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{tx.date}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: tx.amount < 0 ? 'var(--accent-danger)' : 'var(--accent-success)', fontWeight: '700' }}>
                            {tx.amount < 0 ? '' : '+'}${Math.abs(tx.amount).toFixed(2)}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{tx.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PLACEMENT PORTAL */}
          {activeTab === 'placement' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
                
                {/* Career Scorecard */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>📊 Placement Eligibility</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                        <circle cx="60" cy="60" r="50" stroke="var(--accent-success)" strokeWidth="8" fill="transparent"
                          strokeDasharray={2 * Math.PI * 50}
                          strokeDashoffset={2 * Math.PI * 50 * (1 - 0.88)} // 88% probability
                          transform="rotate(-90 60 60)"
                        />
                      </svg>
                      <span style={{ position: 'absolute', fontWeight: '800', fontSize: '1.5rem' }}>88%</span>
                    </div>
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>Placement Readiness Score</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>High probability based on CGPA ({student?.cgpa}) and active project counts.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>HackerRank Code Score:</span>
                      <strong style={{ color: 'var(--accent-info)' }}>Gold Badge (320 pts)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Interview Prep Completed:</span>
                      <strong>8 / 10 Mock Rounds</strong>
                    </div>
                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setShowResumeModal(true)}>
                      📝 Generate Resume Outline
                    </button>
                  </div>
                </div>

                {/* Skills and projects */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Skills tags */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 className={styles.sectionTitle}>💡 Technical Skills Management</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Manage skills verified via coursework & online coding activity.</p>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {skills.map(s => (
                        <span key={s} className="badge badge-info" style={{ padding: '6px 12px', display: 'inline-flex', gap: '6px', fontSize: '0.8rem' }}>
                          {s}
                          <span style={{ cursor: 'pointer', color: 'var(--accent-danger)' }} onClick={() => handleRemoveSkill(s)}>✖</span>
                        </span>
                      ))}
                    </div>

                    <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Add skill (e.g. Python, Docker)"
                        style={{ flexGrow: 1 }}
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn btn-primary">Add</button>
                    </form>
                  </div>

                  {/* Projects builder */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 className={styles.sectionTitle}>🛠️ Portfolio Projects</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      {projects.map((p, idx) => (
                        <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                          <strong style={{ fontSize: '0.85rem' }}>{p.name}</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 6px' }}>{p.description}</p>
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{p.tech}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input type="text" className="form-input" placeholder="Project Name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required />
                      <input type="text" className="form-input" placeholder="Project Description" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} />
                      <input type="text" className="form-input" placeholder="Tech stack (comma separated)" value={newProjectTech} onChange={(e) => setNewProjectTech(e.target.value)} />
                      <button type="submit" className="btn btn-secondary">Add Project to Portfolio</button>
                    </form>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CAMPUS SERVICES */}
          {activeTab === 'services' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={styles.servicesSubTabs}>
                <button onClick={() => setServicesSubTab('canteen')} className={`${styles.serviceSubTab} ${servicesSubTab === 'canteen' ? styles.serviceSubTabActive : ''}`}>
                  🍔 Smart Canteen
                </button>
                <button onClick={() => setServicesSubTab('library')} className={`${styles.serviceSubTab} ${servicesSubTab === 'library' ? styles.serviceSubTabActive : ''}`}>
                  📖 Central Library
                </button>
                <button onClick={() => setServicesSubTab('transport')} className={`${styles.serviceSubTab} ${servicesSubTab === 'transport' ? styles.serviceSubTabActive : ''}`}>
                  🚌 Campus Transport
                </button>
                <button onClick={() => setServicesSubTab('hostel')} className={`${styles.serviceSubTab} ${servicesSubTab === 'hostel' ? styles.serviceSubTabActive : ''}`}>
                  🏢 Hostel Booking
                </button>
                <button onClick={() => setServicesSubTab('iot')} className={`${styles.serviceSubTab} ${servicesSubTab === 'iot' ? styles.serviceSubTabActive : ''}`}>
                  🏫 Classroom IoT & Parking
                </button>
              </div>

              {/* Canteen SubTab */}
              {servicesSubTab === 'canteen' && (
                <div className={styles.canteenLayout}>
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>Menu Specials</h4>
                    <div className={styles.menuGrid}>
                      {menu.map(item => (
                        <div key={item.id} className={`${styles.menuItemCard} glass-panel`}>
                          <div className={styles.itemEmoji}>{item.image}</div>
                          <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                          <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                          <button onClick={() => addToCart(item)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: '4px', width: '100%' }}>
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>

                    <h4 style={{ margin: '24px 0 12px' }}>Your Recent Orders</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {canteenOrders.map((o: any) => {
                        const orderItems = JSON.parse(o.itemsJson);
                        return (
                          <div key={o.id} className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <div>
                              <strong>Order #{o.id.slice(0, 5)}</strong>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                {orderItems.map((i: any) => `${i.name} x${i.qty}`).join(', ')}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span>${o.total.toFixed(2)}</span>
                              <span className={`badge ${o.status === 'COMPLETED' ? 'badge-success' : o.status === 'READY' ? 'badge-info' : 'badge-warning'}`}>
                                {o.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`${styles.cartPanel} glass-panel`}>
                    <h4 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>🛒 Checkout Cart</h4>
                    {Object.keys(cart).length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Cart is empty</p>
                    ) : (
                      <>
                        <div className={styles.cartList}>
                          {Object.values(cart).map((c: any) => (
                            <div key={c.item.id} className={styles.cartRow}>
                              <span>{c.item.name} (x{c.qty})</span>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span>${(c.item.price * c.qty).toFixed(2)}</span>
                                <button onClick={() => removeFromCart(c.item.id)} style={{ color: 'var(--accent-danger)', cursor: 'pointer' }}>✖</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={styles.cartTotal}>
                          <span>Total:</span>
                          <span>
                            ${Object.values(cart).reduce((sum: number, c: any) => sum + c.item.price * c.qty, 0).toFixed(2)}
                          </span>
                        </div>
                        <button onClick={placeCanteenOrder} className="btn btn-primary" style={{ width: '100%' }}>
                          Place Order (Wallet Pay)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Library SubTab */}
              {servicesSubTab === 'library' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr', gap: '24px' }}>
                  <div>
                    <h4 style={{ marginBottom: '16px' }}>Library Book Directory</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {catalog.map(book => (
                        <div key={book.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{book.title}</strong>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>by {book.author}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.available} copies available</span>
                            <button onClick={() => requestBook(book)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                              Request Issue
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <h4 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>📚 Your Issued Books</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {books.map(b => (
                        <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{b.bookTitle}</span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Due: {new Date(b.dueDate).toLocaleDateString()}</span>
                            <span className={`badge ${b.status === 'OVERDUE' ? 'badge-danger' : b.status === 'RETURNED' ? 'badge-success' : 'badge-info'}`}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Transport SubTab */}
              {servicesSubTab === 'transport' && (
                <div>
                  <h4 style={{ marginBottom: '16px' }}>Bus Routes & Live Tracker</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {routes.map(r => (
                      <div key={r.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '1rem', color: '#fff' }}>{r.routeName}</strong>
                          <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <span><strong>Current Stop:</strong> {r.currentStop}</span>
                            <span><strong>Driver:</strong> {r.driverName} ({r.driverPhone})</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge ${r.status === 'ON_TIME' ? 'badge-success' : 'badge-warning'}`} style={{ padding: '6px 12px' }}>
                            {r.status === 'ON_TIME' ? 'On Time' : `Delayed +${r.delayMinutes} min`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hostel SubTab */}
              {servicesSubTab === 'hostel' && (
                <div>
                  <h4 style={{ marginBottom: '16px' }}>Hostel Block Allocations</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {hostelBlocks.map((h, i) => (
                      <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <strong style={{ fontSize: '1.05rem' }}>{h.block}</strong>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <span>Occupancy rate:</span>
                          <span style={{ fontWeight: '600', color: '#fff' }}>{h.occupancy}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <span>Rooms available:</span>
                          <span style={{ fontWeight: '600', color: 'var(--accent-info)' }}>{h.roomsAvailable}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <span>Rating:</span>
                          <span style={{ color: 'var(--accent-warning)' }}>{h.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IoT Classroom & Smart Parking SubTab */}
              {servicesSubTab === 'iot' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
                  
                  {/* IoT Sensors */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>🏫 IoT Smart Classroom Monitor</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Class occupancy:</span>
                        <strong style={{ color: 'var(--accent-info)' }}>{classroomIoT.occupancy}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Projector status:</span>
                        <strong style={{ color: 'var(--accent-success)' }}>{classroomIoT.projector}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>AC/Climate:</span>
                        <strong>{classroomIoT.acTemp}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Energy Consumption:</span>
                        <strong style={{ color: 'var(--accent-warning)' }}>{classroomIoT.energyUsage}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-info)', fontStyle: 'italic', marginTop: '6px' }}>
                        ⚡ {classroomIoT.smartScheduling}
                      </div>
                    </div>
                  </div>

                  {/* Smart Parking Slots Reservation */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>🚗 Smart Parking Reservation</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Reserve parking space A1-A8 in real-time. Slots are monitored via weight-sensors.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                      {parkingSlots.map(slot => (
                        <div
                          key={slot.id}
                          onClick={() => handleReserveParking(slot.id)}
                          style={{
                            cursor: 'pointer',
                            padding: '16px 8px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            border: '1px solid',
                            background: slot.reserved && slot.studentCode === 'STU001' ? 'rgba(99,102,241,0.15)' : slot.reserved ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                            borderColor: slot.reserved && slot.studentCode === 'STU001' ? 'var(--accent-primary)' : slot.reserved ? 'var(--accent-danger)' : 'var(--accent-success)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <strong style={{ display: 'block', fontSize: '0.9rem' }}>{slot.id}</strong>
                          <span style={{ fontSize: '0.65rem', display: 'block', marginTop: '4px', color: slot.reserved && slot.studentCode === 'STU001' ? 'var(--accent-primary)' : slot.reserved ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                            {slot.reserved && slot.studentCode === 'STU001' ? 'Reserved (You)' : slot.reserved ? 'Occupied' : 'AVAILABLE'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 7: SUPPORT TICKETS */}
          {activeTab === 'support' && (
            <div className={`${styles.canteenLayout} animate-fade-in`}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '20px' }}>🎫 Submit a Support Grievance</h3>
                {ticketSuccess && (
                  <div className="badge badge-success" style={{ display: 'block', padding: '12px', textAlign: 'center', marginBottom: '16px', fontSize: '0.85rem' }}>
                    Ticket submitted successfully! Support staff alerted, auto-escalation active.
                  </div>
                )}
                <form onSubmit={handleSubmitTicket}>
                  <div className="form-group">
                    <label className="form-label">Grievance Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. WiFi failing in Hostel block B"
                      value={ticketTitle}
                      onChange={(e) => setTicketTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-input" value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)}>
                        <option value="ACADEMIC">Academic affairs</option>
                        <option value="FINANCE">Finance & payments</option>
                        <option value="HOSTEL">Hostel maintenance</option>
                        <option value="TRANSPORT">Campus transport</option>
                        <option value="OTHER">Other support</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select className="form-input" value={ticketPriority} onChange={(e) => setTicketPriority(e.target.value)}>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Detailed Description</label>
                    <textarea
                      className="form-input"
                      rows={5}
                      placeholder="Provide all context, error codes, room numbers or transaction ids..."
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Submit Support Ticket
                  </button>
                </form>
              </div>

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 className={styles.sectionTitle} style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>📋 Grievance Ticket Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '450px' }}>
                  {tickets.map(t => (
                    <div key={t.id} className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ticket #{t.id.slice(0, 8)}</span>
                        <span className={`badge ${t.status === 'RESOLVED' ? 'badge-success' : t.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-danger'}`}>
                          {t.status}
                        </span>
                      </div>
                      <strong style={{ fontSize: '0.9rem' }}>{t.title}</strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t.description}</p>
                      
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-info)' }}>
                        ⏱️ Auto-Escalation: {t.status !== 'RESOLVED' ? 'Active (Escalates to Head Office in 24h if unresolved)' : 'Deactivated'}
                      </div>

                      {t.resolutionNotes && (
                        <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid var(--accent-success)', borderRadius: '4px', fontSize: '0.75rem' }}>
                          <strong>Resolution notes:</strong> {t.resolutionNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: COPILOT CHAT */}
          {activeTab === 'copilot' && (
            <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '620px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>🤖</span>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>AI Campus Copilot</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)' }}>● Advanced Knowledge & Study Planner Engine</span>
                </div>
              </div>

              <div className={styles.chatMessages}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className={`${styles.message} ${msg.sender === 'user' ? styles.messageUser : styles.messageSystem}`}>
                      {msg.text.split('\n').map((line: string, index: number) => (
                        <p key={index} style={{ marginBottom: line.startsWith('-') ? '4px' : '8px' }}>{line}</p>
                      ))}
                    </div>

                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '12px', marginTop: '2px' }}>
                        {msg.suggestedActions.map((act: any, ai: number) => (
                          <button
                            key={ai}
                            onClick={() => {
                              if (act.url.includes('finance')) setActiveTab('finance');
                              else if (act.url.includes('academics')) setActiveTab('academics');
                              else if (act.url.includes('services')) setActiveTab('services');
                              else if (act.url.includes('support')) setActiveTab('support');
                            }}
                            className={act.primary ? "btn btn-primary" : "btn btn-secondary"}
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className={styles.suggestedActions}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '6px' }}>Intelligent Queries:</span>
                <div onClick={() => sendCopilotMessage('Generate study planner schedule')} className={styles.actionChip}>📅 Study Planner Schedule</div>
                <div onClick={() => sendCopilotMessage('Help me write my resume and suggest internships')} className={styles.actionChip}>📝 Resume / Career Outline</div>
                <div onClick={() => sendCopilotMessage('What is the library policy and timings?')} className={styles.actionChip}>🏫 Library FAQ</div>
              </div>

              <div className={styles.chatInputArea}>
                <input
                  type="text"
                  className={styles.chatInput}
                  placeholder="Ask for resume generation, study planner, grades advice or campus FAQ..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendCopilotMessage();
                  }}
                />
                <button onClick={() => sendCopilotMessage()} className="btn btn-primary" style={{ height: '48px', width: '80px' }}>
                  Send
                </button>
              </div>
            </div>
          )}

          {/* TAB 9: DIGITAL ID & QR SCANNER */}
          {activeTab === 'id' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }} className="animate-fade-in">
              
              {/* ID Display */}
              <div className={styles.idCardContainer} style={{ padding: 0 }}>
                <div className={styles.idCard} style={{ width: '100%', height: '280px' }}>
                  <div className={styles.idCardGlow}></div>
                  <div className={styles.idCardHeader}>
                    <span className={styles.idCollegeName}>CAMPUS PILOT INSTITUTE</span>
                    <span className="badge badge-success">ACTIVE STUDENT</span>
                  </div>

                  <div className={styles.idCardBody}>
                    <div className={styles.idPhoto}>🎓</div>
                    <div className={styles.idInfo}>
                      <span className={styles.idName}>{student.fullName}</span>
                      <span className={styles.idDetails}>Course: **{student.courseId}**</span>
                      <span className={styles.idDetails}>Dept: **{student.department.name}**</span>
                      <span className={styles.idDetails}>Semester: **Sem {student.currentSemester}**</span>
                    </div>
                  </div>

                  <div className={styles.idBarcodeContainer}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)' }}>STUDENT ID</span>
                      <span className={styles.idCode}>{student.studentCode}</span>
                    </div>
                    {/* Visual QR Code Generator */}
                    <div style={{ padding: '4px', background: '#fff', borderRadius: '4px' }}>
                      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="#111" strokeWidth="6">
                        <rect x="5" y="5" width="25" height="25" />
                        <rect x="70" y="5" width="25" height="25" />
                        <rect x="5" y="70" width="25" height="25" />
                        <path d="M 45 10 H 55 M 45 45 H 65 M 65 75 H 90 M 10 45 V 60" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Scanner Simulator */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '10px' }}>🤳 Dynamic QR Pass & IoT Scanner Simulator</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Select the campus utility service, then click simulated scan to mimic entering library/hostel or marking attendance.</p>
                
                <div className="form-group">
                  <label className="form-label">Active Scanner Utility Mode</label>
                  <select className="form-input" value={qrMode} onChange={(e: any) => { setQrMode(e.target.value); setScanSimulatorMsg(''); }}>
                    <option value="attendance">Classroom Attendance (CS-303)</option>
                    <option value="library">Library Book Checkout</option>
                    <option value="canteen">Canteen Pre-Order Pickup Token</option>
                    <option value="hostel">Hostel Block-B Biometric Entrance</option>
                  </select>
                </div>

                <div style={{ textAlign: 'center', padding: '16px', background: '#fff', width: '160px', margin: '0 auto 16px', borderRadius: '8px' }}>
                  {/* Dynamic Visual QR based on mode */}
                  <svg width="128" height="128" viewBox="0 0 100 100" fill="none" stroke="#111" strokeWidth="4">
                    <rect x="5" y="5" width="25" height="25" strokeWidth="6"/>
                    <rect x="12" y="12" width="11" height="11" fill="#111"/>
                    <rect x="70" y="5" width="25" height="25" strokeWidth="6"/>
                    <rect x="77" y="12" width="11" height="11" fill="#111"/>
                    <rect x="5" y="70" width="25" height="25" strokeWidth="6"/>
                    <rect x="12" y="77" width="11" height="11" fill="#111"/>
                    {/* Alter grids based on mode */}
                    {qrMode === 'attendance' && <path d="M 45 10 L 55 10 M 45 30 L 60 30 M 10 45 L 30 45 M 55 55 L 75 55 M 70 85 L 90 85" strokeWidth="4" />}
                    {qrMode === 'library' && <path d="M 45 20 H 60 M 50 45 H 80 M 65 65 H 90 M 55 85 H 75" strokeWidth="4" />}
                    {qrMode === 'canteen' && <path d="M 45 15 V 35 M 55 45 V 65 M 75 45 V 85 M 85 55 V 75" strokeWidth="4" />}
                    {qrMode === 'hostel' && <path d="M 45 45 H 55 V 55 H 45 Z M 65 45 H 90 V 60 M 70 70 H 80 V 85" strokeWidth="4" />}
                  </svg>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#666', marginTop: '6px', fontWeight: 'bold' }}>PILOT_SECURE_TOKEN</span>
                </div>

                <button onClick={simulateQRScannerCheckIn} className="btn btn-primary" style={{ width: '100%' }}>
                  Simulate Scanner Scan
                </button>

                {scanSimulatorMsg && (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(99,102,241,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center' }}>
                    {scanSimulatorMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 10: GAMIFICATION ACHIEVEMENTS */}
          {activeTab === 'gamification' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
                
                {/* Badges */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>🏆 Unlocked Badges & Achievements</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {badges.map((badge, idx) => (
                      <div
                        key={idx}
                        className="glass-panel"
                        style={{
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: badge.unlocked ? 'rgba(99,102,241,0.03)' : 'rgba(255,255,255,0.01)',
                          opacity: badge.unlocked ? 1 : 0.4,
                          borderColor: badge.unlocked ? 'rgba(99,102,241,0.15)' : 'var(--border-glass)'
                        }}
                      >
                        <span style={{ fontSize: '2.5rem' }}>{badge.icon}</span>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>{badge.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{badge.desc}</span>
                          <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 'bold', color: badge.unlocked ? 'var(--accent-success)' : 'var(--text-muted)', marginTop: '4px' }}>
                            {badge.unlocked ? '✓ UNLOCKED (+150 XP)' : 'LOCKED'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Rewards Store */}
                  <div style={{ marginTop: '24px' }}>
                    <h3 className={styles.sectionTitle} style={{ marginBottom: '12px' }}>🎁 XP Rewards Redemption Store</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="glass-panel" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.8rem', display: 'block' }}>Canteen Burger Voucher</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cost: 400 XP</span>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => {
                          if (xpPoints < 400) { alert('Not enough XP points!'); return; }
                          setXpPoints(prev => prev - 400);
                          alert('Voucher added! Check wallet vouchers.');
                        }}>Redeem</button>
                      </div>

                      <div className="glass-panel" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.8rem', display: 'block' }}>Library Fine Waiver ($5)</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cost: 500 XP</span>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => {
                          if (xpPoints < 500) { alert('Not enough XP points!'); return; }
                          setXpPoints(prev => prev - 500);
                          alert('Fine Waiver code registered to library dues!');
                        }}>Redeem</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>🏆 Campus Points Leaderboard</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {leaderboard.map((user) => (
                      <div
                        key={user.rank}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '12px',
                          borderRadius: '6px',
                          background: user.name.includes('(You)') ? 'rgba(99,102,241,0.08)' : 'transparent',
                          border: user.name.includes('(You)') ? '1px solid rgba(99,102,241,0.2)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 'bold', color: user.rank === 1 ? 'var(--accent-warning)' : 'var(--text-secondary)' }}>#{user.rank}</span>
                          <strong>{user.name}</strong>
                        </div>
                        <strong style={{ color: 'var(--accent-info)', fontSize: '0.85rem' }}>{user.points}</strong>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 11: SOCIAL & MARKETPLACE */}
          {activeTab === 'social' && (
            <div className={`${styles.canteenLayout} animate-fade-in`}>
              
              {/* Campus Social Feed */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>📣 Social Campus Feed</h3>
                
                <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Share achievements, post club activities or exam tips..."
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '6px 16px', fontSize: '0.8rem' }}>Post Feed</button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '450px' }}>
                  {feedPosts.map(post => (
                    <div key={post.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-glass)', display: 'flex', gap: '12px' }}>
                      <div style={{ fontSize: '2rem' }}>{post.avatar}</div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <strong>{post.author}</strong>
                          <span>{post.date}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#fff', marginTop: '6px', lineHeight: '1.4' }}>{post.text}</p>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <button onClick={() => handleLikePost(post.id)} style={{ cursor: 'pointer', color: post.liked ? 'var(--accent-secondary)' : 'inherit', background: 'none', border: 'none' }}>
                            ❤️ {post.likes} Likes
                          </button>
                          <span>💬 {post.comments} Comments</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marketplace */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>🛒 Campus Marketplace</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '250px', overflowY: 'auto' }}>
                  {marketplaceItems.map(item => (
                    <div key={item.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <strong style={{ color: '#fff' }}>{item.name}</strong>
                        <strong style={{ color: 'var(--accent-success)' }}>${item.price}</strong>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        <span>Seller: {item.seller}</span>
                        <span>Condition: {item.cond}</span>
                      </div>
                      <button className="btn btn-secondary" style={{ width: '100%', padding: '2px 4px', fontSize: '0.7rem', marginTop: '6px' }} onClick={() => alert(`Contacting ${item.seller} regarding book purchase`)}>
                        Contact Seller
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCreateMarketItem} style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px dashed var(--border-glass)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>List Book / Notes for Sale</span>
                  <input type="text" className="form-input" style={{ fontSize: '0.75rem', padding: '8px' }} placeholder="Book Title" value={newMarketItemName} onChange={(e) => setNewMarketItemName(e.target.value)} required />
                  <input type="number" className="form-input" style={{ fontSize: '0.75rem', padding: '8px' }} placeholder="Price ($)" value={newMarketItemPrice} onChange={(e) => setNewMarketItemPrice(e.target.value)} required />
                  <input type="text" className="form-input" style={{ fontSize: '0.75rem', padding: '8px' }} placeholder="Short details" value={newMarketItemDesc} onChange={(e) => setNewMarketItemDesc(e.target.value)} />
                  <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Post Listing</button>
                </form>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* PAYMENT DIALOG CHECKOUT MODAL */}
      {paymentModalFee && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} glass-panel animate-fade-in`}>
            <div className={styles.modalClose} onClick={() => setPaymentModalFee(null)}>✖</div>
            <h3>💳 Secure Semester Payment</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 16px' }}>
              Settling dues for: **{paymentModalFee.feeType}**
            </p>

            {paymentSuccessMessage ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <span style={{ fontSize: '3rem' }}>✅</span>
                <h4 style={{ margin: '16px 0 8px' }}>Payment Approved</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>{paymentSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleMakePayment}>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Amount Due:</span>
                    <strong style={{ color: 'var(--accent-info)' }}>
                      ${(paymentModalFee.amountDue - paymentModalFee.amountPaid).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className={styles.paymentTabs}>
                  <div onClick={() => setPaymentMethod('wallet')} className={`${styles.paymentTab} ${paymentMethod === 'wallet' ? styles.paymentTabActive : ''}`}>
                    👛 Digital Wallet
                  </div>
                  <div onClick={() => setPaymentMethod('card')} className={`${styles.paymentTab} ${paymentMethod === 'card' ? styles.paymentTabActive : ''}`}>
                    💳 Card Checkout
                  </div>
                  <div onClick={() => setPaymentMethod('qr')} className={`${styles.paymentTab} ${paymentMethod === 'qr' ? styles.paymentTabActive : ''}`}>
                    🤳 UPI / QR Scan
                  </div>
                </div>

                {paymentMethod === 'wallet' && (
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center' }}>
                    <span>Wallet Balance: <strong>${walletBalance.toFixed(2)}</strong></span>
                    {walletBalance < (paymentModalFee.amountDue - paymentModalFee.amountPaid) && (
                      <p style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '4px' }}>Insufficient balance. Please select other payment method.</p>
                    )}
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Cardholder Name</label>
                      <input type="text" className="form-input" placeholder={student.fullName} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Expiry Date</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'qr' && (
                  <div className={styles.qrContainer}>
                    <div className={styles.qrCode}>
                      <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="#111" strokeWidth="3">
                        <rect x="5" y="5" width="25" height="25" strokeWidth="4"/>
                        <rect x="12" y="12" width="11" height="11" fill="#111"/>
                        <rect x="70" y="5" width="25" height="25" strokeWidth="4"/>
                        <rect x="77" y="12" width="11" height="11" fill="#111"/>
                        <rect x="5" y="70" width="25" height="25" strokeWidth="4"/>
                        <rect x="12" y="77" width="11" height="11" fill="#111"/>
                        <path d="M 45 10 L 55 10 M 45 20 L 60 20 M 45 30 L 50 30 M 10 45 L 10 60 M 20 45 L 20 55 M 30 45 L 30 60 M 45 45 L 60 45 M 55 55 L 65 55 M 45 65 L 50 65 M 70 45 L 90 45 M 75 55 L 85 55 M 70 65 L 80 65 M 65 75 L 85 75 M 65 85 L 90 85" strokeWidth="3" strokeLinecap="square"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scan QR with your banking app to authorize pay</span>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={processingPayment}>
                  {processingPayment ? 'Authorizing Gateway Transaction...' : `Confirm Payment of $${(paymentModalFee.amountDue - paymentModalFee.amountPaid).toLocaleString()}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PORTFOLIO RESUME MARKDOWN MODAL */}
      {showResumeModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} glass-panel animate-fade-in`} style={{ maxWidth: '600px' }}>
            <div className={styles.modalClose} onClick={() => setShowResumeModal(false)}>✖</div>
            <h3>📝 AI Generated Resume & Placement Profile</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 16px' }}>Copy formatted markdown outline for job boards or placement portals.</p>
            
            <textarea
              className="form-input"
              rows={12}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
              value={`# RESUME: ${student.fullName.toUpperCase()}
Email: ${student.studentCode.toLowerCase()}@campus.edu | Code: ${student.studentCode}
Department: ${student.department.name} | CGPA: ${student.cgpa} / 10.0

## SKILLS & COMPETENCIES
* Programming & Tools: ${skills.join(', ')}
* Active Placement Readiness Quotient: 88%

## PORTFOLIO PROJECTS
${projects.map((p, i) => `${i+1}. **${p.name}**
   *Description:* ${p.description}
   *Technologies:* ${p.tech}`).join('\n\n')}

## EDUCATION
* B.Tech CSE (Semester 6) - Campus Pilot Institute
* Overall Attendance Rate: ${dashboardData.attendanceSummary.overallPercentage}% (Maintained)`}
              readOnly
            />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={() => {
              navigator.clipboard.writeText(`RESUME: ${student.fullName}...`);
              alert('Resume Outline copied to clipboard!');
              setShowResumeModal(false);
            }}>
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentPortal() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Campus Pilot Student Portal...</p>
      </div>
    }>
      <StudentPortalContent />
    </Suspense>
  );
}
