export type DemoRole = "admin" | "teacher" | "bursar" | "parent";

export type DemoStudent = {
  id: string;
  name: string;
  className: string;
  status: "Present" | "Absent" | "Late";
  average: number;
  attendance: number;
  balance: number;
};

export const demoSchool = {
  name: "Greenfield Academy",
  motto: "Learn. Lead. Thrive.",
  term: "Second Term · 2025/2026",
  location: "Kumasi, Ghana",
};

export const demoStats = {
  students: 684,
  teachers: 42,
  classes: 24,
  attendance: 94,
  feesCollected: 412580,
  feesOutstanding: 67340,
};

export const demoStudents: DemoStudent[] = [
  { id: "ST-001", name: "Ama Serwaa Mensah", className: "JHS 2A", status: "Present", average: 86, attendance: 97, balance: 0 },
  { id: "ST-002", name: "Kwame Osei", className: "JHS 2A", status: "Present", average: 78, attendance: 92, balance: 1250 },
  { id: "ST-003", name: "Abena Owusu", className: "JHS 2A", status: "Late", average: 91, attendance: 95, balance: 0 },
  { id: "ST-004", name: "Kofi Asante", className: "JHS 2A", status: "Absent", average: 69, attendance: 83, balance: 2400 },
  { id: "ST-005", name: "Yaa Boateng", className: "JHS 2B", status: "Present", average: 88, attendance: 98, balance: 0 },
  { id: "ST-006", name: "Kojo Appiah", className: "JHS 2B", status: "Present", average: 74, attendance: 90, balance: 800 },
  { id: "ST-007", name: "Efua Sarpong", className: "JHS 1A", status: "Present", average: 93, attendance: 99, balance: 0 },
  { id: "ST-008", name: "Yaw Frimpong", className: "JHS 1A", status: "Absent", average: 66, attendance: 79, balance: 1800 },
  { id: "ST-009", name: "Akua Nyarko", className: "Primary 6", status: "Present", average: 89, attendance: 96, balance: 0 },
  { id: "ST-010", name: "Nana Boakye", className: "Primary 6", status: "Present", average: 81, attendance: 94, balance: 450 },
];

export const demoTeachers = [
  { name: "Mr. Daniel Asare", role: "Class Teacher", classes: "JHS 2A", attendance: 96 },
  { name: "Mrs. Lydia Boateng", role: "Subject Teacher", classes: "English · JHS 1–3", attendance: 98 },
  { name: "Mr. Samuel Addo", role: "Subject Teacher", classes: "Mathematics · JHS 1–3", attendance: 94 },
  { name: "Ms. Patricia Ofori", role: "Class Teacher", classes: "JHS 2B", attendance: 97 },
];

export const demoPayments = [
  { id: "PAY-4812", student: "Ama Serwaa Mensah", amount: 3200, method: "Mobile Money", date: "08 Sep 2026", receipt: "REC-4812" },
  { id: "PAY-4811", student: "Kojo Appiah", amount: 1500, method: "Cash", date: "08 Sep 2026", receipt: "REC-4811" },
  { id: "PAY-4807", student: "Yaa Boateng", amount: 4200, method: "Bank Transfer", date: "07 Sep 2026", receipt: "REC-4807" },
  { id: "PAY-4802", student: "Akua Nyarko", amount: 2800, method: "Mobile Money", date: "07 Sep 2026", receipt: "REC-4802" },
];

export const demoAnnouncements = [
  { title: "Mid-term examinations begin next Monday", audience: "All parents", date: "06 Sep 2026" },
  { title: "Inter-house athletics training schedule", audience: "JHS students", date: "04 Sep 2026" },
  { title: "School fees reminder — Second Term", audience: "Outstanding accounts", date: "02 Sep 2026" },
];

export const demoAttendanceTrend = [92, 94, 93, 96, 95, 94, 97, 96, 94, 95, 93, 96, 95, 94];
export const demoFeeTrend = [48, 62, 71, 84, 95, 112];

export const roleCopy: Record<DemoRole, { title: string; subtitle: string }> = {
  admin: { title: "School Administration", subtitle: "A complete operational view of the school" },
  teacher: { title: "Class Teacher Workspace", subtitle: "Attendance, grades and student progress" },
  bursar: { title: "Finance & Bursary", subtitle: "Collections, balances, receipts and reporting" },
  parent: { title: "Parent Portal", subtitle: "Your child's school life in one place" },
};
