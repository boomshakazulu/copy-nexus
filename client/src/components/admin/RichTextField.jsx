import React from "react";
import { useI18n } from "../../i18n";

export default function RichTextField({ value, onChange, placeholder }) {
  const { t } = useI18n();
  const ref = React.useRef(null);
  const resolvedPlaceholder = placeholder ?? t("admin.richText.placeholder");

  // Use deprecated execCommand for simplicity (works fine for basic formatting)
  const exec = (cmd, arg = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
  };

  const addLink = () => {
    const url = prompt(t("admin.richText.enterUrl"));
    if (!url) return;
    exec("createLink", url);
  };

  const clear = () => {
    ref.current.innerHTML = "";
    onChange("");
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => exec("bold")}
          className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="rounded border px-2 py-1 text-sm hover:bg-gray-50 italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          className="rounded border px-2 py-1 text-sm hover:bg-gray-50 underline"
        >
          U
        </button>
        <span className="mx-1 h-4 w-px bg-gray-300" />
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
        >
          {t("admin.richText.unorderedList")}
        </button>
        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
        >
          {t("admin.richText.orderedList")}
        </button>
        <button
          type="button"
          onClick={addLink}
          className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
        >
          {t("admin.richText.link")}
        </button>
        <span className="mx-1 h-4 w-px bg-gray-300" />
        <button
          type="button"
          onClick={clear}
          className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
        >
          {t("admin.richText.clear")}
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        className="min-h-[120px] w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00294D]/20 prose prose-sm max-w-none"
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        // keep editor synced when opening modal with existing value
        dangerouslySetInnerHTML={{ __html: value || "" }}
        data-placeholder={resolvedPlaceholder}
        style={{ whiteSpace: "pre-wrap" }}
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before{
          content: attr(data-placeholder);
          color: #9CA3AF; /* gray-400 */
        }
      `}</style>
    </div>
  );
}
