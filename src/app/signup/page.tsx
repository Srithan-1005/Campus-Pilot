'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../landing.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Student specific
  const [studentCode, setStudentCode] = useState('');
  const [courseId, setCourseId] = useState('B.Tech');
  const [departmentId, setDepartmentId] = useState('cse-dept-id');

  // Parent specific
  const [relationship, setRelationship] = useState('FATHER');
  const [occupation, setOccupation] = useState('');
  const [linkedStudentId, setLinkedStudentId] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate role
      if (role !== 'STUDENT' && role !== 'PARENT') {
        throw new Error('Only Student or Parent accounts can be created publicly.');
      }

      // Check fields
      if (!email || !password || !fullName) {
        throw new Error('Please fill in all required credentials.');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const payload: any = {
        email,
        phone,
        password,
        fullName,
        role,
        status: 'ACTIVE'
      };

      if (role === 'STUDENT') {
        payload.studentCode = studentCode || `STU-${Math.floor(1000 + Math.random() * 9000)}`;
        payload.courseId = courseId;
        payload.departmentId = departmentId;
      } else if (role === 'PARENT') {
        payload.relationship = relationship;
        payload.occupation = occupation;
        payload.linkedStudentId = linkedStudentId;
      }

      // Prohibit normal users from creating Admin or Teacher accounts
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.backgroundGlows}>
        <div className={styles.glowPrimary}></div>
        <div className={styles.glowSecondary}></div>
      </div>

      <div className={`${styles.loginCard} glass-panel animate-fade-in`} style={{ maxWidth: '480px' }}>
        <div className={styles.header}>
          <div className={styles.logo}>🧭</div>
          <h1>Create Account</h1>
          <p>Join Campus Pilot platform</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && (
          <div className="badge badge-success" style={{ display: 'block', padding: '12px', textAlign: 'center', marginBottom: '16px' }}>
            Account registered successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Alex Carter"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Campus Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent / Guardian</option>
            </select>
          </div>

          {role === 'STUDENT' && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="STU001"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select className="form-input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MBA">MBA</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-input" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                    <option value="cse-dept-id">Computer Science (CSE)</option>
                    <option value="ece-dept-id">Electronics (ECE)</option>
                    <option value="me-dept-id">Mechanical (ME)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {role === 'PARENT' && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <select className="form-input" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
                  <option value="FATHER">Father</option>
                  <option value="MOTHER">Mother</option>
                  <option value="GUARDIAN">Guardian</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Engineer"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Linked Student ID Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="STU001"
                    value={linkedStudentId}
                    onChange={(e) => setLinkedStudentId(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Choose Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account? <span onClick={() => router.push('/')} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }}>Log In</span>
        </div>
      </div>
    </main>
  );
}
