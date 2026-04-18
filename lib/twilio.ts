import twilio from "twilio";
import { env } from "@/lib/env";

const accountSid = env.TWILIO_ACCOUNT_SID;
const authToken = env.TWILIO_AUTH_TOKEN;
const phoneNumber = env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!client || !phoneNumber) {
    console.warn("Twilio not configured, skipping SMS");
    return false;
  }

  try {
    await client.messages.create({
      body: message,
      from: phoneNumber,
      to,
    });
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  if (!client || !phoneNumber) {
    console.warn("Twilio not configured, skipping WhatsApp");
    return false;
  }

  const toFormatted = to.startsWith("+") ? `whatsapp:${to}` : `whatsapp:+${to}`;
  const fromFormatted = phoneNumber.startsWith("whatsapp:")
    ? phoneNumber
    : `whatsapp:${phoneNumber}`;

  try {
    await client.messages.create({
      body: message,
      from: fromFormatted,
      to: toFormatted,
    });
    return true;
  } catch (error) {
    console.error("Failed to send WhatsApp:", error);
    return false;
  }
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("233")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+233${cleaned.substring(1)}`;
  }
  return `+233${cleaned}`;
}