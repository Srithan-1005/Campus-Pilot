'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../student/portal.module.css';

export default function TeacherPortal() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roster');

  // Attendance states
  const [selectedStudentForAttendance, setSelectedStudentForAttendance] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState('PRESENT');
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);

  // Grade state
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState('');
  const [subject, setSubject] = useState('CS-301');
  const [grade, setGrade] = useState('A');
  const [gradeSuccess, setGradeSuccess] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== 'TEACHER' && user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    setTeacher(user);

    // Fetch student directory list
    fetch('/api/v1/admin/users?role=STUDENT')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudents(data.users);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttendanceSuccess(false);
    
    // Call the attendance update API
    const res = await fetch('/api/v1/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: selectedStudentForAttendance,
        date: attendanceDate,
        status: attendanceStatus,
        subjectId: subject,
        subjectName: 'Software Engineering'
      })
    });

    if (res.ok) {
      setAttendanceSuccess(true);
      setTimeout(() => setAttendanceSuccess(false), 3000);
    }
  };

  const handlePublishGrade = (e: React.FormEvent) => {
    e.preventDefault();
    setGradeSuccess(true);
    alert(`Grade ${grade} assigned to student code ${selectedStudentForGrade}`);
    setTimeout(() => setGradeSuccess(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    fetch('/api/v1/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading Faculty Portal...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={styles.avatar}>👩‍🏫</div>
          <div>
            <h1 className={styles.welcomeText}>Faculty Console: {teacher?.fullName || 'Dr. Jenkins'}</h1>
            <p className={styles.subtitle}>Department of Computer Science & Engineering</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
          Logout
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px', marginTop: '24px' }}>
        <aside className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', height: 'fit-content' }}>
          <button onClick={() => setActiveTab('roster')} className={`${styles.navButton} ${activeTab === 'roster' ? styles.navActive : ''}`}>
            👨‍🎓 My Assigned Students
          </button>
          <button onClick={() => setActiveTab('attendance')} className={`${styles.navButton} ${activeTab === 'attendance' ? styles.navActive : ''}`}>
            📝 Attendance Roll Call
          </button>
          <button onClick={() => setActiveTab('grades')} className={`${styles.navButton} ${activeTab === 'grades' ? styles.navActive : ''}`}>
            📊 Gradebook Manager
          </button>
        </aside>

        <main className="glass-panel" style={{ padding: '24px' }}>
          {activeTab === 'roster' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Student Registry</h2>
              <table className={styles.gradesTable || ''} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '12px' }}>Code</th>
                    <th style={{ padding: '12px' }}>Student Name</th>
                    <th style={{ padding: '12px' }}>Course</th>
                    <th style={{ padding: '12px' }}>Semester</th>
                    <th style={{ padding: '12px' }}>Attendance</th>
                    <th style={{ padding: '12px' }}>CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{s.studentProfile?.studentCode || 'STU001'}</td>
                      <td style={{ padding: '12px' }}>{s.fullName}</td>
                      <td style={{ padding: '12px' }}>{s.studentProfile?.courseId || 'B.Tech'}</td>
                      <td style={{ padding: '12px' }}>Sem {s.studentProfile?.currentSemester || 1}</td>
                      <td style={{ padding: '12px', color: (s.studentProfile?.attendanceRate || 85) < 75 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                        {s.studentProfile?.attendanceRate || 92}%
                      </td>
                      <td style={{ padding: '12px' }}>{s.studentProfile?.cgpa || 8.5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div style={{ maxWidth: '500px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Record Attendance</h2>
              {attendanceSuccess && (
                <div className="badge badge-success" style={{ display: 'block', padding: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  Attendance roll call marked successfully!
                </div>
              )}
              <form onSubmit={handleAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Student</label>
                  <select className="form-input" value={selectedStudentForAttendance} onChange={(e) => setSelectedStudentForAttendance(e.target.value)} required>
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.studentProfile?.id}>{s.fullName} ({s.studentProfile?.studentCode})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={attendanceStatus} onChange={(e) => setAttendanceStatus(e.target.value)}>
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="LATE">LATE</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Mark Attendance
                </button>
              </form>
            </div>
          )}

          {activeTab === 'grades' && (
            <div style={{ maxWidth: '500px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Assign Grades</h2>
              {gradeSuccess && (
                <div className="badge badge-success" style={{ display: 'block', padding: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  Grade published to student transcript!
                </div>
              )}
              <form onSubmit={handlePublishGrade} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Student</label>
                  <select className="form-input" value={selectedStudentForGrade} onChange={(e) => setSelectedStudentForGrade(e.target.value)} required>
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.studentProfile?.studentCode}>{s.fullName} ({s.studentProfile?.studentCode})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select className="form-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Publish Grade
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
