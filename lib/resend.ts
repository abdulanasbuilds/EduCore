import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: { filename: string; content: string | Buffer }[];
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return false;
  }

  try {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    await resend.emails.send({
      from: "EduCore <noreply@yourdomain.com>",
      to: recipients,
      subject: options.subject,
      html: options.html || "",
      text: options.text || "",
      attachments: options.attachments,
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function sendTemplateEmail(
  to: string | string[],
  templateName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templates: Record<string, (data: Record<string, any>) => string> = {
    welcome: (d) => `
      <h1>Welcome to EduCore</h1>
      <p>Hello ${d.name},</p>
      <p>Your account has been created. You can now login to view your child's academic information.</p>
      <p>Login credentials:</p>
      <ul>
        <li>Email: ${d.email}</li>
        <li>Password: ${d.password}</li>
      </ul>
      <p><a href="${d.loginUrl}">Click here to login</a></p>
    `,
    attendance_alert: (d) => `
      <h1>Attendance Alert</h1>
      <p>Dear ${d.parentName},</p>
      <p>Your child ${d.studentName} was marked ${d.status} on ${d.date}.</p>
      ${d.reason ? `<p>Reason: ${d.reason}</p>` : ""}
    `,
    grade_published: (d) => `
      <h1>Grade Published</h1>
      <p>Dear ${d.parentName},</p>
      <p>The ${d.term} grades for ${d.studentName} have been published.</p>
      <p>Log in to view the full report card.</p>
    `,
    fee_receipt: (d) => `
      <h1>Fee Receipt</h1>
      <p>Dear ${d.parentName},</p>
      <p>Payment received for ${d.studentName}.</p>
      <ul>
        <li>Amount: ${d.amount}</li>
        <li>Date: ${d.date}</li>
        <li>Reference: ${d.reference}</li>
      </ul>
    `,
    fee_reminder: (d) => `
      <h1>Fee Reminder</h1>
      <p>Dear ${d.parentName},</p>
      <p>This is a reminder that fees for ${d.studentName} are due on ${d.dueDate}.</p>
      <p>Outstanding amount: ${d.amount}</p>
      <p>Please make payment to avoid late fees.</p>
    `,
  };

  const template = templates[templateName];
  if (!template) {
    console.error(`Unknown email template: ${templateName}`);
    return false;
  }

  return sendEmail({
    to,
    subject: `EduCore - ${templateName.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
    html: template(data),
  });
}