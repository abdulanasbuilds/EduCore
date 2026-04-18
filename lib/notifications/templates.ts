export function absenceAlert(studentName: string, date: string, schoolName: string, schoolPhone: string): string {
  return `Dear Parent, ${studentName} was absent from school today, ${date}. Please contact the school if you have not already notified us. — ${schoolName} (${schoolPhone})`;
}

export function consecutiveAbsenceAlert(studentName: string, days: number, schoolName: string): string {
  return `URGENT: ${studentName} has been absent for ${days} consecutive school days. Please contact the school administration immediately. — ${schoolName}`;
}

export function gradePublished(
  parentName: string,
  studentName: string,
  subject: string,
  score: number,
  maxScore: number,
  grade: string,
  portalUrl: string
): string {
  return `Dear ${parentName}, ${subject} results for ${studentName}: ${score}/${maxScore} (${grade}). View full results at ${portalUrl}`;
}

export function belowPassMark(
  parentName: string,
  studentName: string,
  subject: string,
  score: number,
  passmark: number,
  schoolName: string
): string {
  return `Dear ${parentName}, ${studentName} scored ${score}% in ${subject}, which is below the pass mark of ${passmark}%. Please encourage extra study. — ${schoolName}`;
}

export function feeReminder(
  parentName: string,
  studentName: string,
  amount: string,
  dueDate: string,
  schoolName: string
): string {
  return `Dear ${parentName}, ${studentName}'s school fees of ${amount} are due on ${dueDate}. Please pay at the school or contact the bursar. — ${schoolName}`;
}

export function feeReceipt(
  parentName: string,
  studentName: string,
  amount: string,
  balance: string,
  receiptNumber: string,
  schoolName: string
): string {
  return `Payment received: ${amount} for ${studentName}. Balance: ${balance}. Receipt #${receiptNumber}. — ${schoolName}`;
}

export function welcomeEnrollment(
  parentName: string,
  studentName: string,
  className: string,
  portalUrl: string,
  password: string,
  schoolName: string
): string {
  return `Welcome to ${schoolName}. ${studentName} has been successfully enrolled in ${className}. Parent portal: ${portalUrl} Password: ${password}`;
}

export function termReportReady(
  parentName: string,
  studentName: string,
  term: string,
  pdfUrl: string,
  schoolName: string
): string {
  return `Dear ${parentName}, ${studentName}'s ${term} report card is ready. Download it here: ${pdfUrl}. — ${schoolName}`;
}

export function promotionNotice(
  parentName: string,
  studentName: string,
  outcome: string,
  nextClass: string,
  schoolName: string
): string {
  const outcomeText =
    outcome === "promoted"
      ? `has been promoted to ${nextClass}`
      : outcome === "graduated"
        ? "has graduated"
        : `is to repeat ${nextClass}`;
  return `Dear ${parentName}, the academic year has ended. ${studentName} ${outcomeText}. Full transcript available on the parent portal. — ${schoolName}`;
}

export function weeklyDigest(
  parentName: string,
  studentName: string,
  presentDays: number,
  absentDays: number,
  upcomingEvents: string
): string {
  return `Weekly update for ${studentName}: Present ${presentDays} days, Absent ${absentDays} days this week. ${upcomingEvents ? `Upcoming: ${upcomingEvents}` : ""}`;
}

export function monthlyReport(
  parentName: string,
  studentName: string,
  attendancePercent: number,
  averageGrade: string,
  feeBalance: string
): string {
  return `Monthly summary for ${studentName}: Attendance: ${attendancePercent}%, Average Grade: ${averageGrade}, Fee Balance: ${feeBalance}. — View details on parent portal.`;
}
