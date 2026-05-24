import nodemailer from "nodemailer";

interface SignupNotificationData {
  name: string;
  email: string;
  phone?: string | null;
  description?: string | null;
  theme: string;
}

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendSignupNotification(data: SignupNotificationData): Promise<void> {
  const notificationEmail = process.env.SIGNUP_NOTIFICATION_EMAIL;
  if (!notificationEmail) return;

  const transporter = createTransporter();
  if (!transporter) return;

  const themeLabel = data.theme === "MIND_MENTOR" ? "🧠 MindMentor" : "⚽ SportMentor";

  const text = [
    "Cerere nouă de înregistrare antrenor:",
    "",
    `Nume: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Telefon: ${data.phone}` : null,
    `Temă: ${themeLabel}`,
    data.description ? `\nDescriere:\n${data.description}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: notificationEmail,
    subject: `[Sport Mentor] Cerere nouă de înregistrare: ${data.name}`,
    text,
  });
}
