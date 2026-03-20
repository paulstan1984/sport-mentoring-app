import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function RootPage() {
  const session = await getSession();

  if (!session.userId) redirect("/login");
  if (session.role === "SUPER_ADMIN") redirect("/admin/mentors");
  if (session.role === "MENTOR") redirect("/mentor/dashboard");
  if (session.role === "PLAYER") redirect("/player/dashboard");

  redirect("/login");
}
