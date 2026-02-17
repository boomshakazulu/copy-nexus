import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useI18n } from "../../i18n";

const TOOLBAR = [
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
  ["blockquote", "code-block"],
  ["link"],
  ["clean"],
];

const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "align",
  "blockquote",
  "code-block",
  "link",
];

export default function RichTextField({ value, onChange, placeholder }) {
  const { t } = useI18n();
  const resolvedPlaceholder = placeholder ?? t("admin.richText.placeholder");
  const [stats, setStats] = React.useState({ words: 0, chars: 0 });

  const updateStatsFromHtml = (html) => {
    const doc = new DOMParser().parseFromString(
      `<div>${html || ""}</div>`,
      "text/html"
    );
    const text = (doc.body.textContent || "").trim();
    const words = text ? text.split(/\s+/).length : 0;
    setStats({ words, chars: text.length });
  };

  const handleChange = (content) => {
    onChange(content || "");
    updateStatsFromHtml(content || "");
  };

  React.useEffect(() => {
    updateStatsFromHtml(value || "");
  }, [value]);

  return (
    <div className="w-full">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        placeholder={resolvedPlaceholder}
        modules={{
          toolbar: TOOLBAR,
          clipboard: { matchVisual: false },
        }}
        formats={FORMATS}
        className="rich-text-field"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-gray-500">
        <span>{t("admin.richText.pasteHint")}</span>
        <span>
          {t("admin.richText.wordCount", { count: stats.words })} -{" "}
          {t("admin.richText.charCount", { count: stats.chars })}
        </span>
      </div>
      <style>{`
        .rich-text-field .ql-container {
          min-height: 160px;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .rich-text-field .ql-toolbar {
          border-radius: 0.5rem 0.5rem 0 0;
        }
        .rich-text-field .ql-editor {
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
