"use client";

import { useRouter } from "next/navigation";
import { markLibraryItemRead } from "@/actions/player";

type LibraryItem = {
  id: number;
  name: string;
  fileType: string;
  isRead: boolean;
};

export function LibraryList({ items }: { items: LibraryItem[] }) {
  const router = useRouter();

  async function handleOpen(id: number) {
    // Mark as read
    await markLibraryItemRead(id);
    // Open file in new tab
    window.open(`/api/files/${id}`, "_blank");
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        Mentorul tău nu a adăugat încă materiale în bibliotecă.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleOpen(item.id)}
          className="w-full bg-white dark:bg-gray-900 shadow rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow text-left"
        >
          <span className="text-3xl">{getFileIcon(item.fileType)}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{item.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.fileType.toUpperCase()}</p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full shrink-0 ${
              item.isRead
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
            }`}
          >
            {item.isRead ? "Citit" : "Nou"}
          </span>
        </button>
      ))}
    </div>
  );
}

function getFileIcon(fileType: string): string {
  if (fileType.includes("pdf")) return "📄";
  if (fileType.includes("word") || fileType.includes("doc")) return "📝";
  if (fileType.includes("image") || fileType.match(/png|jpg|jpeg|gif/)) return "🖼️";
  return "📁";
}
