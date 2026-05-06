import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const { theme } = await searchParams;
  const isMindMentor = theme === "mind";

  return <LoginForm isMindMentor={isMindMentor} />;
}
