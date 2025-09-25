export default function ConfirmDialog({
  open,
  title = "Heads up",
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Continue",
  loading = false,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-xl"
      >
        <div className="text-base font-semibold text-white">{title}</div>
        <p className="mt-2 text-sm text-zinc-300">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-sm px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-800 hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="text-sm px-3 py-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-600 disabled:opacity-60"
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}