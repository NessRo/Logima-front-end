import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback, Suspense, lazy } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { projectsApi } from "@/lib/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import { UploadCloud } from "lucide-react";
import UploadDialog from "@/components/ui/upload-dialog";


const OpportunityMap = lazy(() => import("@/features/opportunity/OpportunityMap"));
const JourneyMap     = lazy(() => import("@/features/journey/JourneyMap"));

export default function ProjectPage() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // editing state (for desired-outcome node in OpportunityMap)
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // AI refresh state
  const [aiRefreshing, setAiRefreshing] = useState(false);

  // confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmIntent, setConfirmIntent] = useState(null); // 'edit' | 'aiRefresh' | null
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("opportunity"); // or "journey"
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleUploadSubmit = useCallback(async (files) => {
    // TODO: replace with your real API call
    // await projectsApi.uploadDocuments(projectId, files)
    await new Promise((r) => setTimeout(r, 600));
  }, [projectId]);

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

  // actions used by OpportunityMap
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
        await new Promise((r) => setTimeout(r, 800));
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

  // open confirm first, then run the action
  const onEditRequest = useCallback(() => { setConfirmIntent("edit"); setConfirmOpen(true); }, []);
  const onAiRefreshRequest = useCallback(() => { setConfirmIntent("aiRefresh"); setConfirmOpen(true); }, []);
  const handleConfirm = useCallback(async () => {
    if (!confirmIntent) return;
    try {
      setConfirmLoading(true);
      if (confirmIntent === "edit") performStartEditing();
      if (confirmIntent === "aiRefresh") await performAiRefresh();
      setConfirmOpen(false);
      setConfirmIntent(null);
    } finally { setConfirmLoading(false); }
  }, [confirmIntent, performStartEditing, performAiRefresh]);
  const handleCancel = useCallback(() => { setConfirmOpen(false); setConfirmIntent(null); }, []);

  return (
    <main className="min-h-[100dvh] pt-14 w-full bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {loading ? (
        <div className="h-full w-full flex items-center justify-center text-zinc-300">Loading…</div>
      ) : !project ? (
        <div className="h-full w-full flex items-center justify-center text-zinc-300">Project not found</div>
      ) : (
        <div className="h-full w-full p-4">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
             <div className="flex items-center justify-between gap-3">
               <TabsList className="w-[290px] grid grid-cols-3 rounded-xl bg-white/5 p-1">
                 <TabsTrigger value="journey" className="rounded-lg text-xs">Journey</TabsTrigger>
                 <TabsTrigger value="opportunity" className="rounded-lg text-xs">Opportunity</TabsTrigger>
                 <TabsTrigger value="Customer cards" className="rounded-lg text-xs">Customer cards</TabsTrigger>
               </TabsList>
               <button
                 type="button"
                 onClick={() => setUploadOpen(true)}
                 className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
               >
                 <UploadCloud className="h-4 w-4" />
                 Upload
               </button>
             </div>

            {/* Keep content mounted so React Flow preserves viewport; hide the inactive one */}
            <div className="mt-3 flex-1">
              <TabsContent value="opportunity" forceMount className={activeTab !== "opportunity" ? "hidden" : ""}>
                <Suspense fallback={<div className="h-full grid place-items-center text-zinc-300">Loading map…</div>}>
                  <OpportunityMap
                    project={project}
                    // outcome-edit props
                    editing={editing}
                    draft={draft}
                    saving={saving}
                    aiRefreshing={aiRefreshing}
                    onDraftChange={setDraft}
                    onSave={onSave}
                    onCancel={onCancel}
                    onEditRequest={onEditRequest}
                    onAiRefreshRequest={onAiRefreshRequest}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="journey" forceMount className={activeTab !== "journey" ? "hidden" : ""}>
                <Suspense fallback={<div className="h-full grid place-items-center text-zinc-300">Loading map…</div>}>
                  <JourneyMap project={project} />
                </Suspense>
              </TabsContent>
            </div>
          </Tabs>
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

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSubmit={handleUploadSubmit}
        title="Upload project artifacts"
        description="Attach customer-discovery notes, transcripts, screenshots, etc."
        accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg"
      />
    </main>
  );
}