"use client";
import {useState, useEffect} from "react";
import {Camera, Trash2, RotateCcw} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.tsx";
import {Button} from "../ui/button.tsx";
import {cn} from "../../app/cn.js";
import {Editor} from "../../app/Editor.jsx";
import {useSnapshots} from "@/lib/notebooks/hooks.ts";
import type {Notebook, Snapshot} from "@/lib/notebooks/schema.ts";

export type SnapshotsDialogProps = {
  notebook: Readonly<Notebook>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createSnapshot: (name: string | null) => Snapshot;
  onRestore: (snapshot: Snapshot) => void;
  deleteSnapshot: (snapshotId: string) => void;
};

export function SnapshotsDialog({notebook, open, onOpenChange, createSnapshot, onRestore}: SnapshotsDialogProps) {
  const {snapshots, deleteSnapshot} = useSnapshots(notebook.id);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open && notebook?.id) {
      if (snapshots.length > 0 && !selectedSnapshot) {
        setSelectedSnapshot(snapshots[0]);
      }
    } else {
      setSelectedSnapshot(null);
    }
  }, [open, notebook?.id, snapshots, selectedSnapshot]);

  function handleCreateSnapshot() {
    if (!notebook) return;
    setIsCreating(true);
    setTimeout(() => {
      const snapshot = createSnapshot(null);
      setSelectedSnapshot(snapshot);
      setIsCreating(false);
    }, 100);
  }

  function handleRestore(snapshotId: string) {
    const snapshot = snapshots.find((s) => s.id === snapshotId);
    if (snapshot) {
      onRestore(snapshot);
      onOpenChange(false);
    } else {
      console.error(`Snapshot with id ${snapshotId} not found`);
    }
  }

  function handleDelete(snapshotId: string, e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this snapshot?")) {
      deleteSnapshot(snapshotId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("w-[calc(100vw-8rem)]! h-[calc(100vh-8rem)]! max-w-none! flex flex-col p-0")}>
        <DialogHeader className={cn("px-6 pt-6")}>
          <DialogTitle>Snapshots</DialogTitle>
          <DialogDescription>
            Create snapshots to save the current state of your notebook. You can restore any snapshot later.
          </DialogDescription>
        </DialogHeader>
        <div className={cn("flex-1 flex overflow-hidden min-h-0 border-t border-stone-200")}>
          {/* Sidebar */}
          <div className={cn("w-80 border-r border-stone-200 flex flex-col")}>
            <div className={cn("p-4 border-b border-stone-200")}>
              <Button
                onClick={handleCreateSnapshot}
                disabled={isCreating || !notebook}
                className={cn("w-full")}
                size="sm"
              >
                <Camera className={cn("w-4 h-4")} />
                {isCreating ? "Creating..." : "Create Snapshot"}
              </Button>
            </div>
            <div className={cn("flex-1 overflow-y-auto")}>
              {snapshots.length === 0 ? (
                <div className={cn("text-center py-8 px-4 text-stone-500")}>
                  <Camera className={cn("w-12 h-12 mx-auto mb-2 opacity-50")} />
                  <p className={cn("text-sm")}>No snapshots yet. Create your first snapshot to get started.</p>
                </div>
              ) : (
                <div className={cn("flex flex-col")}>
                  {snapshots.map((snapshot, index) => (
                    <div
                      key={snapshot.id}
                      className={cn(
                        "p-3 border-b border-stone-100 cursor-pointer transition-colors",
                        selectedSnapshot?.id === snapshot.id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : "hover:bg-stone-50",
                      )}
                      onClick={() => setSelectedSnapshot(snapshot)}
                    >
                      <div className={cn("flex items-start justify-between gap-2")}>
                        <div className={cn("flex-1 min-w-0")}>
                          <div
                            className={cn(
                              "font-medium text-sm",
                              index === 0
                                ? "text-green-800"
                                : snapshot.name === null
                                  ? "text-stone-500"
                                  : "text-stone-900",
                            )}
                          >
                            {index === 0 ? "The Last Saved Version" : (snapshot.name ?? "Untitled snapshot")}
                          </div>
                          <div className={cn("text-xs text-stone-500 mt-1")}>{formatDate(snapshot.created)}</div>
                        </div>
                        <div className={cn("flex items-center")}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => handleDelete(snapshot.id, e)}
                            className={cn("h-6 w-6 text-stone-500 hover:text-red-600")}
                          >
                            <Trash2 className={cn("w-4 h-4")} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(snapshot.id);
                            }}
                            className={cn("h-6 w-6 text-stone-500 hover:text-blue-600")}
                          >
                            <RotateCcw className={cn("w-4 h-4")} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Code Viewer */}
          <div className={cn("flex-1 flex flex-col min-w-0")}>
            {selectedSnapshot ? (
              <>
                <div
                  className={cn("px-4 py-2 border-b border-stone-200 bg-stone-50 flex items-center justify-between")}
                >
                  <div>
                    <div
                      className={cn(
                        "font-medium text-sm",
                        selectedSnapshot.name === null ? "text-stone-500" : "text-stone-900",
                      )}
                    >
                      {selectedSnapshot.name ?? "Untitled snapshot"}
                    </div>
                    <div className={cn("text-xs text-stone-500")}>{formatDate(selectedSnapshot.created)}</div>
                  </div>
                  <Button onClick={() => handleRestore(selectedSnapshot.id)} size="sm" className={cn("ml-4")}>
                    <RotateCcw className={cn("w-4 h-4")} />
                    Restore
                  </Button>
                </div>
                <div className={cn("flex-1 overflow-y-scroll p-4 relative")}>
                  <Editor
                    initialCode={selectedSnapshot.content}
                    autoRun={false}
                    pinToolbar
                    readonly={true}
                    onUserInput={() => {}}
                  />
                </div>
              </>
            ) : (
              <div className={cn("flex-1 flex items-center justify-center text-stone-400")}>
                <div className={cn("text-center")}>
                  <Camera className={cn("w-16 h-16 mx-auto mb-4 opacity-30")} />
                  <p>Select a snapshot to view its code</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
}
