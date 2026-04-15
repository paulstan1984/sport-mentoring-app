import { requireSuperAdmin } from "@/lib/auth";
import ToolsClient from "./ToolsClient";

export default async function ToolsPage() {
  await requireSuperAdmin();
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Unelte
      </h1>
      <ToolsClient />
    </div>
  );
}
