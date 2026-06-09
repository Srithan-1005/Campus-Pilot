'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './portal.module.css';

interface Student {
  id: string;
  fullName: string;
  studentCode: string;
  departmentId: string;
  departmentCode: string;
  courseId: string;
  currentSemester: number;
  cgpa: number;
  attendanceRate?: number;
  outstandingFees?: number;
  riskScore?: number;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  student?: {
    fullName: string;
    studentCode: string;
  };
  resolutionNotes?: string;
}

export default function AdminPortal() {
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [selectedCampus, setSelectedCampus] = useState('Main Campus');

  // User & Role-Based Signup states
  const [registryUsers, setRegistryUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState<any>(null);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkImportStatus, setBulkImportStatus] = useState('');
  const [userManagementSubTab, setUserManagementSubTab] = useState<'list' | 'add' | 'rbac' | 'bulk'>('list');
  
  // Roles & Permissions states
  const [roles, setRoles] = useState<any[]>([
    { id: 'role-sa', name: 'SUPER_ADMIN', description: 'System-wide owner with complete permissions' },
    { id: 'role-ad', name: 'ADMIN', description: 'Institutional administrative manager' },
    { id: 'role-tr', name: 'TEACHER', description: 'Academic instructor and grader' },
    { id: 'role-st', name: 'STUDENT', description: 'Campus attendee and service consumer' },
    { id: 'role-pt', name: 'PARENT', description: 'Student guardian' },
  ]);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<any>(null);
  const [rolePermissionsList, setRolePermissionsList] = useState<any[]>([
    { id: 'p1', name: 'CREATE_USER', module: 'USERS', action: 'CREATE' },
    { id: 'p2', name: 'EDIT_USER', module: 'USERS', action: 'EDIT' },
    { id: 'p3', name: 'DELETE_USER', module: 'USERS', action: 'DELETE' },
    { id: 'p4', name: 'MANAGE_FINANCE', module: 'FINANCE', action: 'MANAGE' },
    { id: 'p5', name: 'OVERRIDE_ATTENDANCE', module: 'ACADEMICS', action: 'WRITE' },
    { id: 'p6', name: 'PUBLISH_GRADES', module: 'ACADEMICS', action: 'PUBLISH' },
  ]);
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<string[]>([]);

  // User form states
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'STUDENT',
    status: 'ACTIVE',
    studentCode: '',
    departmentId: 'cse-dept-id',
    courseId: 'B.Tech',
    currentSemester: 1,
    section: 'A',
    admissionYear: 2023,
    guardianName: '',
    guardianPhone: '',
    employeeId: '',
    designation: 'Lecturer',
    subjectsAssigned: '',
    roleTitle: 'Staff',
    department: 'Administration',
    permissionsJson: '[]',
    linkedStudentId: '',
    relationship: 'GUARDIAN',
    occupation: ''
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Approvals & Tasks state
  const [approvals, setApprovals] = useState<any[]>([
    { id: '1', type: 'LEAVE', studentName: 'Alex Carter', studentCode: 'STU001', details: 'Medical Leave - 3 days due to fever recovery.', status: 'PENDING', date: 'May 18, 2026' },
    { id: '2', type: 'HOSTEL', studentName: 'Noah Centineo', studentCode: 'STU005', details: 'Room Shift Request: Block B-302 to Block A-104.', status: 'PENDING', date: 'May 17, 2026' },
    { id: '3', type: 'SCHOLARSHIP', studentName: 'Emma Watson', studentCode: 'STU002', details: 'Merit-Cum-Means Scholarship Application (Sem 4).', status: 'PENDING', date: 'May 16, 2026' },
    { id: '4', type: 'DOCUMENT', studentName: 'Liam Neeson', studentCode: 'STU003', details: 'Official Transcript Request for Internship.', status: 'PENDING', date: 'May 15, 2026' },
    { id: '5', type: 'EVENT', studentName: 'Sophia Loren', studentCode: 'STU004', details: 'Campus Coding Club Hackathon Approval.', status: 'PENDING', date: 'May 14, 2026' },
    { id: '6', type: 'REFUND', studentName: 'Olivia Rodrigo', studentCode: 'STU006', details: 'Library Security Deposit Refund Request.', status: 'PENDING', date: 'May 13, 2026' },
  ]);

  // Audit Logs & Security state
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 1, action: 'ADMIN_LOGIN', user: 'admin@campus.edu', status: 'SUCCESS', details: 'Login successful from IP 192.168.1.100', timestamp: 'May 19, 2026 10:15 AM' },
    { id: 2, action: 'ADMIN_LOGIN', user: 'admin@campus.edu', status: 'FAILED', details: 'Failed login attempt. Invalid password credentials.', timestamp: 'May 19, 2026 09:30 AM' },
    { id: 3, action: 'ATTENDANCE_OVERRIDE', user: 'admin@campus.edu', status: 'SUCCESS', details: 'Overrode attendance for STU001 to PRESENT (May 14)', timestamp: 'May 18, 2026 04:45 PM' },
    { id: 4, action: 'CRITICAL_DATA_CHANGE', user: 'admin@campus.edu', status: 'SUCCESS', details: 'Modified tuition fee assignment model for Sem-6.', timestamp: 'May 17, 2026 02:15 PM' },
    { id: 5, action: 'ROLE_CHANGE', user: 'admin@campus.edu', status: 'SUCCESS', details: 'Assigned Senior Evaluator role to Prof. Miller.', timestamp: 'May 16, 2026 11:00 AM' },
    { id: 6, action: 'SUSPICIOUS_ACTIVITY', user: 'SYSTEM_MONITOR', status: 'ALERT', details: 'High rate of tab-switching events logged for STU002 during exam.', timestamp: 'May 15, 2026 03:22 PM' },
  ]);

  // Live activity feed state
  const [liveActivities, setLiveActivities] = useState<any[]>([
    { id: 1, type: 'PAYMENT', message: 'Alex Carter paid Tuition Fee instalment of $4,000.', time: 'Just now' },
    { id: 2, type: 'COMPLAINT', message: 'Emma Watson raised support ticket: "Hostel Wi-Fi down".', time: '10 mins ago' },
    { id: 3, type: 'ATTENDANCE', message: 'Attendance marked for CSE Section A (34 present).', time: '45 mins ago' },
    { id: 4, type: 'LIBRARY', message: 'Liam Neeson issued "Clean Code" by Robert C. Martin.', time: '2 hrs ago' },
    { id: 5, type: 'EVENT', message: 'Sophia Loren registered for the Annual Science Fair.', time: '4 hrs ago' },
    { id: 6, type: 'CANTEEN', message: 'Noah Centineo placed order: Paneer Pizza, Coke.', time: '5 hrs ago' }
  ]);

  // Smart Admin Actions states
  const [adminAction, setAdminAction] = useState<string>('NONE');
  const [actionAnnouncement, setActionAnnouncement] = useState('');
  const [actionFeeCode, setActionFeeCode] = useState('STU001');
  const [actionFeeAmount, setActionFeeAmount] = useState('500');
  const [actionResultCode, setActionResultCode] = useState('STU001');
  const [actionResultSubj, setActionResultSubj] = useState('CS-301');
  const [actionResultGrade, setActionResultGrade] = useState('A');
  const [actionEventTitle, setActionEventTitle] = useState('');
  const [exportCategory, setExportCategory] = useState('ATTENDANCE');
  const [exportFormat, setExportFormat] = useState('CSV');
  const [exportSuccess, setExportSuccess] = useState(false);

  // Dashboard state loaded from API
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Student directory states
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);

  // Add new student states
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentDept, setNewStudentDept] = useState('');
  const [newStudentCourse, setNewStudentCourse] = useState('');
  const [newStudentSem, setNewStudentSem] = useState(1);
  const [newStudentCgpa, setNewStudentCgpa] = useState(8.0);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentSuccessMsg, setStudentSuccessMsg] = useState('');

  // Support ticket resolver states
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [ticketResolveSuccess, setTicketResolveSuccess] = useState(false);

  // Academic override states
  const [selectedStudentForAttendance, setSelectedStudentForAttendance] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState('CS-301');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState('PRESENT');
  const [attendanceOverrideSuccess, setAttendanceOverrideSuccess] = useState(false);

  // Operations service states
  const [canteenOrders, setCanteenOrders] = useState<any[]>([]);
  const [libraryRequests, setLibraryRequests] = useState<any[]>([]);
  const [transportRoutes, setTransportRoutes] = useState<any[]>([]);

  // Fetch all administration payloads
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin-dashboard/overview');
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data);
      }

      // Fetch support tickets
      const resTickets = await fetch('/api/v1/tickets');
      const dataTickets = await resTickets.json();
      if (resTickets.ok) {
        setTickets(dataTickets.tickets);
        if (dataTickets.tickets.length > 0 && !selectedTicket) {
          setSelectedTicket(dataTickets.tickets[0]);
        }
      }

      // Fetch student directory data
      // For simplicity, query profiles from backend
      // We can fetch from a mock endpoint or reuse dashboard risk data
      const resStuds = await fetch('/api/v1/student-dashboard/overview'); // trigger stub
      const dataStuds = await resStuds.json();
      
      // Let's query SQLite db directly via an inline call or fetch departments
      // Actually we will write a generic student fetch inside this API.
      // For evaluation, let's load all students with risk status.
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/v1/admin-dashboard/overview');
      const data = await res.json();
      // Calculate risk/attendance for all seeded students
      // We'll populate students state
      const resAll = await fetch('/api/v1/tickets'); // dummy to hit client
      // Let's simulate student load from seed:
      // We can generate student profiles based on dashboardData.atRiskStudents or make a simple API query
    } catch (err) {
      console.error(err);
    }
  };

  // Load operations data
  const fetchOperationsData = async () => {
    try {
      // Canteen Orders
      const resCanteen = await fetch('/api/v1/services?type=canteen&studentId='); // Admin canteen order fetch
      // Since type=canteen returns menu without studentId, we'll fetch from custom admin
      // For simplicity, we can fetch all canteen orders
      // In student portal canteen orders are seeded. We can load active orders.
      // Let's populate mock orders list for admin canteen operations
      
      // Transport Routes
      const resTransport = await fetch('/api/v1/services?type=transport');
      const dataTransport = await resTransport.json();
      if (resTransport.ok) setTransportRoutes(dataTransport.routes);

      // Library requests
      const resLib = await fetch('/api/v1/services?type=library&studentId='); // fetch catalog
      // Library requests can be derived or we can seed
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRegistryUsers = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (userSearchQuery) queryParams.append('search', userSearchQuery);
      if (userRoleFilter) queryParams.append('role', userRoleFilter);
      if (userStatusFilter) queryParams.append('status', userStatusFilter);

      const res = await fetch(`/api/v1/admin/users?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRegistryUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching registry users:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.role === 'ADMIN' || userForm.role === 'SUPER_ADMIN') {
      if (currentUser?.role !== 'SUPER_ADMIN') {
        alert('Permission Denied: Only Super Admins can create Admin or Super Admin accounts.');
        return;
      }
    }
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create user');
        return;
      }
      alert('User created successfully!');
      // Reset form
      setUserForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'STUDENT',
        status: 'ACTIVE',
        studentCode: '',
        departmentId: 'cse-dept-id',
        courseId: 'B.Tech',
        currentSemester: 1,
        section: 'A',
        admissionYear: 2023,
        guardianName: '',
        guardianPhone: '',
        employeeId: '',
        designation: 'Lecturer',
        subjectsAssigned: '',
        roleTitle: 'Staff',
        department: 'Administration',
        permissionsJson: '[]',
        linkedStudentId: '',
        relationship: 'GUARDIAN',
        occupation: ''
      });
      fetchRegistryUsers();
      setUserManagementSubTab('list');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditUser) return;
    if (userForm.role === 'ADMIN' || userForm.role === 'SUPER_ADMIN' || selectedEditUser.role === 'ADMIN' || selectedEditUser.role === 'SUPER_ADMIN') {
      if (currentUser?.role !== 'SUPER_ADMIN') {
        alert('Permission Denied: Only Super Admins can modify Admin or Super Admin accounts.');
        return;
      }
    }
    if (selectedEditUser.id === currentUser?.id && userForm.role !== selectedEditUser.role) {
      alert('Permission Denied: You cannot modify your own role category.');
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/users/${selectedEditUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update user');
        return;
      }
      alert('User updated successfully!');
      setShowEditUserModal(false);
      setSelectedEditUser(null);
      fetchRegistryUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSoftDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to soft-delete this user?')) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('User soft-deleted successfully.');
        fetchRegistryUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/restore`, {
        method: 'PATCH'
      });
      if (res.ok) {
        alert('User account restored successfully.');
        fetchRegistryUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to restore user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        alert(`Status updated to ${newStatus}`);
        fetchRegistryUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkImportStatus('Processing...');
    try {
      const lines = bulkCsvText.split('\n');
      if (lines.length <= 1) {
        alert('Please paste CSV content with header and rows.');
        setBulkImportStatus('');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const parsedUsers = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const columns = lines[i].split(',').map(c => c.trim());
        const userObj: any = {};
        headers.forEach((header, index) => {
          userObj[header] = columns[index];
        });
        parsedUsers.push(userObj);
      }

      const res = await fetch('/api/v1/admin/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: parsedUsers })
      });
      const data = await res.json();
      if (res.ok) {
        setBulkImportStatus(`Success! Imported: ${data.importedCount} users. Errors: ${data.errors.length}`);
        fetchRegistryUsers();
      } else {
        setBulkImportStatus(`Failed: ${data.error}`);
      }
    } catch (err) {
      setBulkImportStatus('Failed to process bulk import.');
    }
  };

  const startEditUser = (user: any) => {
    setSelectedEditUser(user);
    setUserForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '', // Keep blank for no password change
      role: user.role || 'STUDENT',
      status: user.status || 'ACTIVE',
      studentCode: user.studentProfile?.studentCode || '',
      departmentId: user.studentProfile?.departmentId || 'cse-dept-id',
      courseId: user.studentProfile?.courseId || 'B.Tech',
      currentSemester: user.studentProfile?.currentSemester || 1,
      section: user.studentProfile?.section || 'A',
      admissionYear: user.studentProfile?.admissionYear || 2023,
      guardianName: user.studentProfile?.guardianName || '',
      guardianPhone: user.studentProfile?.guardianPhone || '',
      employeeId: user.teacherProfile?.employeeId || user.adminProfile?.employeeId || '',
      designation: user.teacherProfile?.designation || user.adminProfile?.designation || 'Lecturer',
      subjectsAssigned: user.teacherProfile?.subjectsAssigned || '',
      roleTitle: user.adminProfile?.roleTitle || 'Staff',
      department: user.adminProfile?.department || 'Administration',
      permissionsJson: user.adminProfile?.permissionsJson || '[]',
      linkedStudentId: user.parentProfile?.linkedStudentId || '',
      relationship: user.parentProfile?.relationship || 'GUARDIAN',
      occupation: user.parentProfile?.occupation || ''
    });
    setShowEditUserModal(true);
  };

  const handleSelectRole = async (role: any) => {
    setSelectedRoleForPermissions(role);
    const defaultPermissionMapping: Record<string, string[]> = {
      'SUPER_ADMIN': ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
      'ADMIN': ['p1', 'p2', 'p4', 'p5'],
      'TEACHER': ['p5', 'p6'],
      'STUDENT': [],
      'PARENT': [],
    };
    setAssignedPermissionIds(defaultPermissionMapping[role.name] || []);
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleForPermissions) return;
    try {
      const res = await fetch(`/api/v1/admin/roles/${selectedRoleForPermissions.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: assignedPermissionIds })
      });
      if (res.ok) {
        alert('Role permissions saved successfully!');
      } else {
        alert('Failed to save permissions');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'userManagement') {
      fetchRegistryUsers();
    }
  }, [activeTab, userSearchQuery, userRoleFilter, userStatusFilter]);

  useEffect(() => {
    fetchDashboardData();
    fetchOperationsData();
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Sync students directory search
  useEffect(() => {
    if (dashboardData && dashboardData.atRiskStudents) {
      // Use students from dashboard + add mock directory list
      const studentsList = [
        { id: '1', fullName: 'Alex Carter', studentCode: 'STU001', departmentId: '1', departmentCode: 'CSE', courseId: 'B.Tech CSE', currentSemester: 6, cgpa: 8.4, attendanceRate: 85, outstandingFees: 8000, riskScore: 25 },
        { id: '2', fullName: 'Emma Watson', studentCode: 'STU002', departmentId: '2', departmentCode: 'ECE', courseId: 'B.Tech ECE', currentSemester: 4, cgpa: 6.8, attendanceRate: 52, outstandingFees: 12000, riskScore: 68 },
        { id: '3', fullName: 'Liam Neeson', studentCode: 'STU003', departmentId: '3', departmentCode: 'ME', courseId: 'B.Tech ME', currentSemester: 2, cgpa: 7.2, attendanceRate: 88, outstandingFees: 0, riskScore: 5 },
        { id: '4', fullName: 'Sophia Loren', studentCode: 'STU004', departmentId: '1', departmentCode: 'CSE', courseId: 'B.Tech CSE', currentSemester: 8, cgpa: 9.1, attendanceRate: 95, outstandingFees: 0, riskScore: 0 },
        { id: '5', fullName: 'Noah Centineo', studentCode: 'STU005', departmentId: '2', departmentCode: 'ECE', courseId: 'B.Tech ECE', currentSemester: 6, cgpa: 5.9, attendanceRate: 61, outstandingFees: 3500, riskScore: 48 },
        { id: '6', fullName: 'Olivia Rodrigo', studentCode: 'STU006', departmentId: '3', departmentCode: 'ME', courseId: 'B.Tech ME', currentSemester: 4, cgpa: 8.1, attendanceRate: 78, outstandingFees: 0, riskScore: 12 },
        { id: '10', fullName: 'Benjamin Franklin', studentCode: 'STU010', departmentId: '1', departmentCode: 'CSE', courseId: 'B.Tech CSE', currentSemester: 6, cgpa: 6.2, attendanceRate: 45, outstandingFees: 12000, riskScore: 82 },
      ];
      setStudents(studentsList);
      setFilteredStudents(studentsList);

      const uniqueDepts = Array.from(new Set(studentsList.map(s => s.departmentCode)));
      setDepartments(uniqueDepts);
    }
  }, [dashboardData]);

  // Handle Search & Filtering
  useEffect(() => {
    let result = students;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(q) || s.studentCode.toLowerCase().includes(q)
      );
    }
    if (deptFilter) {
      result = result.filter(s => s.departmentCode === deptFilter);
    }
    setFilteredStudents(result);
  }, [searchQuery, deptFilter, students]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  // Submit Support Ticket resolution
  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const res = await fetch('/api/v1/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: resolutionStatus,
          resolutionNotes
        })
      });

      if (res.ok) {
        setTicketResolveSuccess(true);
        setResolutionNotes('');
        
        // Reload tickets
        const resTickets = await fetch('/api/v1/tickets');
        const dataTickets = await resTickets.json();
        if (resTickets.ok) {
          setTickets(dataTickets.tickets);
          const updated = dataTickets.tickets.find((t: any) => t.id === selectedTicket.id);
          setSelectedTicket(updated || null);
        }

        // Reload dashboard
        const resDash = await fetch('/api/v1/admin-dashboard/overview');
        const dataDash = await resDash.json();
        if (resDash.ok) setDashboardData(dataDash);

        setTimeout(() => setTicketResolveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Override attendance in DB
  const handleAttendanceOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForAttendance) return;

    try {
      const res = await fetch('/api/v1/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentForAttendance,
          date: attendanceDate,
          status: attendanceStatus,
          subjectId: selectedSubject,
          subjectName: selectedSubject === 'CS-301' ? 'Software Engineering' : selectedSubject === 'CS-302' ? 'Database Systems' : 'Computer Networks'
        })
      });

      if (res.ok) {
        setAttendanceOverrideSuccess(true);
        // Refresh dashboard data
        const resDash = await fetch('/api/v1/admin-dashboard/overview');
        const dataDash = await resDash.json();
        if (resDash.ok) setDashboardData(dataDash);

        setTimeout(() => setAttendanceOverrideSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle route bus delay state
  const handleToggleBusDelay = (routeId: string, currentStatus: string) => {
    const updatedRoutes = transportRoutes.map(r => {
      if (r.id === routeId) {
        const isDelayed = currentStatus === 'ON_TIME';
        return {
          ...r,
          status: isDelayed ? 'DELAYED' : 'ON_TIME',
          delayMinutes: isDelayed ? 15 : 0
        };
      }
      return r;
    });
    setTransportRoutes(updatedRoutes);
  };

  if (loading || !dashboardData) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Campus Pilot Institutional Admin Portal...</p>
      </div>
    );
  }

  const { kpis, atRiskStudents, supportStats, monthlyRevenue, serviceHealth } = dashboardData;

  const displayKpis = {
    totalStudents: selectedCampus === 'Downtown Campus' 
      ? Math.round(kpis.totalStudents * 0.4) 
      : selectedCampus === 'West Valley Research Center' 
      ? Math.round(kpis.totalStudents * 0.15) 
      : kpis.totalStudents,
    activeStaff: selectedCampus === 'Downtown Campus' 
      ? 6 
      : selectedCampus === 'West Valley Research Center' 
      ? 3 
      : kpis.activeStaff,
    overallAttendanceRate: selectedCampus === 'Downtown Campus' 
      ? 82 
      : selectedCampus === 'West Valley Research Center' 
      ? 91 
      : kpis.overallAttendanceRate,
    totalOutstandingFees: selectedCampus === 'Downtown Campus' 
      ? Math.round(kpis.totalOutstandingFees * 0.35) 
      : selectedCampus === 'West Valley Research Center' 
      ? Math.round(kpis.totalOutstandingFees * 0.08) 
      : kpis.totalOutstandingFees,
  };

  const displayServiceHealth = {
    libraryOverdueCount: selectedCampus === 'Downtown Campus' 
      ? Math.round(serviceHealth.libraryOverdueCount * 0.3) 
      : selectedCampus === 'West Valley Research Center' 
      ? 0 
      : serviceHealth.libraryOverdueCount,
    hostelOccupancy: selectedCampus === 'Downtown Campus' 
      ? 64 
      : selectedCampus === 'West Valley Research Center' 
      ? 12 
      : serviceHealth.hostelOccupancy,
    activeTransportBuses: selectedCampus === 'Downtown Campus' 
      ? 3 
      : selectedCampus === 'West Valley Research Center' 
      ? 1 
      : serviceHealth.activeTransportBuses,
  };

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
            {currentUser?.role === 'SUPER_ADMIN' ? '👑' : '👨‍💼'}
          </div>
          <div className={styles.userData}>
            <span className={styles.userName}>{currentUser?.fullName || 'Dr. Sarah Jenkins'}</span>
            <span className={styles.userRole}>{currentUser?.role || 'Registrar Admin (Academic)'}</span>
          </div>
        </div>

        <nav className={styles.sidebarMenu}>
          <div
            onClick={() => setActiveTab('dashboard')}
            className={`${styles.menuItem} ${activeTab === 'dashboard' ? styles.menuItemActive : ''}`}
          >
            📊 Analytics & Risk
          </div>
          <div
            onClick={() => setActiveTab('approvals')}
            className={`${styles.menuItem} ${activeTab === 'approvals' ? styles.menuItemActive : ''}`}
          >
            📋 Approval Center
          </div>
          <div
            onClick={() => setActiveTab('finance')}
            className={`${styles.menuItem} ${activeTab === 'finance' ? styles.menuItemActive : ''}`}
          >
            💰 Finance Console
          </div>
          <div
            onClick={() => setActiveTab('students')}
            className={`${styles.menuItem} ${activeTab === 'students' ? styles.menuItemActive : ''}`}
          >
            👨‍🎓 Student Directory
          </div>
          <div
            onClick={() => setActiveTab('academics')}
            className={`${styles.menuItem} ${activeTab === 'academics' ? styles.menuItemActive : ''}`}
          >
            📚 Attendance Override
          </div>
          <div
            onClick={() => setActiveTab('ticketing')}
            className={`${styles.menuItem} ${activeTab === 'ticketing' ? styles.menuItemActive : ''}`}
          >
            🎫 Grievance Resolver
          </div>
          <div
            onClick={() => setActiveTab('security')}
            className={`${styles.menuItem} ${activeTab === 'security' ? styles.menuItemActive : ''}`}
          >
            🛡️ Audit & Security
          </div>
          <div
            onClick={() => setActiveTab('operations')}
            className={`${styles.menuItem} ${activeTab === 'operations' ? styles.menuItemActive : ''}`}
          >
            🏛️ Campus Operations
          </div>
          <div
            onClick={() => setActiveTab('userManagement')}
            className={`${styles.menuItem} ${activeTab === 'userManagement' ? styles.menuItemActive : ''}`}
          >
            👤 User & RBAC Manager
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
            🚪 Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {activeTab === 'dashboard' ? 'Institutional Insights & Analytics' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + ' Hub'}
          </div>
          <div className={styles.headerActions}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Campus:</span>
              <select 
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-glass)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Main Campus">🏫 Main Campus (HQ)</option>
                <option value="Downtown Campus">🏢 Downtown Campus</option>
                <option value="West Valley Research Center">🧪 West Valley Research Center</option>
              </select>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System status: <strong style={{ color: 'var(--accent-success)' }}>ONLINE</strong></span>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* TAB 1: ANALYTICS & RISK */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Executive KPI Overview (9 Cards) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className={`${styles.kpiCard} glass-panel`} style={{ padding: '16px' }}>
                  <div className={styles.kpiInfo}>
                    <span className={styles.kpiLabel} style={{ fontSize: '0.72rem' }}>Total Students</span>
                    <span className={styles.kpiValue} style={{ fontSize: '1.5rem' }}>{displayKpis.totalStudents}</span>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>👥</span>
                </div>

                <div className={`${styles.kpiCard} glass-panel`} style={{ padding: '16px' }}>
                  <div className={styles.kpiInfo}>
                    <span className={styles.kpiLabel} style={{ fontSize: '0.72rem' }}>Present Today</span>
                    <span className={styles.kpiValue} style={{ fontSize: '1.5rem', color: 'var(--accent-success)' }}>
                      {Math.round(displayKpis.totalStudents * 0.92)}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>✔️</span>
                </div>

                <div className={`${styles.kpiCard} glass-panel`} style={{ padding: '16px' }}>
                  <div className={styles.kpiInfo}>
                    <span className={styles.kpiLabel} style={{ fontSize: '0.72rem' }}>Pending Fees</span>
                    <span className={styles.kpiValue} style={{ fontSize: '1.5rem', color: 'var(--accent-danger)' }}>
                      ${displayKpis.totalOutstandingFees.toLocaleString()}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>💳</span>
                </div>

                <div className={`${styles.kpiCard} glass-panel`} style={{ padding: '16px' }}>
                  <div className={styles.kpiInfo}>
                    <span className={styles.kpiLabel} style={{ fontSize: '0.72rem' }}>Open Complaints</span>
                    <span className={styles.kpiValue} style={{ fontSize: '1.5rem', color: 'var(--accent-warning)' }}>
                      {supportStats?.openTickets || 5}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>⚠️</span>
                </div>

                <div className={`${styles.kpiCard} glass-panel`} style={{ padding: '16px' }}>
                  <div className={styles.kpiInfo}>
                    <span className={styles.kpiLabel} style={{ fontSize: '0.72rem' }}>Upcoming Exams</span>
                    <span className={styles.kpiValue} style={{ fontSize: '1.5rem' }}>3 Active</span>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>🎫</span>
                </div>

                <div className={`${styles.kpiCard} glass-panel`} style={{ padding: '16px' }}>
                  <div className={styles.kpiInfo}>
                    <span className={styles.kpiLabel} style={{ fontSize: '0.72rem' }}>Hostel Occupancy</span>
                    <span className={styles.kpiValue} style={{ fontSize: '1.5rem', color: 'var(--accent-info)' }}>
                      {displayServiceHealth.hostelOccupancy}%
                    </span>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>🏢</span>
                </div>

                <div className={`${styles.kpiCard} glass-panel`} style={{ padding: '16px' }}>
                  <div className={styles.kpiInfo}>
                    <span className={styles.kpiLabel} style={{ fontSize: '0.72rem' }}>Transport Usage</span>
                    <span className={styles.kpiValue} style={{ fontSize: '1.5rem' }}>180 Riders</span>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>🚌</span>
                </div>

                <div className={`${styles.kpiCard} glass-panel`} style={{ padding: '16px' }}>
                  <div className={styles.kpiInfo}>
                    <span className={styles.kpiLabel} style={{ fontSize: '0.72rem' }}>Canteen Orders</span>
                    <span className={styles.kpiValue} style={{ fontSize: '1.5rem' }}>12 Active</span>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>🍔</span>
                </div>

                <div className={`${styles.kpiCard} glass-panel`} style={{ padding: '16px' }}>
                  <div className={styles.kpiInfo}>
                    <span className={styles.kpiLabel} style={{ fontSize: '0.72rem' }}>At-Risk Students</span>
                    <span className={styles.kpiValue} style={{ fontSize: '1.5rem', color: 'var(--accent-danger)' }}>
                      {atRiskStudents.length}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>🚨</span>
                </div>
              </div>

              {/* Main Dashboard Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '24px' }}>
                
                {/* LEFT COLUMN: Risk Scorecard & Smart Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Risk Alert Center */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>🚨 Risk Alert Center & AI Scorecard</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Automated detection telemetry</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {atRiskStudents.map((s: any) => (
                        <div key={s.id} style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-glass)', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                          <div 
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' }}
                            onClick={() => setExpandedStudentId(expandedStudentId === s.id ? null : s.id)}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '0.9rem' }}>{s.fullName}</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({s.studentCode})</span>
                                {expandedStudentId === s.id ? '▲' : '▼'}
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                {s.attendanceRate < 75 && <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Low Attendance</span>}
                                {s.outstandingFees > 5000 && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Pending Fees</span>}
                                {s.cgpa < 7.0 && <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Poor Academics</span>}
                                {s.reasons.includes('Low Engagement') && <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Low Engagement</span>}
                              </div>
                            </div>
                            <div style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              background: s.riskScore > 65 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: s.riskScore > 65 ? 'var(--accent-danger)' : 'var(--accent-warning)',
                              border: `1px solid ${s.riskScore > 65 ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}`
                            }}>
                              Risk: {s.riskScore}%
                            </div>
                          </div>

                          {expandedStudentId === s.id && (
                            <div style={{ padding: '0 16px 16px', borderTop: '1px dashed var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.1)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', fontSize: '0.78rem' }}>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)' }}>Dropout Predictor:</span>{' '}
                                  <strong style={{ color: s.predictions?.dropoutRisk === 'HIGH' ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                                    {s.predictions?.dropoutRisk || 'LOW'}
                                  </strong>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)' }}>Burnout Indicator:</span>{' '}
                                  <strong style={{ color: s.wellness?.burnoutRisk === 'HIGH' ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                                    {s.wellness?.burnoutRisk || 'LOW'}
                                  </strong>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)' }}>Friday Attendance Drop:</span>{' '}
                                  <strong style={{ color: 'var(--accent-warning)' }}>-28% Commuter Drop</strong>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)' }}>Engagement Status:</span>{' '}
                                  <strong>{s.wellness?.lowParticipation ? 'Low Attendance' : 'Active'}</strong>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button onClick={() => alert(`Direct SMS alert dispatched to parents of ${s.fullName} regarding attendance.`)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem', flex: 1 }}>
                                  💬 SMS Alert Parent
                                </button>
                                <button onClick={() => alert(`Counseling meeting scheduled with Dean of Academics for ${s.fullName}.`)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.72rem', flex: 1 }}>
                                  👥 Book Counselor
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Smart Admin Actions */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>⚡ Smart Admin Actions</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                      <button onClick={() => setAdminAction('ANNOUNCEMENT')} className="btn btn-secondary" style={{ padding: '10px 4px', fontSize: '0.76rem', background: adminAction === 'ANNOUNCEMENT' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)' }}>
                        📢 Announcement
                      </button>
                      <button onClick={() => setAdminAction('FEE')} className="btn btn-secondary" style={{ padding: '10px 4px', fontSize: '0.76rem', background: adminAction === 'FEE' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)' }}>
                        💵 Assign Fee
                      </button>
                      <button onClick={() => setAdminAction('RESULT')} className="btn btn-secondary" style={{ padding: '10px 4px', fontSize: '0.76rem', background: adminAction === 'RESULT' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)' }}>
                        🎓 Publish Result
                      </button>
                      <button onClick={() => setAdminAction('EVENT')} className="btn btn-secondary" style={{ padding: '10px 4px', fontSize: '0.76rem', background: adminAction === 'EVENT' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)' }}>
                        📅 Create Event
                      </button>
                      <button onClick={() => {
                        alert('Fast check: Resolved ticket TKT-402 (Hostel Wi-Fi issue). Auto response logged.');
                        setLiveActivities(prev => [{ id: Date.now(), type: 'COMPLAINT', message: 'Admin Sarah resolved ticket TKT-402.', time: 'Just now' }, ...prev]);
                      }} className="btn btn-secondary" style={{ padding: '10px 4px', fontSize: '0.76rem' }}>
                        ✓ Resolve Ticket
                      </button>
                      <button onClick={() => setAdminAction('EXPORT')} className="btn btn-secondary" style={{ padding: '10px 4px', fontSize: '0.76rem', background: adminAction === 'EXPORT' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)' }}>
                        📥 Export Report
                      </button>
                    </div>

                    {/* Inline Form Renders */}
                    {adminAction === 'ANNOUNCEMENT' && (
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                        <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>Send Global Announcement Notification</strong>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" className="form-input" placeholder="Type notice message..." value={actionAnnouncement} onChange={e => setActionAnnouncement(e.target.value)} style={{ fontSize: '0.8rem' }} />
                          <button onClick={() => {
                            if (!actionAnnouncement.trim()) return;
                            alert(`Announcement broadcasted to all Student & Parent feeds: "${actionAnnouncement}"`);
                            setActionAnnouncement('');
                            setAdminAction('NONE');
                          }} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>Send</button>
                        </div>
                      </div>
                    )}

                    {adminAction === 'FEE' && (
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                        <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>Assign Fee Invoice Dues</strong>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <input type="text" className="form-input" placeholder="Student ID" value={actionFeeCode} onChange={e => setActionFeeCode(e.target.value)} style={{ fontSize: '0.8rem' }} />
                          <input type="number" className="form-input" placeholder="Amount ($)" value={actionFeeAmount} onChange={e => setActionFeeAmount(e.target.value)} style={{ fontSize: '0.8rem' }} />
                        </div>
                        <button onClick={() => {
                          alert(`Assigned fee invoice of $${actionFeeAmount} to student ${actionFeeCode}. Parent alert dispatched.`);
                          setLiveActivities(prev => [{ id: Date.now(), type: 'PAYMENT', message: `Fee dues of $${actionFeeAmount} assigned to ${actionFeeCode}.`, time: 'Just now' }, ...prev]);
                          setAdminAction('NONE');
                        }} className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem' }}>Confirm Assignment</button>
                      </div>
                    )}

                    {adminAction === 'RESULT' && (
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                        <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>Publish New Course Grade</strong>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <input type="text" className="form-input" placeholder="Student ID" value={actionResultCode} onChange={e => setActionResultCode(e.target.value)} style={{ fontSize: '0.8rem' }} />
                          <input type="text" className="form-input" placeholder="Subject" value={actionResultSubj} onChange={e => setActionResultSubj(e.target.value)} style={{ fontSize: '0.8rem' }} />
                          <select className="form-input" value={actionResultGrade} onChange={e => setActionResultGrade(e.target.value)} style={{ fontSize: '0.8rem' }}>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                        <button onClick={() => {
                          alert(`Published grade ${actionResultGrade} for ${actionResultSubj} to student ${actionResultCode}.`);
                          setAdminAction('NONE');
                        }} className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem' }}>Publish Result</button>
                      </div>
                    )}

                    {adminAction === 'EVENT' && (
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                        <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>Create Campus Calendar Event</strong>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" className="form-input" placeholder="Event Title (e.g. Science Fair)" value={actionEventTitle} onChange={e => setActionEventTitle(e.target.value)} style={{ fontSize: '0.8rem' }} />
                          <button onClick={() => {
                            if (!actionEventTitle.trim()) return;
                            alert(`Calendar event created: "${actionEventTitle}". Announcement dispatched.`);
                            setLiveActivities(prev => [{ id: Date.now(), type: 'EVENT', message: `New event "${actionEventTitle}" created.`, time: 'Just now' }, ...prev]);
                            setActionEventTitle('');
                            setAdminAction('NONE');
                          }} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>Create</button>
                        </div>
                      </div>
                    )}

                    {adminAction === 'EXPORT' && (
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                        <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>Export Institutional Reports</strong>
                        {exportSuccess ? (
                          <div style={{ color: 'var(--accent-success)', fontSize: '0.8rem', textAlign: 'center', padding: '8px 0' }}>
                            ✓ Report downloaded successfully as {exportFormat}!
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <select className="form-input" value={exportCategory} onChange={e => setExportCategory(e.target.value)} style={{ fontSize: '0.8rem' }}>
                                <option value="ATTENDANCE">Attendance Registers</option>
                                <option value="FEES">Fees & Finance Dues</option>
                                <option value="RESULTS">Exam Result Grids</option>
                                <option value="HOSTEL">Hostel Boarders</option>
                                <option value="TRANSPORT">Transit Route Maps</option>
                                <option value="COMPLAINTS">Support Tickets Logs</option>
                              </select>
                              <select className="form-input" value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{ fontSize: '0.8rem' }}>
                                <option value="CSV">CSV Format</option>
                                <option value="EXCEL">Excel Sheet</option>
                                <option value="PDF">PDF Document</option>
                              </select>
                            </div>
                            <button onClick={() => {
                              setExportSuccess(true);
                              setTimeout(() => {
                                setExportSuccess(false);
                                setAdminAction('NONE');
                              }, 2000);
                            }} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>Download Export</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Department Analytics & Activity Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Department-Wise Analytics */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>📊 Department-Wise Analytics</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Attendance by Dept */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          <span>Attendance Rate by Dept</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', width: '32px' }}>CSE</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ height: '8px', background: 'var(--accent-primary)', width: '85%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>85%</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.72rem', width: '32px' }}>ECE</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ height: '8px', background: 'var(--accent-primary)', width: '78%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>78%</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.72rem', width: '32px' }}>ME</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ height: '8px', background: 'var(--accent-primary)', width: '72%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>72%</span>
                        </div>
                      </div>

                      {/* Fee Collection by Course */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          <span>Fee Collection by Course</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', width: '32px' }}>CSE</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ height: '8px', background: 'var(--accent-success)', width: '90%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>$120K</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.72rem', width: '32px' }}>ECE</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ height: '8px', background: 'var(--accent-success)', width: '65%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>$80K</span>
                        </div>
                      </div>

                      {/* Exam Performance by Sem */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          <span>Exam Performance by Sem (GPA)</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', width: '32px' }}>Sem 1</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ height: '8px', background: 'var(--accent-info)', width: '78%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>7.80</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.72rem', width: '32px' }}>Sem 3</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ height: '8px', background: 'var(--accent-info)', width: '81%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>8.10</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.72rem', width: '32px' }}>Sem 5</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ height: '8px', background: 'var(--accent-info)', width: '84%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>8.40</span>
                        </div>
                      </div>

                      {/* Support Ticket Categories */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          <span>Support Tickets by Category</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', width: '45px' }}>Academic</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ height: '8px', background: 'var(--accent-warning)', width: '65%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>4 open</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.72rem', width: '45px' }}>Billing</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ height: '8px', background: 'var(--accent-warning)', width: '35%', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>2 open</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Activity Feed */}
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>⚡ Real-Time Activity Feed</h3>
                      <button onClick={() => {
                        const activities = [
                          'Hostel Room 302 Outpass requested by Alex Carter.',
                          'Book "Introduction to Algorithms" issued to Emma Watson.',
                          'Canteen order #412 placed: Veg Club Sandwich.',
                          'Event registration: Liam Neeson registered for Chess Club Meet.',
                          'Parent message received from Robert Carter regarding Networks exam.',
                          'Attendance overridden for student STU003 by Registrar.'
                        ];
                        const randomAct = activities[Math.floor(Math.random() * activities.length)];
                        setLiveActivities(prev => [{ id: Date.now(), type: 'FEED', message: randomAct, time: 'Just now' }, ...prev]);
                      }} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', border: 'none' }}>
                        Simulate Event
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                      {liveActivities.map(act => (
                        <div key={act.id} style={{ display: 'flex', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.8rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.25rem' }}>
                            {act.type === 'PAYMENT' ? '💰' : act.type === 'COMPLAINT' ? '⚠️' : act.type === 'ATTENDANCE' ? '📝' : act.type === 'LIBRARY' ? '📚' : act.type === 'EVENT' ? '📅' : '🍔'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, color: 'var(--text-primary)' }}>{act.message}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: APPROVAL CENTER */}
          {activeTab === 'approvals' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>📋 Approval Center</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending leaves, hostel swaps, scholarships, documents, & refunds</span>
                </div>
                <div className={styles.tableContainer}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Student Name</th>
                        <th>ID Code</th>
                        <th>Request Details</th>
                        <th>Submitted Date</th>
                        <th>Status</th>
                        <th>Action Buttons</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.map(req => (
                        <tr key={req.id}>
                          <td>
                            <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>{req.type}</span>
                          </td>
                          <td><strong>{req.studentName}</strong></td>
                          <td>{req.studentCode}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{req.details}</td>
                          <td>{req.date}</td>
                          <td>
                            <span className={`badge badge-${req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'}`} style={{ fontSize: '0.75rem' }}>
                              {req.status}
                            </span>
                          </td>
                          <td>
                            {req.status === 'PENDING' ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => {
                                  setApprovals(prev => prev.map(a => a.id === req.id ? { ...a, status: 'APPROVED' } : a));
                                  setAuditLogs(prev => [{ id: Date.now(), action: 'CRITICAL_DATA_CHANGE', user: 'admin@campus.edu', status: 'SUCCESS', details: `Approved ${req.type} request for ${req.studentCode}`, timestamp: new Date().toLocaleTimeString() }, ...prev]);
                                  setLiveActivities(prev => [{ id: Date.now(), type: 'FEED', message: `Approved ${req.type} request for ${req.studentName}.`, time: 'Just now' }, ...prev]);
                                }} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Approve</button>
                                <button onClick={() => {
                                  setApprovals(prev => prev.map(a => a.id === req.id ? { ...a, status: 'REJECTED' } : a));
                                  setAuditLogs(prev => [{ id: Date.now(), action: 'CRITICAL_DATA_CHANGE', user: 'admin@campus.edu', status: 'SUCCESS', details: `Rejected ${req.type} request for ${req.studentCode}`, timestamp: new Date().toLocaleTimeString() }, ...prev]);
                                }} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: 'none' }}>Reject</button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actioned</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FINANCE DASHBOARD */}
          {activeTab === 'finance' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TODAY'S COLLECTION</span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-success)', marginTop: '4px' }}>$12,450</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>14 transactions</span>
                </div>
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MONTHLY REVENUE</span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)', marginTop: '4px' }}>$142,000</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: $150,000</span>
                </div>
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PENDING DUES</span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-danger)', marginTop: '4px' }}>$44,000</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>12 overdue accounts</span>
                </div>
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SCHOLARSHIP DISBURSED</span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-info)', marginTop: '4px' }}>$25,500</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>18 awardees</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
                {/* Transaction history / Failures */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>⚠️ Transaction Log & Gateway Failures</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '10px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                        <span>Emma Watson (STU002)</span>
                        <span style={{ color: 'var(--accent-danger)' }}>FAILURE</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Amount: $12,000 | Reason: Insufficient Funds (Gateway 302)</div>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '6px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                        <span>Olivia Rodrigo (STU006)</span>
                        <span style={{ color: 'var(--accent-success)' }}>REFUND APPROVED</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Amount: $150 | Library Security Deposit Release</div>
                    </div>
                  </div>
                </div>

                {/* Overdue students list */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>🚨 Overdue Accounts Dues</h4>
                  <div className={styles.tableContainer}>
                    <table className={styles.adminTable} style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Total Outstanding</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: '600' }}>STU001</td>
                          <td>Alex Carter</td>
                          <td style={{ color: 'var(--accent-warning)', fontWeight: '600' }}>$8,000</td>
                          <td><button onClick={() => alert('Dispatched invoice reminder to Mr. Robert Carter')} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Alert Parent</button></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600' }}>STU002</td>
                          <td>Emma Watson</td>
                          <td style={{ color: 'var(--accent-warning)', fontWeight: '600' }}>$12,000</td>
                          <td><button onClick={() => alert('Dispatched invoice reminder to Mrs. Jean Watson')} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Alert Parent</button></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '600' }}>STU010</td>
                          <td>Benjamin Franklin</td>
                          <td style={{ color: 'var(--accent-warning)', fontWeight: '600' }}>$12,000</td>
                          <td><button onClick={() => alert('Dispatched invoice reminder to Mr. Josiah Franklin')} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Alert Parent</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AUDIT & SECURITY PANEL */}
          {activeTab === 'security' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>🛡️ Audit Logs & Security Panel</h3>
                  <span className="badge badge-success" style={{ padding: '4px 10px' }}>IP White-List Guard Active</span>
                </div>
                <div className={styles.tableContainer}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Action Category</th>
                        <th>Operator User</th>
                        <th>Event Description</th>
                        <th>Timestamp</th>
                        <th>Security Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id}>
                          <td>
                            <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>{log.action}</span>
                          </td>
                          <td>{log.user}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.details}</td>
                          <td>{log.timestamp}</td>
                          <td>
                            <span className={`badge badge-${log.status === 'SUCCESS' ? 'success' : log.status === 'FAILED' ? 'danger' : 'warning'}`} style={{ fontSize: '0.75rem' }}>
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
          )}

          {/* TAB 2: STUDENT DIRECTORY */}
          {activeTab === 'students' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>👨‍🎓 Student Directory & Registry</h3>
                </div>

                <div className={styles.directoryFilters}>
                  <input
                    type="text"
                    className="form-input searchBar"
                    placeholder="Search by student name or roll code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select className="form-input" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map((d, di) => (
                      <option key={di} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.tableContainer}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Student Name</th>
                        <th>Dept</th>
                        <th>Course</th>
                        <th>Sem</th>
                        <th>CGPA</th>
                        <th>Attendance</th>
                        <th>Outstanding</th>
                        <th>Risk Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(s => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '600' }}>{s.studentCode}</td>
                          <td style={{ fontWeight: '600' }}>{s.fullName}</td>
                          <td>{s.departmentCode}</td>
                          <td>{s.courseId}</td>
                          <td>Sem {s.currentSemester}</td>
                          <td>{s.cgpa}</td>
                          <td style={{ color: (s.attendanceRate || 0) < 75 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                            {s.attendanceRate}%
                          </td>
                          <td style={{ color: (s.outstandingFees || 0) > 0 ? 'var(--accent-warning)' : 'var(--text-muted)' }}>
                            ${s.outstandingFees?.toLocaleString()}
                          </td>
                          <td>
                            <span className={`badge ${
                              (s.riskScore || 0) > 50 ? 'badge-danger' : (s.riskScore || 0) > 20 ? 'badge-warning' : 'badge-success'
                            }`}>
                              {s.riskScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE OVERRIDE */}
          {activeTab === 'academics' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
              <h3 className={styles.sectionTitle} style={{ marginBottom: '20px' }}>📚 Academic Attendance Override</h3>
              
              {attendanceOverrideSuccess && (
                <div className="badge badge-success" style={{ display: 'block', padding: '12px', textAlign: 'center', marginBottom: '16px', fontSize: '0.85rem' }}>
                  Attendance record successfully registered/overridden!
                </div>
              )}

              <form onSubmit={handleAttendanceOverride}>
                <div className="form-group">
                  <label className="form-label">Select Student</label>
                  <select className="form-input" value={selectedStudentForAttendance} onChange={(e) => setSelectedStudentForAttendance(e.target.value)} required>
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.studentCode})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-input" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="CS-301">CS-301: Software Engineering</option>
                    <option value="CS-302">CS-302: Database Systems</option>
                    <option value="CS-303">CS-303: Computer Networks</option>
                    <option value="CS-304">CS-304: Theory of Computation</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Override Status</label>
                    <select className="form-input" value={attendanceStatus} onChange={(e) => setAttendanceStatus(e.target.value)}>
                      <option value="PRESENT">PRESENT</option>
                      <option value="ABSENT">ABSENT</option>
                      <option value="LATE">LATE</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                  Save Attendance Override
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: GRIEVANCE RESOLVER */}
          {activeTab === 'ticketing' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Ticket Stats Dashboard */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>OPEN TICKETS</span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-danger)', marginTop: '4px' }}>{supportStats?.openTickets || 5} Tickets</h4>
                </div>
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AVG RESOLUTION TIME</span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-info)', marginTop: '4px' }}>{supportStats?.averageResolutionHours || 4.2} Hrs</h4>
                </div>
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>URGENT COMPLAINTS</span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-danger)', marginTop: '4px' }}>1 Active</h4>
                </div>
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DEPT ISSUES</span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '4px' }}>Hostel, Wi-Fi</h4>
                </div>
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SATISFACTION RATING</span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-success)', marginTop: '4px' }}>{supportStats?.satisfactionScore || 4.8}/5.0</h4>
                </div>
              </div>

              <div className={styles.ticketGrid}>
                {/* Ticket list */}
                <div className={`${styles.ticketListPanel} glass-panel`}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>🎫 Grievance Tickets Queue</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '550px' }}>
                    {tickets.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTicket(t);
                          setResolutionStatus(t.status === 'OPEN' ? 'IN_PROGRESS' : t.status);
                          setResolutionNotes(t.resolutionNotes || '');
                        }}
                        className={`${styles.ticketItemCard} ${selectedTicket?.id === t.id ? styles.ticketActive : ''}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          <span>Student: {t.student?.fullName}</span>
                          <span className={`badge ${
                            t.status === 'RESOLVED' ? 'badge-success' : t.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-danger'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <strong style={{ fontSize: '0.9rem' }}>{t.title}</strong>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.7rem' }}>
                          <span className="badge badge-info">{t.category}</span>
                          <span className="badge badge-warning">{t.priority} Priority</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolver form */}
                <div className={`${styles.ticketResolverPanel} glass-panel`}>
                  {selectedTicket ? (
                    <div>
                      <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>{selectedTicket.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{selectedTicket.description}</p>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.78rem' }}>
                          <span>Priority: <strong style={{ color: 'var(--accent-warning)' }}>{selectedTicket.priority}</strong></span>
                          <span>Category: <strong>{selectedTicket.category}</strong></span>
                          <span>Student: <strong>{selectedTicket.student?.fullName} ({selectedTicket.student?.studentCode})</strong></span>
                        </div>
                      </div>

                      <form onSubmit={handleResolveTicket}>
                        <div className="form-group">
                          <label className="form-label">Review Status</label>
                          <select className="form-input" value={resolutionStatus} onChange={(e) => setResolutionStatus(e.target.value)}>
                            <option value="OPEN">OPEN (Unassigned)</option>
                            <option value="IN_PROGRESS">IN PROGRESS (Reviewing)</option>
                            <option value="RESOLVED">RESOLVED (Closed)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Resolution & Audit Action Notes</label>
                          <textarea
                            className="form-input"
                            rows={6}
                            placeholder="Provide details about actions taken, refunds processed, or repairs scheduled..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            required
                          />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                          Update Ticket Status & Log Notes
                        </button>
                      </form>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No ticket selected</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OPERATIONS */}
          {activeTab === 'operations' && (
            <div className={`${styles.operationsGrid} animate-fade-in`}>
              {/* Transport Routing Control */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>🚌 Transport Routing Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {transportRoutes.map(route => (
                    <div key={route.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '12px', borderBottom: '1px solid var(--border-glass)' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{route.routeName}</strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', alignItems: 'center' }}>
                        <span className={`badge ${route.status === 'ON_TIME' ? 'badge-success' : 'badge-warning'}`}>
                          {route.status === 'ON_TIME' ? 'ON TIME' : `DELAYED +${route.delayMinutes} MIN`}
                        </span>
                        <button
                          onClick={() => handleToggleBusDelay(route.id, route.status)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          Trigger Delay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Library Approvals */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>📚 Library Issue Approvals</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="glass-panel" style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Student: STU001 (Alex)</span>
                      <span>1 hr ago</span>
                    </div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', margin: '4px 0' }}>Introduction to Algorithms</strong>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Approve Issue</button>
                      <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Decline</button>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Student: STU003 (Liam)</span>
                      <span>3 hrs ago</span>
                    </div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', margin: '4px 0' }}>Design Patterns (Gang of Four)</strong>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Approve Issue</button>
                      <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Decline</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Canteen Orders Tracker */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>🍔 Canteen Order Tracker</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="glass-panel" style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Order #1982</span>
                      <span className="badge badge-danger">PENDING</span>
                    </div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', margin: '4px 0' }}>Veg Burger x1, French Fries x1</strong>
                    <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem', width: '100%', marginTop: '6px' }}>Set Ready for Pickup</button>
                  </div>

                  <div className="glass-panel" style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Order #1980</span>
                      <span className="badge badge-info">PREPARING</span>
                    </div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', margin: '4px 0' }}>Paneer Pizza x1, Coca Cola x2</strong>
                    <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem', width: '100%', marginTop: '6px' }}>Set Ready for Pickup</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: USER MANAGEMENT & RBAC CONSOLE */}
          {activeTab === 'userManagement' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Sub Navigation */}
              <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                <button
                  onClick={() => setUserManagementSubTab('list')}
                  className={`btn ${userManagementSubTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                >
                  👤 User Registry Directory
                </button>
                <button
                  onClick={() => setUserManagementSubTab('add')}
                  className={`btn ${userManagementSubTab === 'add' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                >
                  ➕ Create New User Account
                </button>
                <button
                  onClick={() => setUserManagementSubTab('rbac')}
                  className={`btn ${userManagementSubTab === 'rbac' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                >
                  🛡️ Role & Permission Matrix
                </button>
                <button
                  onClick={() => setUserManagementSubTab('bulk')}
                  className={`btn ${userManagementSubTab === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                >
                  📥 CSV Bulk Importer
                </button>
              </div>

              {/* Sub Tab: LIST */}
              {userManagementSubTab === 'list' && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                  {/* Search and Filters */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, minWidth: '240px' }} className="form-group">
                      <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        className="form-input"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                      />
                    </div>
                    <div style={{ width: '160px' }} className="form-group">
                      <select
                        className="form-input"
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                      >
                        <option value="">-- All Roles --</option>
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="PARENT">Parent</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </div>
                    <div style={{ width: '160px' }} className="form-group">
                      <select
                        className="form-input"
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                      >
                        <option value="">-- All Status --</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="DELETED">Deleted (Soft)</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.tableContainer}>
                    <table className={styles.adminTable}>
                      <thead>
                        <tr>
                          <th>User Details</th>
                          <th>Role</th>
                          <th>Specific Profile Info</th>
                          <th>Status</th>
                          <th>Created At</th>
                          <th>Action Controls</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registryUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textRendering: 'optimizeSpeed', textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                              No users match criteria.
                            </td>
                          </tr>
                        ) : (
                          registryUsers.map((u: any) => (
                            <tr key={u.id}>
                              <td>
                                <div><strong>{u.fullName}</strong></div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                                {u.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {u.phone}</div>}
                              </td>
                              <td>
                                <span className={`badge badge-${u.role === 'SUPER_ADMIN' || u.role === 'ADMIN' ? 'danger' : u.role === 'TEACHER' ? 'info' : 'success'}`} style={{ fontSize: '0.72rem' }}>
                                  {u.role}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.8rem' }}>
                                {u.role === 'STUDENT' && u.studentProfile && (
                                  <div>
                                    Code: <strong>{u.studentProfile.studentCode}</strong><br />
                                    Course: {u.studentProfile.courseId} ({u.studentProfile.section})<br />
                                    GPA: {u.studentProfile.cgpa || '0.0'}
                                  </div>
                                )}
                                {u.role === 'TEACHER' && u.teacherProfile && (
                                  <div>
                                    Emp ID: <strong>{u.teacherProfile.employeeId}</strong><br />
                                    Designation: {u.teacherProfile.designation}
                                  </div>
                                )}
                                {u.role === 'PARENT' && u.parentProfile && (
                                  <div>
                                    Relationship: <strong>{u.parentProfile.relationship}</strong><br />
                                    Ward Code: {u.parentProfile.linkedStudentId}
                                  </div>
                                )}
                                {u.role === 'ADMIN' && u.adminProfile && (
                                  <div>
                                    Emp ID: <strong>{u.adminProfile.employeeId || 'N/A'}</strong><br />
                                    Title: {u.adminProfile.roleTitle}
                                  </div>
                                )}
                                {!u.studentProfile && !u.teacherProfile && !u.parentProfile && !u.adminProfile && (
                                  <span style={{ color: 'var(--text-muted)' }}>Profile Unlinked</span>
                                )}
                              </td>
                              <td>
                                <span className={`badge badge-${u.status === 'ACTIVE' ? 'success' : u.status === 'DELETED' ? 'danger' : 'warning'}`} style={{ fontSize: '0.75rem' }}>
                                  {u.status}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.78rem' }}>
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => startEditUser(u)}
                                    className="btn btn-primary"
                                    style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                  >
                                    Edit
                                  </button>

                                  {u.status !== 'DELETED' ? (
                                    <>
                                      <button
                                        onClick={() => handleUpdateStatus(u.id, u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                                        className="btn btn-secondary"
                                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                      >
                                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                      </button>
                                      <button
                                        onClick={() => handleSoftDeleteUser(u.id)}
                                        className="btn btn-secondary"
                                        style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: 'none' }}
                                      >
                                        Delete
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleRestoreUser(u.id)}
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: '#a7f3d0', border: 'none' }}
                                    >
                                      Restore
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub Tab: ADD USER */}
              {userManagementSubTab === 'add' && (
                <div className="glass-panel" style={{ padding: '24px', maxWidth: '700px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>➕ Register New Smart Campus User</h3>
                  <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Alex Jenkins"
                          value={userForm.fullName}
                          onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Role Category</label>
                        <select
                          className="form-input"
                          value={userForm.role}
                          onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="TEACHER">TEACHER</option>
                          <option value="PARENT">PARENT</option>
                          <option value="ADMIN">ADMIN (Super Admin Authorization)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Campus Email</label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="user@campus.edu"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Secure Password</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Min 6 characters"
                          value={userForm.password}
                          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="+1 (555) 000-0000"
                          value={userForm.phone}
                          onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Account Status</label>
                        <select
                          className="form-input"
                          value={userForm.status}
                          onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      </div>
                    </div>

                    {/* Dynamic Role-Based Inputs */}
                    {userForm.role === 'STUDENT' && (
                      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-glass)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Student Profile Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="form-group">
                            <label className="form-label">Student Code (Roll Number)</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="STU011"
                              value={userForm.studentCode}
                              onChange={(e) => setUserForm({ ...userForm, studentCode: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Course Program</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="B.Tech"
                              value={userForm.courseId}
                              onChange={(e) => setUserForm({ ...userForm, courseId: e.target.value })}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="form-group">
                            <label className="form-label">Department ID</label>
                            <select
                              className="form-input"
                              value={userForm.departmentId}
                              onChange={(e) => setUserForm({ ...userForm, departmentId: e.target.value })}
                            >
                              <option value="cse-dept-id">Computer Science (CSE)</option>
                              <option value="ece-dept-id">Electronics (ECE)</option>
                              <option value="me-dept-id">Mechanical (ME)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Semester / Section</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="number"
                                className="form-input"
                                style={{ width: '80px' }}
                                value={userForm.currentSemester}
                                onChange={(e) => setUserForm({ ...userForm, currentSemester: Number(e.target.value) })}
                              />
                              <input
                                type="text"
                                className="form-input"
                                placeholder="A"
                                value={userForm.section}
                                onChange={(e) => setUserForm({ ...userForm, section: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="form-group">
                            <label className="form-label">Guardian Name</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Parent Full Name"
                              value={userForm.guardianName}
                              onChange={(e) => setUserForm({ ...userForm, guardianName: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Guardian Phone</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Parent Contact"
                              value={userForm.guardianPhone}
                              onChange={(e) => setUserForm({ ...userForm, guardianPhone: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {userForm.role === 'TEACHER' && (
                      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-glass)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Faculty Profile Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="form-group">
                            <label className="form-label">Employee ID</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="TCH102"
                              value={userForm.employeeId}
                              onChange={(e) => setUserForm({ ...userForm, employeeId: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Designation</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Assistant Professor"
                              value={userForm.designation}
                              onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="form-group">
                            <label className="form-label">Department ID</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="cse-dept-id"
                              value={userForm.departmentId}
                              onChange={(e) => setUserForm({ ...userForm, departmentId: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Assigned Subjects (JSON / String)</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="CS-301, CS-302"
                              value={userForm.subjectsAssigned}
                              onChange={(e) => setUserForm({ ...userForm, subjectsAssigned: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {userForm.role === 'PARENT' && (
                      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-glass)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Parent Profile Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="form-group">
                            <label className="form-label">Linked Student ID (UserId or Roll code)</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="STU001"
                              value={userForm.linkedStudentId}
                              onChange={(e) => setUserForm({ ...userForm, linkedStudentId: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Relationship</label>
                            <select
                              className="form-input"
                              value={userForm.relationship}
                              onChange={(e) => setUserForm({ ...userForm, relationship: e.target.value })}
                            >
                              <option value="FATHER">FATHER</option>
                              <option value="MOTHER">MOTHER</option>
                              <option value="GUARDIAN">GUARDIAN</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Occupation</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Civil Engineer"
                            value={userForm.occupation}
                            onChange={(e) => setUserForm({ ...userForm, occupation: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {userForm.role === 'ADMIN' && (
                      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-glass)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Admin Profile Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="form-group">
                            <label className="form-label">Employee ID</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="ADM402"
                              value={userForm.employeeId}
                              onChange={(e) => setUserForm({ ...userForm, employeeId: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Department Scope</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Academic Affairs"
                              value={userForm.department}
                              onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Official Title</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Registrar Coordinator"
                            value={userForm.roleTitle}
                            onChange={(e) => setUserForm({ ...userForm, roleTitle: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                      Register User Account
                    </button>
                  </form>
                </div>
              )}

              {/* Sub Tab: RBAC MATRIX */}
              {userManagementSubTab === 'rbac' && (
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px' }}>
                  {/* Roles list */}
                  <div className="glass-panel" style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>Select Role</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {roles.map(r => (
                        <div
                          key={r.id}
                          onClick={() => handleSelectRole(r)}
                          style={{
                            padding: '12px',
                            background: selectedRoleForPermissions?.id === r.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <strong style={{ display: 'block', fontSize: '0.85rem' }}>{r.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: selectedRoleForPermissions?.id === r.id ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>{r.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Permissions matrix */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    {selectedRoleForPermissions ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>🛡️ Permissions Matrix for {selectedRoleForPermissions.name}</h3>
                          <button onClick={handleSavePermissions} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                            Save Matrix Changes
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          {rolePermissionsList.map(p => {
                            const checked = assignedPermissionIds.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '12px',
                                  background: 'rgba(255,255,255,0.01)',
                                  border: '1px solid var(--border-glass)',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setAssignedPermissionIds([...assignedPermissionIds, p.id]);
                                    } else {
                                      setAssignedPermissionIds(assignedPermissionIds.filter(id => id !== p.id));
                                    }
                                  }}
                                />
                                <div>
                                  <strong style={{ fontSize: '0.85rem' }}>{p.name}</strong>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Module: {p.module} | Action: {p.action}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Select a user role from the left column to view or modify privileges mapping.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub Tab: BULK */}
              {userManagementSubTab === 'bulk' && (
                <div className="glass-panel" style={{ padding: '24px', maxWidth: '650px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px' }}>📥 Import Users via CSV</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Paste raw comma-separated user records. Required columns: <code>email</code>, <code>fullName</code>, <code>role</code> (STUDENT, TEACHER, PARENT). For students, optionally supply <code>studentCode</code>.
                  </p>

                  <form onSubmit={handleBulkImportCSV} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">CSV Data Rows</label>
                      <textarea
                        className="form-input"
                        rows={8}
                        placeholder="email,fullName,role,studentCode,phone&#10;sarah.johnson@campus.edu,Sarah Johnson,STUDENT,STU992,+15559812209&#10;michael.scott@campus.edu,Michael Scott,TEACHER,,+15551220019"
                        value={bulkCsvText}
                        onChange={(e) => setBulkCsvText(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary">
                      Execute Bulk Registry Import
                    </button>
                  </form>

                  {bulkImportStatus && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                      {bulkImportStatus}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* EDIT USER OVERLAY MODAL */}
          {showEditUserModal && selectedEditUser && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px'
            }}>
              <div className="glass-panel" style={{ padding: '24px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>✏️ Edit User Profile: {selectedEditUser.email}</h3>
                  <button onClick={() => setShowEditUserModal(false)} className="btn btn-secondary" style={{ padding: '4px 8px' }}>✕</button>
                </div>

                <form onSubmit={handleEditUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={userForm.fullName}
                      onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={userForm.phone}
                        onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Change Password (leave blank to keep current)</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role Category (Modify carefully)</label>
                      <select
                        className="form-input"
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="PARENT">PARENT</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Role-Based Inputs */}
                  {userForm.role === 'STUDENT' && (
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-glass)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Student Profile Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Student Code (Roll Number)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={userForm.studentCode}
                            onChange={(e) => setUserForm({ ...userForm, studentCode: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Course Program</label>
                          <input
                            type="text"
                            className="form-input"
                            value={userForm.courseId}
                            onChange={(e) => setUserForm({ ...userForm, courseId: e.target.value })}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Department ID</label>
                          <input
                            type="text"
                            className="form-input"
                            value={userForm.departmentId}
                            onChange={(e) => setUserForm({ ...userForm, departmentId: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Semester / Section</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '80px' }}
                              value={userForm.currentSemester}
                              onChange={(e) => setUserForm({ ...userForm, currentSemester: Number(e.target.value) })}
                            />
                            <input
                              type="text"
                              className="form-input"
                              value={userForm.section}
                              onChange={(e) => setUserForm({ ...userForm, section: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {userForm.role === 'TEACHER' && (
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-glass)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Faculty Profile Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Employee ID</label>
                          <input
                            type="text"
                            className="form-input"
                            value={userForm.employeeId}
                            onChange={(e) => setUserForm({ ...userForm, employeeId: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Designation</label>
                          <input
                            type="text"
                            className="form-input"
                            value={userForm.designation}
                            onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {userForm.role === 'PARENT' && (
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-glass)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Parent Profile Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Linked Student ID Code</label>
                          <input
                            type="text"
                            className="form-input"
                            value={userForm.linkedStudentId}
                            onChange={(e) => setUserForm({ ...userForm, linkedStudentId: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Relationship</label>
                          <input
                            type="text"
                            className="form-input"
                            value={userForm.relationship}
                            onChange={(e) => setUserForm({ ...userForm, relationship: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      Save Profile Changes
                    </button>
                    <button type="button" onClick={() => setShowEditUserModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
