import React, { useMemo } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export default function JourneyMap({ project }) {
  // derive journey nodes/edges from project (placeholder)
  const nodes = useMemo(() => ([
    { id: "j1", position: { x: 80, y: 30 }, data: { label: "Discover" }, type: "input" },
    { id: "j2", position: { x: 300, y: 30 }, data: { label: "Evaluate" } },
    { id: "j3", position: { x: 520, y: 30 }, data: { label: "Decide" }, type: "output" },
  ]), [project]);

  const edges = useMemo(() => ([
    { id: "e1-2", source: "j1", target: "j2", animated: true },
    { id: "e2-3", source: "j2", target: "j3", animated: true },
  ]), [project]);

  return (
    <div className="h-[calc(100vh-140px)] w-full">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Controls />
        <Background gap={24} className="opacity-30" />
      </ReactFlow>
    </div>
  );
}