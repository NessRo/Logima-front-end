// src/pages/ProjectPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { projectsApi } from "@/lib/api";

import ReactFlow, { Background, Controls, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

// --- Node: Desired/Strategic Outcome (inline editable) ---
function DesiredOutcomeNode({ data }) {
  const {
    outcome,
    editing,
    draft,
    saving,
    onEditStart,
    onDraftChange,
    onSave,
    onCancel,
  } = data;

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className="group w-[420px] rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur shadow-lg shadow-black/40"
      onDoubleClick={onEditStart}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="text-2xl">🎯</div>
          {!editing && (
            <button
              onClick={onEditStart}
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

      {/* Handles so we can attach children later */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { desired: DesiredOutcomeNode };

export default function ProjectPage() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // editing state
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

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

  // actions
  const onEditStart = useCallback(() => {
    setDraft(project?.project_outcome ?? "");
    setEditing(true);
  }, [project]);

  const onCancel = useCallback(() => {
    setDraft(project?.project_outcome ?? "");
    setEditing(false);
  }, [project]);

  const onSave = useCallback(async () => {
    try {
      setSaving(true);
      // Optimistic update locally
      setProject((p) => (p ? { ...p, project_outcome: draft } : p));

      // Update API — adjust method name if your client differs (put/patch/update)
      await projectsApi.update(projectId, { project_outcome: draft });

      setEditing(false);
    } catch (e) {
      console.error("Save failed:", e);
      // Revert if needed by reloading latest from API (lightweight approach)
      try {
        const fresh = await projectsApi.get(projectId);
        setProject(fresh);
        setDraft(fresh?.project_outcome ?? "");
      } catch {}
    } finally {
      setSaving(false);
    }
  }, [draft, projectId]);

  // Build a single-node React Flow graph once we have data
  const nodes = useMemo(() => {
    if (!project) return [];
    return [
      {
        id: "desired",
        type: "desired",
        position: { x: 0, y: 0 }, // centered by fitView
        data: {
          outcome: project.project_outcome,
          editing,
          draft,
          saving,
          onEditStart,
          onDraftChange: setDraft,
          onSave,
          onCancel,
        },
      },
    ];
  }, [project, editing, draft, saving, onEditStart, onSave, onCancel]);

  const edges = []; // none yet

  return (
    // Full-height page area (subtract your 56px top bar; change if your header is different)
    <main className="h-[calc(100vh-56px)] w-full bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {loading ? (
        <div className="h-full w-full flex items-center justify-center text-zinc-300">
          Loading…
        </div>
      ) : !project ? (
        <div className="h-full w-full flex items-center justify-center text-zinc-300">
          Project not found
        </div>
      ) : (
        <div className="h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
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
    </main>
  );
}
