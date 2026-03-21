import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const SALT_ROUNDS = 12;

  // ── SUPER_ADMIN ────────────────────────────────────────────────────────────
  const admin = await db.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: await bcrypt.hash("admin1234", SALT_ROUNDS),
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✅ SUPER_ADMIN: ${admin.username}`);

  // ── Playfield Positions ────────────────────────────────────────────────────
  const positions = [
    "Portar",
    "Fundaș central",
    "Fundaș lateral",
    "Mijlocaș defensiv",
    "Mijlocaș central",
    "Mijlocaș ofensiv",
    "Extremă",
    "Atacant",
  ];

  for (const name of positions) {
    await db.playfieldPosition.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ ${positions.length} poziții pe teren create.`);

  // ── Demo Mentor ────────────────────────────────────────────────────────────
  const mentorUser = await db.user.upsert({
    where: { username: "rada" },
    update: {},
    create: {
      username: "rada",
      passwordHash: await bcrypt.hash("mentor1234", SALT_ROUNDS),
      role: "MENTOR",
      mentor: {
        create: {
          name: "Ionuț Rada",
          description: "Antrenor cu 10 ani experiență.",
        },
      },
    },
  });
  console.log(`✅ Mentor demo: ${mentorUser.username}`);

  const mentor = await db.mentor.findUnique({ where: { userId: mentorUser.id } });

  // ── Demo Checkin Form ──────────────────────────────────────────────────────
  if (mentor) {
    const form = await db.checkinForm.upsert({
      where: { mentorId: mentor.id },
      update: {},
      create: { mentorId: mentor.id },
    });

    const formItems = [
      { label: "Trezit nu mai târziu de ora 8", allowAdditionalString: false, order: 0 },
      { label: "Mic dejun sănătos", allowAdditionalString: false, order: 1 },
      { label: "Școală / Citit 30-40 de min", allowAdditionalString: false, order: 2 },
      { label: "Mobilitate / Prevenție", allowAdditionalString: false, order: 3 },
      { label: "Gustare sănătoasă", allowAdditionalString: false, order: 4 },
      { label: "Antrenament 1", allowAdditionalString: false, order: 5 },
      { label: "Gustare sănătoasă (fructe)", allowAdditionalString: false, order: 6 },
      { label: "Social media max 30 min", allowAdditionalString: false, order: 7 },
      { label: "Prânz sănătos", allowAdditionalString: false, order: 8 },
      { label: "Odihnă", allowAdditionalString: false, order: 9 },
      { label: "Mobilitate / Prevenție", allowAdditionalString: false, order: 10 },
      { label: "Gustare sănătoasă", allowAdditionalString: false, order: 11 },
      { label: "Antrenament 2", allowAdditionalString: false, order: 12 },
      { label: "Recuperare / Detensionare / Băi calde-reci", allowAdditionalString: false, order: 13 },
      { label: "Cină sănătoasă", allowAdditionalString: false, order: 14 },
      { label: "Social media max 1 oră", allowAdditionalString: false, order: 15 },
      { label: "Citit cărți / cursuri / materiale Biblioteca TheRadaWay", allowAdditionalString: false, order: 16 },
      { label: "Odihnă nu mai târziu de ora 23", allowAdditionalString: false, order: 17 },
      { label: "Am avut o atitudine bună", allowAdditionalString: false, order: 18 },
      { label: "Am făcut un lucru bun azi", allowAdditionalString: true, order: 19 },
      { label: "Am învățat ceva", allowAdditionalString: true, order: 20 },
    ];

    for (const item of formItems) {
      const existing = await db.checkinFormItem.findFirst({
        where: { formId: form.id, label: item.label },
      });
      if (!existing) {
        await db.checkinFormItem.create({ data: { ...item, formId: form.id } });
      }
    }
    console.log(`✅ Formular de checkin demo creat.`);

    // ── Demo Player ────────────────────────────────────────────────────────
    const playerUser = await db.user.upsert({
      where: { username: "jucator1" },
      update: {},
      create: {
        username: "jucator1",
        passwordHash: await bcrypt.hash("jucator1234", SALT_ROUNDS),
        role: "PLAYER",
        player: {
          create: {
            name: "Andrei Ionescu",
            team: "U17 Demo",
            mentorId: mentor.id,
          },
        },
      },
    });
    console.log(`✅ Jucător demo: ${playerUser.username}`);
  }

  console.log("\n🎉 Seed complet!");
  console.log("──────────────────────────────────────────");
  console.log("Conturi de test:");
  console.log("  SUPER_ADMIN: admin / admin1234");
  console.log("  MENTOR:      rada / mentor1234");
  console.log("  PLAYER:      jucator1 / jucator1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
