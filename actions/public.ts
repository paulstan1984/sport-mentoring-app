"use server";

import { db } from "@/lib/db";
import { SignupRequestStatus, RequestType, MentorTheme } from "@/app/generated/prisma/client";
import { sendSignupNotification } from "@/lib/email";

type ActionResult = { error?: string; success?: boolean };

function parseMentorTheme(raw: string | null | undefined): MentorTheme {
  return raw === "MIND_MENTOR" ? "MIND_MENTOR" : "SPORT_MENTOR";
}

export async function submitMentorSignup(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const theme = parseMentorTheme(formData.get("theme") as string);
  const recaptchaToken = (formData.get("g-recaptcha-response") as string) || "";

  if (!name || !email) {
    return { error: "Câmpurile marcate sunt obligatorii." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Adresa de email nu este validă." };
  }

  // Verify reCAPTCHA token when the secret key is configured
  if (process.env.RECAPTCHA_SECRET_KEY) {
    if (!recaptchaToken) {
      return { error: "Te rugăm să completezi verificarea reCAPTCHA." };
    }
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY)}&response=${encodeURIComponent(recaptchaToken)}`,
    });
    const verifyData = (await verifyRes.json()) as { success: boolean };
    if (!verifyData.success) {
      return { error: "Verificarea reCAPTCHA a eșuat. Încearcă din nou." };
    }
  }

  // Prevent duplicate pending requests for the same email
  const existing = await db.adminRequest.findFirst({
    where: { email, status: SignupRequestStatus.PENDING, requestType: RequestType.SIGNUP },
  });
  if (existing) {
    return { error: "Există deja o cerere în așteptare pentru această adresă de email." };
  }

  await db.adminRequest.create({
    data: { name, email, phone, description, theme, status: SignupRequestStatus.PENDING, requestType: RequestType.SIGNUP },
  });

  // Send notification email (best-effort, do not fail the request if email fails)
  try {
    await sendSignupNotification({ name, email, phone, description, theme });
  } catch {
    // intentionally swallow email errors
  }

  return { success: true };
}

