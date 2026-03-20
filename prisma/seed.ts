import "dotenv/config";
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
    where: { username: "mentor1" },
    update: {},
    create: {
      username: "mentor1",
      passwordHash: await bcrypt.hash("mentor1234", SALT_ROUNDS),
      role: "MENTOR",
      mentor: {
        create: {
          name: "Ion Popescu",
          description: "Antrenor cu 10 ani experiență în fotbal juniori.",
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
      { label: "Am mers la antrenament", allowAdditionalString: false, order: 0 },
      { label: "Am respectat programul de odihnă", allowAdditionalString: false, order: 1 },
      { label: "Am mâncat sănătos", allowAdditionalString: true, order: 2 },
      { label: "Am exersat individual (tehnica)", allowAdditionalString: true, order: 3 },
    ];

    for (const item of formItems) {
      const existing = await db.checkinFormItem.findFirst({
        where: { formId: form.id, label: item.label },
      });
      if (!existing) {
        await db.checkinFormItem.create({ data: { ...item, formId: form.id } });
      }
    }
    console.log(`✅ Formular de pontaj demo creat.`);

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
  console.log("  MENTOR:      mentor1 / mentor1234");
  console.log("  PLAYER:      jucator1 / jucator1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
