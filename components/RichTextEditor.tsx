"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect, useState } from "react";

interface RichTextEditorProps {
  name: string;
  initialValue?: string;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  name,
  initialValue = "",
  placeholder,
  minHeight = "min-h-32",
}: RichTextEditorProps) {
  const [htmlValue, setHtmlValue] = useState(initialValue);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    immediatelyRender: false,
    content: initialValue,
    onCreate: ({ editor: currentEditor }) => {
      setHtmlValue(currentEditor.getHTML());
    },
    onUpdate: ({ editor: currentEditor }) => {
      setHtmlValue(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `outline-none ${minHeight} px-3 py-2`,
      },
    },
  });

  // Reset content when initialValue changes (e.g., after form submit)
  useEffect(() => {
    if (editor && initialValue !== editor.getHTML()) {
      editor.commands.setContent(initialValue || "");
      setHtmlValue(editor.getHTML());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  const toolbar = [
    {
      label: "B",
      title: "Bold",
      className: "font-bold",
      action: () => editor?.chain().focus().toggleBold().run(),
      active: () => editor?.isActive("bold"),
    },
    {
      label: "I",
      title: "Italic",
      className: "italic",
      action: () => editor?.chain().focus().toggleItalic().run(),
      active: () => editor?.isActive("italic"),
    },
    {
      label: "UL",
      title: "Listă",
      className: "",
      action: () => editor?.chain().focus().toggleBulletList().run(),
      active: () => editor?.isActive("bulletList"),
    },
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Hidden input carries HTML value on form submit */}
      <input type="hidden" name={name} value={htmlValue} readOnly />

      {/* Toolbar */}
      <div className="flex gap-1 p-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {toolbar.map((btn) => (
          <button
            key={btn.title}
            type="button"
            title={btn.title}
            onClick={btn.action}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              btn.className
            } ${
              btn.active?.()
                ? "bg-gray-200 dark:bg-gray-700"
                : ""
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="bg-white dark:bg-gray-900 min-h-32">
        {placeholder && !editor?.getText() && (
          <p className="absolute px-3 py-2 text-gray-400 pointer-events-none text-sm">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
