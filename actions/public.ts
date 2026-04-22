"use server";

import { db } from "@/lib/db";
import { SignupRequestStatus, RequestType } from "@/app/generated/prisma/client";

type ActionResult = { error?: string; success?: boolean };

export async function submitMentorSignup(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !email) {
    return { error: "Câmpurile marcate sunt obligatorii." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Adresa de email nu este validă." };
  }

  // Prevent duplicate pending requests for the same email
  const existing = await db.adminRequest.findFirst({
    where: { email, status: SignupRequestStatus.PENDING, requestType: RequestType.SIGNUP },
  });
  if (existing) {
    return { error: "Există deja o cerere în așteptare pentru această adresă de email." };
  }

  await db.adminRequest.create({
    data: { name, email, phone, description, status: SignupRequestStatus.PENDING, requestType: RequestType.SIGNUP },
  });

  return { success: true };
}
