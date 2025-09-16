// src/pages/ProjectPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { projectsApi } from "@/lib/api";


export default function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);

    projectsApi
      .get(projectId, { signal: ac.signal })
      .then((data) => setProject(data))
      .catch((err) => {
        // ignore abort errors; log others
        if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
          console.error("Failed to load project:", err);
        }
        setProject(null);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [projectId]);



  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="max-w-6xl mx-auto">

        <div className="mt-6 rounded-xl border border-white/10 bg-[#181818] p-8 text-gray-300">
          {/* Blank state — build your UI here */}
           {loading ? "Loading…" : project?.project_outcome ?? "Project not found"}
        </div>
      </div>
    </main>
  );
}
