// src/pages/ProjectPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { projectsApi } from "@/lib/api";

import ReactFlow, { Background, Controls, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

function ConfirmDialog({ open, title = "Heads up", message, onCancel, onConfirm, confirmLabel = "Continue", loading = false }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
        <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-xl">
          <div className="text-base font-semibold text-white">{title}</div>
          <p className="mt-2 text-sm text-zinc-300">{message}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-800 hover:bg-zinc-700">
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


// --- Node: Desired/Strategic Outcome (inline editable) ---
function DesiredOutcomeNode({ data }) {
  const {
    outcome,
    editing,
    draft,
    saving,
    // NEW:
    onEditRequest,
    onAiRefreshRequest,
    aiRefreshing,
    onDraftChange,
    onSave,
    onCancel,
  } = data;

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); onSave(); }
    if (e.key === "Escape") { e.preventDefault(); onCancel(); }
  };

  return (
    <div
      className="group relative w-[420px] rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur shadow-lg shadow-black/40"
      onDoubleClick={onEditRequest}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="text-2xl">🎯</div>
          {!editing && (
            <button
              onClick={onEditRequest}
              className="ml-auto text-xs px-2 py-1 rounded-md border border-white/10 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
            >
              Edit
            </button>
          )}
        </div>

        <div className="mt-1 text-sm font-semibold text-white">Strategic Outcome</div>

        {!editing ? (
          <div className="text-sm text-zinc-300 mt-1 leading-snug whitespace-pre-wrap">
            {outcome || "Not set"}
          </div>
        ) : (
          <div className="mt-2">
            <textarea
              autoFocus
              rows={6}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full text-sm leading-snug rounded-lg bg-zinc-800/80 border border-white/10 text-zinc-100 p-3 outline-none focus:ring-2 ring-white/10"
              placeholder="Write the strategic outcome…"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={onCancel}
                disabled={saving}
                className="text-sm px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-800 hover:bg-zinc-700"
              >
                Cancel
              </button>
              <span className="ml-auto text-[11px] text-zinc-400">
                ⌘/Ctrl+Enter to save • Esc to cancel
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom-right AI Refresh */}
      {!editing && (
        <button
          onClick={onAiRefreshRequest}
          disabled={aiRefreshing}
          title="Regenerate this with AI"
          className="absolute bottom-3 right-3 text-xs px-3 py-1.5 rounded-md border border-white/10 bg-indigo-600/90 hover:bg-indigo-600 disabled:opacity-60"
        >
          {aiRefreshing ? "Refreshing…" : "AI Refresh"}
        </button>
      )}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { desired: DesiredOutcomeNode };

export default function ProjectPage() {
  const { projectId } = useParams();

  const [project, setProject]   = useState(null);
  const [loading, setLoading]   = useState(true);

  // editing state
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState("");
  const [saving, setSaving]     = useState(false);

  // AI refresh state
  const [aiRefreshing, setAiRefreshing] = useState(false);

  // confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmIntent, setConfirmIntent] = useState(null); // 'edit' | 'aiRefresh' | null
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    projectsApi
      .get(projectId, { signal: ac.signal })
      .then((data) => {
        setProject(data);
        setDraft(data?.project_outcome ?? "");
      })
      .catch((err) => {
        if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
          console.error("Failed to load project:", err);
        }
        setProject(null);
        setDraft("");
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [projectId]);

  // --- perform actions ---
  const performStartEditing = useCallback(() => {
    setDraft(project?.project_outcome ?? "");
    setEditing(true);
  }, [project]);

  const performAiRefresh = useCallback(async () => {
    try {
      setAiRefreshing(true);
      if (projectsApi.aiRefreshOutcome) {
        await projectsApi.aiRefreshOutcome(projectId);
      } else {
        await new Promise((r) => setTimeout(r, 800)); // demo delay
      }
      const fresh = await projectsApi.get(projectId);
      setProject(fresh);
      setDraft(fresh?.project_outcome ?? "");
    } catch (e) {
      console.error("AI Refresh failed:", e);
    } finally {
      setAiRefreshing(false);
    }
  }, [projectId]);

  // --- request (opens confirm) ---
  const onEditRequest = useCallback(() => {
    setConfirmIntent("edit");
    setConfirmOpen(true);
  }, []);
  const onAiRefreshRequest = useCallback(() => {
    setConfirmIntent("aiRefresh");
    setConfirmOpen(true);
  }, []);

  // --- confirm modal handlers ---
  const handleConfirm = useCallback(async () => {
    if (!confirmIntent) return;
    try {
      setConfirmLoading(true);
      if (confirmIntent === "edit") {
        performStartEditing();
      } else if (confirmIntent === "aiRefresh") {
        await performAiRefresh();
      }
      setConfirmOpen(false);
      setConfirmIntent(null);
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmIntent, performStartEditing, performAiRefresh]);

  const handleCancel = useCallback(() => {
    setConfirmOpen(false);
    setConfirmIntent(null);
  }, []);

  // save/cancel existing
  const onSave = useCallback(async () => {
    try {
      setSaving(true);
      setProject((p) => (p ? { ...p, project_outcome: draft } : p));
      await projectsApi.update(projectId, { project_outcome: draft });
      setEditing(false);
    } catch (e) {
      console.error("Save failed:", e);
      try {
        const fresh = await projectsApi.get(projectId);
        setProject(fresh);
        setDraft(fresh?.project_outcome ?? "");
      } catch {}
    } finally {
      setSaving(false);
    }
  }, [draft, projectId]);

  const onCancel = useCallback(() => {
    setDraft(project?.project_outcome ?? "");
    setEditing(false);
  }, [project]);

  // node definitions
  const nodes = useMemo(() => {
    if (!project) return [];
    return [
      {
        id: "desired",
        type: "desired",
        position: { x: 0, y: 0 },
        data: {
          outcome: project.project_outcome,
          editing,
          draft,
          saving,
          onDraftChange: setDraft,
          onSave,
          onCancel,
          // NEW:
          onEditRequest,
          onAiRefreshRequest,
          aiRefreshing,
        },
      },
    ];
  }, [project, editing, draft, saving, onSave, onCancel, onEditRequest, onAiRefreshRequest, aiRefreshing]);

  const edges = []; // none yet

  return (
    <main className="h-[calc(100vh-56px)] w-full bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {loading ? (
        <div className="h-full w-full flex items-center justify-center text-zinc-300">Loading…</div>
      ) : !project ? (
        <div className="h-full w-full flex items-center justify-center text-zinc-300">Project not found</div>
      ) : (
        <div className="h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            panOnDrag
            proOptions={{ hideAttribution: true }}
            style={{ width: "100%", height: "100%" }}
          >
            <Controls />
            <Background gap={24} className="opacity-30" />
          </ReactFlow>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        loading={confirmLoading}
        title="This will change the Opportunity Map"
        message="Editing or running AI Refresh can update the entire opportunity map for this project. Click Continue to proceed."
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        confirmLabel="Continue"
      />
    </main>
  );
}
