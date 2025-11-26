import {
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useState, useEffect, useCallback} from 'react';
import { projectsApi } from "@/lib/api";
import { formatUtc } from '@/utils/dates';
import { useAuthStore } from '@/stores/auth';
import { Link } from "react-router-dom";


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
      
      <main
        className="
          relative w-full min-h-[100dvh]
          flex flex-col items-center
          pt-14 px-4 pb-16
          bg-gradient-to-b from-zinc-950 to-zinc-900
          text-white
        "
      >
        {isLoadingProjects ? (
          <div className="mt-32 text-zinc-300">Loading projects…</div>
        ) : projectsError ? (
          <div className="mt-32 text-red-400">{projectsError}</div>
        ) : !hasProjects ? (
          /* EMPTY STATE */
          <div className="relative w-full h-[70vh] flex flex-col justify-center items-center">
            <div
              className="
                w-[min(480px,100%)]
                rounded-2xl border border-white/10
                bg-white/5 backdrop-blur
                px-6 py-8
                shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                text-center space-y-4
              "
            >
              <p className="text-zinc-50 text-lg md:text-2xl">
                Add your first project
              </p>
              <p className="text-sm text-zinc-400">
                Create a project with a clear hypothesis so the LLM knows what to validate against.
              </p>
              <button
                className="
                  inline-flex items-center gap-2
                  bg-teal-500 hover:bg-teal-400 text-white
                  font-semibold py-2.5 px-6 rounded-xl
                  shadow-[0_16px_40px_rgba(20,184,166,0.6)]
                  transition text-sm
                "
                onClick={() => setModalOpen(true)}
              >
                Add New Project <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-full max-w-5xl flex flex-col gap-6">
              <header className="flex items-center justify-between gap-3 mt-4 mb-1">
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-zinc-50">
                    Your projects
                  </h1>
                  <p className="text-sm text-zinc-400">
                    Each project represents a problem or hypothesis you&apos;re validating.
                  </p>
                </div>
                <button
                  className="
                    hidden sm:inline-flex items-center gap-2
                    rounded-xl border border-white/10
                    bg-white/5 px-3 py-2 text-xs
                    text-zinc-100 hover:bg-white/10
                    transition
                  "
                  onClick={() => setModalOpen(true)}
                >
                  New Project
                  <ArrowRight size={14} />
                </button>
              </header>

              <div className="flex flex-col items-center w-full gap-4">
                {projects.map((project) => {
                  const id = project.id ?? project.name; // fallback if no id yet
                  return (
                    <div
                      key={id}
                      className="
                        group relative w-[min(1100px,100%)]
                        bg-white/5
                        border border-white/10
                        rounded-2xl p-5
                        flex flex-col gap-2.5
                        shadow-[0_14px_40px_rgba(0,0,0,0.65)]
                        hover:bg-white/10
                        hover:border-teal-400/70
                        transition
                      "
                    >
                      <h3 className="text-zinc-50 text-sm md:text-base font-semibold truncate pr-10">
                        {project.name}
                      </h3>
                      <p className="text-xs md:text-sm text-zinc-300">
                        {project.description}
                      </p>
                      <p className="text-[11px] md:text-xs text-zinc-400">
                        Created: {formatUtc(project.created_at ?? project.created)}
                      </p>
                      <span className="inline-block px-2.5 py-0.5 text-[11px] rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/40 capitalize w-max">
                        {project.status || "unknown"}
                      </span>

                      {/* Trash (top-right) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSoftDelete(project.id);
                        }}
                        disabled={deletingId === project.id}
                        title="Archive project"
                        aria-label="Archive project"
                        className="
                          absolute top-4 right-12 z-10 p-1.5 rounded-md
                          text-zinc-500 hover:text-red-400
                          hover:bg-red-500/10
                          focus:outline-none focus:ring-2 focus:ring-red-500/40
                          disabled:opacity-60 disabled:cursor-not-allowed
                          transition
                        "
                      >
                        {deletingId === project.id ? (
                          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>

                      {/* Arrow (bottom-right) — green hover */}
                      <Link
                        to={`/projects/${encodeURIComponent(id)}`}
                        onClick={(e) => e.stopPropagation()}
                        title="Open project"
                        aria-label={`Open project ${project.name}`}
                        className="
                          absolute bottom-4 right-4 z-10 p-1.5 rounded-md
                          text-zinc-500 group-hover:text-teal-400
                          hover:bg-teal-500/10
                          focus:outline-none focus:ring-2 focus:ring-teal-500/40
                          transition
                        "
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating add-project button */}
            <button
              className="
                fixed bottom-8 right-8
                inline-flex items-center gap-2
                bg-teal-500 hover:bg-teal-400 text-white
                font-semibold py-2.5 px-5 rounded-full
                shadow-[0_16px_40px_rgba(20,184,166,0.7)]
                transition text-sm
                sm:hidden
              "
              onClick={() => setModalOpen(true)}
            >
              New Project <ArrowRight size={16} />
            </button>
          </>
        )}
      </main>

      {/* New Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleProjectCreate}
            className="
              w-[min(520px,92vw)]
              bg-zinc-950/95
              rounded-2xl border border-white/10
              shadow-[0_24px_70px_rgba(0,0,0,0.9)]
              p-6 md:p-8
              flex flex-col gap-5
              text-white
            "
          >
            <h2 className="text-zinc-50 text-xl font-semibold">Create a new project</h2>
            <p className="text-xs text-zinc-400">
              Start with a concrete problem or hypothesis you want to validate.
            </p>

            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
              className="
                w-full p-3 rounded-xl
                bg-black/40 border border-white/10
                text-sm text-zinc-50 placeholder:text-zinc-500
                outline-none
                focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40
                transition
              "
            />

            <textarea
              value={descriptionValue}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="IMPORTANT! Enter a short description or hypothesis to validate. This description will be used by the LLM to validate against."
              className="
                w-full min-h-[120px] p-3 rounded-xl
                bg-black/40 border border-white/10
                text-sm text-zinc-50 placeholder:text-zinc-500
                outline-none resize-y
                focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40
                transition
              "
            />

            {!!error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="
                  px-4 py-2 text-sm rounded-xl
                  bg-white/5 text-zinc-200
                  hover:bg-white/10
                  transition
                "
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
                className="
                  relative flex items-center justify-center
                  bg-teal-500 hover:bg-teal-400 text-white
                  font-semibold py-2.5 px-5 rounded-xl
                  disabled:opacity-70 disabled:cursor-not-allowed
                  transition min-w-[120px] overflow-hidden
                  shadow-[0_16px_40px_rgba(20,184,166,0.8)]
                  text-sm
                "
              >
                {/* Spinner layer */}
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                    isSubmitting ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
