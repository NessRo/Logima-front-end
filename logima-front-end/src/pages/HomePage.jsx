import {
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';


export default function HomePage() {

  // global UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  // project list pulled from JSON file at build‑time
  const [projects, setProjects] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Project name cannot be empty');
      return;
    }

    setProjects([
      ...projects,
      {
        id: crypto.randomUUID(),
        name: projectName.trim(),
        created_at: new Date().toISOString(),
        status: 'active',
      },
    ]);


    // Future: send to backend here
    setProjectName('');
    setError('');
    setModalOpen(false);
  }

  return (
    <>


      {/* Main content switches based on whether projects exist */}
      {projects.length === 0 ? (
        /* EMPTY STATE */
        <main className="relative w-full h-screen flex flex-col justify-center items-center px-4 overflow-hidden pt-20 gap-6">
          <p className="text-white text-lg md:text-2xl text-center">Add your first new project</p>

          <button
            className="flex items-center gap-2 bg-yellow-300 hover:bg-yellow-200 text-black font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
            onClick={() => setModalOpen(true)}
          >
            Add New Project <ArrowRight size={18} />
          </button>
        </main>
      ) : (
        /** Projects list **/
        <main className="relative w-full min-h-screen flex flex-col items-center pt-24 px-4 gap-8 overflow-y-auto">
          

          <div className="flex flex-col items-center w-full gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative w-[60%] max-w-2xl bg-[#181818] border border-white/10 rounded-xl p-6 flex flex-col gap-4 shadow-lg hover:shadow-violet-500/20 hover:border-violet-500 transition-colors-[#181818] border border-white/10 rounded-xl p-6 flex flex-col gap-4 shadow-lg hover:shadow-violet-500/20 hover:border-violet-500 transition-colors"
              >
                <h3 className="text-white text-lg font-semibold truncate pr-8">
                  {project.name}
                </h3>
                {/* metadata */}
                <p className="text-sm text-gray-400">Created: {project.created_at}</p>
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-violet-600/20 text-violet-300 capitalize w-max">
                  {project.status || 'unknown'}
                </span>

                {/* subtle arrow that fades in */}
                <ArrowRight
                  size={20}
                  className="absolute top-6 right-6 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>

          {/* Floating add‑project button */}
          <button
            className="fixed bottom-8 right-8 flex items-center gap-2 bg-yellow-300 hover:bg-yellow-200 text-black font-semibold py-3 px-6 rounded-full shadow-xl transition-colors"
            onClick={() => setModalOpen(true)}
          >
            New Project <ArrowRight size={18} />
          </button>
        </main>
      )}

      {/* New Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
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
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600"
                onClick={() => {
                  setModalOpen(false);
                  setError('');
                  setProjectName('');
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold rounded-md bg-yellow-300 text-black hover:bg-yellow-200"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
