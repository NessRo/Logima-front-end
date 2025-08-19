// src/pages/ProjectPage.jsx
import { useParams } from "react-router-dom";

export default function ProjectPage() {
  const { projectId } = useParams();

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-white">
          Project {projectId}
        </h1>

        <div className="mt-6 rounded-xl border border-white/10 bg-[#181818] p-8 text-gray-300">
          {/* Blank state — build your UI here */}
          This page is intentionally blank for now.
        </div>
      </div>
    </main>
  );
}
