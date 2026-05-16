const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");

const doc = new Document({
  creator: "EduCore Engineering",
  title: "EduCore - Official User Manual",
  sections: [
    {
      properties: {},
      children: [
        // COVER PAGE
        new Paragraph({
          text: "EduCore",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 2000, after: 400 },
        }),
        new Paragraph({
          text: "The Complete School Management Guide",
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: "A professional manual for Administrators, Teachers, Bursars, Parents, and Students.",
          alignment: AlignmentType.CENTER,
          spacing: { after: 2000 },
        }),
        new Paragraph({
          text: "Official Documentation • 2026 Edition",
          alignment: AlignmentType.CENTER,
          pageBreakBefore: false,
        }),

        // 1. WELCOME
        new Paragraph({
          text: "1. Welcome to EduCore",
          heading: HeadingLevel.HEADING_2,
          pageBreakBefore: true,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          text: "EduCore is a next-generation school management system designed to eliminate paperwork, streamline communication, and provide real-time insights into your school's academic and financial health. Built specifically for the modern educational landscape, it supports the NaCCA Standards-Based Curriculum and ensures complete data security.",
          spacing: { after: 400 },
        }),

        // 2. FIRST-TIME SETUP
        new Paragraph({
          text: "2. First-Time Setup (Admin)",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          text: "Setting up your school for the first time is a linear process. Follow these steps in order to ensure a smooth launch.",
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "1. Configure the Academic Calendar: ", bold: true }),
            new TextRun("Go to Settings. Create the current Academic Year and define the start/end dates for Term 1, 2, and 3."),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "2. Create Classes & Subjects: ", bold: true }),
            new TextRun("Navigate to Classes to set up your structure. Then add your subjects in the Subjects module."),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "3. Invite Staff Accounts: ", bold: true }),
            new TextRun("Use the Supabase Auth Invite system to send secure login links to your Teachers and Bursars. Assign their roles and link them to their respective classes."),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "4. Onboard Students (Bulk Import): ", bold: true }),
            new TextRun("Go to Students > Import CSV. Download the template, copy your existing school roster into it, and upload. The system will instantly generate Admission Numbers and enroll hundreds of students at once."),
          ],
          spacing: { after: 400 },
        }),

        // 3. ROLES
        new Paragraph({
          text: "3. Dashboard Workflows by Role",
          heading: HeadingLevel.HEADING_2,
          pageBreakBefore: true,
          spacing: { before: 400, after: 200 },
        }),

        // Admin
        new Paragraph({ text: "The Headmaster / Admin", heading: HeadingLevel.HEADING_3 }),
        new Paragraph({ text: "Primary Goal: Complete oversight, compliance, and strategic intervention." }),
        new Paragraph({ text: "• Morning: Review the Today at a Glance cards. Check for red alerts indicating missing teachers or chronic student absences.", bullet: { level: 0 } }),
        new Paragraph({ text: "• Midday: Monitor real-time fee collections versus outstanding balances on the financial charts.", bullet: { level: 0 } }),
        new Paragraph({ text: "• Year-End: Run the automated Promotion Engine to process NaCCA-compliant graduation and class upgrades.", bullet: { level: 0 } }),

        // Class Teacher
        new Paragraph({ text: "The Class Teacher", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
        new Paragraph({ text: "Primary Goal: Pastoral care and daily student management." }),
        new Paragraph({ text: "• Morning Routine: Tap the massive 'Mark Attendance' button. Logging an absence automatically flags the student on the parent's portal.", bullet: { level: 0 } }),
        new Paragraph({ text: "• Communication: Use the Quick Announcement box to send instant 160-character messages directly to the parents of their class.", bullet: { level: 0 } }),
        new Paragraph({ text: "• Monitoring: View the color-coded student roster to instantly identify struggling learners.", bullet: { level: 0 } }),

        // Subject Teacher
        new Paragraph({ text: "The Subject Teacher", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
        new Paragraph({ text: "Primary Goal: Assessment and academic evaluation." }),
        new Paragraph({ text: "• Workflow: Create Assessments (Homework, Quizzes, Mid-terms) for assigned classes.", bullet: { level: 0 } }),
        new Paragraph({ text: "• Grading: Enter scores rapidly using the spreadsheet-style input interface. The system automatically calculates proficiency levels.", bullet: { level: 0 } }),

        // Bursar
        new Paragraph({ text: "The Bursar", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
        new Paragraph({ text: "Primary Goal: Maximize liquidity and track revenue accurately." }),
        new Paragraph({ text: "• Collection: Use the massive top search bar to instantly find a student by ID.", bullet: { level: 0 } }),
        new Paragraph({ text: "• Recording: Record Cash or Mobile Money transactions. The system automatically reduces the outstanding balance and generates a digital receipt.", bullet: { level: 0 } }),
        new Paragraph({ text: "• Enforcement: Sort the Defaulters List by highest debt and trigger bulk payment reminders with one click.", bullet: { level: 0 } }),

        // Parent
        new Paragraph({ text: "The Parent / Guardian", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
        new Paragraph({ text: "Primary Goal: Real-time peace of mind regarding child's safety and progress." }),
        new Paragraph({ text: "• Self-Registration: Parents simply visit /register/parent, enter their child's Admission Number and Name, and the system instantly grants them access.", bullet: { level: 0 } }),
        new Paragraph({ text: "• Zero-Friction UX: The dashboard is entirely read-only with large touch targets.", bullet: { level: 0 } }),
        new Paragraph({ text: "• Safety: View a 5-day visual tracker of the child's physical attendance.", bullet: { level: 0 } }),
        new Paragraph({ text: "• Finance: See outstanding fee balances instantly in red, or a green 'Fully Paid' badge.", bullet: { level: 0 } }),

        // Student
        new Paragraph({ text: "The Student & Alumni", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }),
        new Paragraph({ text: "Primary Goal: Academic focus and historical record access." }),
        new Paragraph({ text: "• Active Students: Check the dashboard for impending homework deadlines (highlighted in red if overdue) and view the next day's timetable to pack bags correctly.", bullet: { level: 0 } }),
        new Paragraph({ text: "• Graduated (Alumni): Once promoted to 'Graduated' status by the Admin, the student loses access to active classes but retains a permanent, read-only portal to download past Terminal Report Cards and Certificates.", bullet: { level: 0 } }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("EduCore_Official_User_Manual.docx", buffer);
  console.log("Document generated successfully!");
});
