"use client";

import { markLibraryItemRead } from "@/actions/player";
import { FileText, Image, FileSpreadsheet, File } from "lucide-react";

type LibraryItem = {
  id: number;
  name: string;
  fileType: string;
  isRead: boolean;
};

function FileIcon({ fileType }: { fileType: string }) {
  const cls = "shrink-0";
  if (fileType.includes("pdf")) return <FileText size={20} className={cls} style={{ color: "var(--kit-danger)" }} />;
  if (fileType.includes("word") || fileType.includes("doc")) return <FileText size={20} className={cls} style={{ color: "var(--kit-accent-light)" }} />;
  if (fileType.includes("image") || fileType.match(/png|jpg|jpeg|gif/)) return <Image size={20} className={cls} style={{ color: "var(--kit-success)" }} />;
  if (fileType.includes("sheet") || fileType.includes("excel") || fileType.includes("csv")) return <FileSpreadsheet size={20} className={cls} style={{ color: "var(--kit-warning)" }} />;
  return <File size={20} className={cls} style={{ color: "var(--kit-text-3)" }} />;
}

export function LibraryList({ items }: { items: LibraryItem[] }) {
  async function handleOpen(id: number) {
    await markLibraryItemRead(id);
    window.location.href = `/api/files/${id}`;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--kit-text-2)" }}>
        Mentorul tău nu a adăugat încă materiale în bibliotecă.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleOpen(item.id)}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-left"
          style={{
            background: "var(--kit-surface)",
            border: "1px solid var(--kit-border)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--kit-border-mid)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--kit-border)";
          }}
        >
          <FileIcon fileType={item.fileType} />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--kit-text)" }}
            >
              {item.name}
            </p>
            <p
              className="text-xs mt-0.5 uppercase tracking-wide"
              style={{ color: "var(--kit-text-3)" }}
            >
              {item.fileType.split("/").pop()?.toUpperCase() ?? item.fileType.toUpperCase()}
            </p>
          </div>
          <span
            className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shrink-0"
            style={{
              background: item.isRead ? "var(--kit-success-dim)" : "var(--kit-accent-dim)",
              color: item.isRead ? "var(--kit-success)" : "var(--kit-accent-light)",
            }}
          >
            {item.isRead ? "Citit" : "Nou"}
          </span>
        </button>
      ))}
    </div>
  );
}

