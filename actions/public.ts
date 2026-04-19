"use server";

import { db } from "@/lib/db";

type ActionResult = { error?: string; success?: boolean };

export async function submitMentorSignup(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !email) {
    return { error: "Câmpurile marcate sunt obligatorii." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Adresa de email nu este validă." };
  }

  // Prevent duplicate pending requests for the same email
  const existing = await db.mentorSignupRequest.findFirst({
    where: { email, status: "PENDING" },
  });
  if (existing) {
    return { error: "Există deja o cerere în așteptare pentru această adresă de email." };
  }

  await db.mentorSignupRequest.create({
    data: { name, email, description, status: "PENDING" },
  });

  return { success: true };
}
