import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

function DesiredOutcomeNode({ data }) {
  const { outcome, editing, draft, saving, onDraftChange, onSave, onCancel, onEditRequest, onAiRefreshRequest, aiRefreshing } = data;

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); onSave(); }
    if (e.key === "Escape") { e.preventDefault(); onCancel(); }
  };

  return (
    <div className="group relative w-[420px] rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur shadow-lg shadow-black/40" onDoubleClick={onEditRequest}>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="text-2xl">Strategic Outcome</div>
          {!editing && (
            <button onClick={onEditRequest} className="ml-auto text-xs px-2 py-1 rounded-md border border-white/10 bg-zinc-800 text-zinc-200 hover:bg-zinc-700">Edit</button>
          )}
        </div>

        {!editing ? (
          <div className="text-sm text-zinc-300 leading-snug whitespace-pre-wrap">{outcome || "Not set"}</div>
        ) : (
          <div>
            <textarea
              autoFocus rows={6} value={draft} onChange={(e) => onDraftChange(e.target.value)} onKeyDown={onKeyDown}
              className="w-full text-sm leading-snug rounded-lg bg-zinc-800/80 border border-white/10 text-zinc-100 p-3 outline-none focus:ring-2 ring-white/10"
              placeholder="Write the strategic outcome…"
            />
            <div className="mt-3 flex items-center gap-2">
              <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 disabled:opacity-60">
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={onCancel} disabled={saving} className="text-sm px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-800 hover:bg-zinc-700">Cancel</button>
              <span className="ml-auto text-[11px] text-zinc-400">⌘/Ctrl+Enter to save • Esc to cancel</span>
            </div>
          </div>
        )}

        {!editing && (
          <div className="mt-auto pt-2 flex justify-end">
            <button
              onClick={onAiRefreshRequest}
              disabled={aiRefreshing}
              title="Regenerate this with AI"
              className="text-xs px-3 py-1.5 rounded-md border border-white/10 bg-indigo-600/90 hover:bg-indigo-600 disabled:opacity-60"
            >
              {aiRefreshing ? "Refreshing…" : "AI Refresh"}
            </button>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { desired: DesiredOutcomeNode };

export default function OpportunityMap({
  project,
  editing, draft, saving, aiRefreshing,
  onDraftChange, onSave, onCancel, onEditRequest, onAiRefreshRequest,
}) {
  const nodes = useMemo(() => ([
    {
      id: "desired",
      type: "desired",
      position: { x: 0, y: 0 },
      data: {
        outcome: project?.project_outcome,
        editing, draft, saving, aiRefreshing,
        onDraftChange, onSave, onCancel, onEditRequest, onAiRefreshRequest,
      },
    },
  ]), [project, editing, draft, saving, aiRefreshing, onDraftChange, onSave, onCancel, onEditRequest, onAiRefreshRequest]);

  return (
    <div className="h-[calc(100vh-140px)] w-full">
      <ReactFlow nodes={nodes} edges={[]} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.25 }} panOnDrag proOptions={{ hideAttribution: true }} style={{ width: "100%", height: "100%" }}>
        <Controls />
        <Background gap={24} className="opacity-30" />
      </ReactFlow>
    </div>
  );
}