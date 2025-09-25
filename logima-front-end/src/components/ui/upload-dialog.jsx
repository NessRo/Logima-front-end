import { useCallback, useState } from "react";
import { UploadCloud, X, FileText } from "lucide-react";

export default function UploadDialog({
  open,
  onOpenChange,
  onSubmit,                 // (files: File[]) => Promise<void> | void
  title = "Upload documents",
  description = "PDF, DOCX, PNG, CSV…",
  accept = undefined,      // e.g., ".pdf,.docx,.png,.csv" or "image/*"
  multiple = true,
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const close = useCallback(() => {
    onOpenChange?.(false);
    // keep queue or clear? choose one:
    // setFiles([]);
  }, [onOpenChange]);

  const pickFiles = useCallback((list) => {
    setFiles((prev) => [...prev, ...Array.from(list || [])]);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    pickFiles(e.dataTransfer.files);
  }, [pickFiles]);

  const handleUpload = useCallback(async () => {
    try {
      setUploading(true);
      await onSubmit?.(files);
      close();
      setFiles([]);
    } finally {
      setUploading(false);
    }
  }, [files, onSubmit, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-xl"
      >
        <button
          aria-label="Close"
          onClick={close}
          className="absolute right-3 top-3 text-zinc-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="text-base font-semibold">{title}</div>
        <p className="mt-1 text-sm text-zinc-400">{description}</p>

        {/* Dropzone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="mt-4 grid place-items-center rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-300"
        >
          <UploadCloud className="mb-2 h-6 w-6" />
          <div>Drag & drop files here</div>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
            <input
              type="file"
              multiple={multiple}
              accept={accept}
              className="hidden"
              onChange={(e) => pickFiles(e.target.files)}
            />
            Choose files
          </label>
        </div>

        {/* Queue */}
        {files.length > 0 && (
          <ul className="mt-3 max-h-32 overflow-auto text-xs text-zinc-400 divide-y divide-white/5">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 py-1">
                <span className="flex items-center gap-2 truncate">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="truncate">{f.name}</span>
                </span>
                <span className="shrink-0">{Math.ceil(f.size / 1024)} KB</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={close}
            className="rounded-lg border border-white/10 bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="rounded-lg bg-indigo-600/90 px-3 py-1.5 text-sm hover:bg-indigo-600 disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}