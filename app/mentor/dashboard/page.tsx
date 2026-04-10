import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardClient } from "./DashboardClient";
import { startOfDayUTC } from "@/lib/streak";

export default async function MentorDashboard() {
  await requireMentor();
  const session = await getSession();
  const mentorId = session.mentorId!;

  const players = await db.player.findMany({
    where: { mentorId },
    include: {
      user: { select: { username: true } },
      playfieldPosition: true,
      checkinAnswers: {
        where: { day: startOfDayUTC(new Date()) },
        take: 1,
      },
      confidenceLevels: {
        where: { day: startOfDayUTC(new Date()) },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  const serialized = players.map((p) => ({
    id: p.id,
    name: p.name,
    username: p.user.username,
    team: p.team,
    position: p.playfieldPosition?.name ?? null,
    photo: p.photo ?? null,
    lastActiveAt: p.lastActiveAt?.toISOString() ?? null,
    checkedInToday: p.checkinAnswers.length > 0,
    confidenceToday: p.confidenceLevels[0]?.level ?? null,
  }));

  return <DashboardClient players={serialized} />;
}
