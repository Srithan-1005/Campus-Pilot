'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../student/portal.module.css';

function ParentPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentCodeParam = searchParams.get('studentCode') || 'STU001';

  // Navigation & Authentication states
  const [studentCode, setStudentCode] = useState(studentCodeParam);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  
  // Tab Navigation state
  const [activeTab, setActiveTab] = useState('overview');

  // Interactive Parent states
  const [walletBalance, setWalletBalance] = useState(1200);
  const [outstandingTuition, setOutstandingTuition] = useState(8000);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('4000');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Communication & PTM states
  const [messages, setMessages] = useState<any[]>([
    { id: 1, sender: 'Dr. Sarah Jenkins (Dean)', text: 'Hello, I wanted to inform you that Alex has been doing very well in Software Engineering, but his class attendance drops occasionally on Fridays. Please encourage him to maintain consistency.', date: 'May 18, 2026' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [concernCategory, setConcernCategory] = useState('ACADEMIC');
  const [concernText, setConcernText] = useState('');
  const [concernSuccess, setConcernSuccess] = useState(false);
  
  // Meeting Slots booking
  const [bookedMeetings, setBookedMeetings] = useState<any[]>([
    { id: 1, teacher: 'Prof. Miller (Networks)', date: 'May 15, 2026', time: '03:00 PM', status: 'COMPLETED', feedback: 'Discussed Friday Commuter delay. Ward was advised to attend peer tutorials.' }
  ]);
  const [selectedSlot, setSelectedSlot] = useState('May 22, 2026 at 02:00 PM');
  const [ptmSuccess, setPtmSuccess] = useState(false);

  // Digital Document download state
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  // Mock databases
  const attendanceLog = [
    { date: 'May 18, 2026', subject: 'CS-301: Software Engineering', status: 'PRESENT' },
    { date: 'May 18, 2026', subject: 'CS-302: Database Systems', status: 'PRESENT' },
    { date: 'May 15, 2026', subject: 'CS-303: Computer Networks', status: 'ABSENT' },
    { date: 'May 14, 2026', subject: 'CS-301: Software Engineering', status: 'PRESENT' },
    { date: 'May 14, 2026', subject: 'CS-302: Database Systems', status: 'LATE' },
    { date: 'May 13, 2026', subject: 'CS-303: Computer Networks', status: 'PRESENT' },
    { date: 'May 12, 2026', subject: 'CS-301: Software Engineering', status: 'PRESENT' }
  ];

  const paidHistory = [
    { id: 'TXN-901', feeType: 'Hostel Fee', amount: 3500, date: 'May 01, 2026', status: 'PAID' },
    { id: 'TXN-902', feeType: 'Library Fee', amount: 120, date: 'Apr 10, 2026', status: 'PAID' }
  ];

  const parentAlerts = [
    { id: 1, type: 'danger', message: 'Low Attendance Alert: Ward\'s cumulative attendance in Computer Networks is 68% (Below 75% threshold).', time: '2 hrs ago' },
    { id: 2, type: 'warning', message: 'Tuition Fee Due: Outstanding balance of $8,000 is due on May 25, 2026.', time: '1 day ago' },
    { id: 3, type: 'info', message: 'Timetable Released: End semester exam schedule published. Commencing June 5th.', time: '2 days ago' },
    { id: 4, type: 'warning', message: 'Transport Delay: Route 2B school bus is delayed by 15 mins due to highway construction.', time: 'May 15, 2026' },
    { id: 5, type: 'success', message: 'Outpass Approved: Hostel outpass request for weekend outing approved by Warden.', time: 'May 14, 2026' }
  ];

  const fetchStudentData = async (code: string) => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/v1/admin-dashboard/overview');
      const data = await res.json();
      
      const allStudents = [
        { id: '1', fullName: 'Alex Carter', studentCode: 'STU001', departmentCode: 'CSE', courseId: 'B.Tech CSE', currentSemester: 6, cgpa: 8.4, attendanceRate: 85, outstandingFees: 8000, riskScore: 25, parentName: 'Mr. Robert Carter' },
        { id: '2', fullName: 'Emma Watson', studentCode: 'STU002', departmentCode: 'ECE', courseId: 'B.Tech ECE', currentSemester: 4, cgpa: 6.8, attendanceRate: 52, outstandingFees: 12000, riskScore: 68, parentName: 'Mrs. Jean Watson' },
        { id: '3', fullName: 'Liam Neeson', studentCode: 'STU003', departmentCode: 'ME', courseId: 'B.Tech ME', currentSemester: 2, cgpa: 7.2, attendanceRate: 88, outstandingFees: 0, riskScore: 5, parentName: 'Mr. John Neeson' },
        { id: '10', fullName: 'Benjamin Franklin', studentCode: 'STU010', departmentCode: 'CSE', courseId: 'B.Tech CSE', currentSemester: 6, cgpa: 6.2, attendanceRate: 45, outstandingFees: 12000, riskScore: 82, parentName: 'Mr. Josiah Franklin' },
      ];

      const found = allStudents.find(s => s.studentCode.toUpperCase() === code.toUpperCase());
      if (found) {
        setStudentData(found);
        setOutstandingTuition(found.outstandingFees);
        setIsLoggedIn(true);
      } else {
        throw new Error('Student profile with this code not found in our directory.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentCodeParam) {
      fetchStudentData(studentCodeParam);
    }
  }, [studentCodeParam]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) {
      setError('Please enter a valid Student ID');
      return;
    }
    fetchStudentData(studentCode);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: `${studentData?.parentName || 'Parent'} (You)`,
      text: newMessage,
      date: new Date().toLocaleDateString()
    }]);
    setNewMessage('');
  };

  const handleRaiseConcern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concernText.trim()) return;
    setConcernSuccess(true);
    setConcernText('');
    setTimeout(() => setConcernSuccess(false), 4000);
  };

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeeting = {
      id: Date.now(),
      teacher: 'Dr. Sarah Jenkins (Dean)',
      date: selectedSlot.split(' at ')[0],
      time: selectedSlot.split(' at ')[1],
      status: 'CONFIRMED',
      feedback: 'Awaiting session commencement.'
    };
    setBookedMeetings([...bookedMeetings, newMeeting]);
    setPtmSuccess(true);
    setTimeout(() => setPtmSuccess(false), 4000);
  };

  const handlePayFees = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) return;
    
    setOutstandingTuition(prev => Math.max(0, prev - amt));
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setPaymentModalOpen(false);
    }, 2000);
  };

  if (!isLoggedIn) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '3rem' }}>🛡️</span>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginTop: '12px', background: 'linear-gradient(to right, #ffffff, var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Parent Portal</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>Securely monitor your ward's attendance & finances</p>
          </div>

          {error && <div className="badge badge-danger" style={{ display: 'block', padding: '10px', textAlign: 'center', marginBottom: '16px', fontSize: '0.8rem' }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Ward's Student ID (e.g. STU001)</label>
              <input
                type="text"
                className="form-input"
                placeholder="STUXXX"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Access Portal'}
            </button>
          </form>
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button onClick={() => router.push('/')} className="btn btn-secondary" style={{ width: '100%', border: 'none' }}>
              ← Return to Main Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className={styles.container}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandLogo}>🛡️</div>
          <span className={styles.brandText}>Parent Portal</span>
        </div>

        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>👨‍👩‍👦</div>
          <div className={styles.userData}>
            <span className={styles.userName}>{studentData.parentName}</span>
            <span className={styles.userRole}>Parent of {studentData.fullName}</span>
          </div>
        </div>

        <nav className={styles.sidebarMenu}>
          <div onClick={() => setActiveTab('overview')} className={`${styles.menuItem} ${activeTab === 'overview' ? styles.menuItemActive : ''}`}>
            📊 Ward Overview
          </div>
          <div onClick={() => setActiveTab('attendance')} className={`${styles.menuItem} ${activeTab === 'attendance' ? styles.menuItemActive : ''}`}>
            📈 Attendance Log
          </div>
          <div onClick={() => setActiveTab('finance')} className={`${styles.menuItem} ${activeTab === 'finance' ? styles.menuItemActive : ''}`}>
            💳 Fees & Payments
          </div>
          <div onClick={() => setActiveTab('academics')} className={`${styles.menuItem} ${activeTab === 'academics' ? styles.menuItemActive : ''}`}>
            🎓 Report Card
          </div>
          <div onClick={() => setActiveTab('facilities')} className={`${styles.menuItem} ${activeTab === 'facilities' ? styles.menuItemActive : ''}`}>
            🚌 Hostel & Transport
          </div>
          <div onClick={() => setActiveTab('communication')} className={`${styles.menuItem} ${activeTab === 'communication' ? styles.menuItemActive : ''}`}>
            💬 PT Meet & Message
          </div>
          <div onClick={() => setActiveTab('documents')} className={`${styles.menuItem} ${activeTab === 'documents' ? styles.menuItemActive : ''}`}>
            📄 Digital Vault
          </div>
        </nav>

        <div className={styles.sidebarFooter} style={{ padding: '0 12px 24px' }}>
          <button onClick={() => setIsLoggedIn(false)} className="btn btn-secondary" style={{ width: '100%', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
            🚪 Exit Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {activeTab === 'overview' && 'Guardian oversight dashboard'}
            {activeTab === 'attendance' && 'Ward Attendance Monitoring'}
            {activeTab === 'finance' && 'Student Dues & Billing Tracker'}
            {activeTab === 'academics' && 'Academic Progress Report Card'}
            {activeTab === 'facilities' && 'Hostel Allocations & Transit Schedules'}
            {activeTab === 'communication' && 'PTM Coordinator & Grievance Console'}
            {activeTab === 'documents' && 'Verified Digital Document Vault'}
          </div>
          <div className={styles.headerActions}>
            <span className="badge badge-success">Direct Ward Feed Sync</span>
          </div>
        </header>

        <main className={styles.mainContent}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Attendance Rate</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', color: studentData.attendanceRate < 75 ? 'var(--accent-danger)' : 'var(--accent-success)', marginTop: '4px' }}>
                      {studentData.attendanceRate}%
                    </h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {studentData.attendanceRate < 75 ? 'Debarment Risk' : 'Secure'}</span>
                  </div>
                  <span style={{ fontSize: '2.5rem' }}>📈</span>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Academic CGPA</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-info)', marginTop: '4px' }}>
                      {studentData.cgpa} / 10
                    </h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class Rank: Top 15%</span>
                  </div>
                  <span style={{ fontSize: '2.5rem' }}>🎓</span>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Outstanding Fees</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', color: outstandingTuition > 0 ? 'var(--accent-warning)' : 'var(--accent-success)', marginTop: '4px' }}>
                      ${outstandingTuition.toLocaleString()}
                    </h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date: May 25, 2026</span>
                  </div>
                  <span style={{ fontSize: '2.5rem' }}>💳</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Real-time Alerts */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>🔔 Recent Guardian Notices & Alerts</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {parentAlerts.map(alert => (
                        <div key={alert.id} style={{
                          padding: '12px 16px',
                          background: alert.type === 'danger' ? 'rgba(239, 68, 68, 0.08)' : alert.type === 'warning' ? 'rgba(245, 158, 11, 0.08)' : alert.type === 'info' ? 'rgba(6, 182, 212, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          borderLeft: `4px solid var(--accent-${alert.type === 'danger' ? 'danger' : alert.type === 'warning' ? 'warning' : alert.type === 'info' ? 'info' : 'success'})`,
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>{alert.message}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{alert.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ward Timetable */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>📅 Today's Academic Timetable</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>09:00 AM - 10:30 AM</span>
                        <strong style={{ display: 'block', fontSize: '0.85rem', margin: '4px 0' }}>CS-301: Software Eng</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)' }}>Room: LH-204</span>
                      </div>
                      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>11:00 AM - 12:30 PM</span>
                        <strong style={{ display: 'block', fontSize: '0.85rem', margin: '4px 0' }}>CS-302: Database Sys</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)' }}>Room: LH-102</span>
                      </div>
                      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>02:00 PM - 03:30 PM</span>
                        <strong style={{ display: 'block', fontSize: '0.85rem', margin: '4px 0' }}>CS-303: Networks Lab</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-danger)' }}>Room: Lab-3</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Communications preview */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>💬 Inbox Preview</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {messages.slice(0, 2).map((msg: any) => (
                      <div key={msg.id} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          <strong>{msg.sender}</strong>
                          <span>{msg.date}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.4', margin: 0 }}>{msg.text.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('communication')} className="btn btn-secondary" style={{ marginTop: '16px', fontSize: '0.8rem', width: '100%', border: 'none' }}>
                    View All Messages & Book PTM
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>📈 Monthly Attendance Rate Trend</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', padding: '20px 40px 10px' }}>
                  {[
                    { month: 'Jan', rate: 94 },
                    { month: 'Feb', rate: 90 },
                    { month: 'Mar', rate: 88 },
                    { month: 'Apr', rate: 85 },
                    { month: 'May', rate: studentData.attendanceRate }
                  ].map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                      <div style={{ width: '40px', background: m.rate < 75 ? 'var(--accent-danger)' : 'var(--accent-primary)', height: `${m.rate * 1.3}px`, borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>{m.rate}%</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
                {/* Subject Attendance */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>📚 Subject-Wise Attendance</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span>CS-301: Software Engineering</span>
                        <strong style={{ color: 'var(--accent-success)' }}>86%</strong>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                        <div style={{ height: '6px', background: 'var(--accent-success)', width: '86%', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span>CS-302: Database Systems</span>
                        <strong style={{ color: 'var(--accent-success)' }}>82%</strong>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                        <div style={{ height: '6px', background: 'var(--accent-success)', width: '82%', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span>CS-303: Computer Networks</span>
                        <strong style={{ color: 'var(--accent-danger)' }}>68% (Debarment Risk)</strong>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                        <div style={{ height: '6px', background: 'var(--accent-danger)', width: '68%', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily attendance log */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>📝 Daily Attendance Registry Logs</h3>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                    <table className={styles.feesTable} style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Subject Enrolled</th>
                          <th>Roll Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceLog.map((log, lIdx) => (
                          <tr key={lIdx}>
                            <td>{log.date}</td>
                            <td style={{ fontWeight: '600' }}>{log.subject}</td>
                            <td>
                              <span className={`badge badge-${log.status === 'PRESENT' ? 'success' : log.status === 'LATE' ? 'warning' : 'danger'}`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCE */}
          {activeTab === 'finance' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '24px' }}>
                {/* Pending Dues card */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>💳 Pending Dues & Payments</h3>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-glass)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tuition Fee Dues:</span>
                      <strong style={{ color: 'var(--accent-warning)', fontSize: '1.15rem' }}>${outstandingTuition.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Due Date: May 25, 2026</span>
                      <span>Payment Plan Active</span>
                    </div>
                  </div>
                  {outstandingTuition > 0 ? (
                    <button onClick={() => setPaymentModalOpen(true)} className="btn btn-primary" style={{ width: '100%' }}>
                      Pay Outstanding Fee Balance Online
                    </button>
                  ) : (
                    <div className="badge badge-success" style={{ width: '100%', padding: '12px', fontSize: '0.9rem', textAlign: 'center' }}>
                      ✓ All Fees Fully Settled
                    </div>
                  )}
                </div>

                {/* Paid History & Receipts */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>📜 Paid Transaction History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {paidHistory.map(hist => (
                      <div key={hist.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.82rem', alignItems: 'center' }}>
                        <div>
                          <strong>{hist.feeType}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Txn: {hist.id} | Paid: {hist.date}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: 'var(--accent-success)', display: 'block' }}>${hist.amount}</strong>
                          <span style={{ fontSize: '0.7rem', textDecoration: 'underline', color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => setViewingDoc('RECEIPT')}>
                            Get Receipt
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Gateway Modal Simulator */}
              {paymentModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
                    <h3 style={{ marginBottom: '16px' }}>💳 Secure Payment Gateway</h3>
                    {paymentSuccess ? (
                      <div style={{ padding: '20px', textAlign: 'center' }}>
                        <span style={{ fontSize: '2.5rem' }}>✅</span>
                        <h4 style={{ margin: '10px 0' }}>Payment Authorized!</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Outstanding balance updated successfully.</p>
                      </div>
                    ) : (
                      <form onSubmit={handlePayFees} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group">
                          <label className="form-label">Available Wallet Balance</label>
                          <input type="text" className="form-input" value={`$${walletBalance.toLocaleString()}`} disabled />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Payment Amount ($)</label>
                          <select className="form-input" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}>
                            <option value="4000">Pay Installment ($4,000)</option>
                            <option value="8000">Pay Total Balance (${outstandingTuition})</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Card Number (Simulated)</label>
                          <input type="text" className="form-input" value="••••  ••••  ••••  1890" disabled />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Dues</button>
                          <button type="button" onClick={() => setPaymentModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACADEMICS */}
          {activeTab === 'academics' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
                {/* Grading Sheets */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>📝 Ward Exam & Internal Grades</h3>
                  <table className={styles.feesTable} style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Internal Marks (20)</th>
                        <th>Final Exam (100)</th>
                        <th>Total grade</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: '600' }}>CS-301: Software Engineering</td>
                        <td>18 / 20</td>
                        <td>85 / 100</td>
                        <td>A-</td>
                        <td><span className="badge badge-success">Passed</span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: '600' }}>CS-302: Database Systems</td>
                        <td>16 / 20</td>
                        <td>78 / 100</td>
                        <td>B+</td>
                        <td><span className="badge badge-success">Passed</span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: '600' }}>CS-303: Computer Networks</td>
                        <td>11 / 20</td>
                        <td>62 / 100</td>
                        <td>C</td>
                        <td><span className="badge badge-warning">Needs Review</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* History & Remarks */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>🎓 GPA Progression History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.82rem' }}>
                      <span>Semester 5 GPA</span>
                      <strong>8.60 / 10</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.82rem' }}>
                      <span>Semester 4 GPA</span>
                      <strong>8.20 / 10</strong>
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.15)', borderRadius: '6px', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    <strong style={{ color: 'var(--accent-secondary)', display: 'block', marginBottom: '4px' }}>Class Advisor Remarks:</strong>
                    <p style={{ margin: 0, color: 'var(--text-primary)' }}>"Alex is a highly analytical and bright student. However, he needs to ensure regular participation in the networks labs on Friday mornings."</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FACILITIES */}
          {activeTab === 'facilities' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '24px' }}>
                {/* Transport Tracking details */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>🚌 Transport Status & Tracking</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Bus Route:</span>
                      <strong>Route 2B (Downtown Shuttle)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Stop Time:</span>
                      <strong>8:15 AM at Downtown Crossing</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Driver Details:</span>
                      <strong>Mark Fletcher (+1 555-0199)</strong>
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.08)', borderLeft: '4px solid var(--accent-warning)', borderRadius: '6px', marginTop: '6px' }}>
                      <strong>Delay Notice:</strong> Currently running 15 minutes behind schedule due to highway detours.
                    </div>

                    {/* Live Tracker Simulation */}
                    <div style={{ marginTop: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '16px', textAlign: 'center' }}>
                      <strong style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--accent-primary)', display: 'block', marginBottom: '8px' }}>📍 Live Bus Tracker Simulation</strong>
                      <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                        <div style={{ position: 'absolute', left: '10%', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Stop A</div>
                        <div style={{ position: 'absolute', right: '10%', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Campus</div>
                        <div style={{ position: 'absolute', left: '45%', fontSize: '1.5rem' }}>🚌</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '45px' }}>Location: Near Sector 5 Intersection (4.2 km away)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hostel Monitoring */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>🏢 Hostel Boarding & outpass</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Room Details:</span>
                      <strong>Block-B, Room 302 (Double Sharing)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Outpass Status:</span>
                      <strong style={{ color: 'var(--accent-success)' }}>Weekend Outing - APPROVED</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Hostel Fee status:</span>
                      <strong style={{ color: 'var(--accent-success)' }}>Paid ($3,500)</strong>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>📅 Recent Visitor Logs</strong>
                      <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                          <span>Visitor: Mr. Robert Carter</span>
                          <span style={{ color: 'var(--text-muted)' }}>May 10, 2026</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Time In: 10:00 AM | Time Out: 04:30 PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COMMUNICATION */}
          {activeTab === 'communication' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
                {/* Book PT Meeting */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>📅 Book Parent-Teacher Meeting</h3>
                  {ptmSuccess && (
                    <div className="badge badge-success" style={{ display: 'block', padding: '10px', textAlign: 'center', marginBottom: '16px', fontSize: '0.8rem' }}>
                      ✓ Meeting Slot Booked Successfully!
                    </div>
                  )}
                  <form onSubmit={handleBookMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Available Coordinator Slots</label>
                      <select className="form-input" value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                        <option value="May 22, 2026 at 02:00 PM">May 22, 2026 at 02:00 PM (Dean Sarah Jenkins)</option>
                        <option value="May 22, 2026 at 03:00 PM">May 22, 2026 at 03:00 PM (Dean Sarah Jenkins)</option>
                        <option value="May 26, 2026 at 11:00 AM">May 26, 2026 at 11:00 AM (Prof. Miller - Advisor)</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Book Slot</button>
                  </form>

                  <div style={{ marginTop: '20px' }}>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Scheduled Meeting History</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {bookedMeetings.map(meet => (
                        <div key={meet.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', marginBottom: '4px' }}>
                            <span>{meet.teacher}</span>
                            <span className={`badge badge-${meet.status === 'COMPLETED' ? 'secondary' : 'success'}`}>{meet.status}</span>
                          </div>
                          <div>Slot: {meet.date} at {meet.time}</div>
                          {meet.feedback && <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>Feedback: "{meet.feedback}"</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Messenger / Raise Grievance */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>💬 Chat with Dean / Advisor</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
                      {messages.map((msg: any) => (
                        <div key={msg.id} style={{ background: msg.sender.includes('You') ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            <strong>{msg.sender}</strong>
                            <span>{msg.date}</span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.4', margin: 0 }}>{msg.text}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Type message to administration..."
                        style={{ flexGrow: 1, fontSize: '0.85rem' }}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Send</button>
                    </form>
                  </div>

                  {/* Grievance Ticket raising */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>⚠️ Raise a Grievance Concern</h3>
                    {concernSuccess && (
                      <div className="badge badge-success" style={{ display: 'block', padding: '10px', textAlign: 'center', marginBottom: '16px', fontSize: '0.8rem' }}>
                        ✓ Concern Ticket submitted to Dean of Student Welfare.
                      </div>
                    )}
                    <form onSubmit={handleRaiseConcern} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Category</label>
                          <select className="form-input" value={concernCategory} onChange={(e) => setConcernCategory(e.target.value)}>
                            <option value="ACADEMIC">Academic Issues</option>
                            <option value="FINANCE">Billing & Refunds</option>
                            <option value="HOSTEL">Hostel Safety</option>
                            <option value="TRANSPORT">Bus Timing Delays</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Priority</label>
                          <select className="form-input">
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High Urgent</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Describe Concern</label>
                        <textarea className="form-input" rows={3} value={concernText} onChange={(e) => setConcernText(e.target.value)} placeholder="Provide detailed remarks..." required />
                      </div>
                      <button type="submit" className="btn btn-primary">File Concern</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div onClick={() => setViewingDoc('RECEIPT')} className="glass-panel" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border-glass)', transition: 'transform 0.2s' }}>
                  <span style={{ fontSize: '2rem' }}>🧾</span>
                  <strong style={{ display: 'block', margin: '12px 0 4px', fontSize: '0.9rem' }}>Tuition Fee Receipt</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receipt code: TXN-811</span>
                </div>
                <div onClick={() => setViewingDoc('HALL_TICKET')} className="glass-panel" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border-glass)', transition: 'transform 0.2s' }}>
                  <span style={{ fontSize: '2rem' }}>🎫</span>
                  <strong style={{ display: 'block', margin: '12px 0 4px', fontSize: '0.9rem' }}>Hall Ticket</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sem 6 Examinations</span>
                </div>
                <div onClick={() => setViewingDoc('MARKSHEET')} className="glass-panel" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border-glass)', transition: 'transform 0.2s' }}>
                  <span style={{ fontSize: '2rem' }}>📄</span>
                  <strong style={{ display: 'block', margin: '12px 0 4px', fontSize: '0.9rem' }}>Semester 5 Marksheet</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GPA: 8.60 (Verified)</span>
                </div>
                <div onClick={() => setViewingDoc('BONAFIDE')} className="glass-panel" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border-glass)', transition: 'transform 0.2s' }}>
                  <span style={{ fontSize: '2rem' }}>📜</span>
                  <strong style={{ display: 'block', margin: '12px 0 4px', fontSize: '0.9rem' }}>Bonafide Certificate</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Official Registrar Seal</span>
                </div>
                <div onClick={() => setViewingDoc('ID_CARD')} className="glass-panel" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border-glass)', transition: 'transform 0.2s' }}>
                  <span style={{ fontSize: '2rem' }}>🪪</span>
                  <strong style={{ display: 'block', margin: '12px 0 4px', fontSize: '0.9rem' }}>Student ID Card</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Alex Carter (STU001)</span>
                </div>
              </div>

              {/* Document Modal View */}
              {viewingDoc && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div className="glass-panel" style={{ width: '90%', maxWidth: '550px', padding: '30px', border: '1px solid var(--accent-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                      <strong style={{ fontSize: '1.15rem' }}>📄 Digital Document Viewer</strong>
                      <button onClick={() => setViewingDoc(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                    </div>

                    <div style={{ padding: '20px', background: '#000', border: '1px solid var(--border-glass)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#10b981', lineHeight: '1.5', minHeight: '200px' }}>
                      {viewingDoc === 'RECEIPT' && (
                        <div>
                          <div>=================================================</div>
                          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>CAMPUS PILOT FEES RECEIPT</div>
                          <div>=================================================</div>
                          <div>Transaction ID : TXN-811</div>
                          <div>Paid By        : Mr. Robert Carter</div>
                          <div>Student Name    : Alex Carter (STU001)</div>
                          <div>Course          : B.Tech CSE (Semester 6)</div>
                          <div>Fee Category   : Tuition Fee (Installment 1)</div>
                          <div>Amount Settled : $4,000.00</div>
                          <div>Status         : TRANSACTION SUCCESSFUL</div>
                          <div>=================================================</div>
                          <div style={{ textAlign: 'center' }}>[ OFFICIAL REGISTRY REVENUE STAMP ]</div>
                        </div>
                      )}
                      {viewingDoc === 'HALL_TICKET' && (
                        <div>
                          <div>=================================================</div>
                          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>ADMIT CARD / HALL TICKET</div>
                          <div>=================================================</div>
                          <div>Roll Number    : STU001</div>
                          <div>Candidate Name  : Alex Carter</div>
                          <div>Department    : Computer Science (CSE)</div>
                          <div>Semester      : 6th Semester End Exams</div>
                          <div>Approved Exams:</div>
                          <div> - CS-301: Software Engineering (June 05, 9 AM)</div>
                          <div> - CS-302: Database Systems     (June 08, 9 AM)</div>
                          <div> - CS-303: Computer Networks    (June 10, 2 PM)</div>
                          <div>=================================================</div>
                          <div style={{ textAlign: 'center', color: 'var(--accent-warning)' }}>● ALL DUES CLEAR - PROCTOR CLEARANCE VERIFIED</div>
                        </div>
                      )}
                      {viewingDoc === 'MARKSHEET' && (
                        <div>
                          <div>=================================================</div>
                          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>SEMESTER 5 STATEMENT OF MARKS</div>
                          <div>=================================================</div>
                          <div>Student: Alex Carter | Code: STU001</div>
                          <div>-------------------------------------------------</div>
                          <div>Subject Code & Name            Grade   Credits</div>
                          <div>-------------------------------------------------</div>
                          <div>CS-251: Operating Systems        A        4</div>
                          <div>CS-252: Compiler Design          A-       4</div>
                          <div>CS-253: Artificial Intell         O        3</div>
                          <div>CS-254: Stats & Algebra           B+       3</div>
                          <div>-------------------------------------------------</div>
                          <div>Cumulative GPA: 8.60 / 10.0</div>
                          <div>Result Classification: FIRST CLASS WITH DISTINCTION</div>
                        </div>
                      )}
                      {viewingDoc === 'BONAFIDE' && (
                        <div>
                          <div>=================================================</div>
                          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>BONAFIDE RESIDENT STUDENT CERTIFICATE</div>
                          <div>=================================================</div>
                          <div>Date: May 19, 2026</div>
                          <br />
                          <div>This is to certify that Alex Carter (STU001) son of</div>
                          <div>Mr. Robert Carter is a bonafide student of Computer</div>
                          <div>Science Engineering department at Campus Pilot Academy.</div>
                          <div>He is currently studying in the 6th semester of B.Tech.</div>
                          <br />
                          <div>This certificate is issued to verify hostel residency.</div>
                          <div>=================================================</div>
                          <div style={{ textAlign: 'center' }}>[ SIGNED BY REGISTRAR OFFICE DEAN ]</div>
                        </div>
                      )}
                      {viewingDoc === 'ID_CARD' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #10b981', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', color: '#fff' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>CAMPUS PILOT UNIVERSITY</span>
                          <span style={{ fontSize: '2rem', margin: '10px 0' }}>🪪</span>
                          <strong>Alex Carter</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>STU001 | B.Tech CSE</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-success)', marginTop: '6px' }}>EXPIRY: JUN 2028</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button onClick={() => {
                        alert('Document download initiated to Local Storage!');
                      }} className="btn btn-primary" style={{ flex: 1 }}>Download PDF Copy</button>
                      <button onClick={() => setViewingDoc(null)} className="btn btn-secondary" style={{ flex: 1 }}>Close Vault</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ParentPortal() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Campus Pilot Parent Portal...</p>
      </div>
    }>
      <ParentPortalContent />
    </Suspense>
  );
}
