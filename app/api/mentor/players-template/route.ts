import { requireMentor } from "@/lib/auth";

const CSV_TEMPLATE = "username,password,name,team,dateOfBirth,playfieldPosition\n";

export async function GET() {
  await requireMentor();

  return new Response(CSV_TEMPLATE, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=template-jucatori.csv",
      "Cache-Control": "no-store",
    },
  });
}