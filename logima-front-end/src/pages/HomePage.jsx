import {
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useState, useEffect, useCallback} from 'react';
import { projectsApi } from "@/lib/api";
import { formatUtc } from '@/utils/dates';
import { useAuthStore } from '@/stores/auth';


export default function HomePage() {

  // UI
  const [modalOpen, setModalOpen] = useState(false);


  // form state
  const [projectName, setProjectName] = useState("");
  const [descriptionValue, setProjectDescription] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // server-backed data
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  //delete state
  const [deletingId, setDeletingId] = useState(null);


  // handle initial project load and refreshes
  const refreshProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    setProjectsError("");
    try {
      const data = await projectsApi.list();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setProjectsError(err.message || "Failed to load projects.");
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  // load project list on page load
  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);


  // handle creation of new project
  async function handleProjectCreate(e) {
    e.preventDefault();

    const name = projectName.trim();
    const description = descriptionValue.trim();

    if (!name) return setError("Project name cannot be empty");
    if (!description) return setError("Project description cannot be empty");

    setIsSubmitting(true);
    setError("");

    try {
      await projectsApi.create({
        name,
        description,
        status: "active",
      });

      // reset & close
      setProjectName("");
      setProjectDescription("");
      setCreatedBy("");
      setModalOpen(false);

      // reload from server (single source of truth)
      await refreshProjects();
    } catch (err) {
      setError(err.message || "Something went wrong creating the project.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // handle project de-activate
  async function handleSoftDelete(id) {
    const ok = confirm("Delete this project? This can’t be undone.");
    if (!ok) return;

    setDeletingId(id);
    try {
      await projectsApi.softDelete(id);     // calls DELETE API
      await refreshProjects();          // re-fetch list from server
    } catch (err) {
      setProjectsError(err.message || "Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  }

  const hasProjects = projects?.length > 0;

  return (
    <>


      {/* Main content */}
      
      <main className="relative w-full min-h-screen flex flex-col items-center pt-24 px-4 gap-8 overflow-y-auto">
        {console.log(useAuthStore((s) => s.user))}
        {isLoadingProjects ? (
          <div className="mt-20 text-gray-300">Loading projects…</div>
        ) : projectsError ? (
          <div className="mt-20 text-red-400">{projectsError}</div>
        ) : !hasProjects ? (
          /* EMPTY STATE */
          <div className="relative w-full h-[70vh] flex flex-col justify-center items-center gap-6">
            <p className="text-white text-lg md:text-2xl text-center">
              Add your first new project
            </p>
            <button
              className="flex items-center gap-2 bg-yellow-300 hover:bg-yellow-200 text-black font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
              onClick={() => setModalOpen(true)}
            >
              Add New Project <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center w-full gap-8">
              {projects.map((project) => (
                <div
                  key={project.id ?? project.name}
                  className="group relative w-[80%] max-w-6xl bg-[#181818] border border-white/10 rounded-xl p-6 flex flex-col gap-4 shadow-lg hover:shadow-violet-500/20 hover:border-violet-500 transition-colors"
                >
                  <h3 className="text-white text-lg font-semibold truncate pr-8">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {project.description}
                  </p>
                  <p className="text-sm text-gray-400">
                    Created: {formatUtc(project.created_at ?? project.created)}
                  </p>
                  <span className="inline-block px-2 py-0.5 text-xs rounded bg-violet-600/20 text-violet-300 capitalize w-max">
                    {project.status || "unknown"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSoftDelete(project.id)}
                    disabled={deletingId === project.id}
                    title="Archive project"
                    aria-label="Archive project"
                    className="absolute top-6 right-6 p-2 rounded-md text-violet-400 opacity-80
                              hover:opacity-100 hover:text-red-400 hover:bg-red-500/10
                              focus:outline-none focus:ring-2 focus:ring-red-400/40
                              disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {deletingId === project.id ? (
                      <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Floating add-project button */}
            <button
              className="fixed bottom-8 right-8 flex items-center gap-2 bg-yellow-300 hover:bg-yellow-200 text-black font-semibold py-3 px-6 rounded-full shadow-xl transition-colors"
              onClick={() => setModalOpen(true)}
            >
              New Project <ArrowRight size={18} />
            </button>
          </>
        )}
      </main>

      {/* New Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleProjectCreate}
            className="bg-[#181818] w-11/12 max-w-md p-8 rounded-xl border border-white/10 flex flex-col gap-6"
          >
            <h2 className="text-white text-xl font-semibold">Create a new project</h2>

            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full p-3 rounded-md bg-[#222] text-white placeholder-gray-400 outline-none border border-transparent focus:border-violet-500"
            />

            <textarea
              value={descriptionValue}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="IMPORTANT! Enter a short description or hypothesis to validate. This description will be used by the LLM to validate against."
              className="w-full min-h-[120px] p-3 rounded-md bg-neutral-900 text-white placeholder:text-gray-400 border border-transparent outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-y"
            />

            {!!error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600"
                onClick={() => {
                  setModalOpen(false);
                  setError("");
                  setProjectName("");
                  setProjectDescription("");
                  setCreatedBy("");
                }}
              >
                Cancel
              </button>

              {/* Submit with sleek spinner + fade */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative flex items-center justify-center bg-yellow-300 hover:bg-yellow-200 text-black font-semibold py-2.5 px-5 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed transition min-w-[120px] overflow-hidden"
              >
                {/* Spinner layer */}
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                    isSubmitting ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                </span>

                {/* Text layer */}
                <span
                  className={`transition-opacity duration-200 ${
                    isSubmitting ? "opacity-0" : "opacity-100"
                  }`}
                >
                  Submit
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
