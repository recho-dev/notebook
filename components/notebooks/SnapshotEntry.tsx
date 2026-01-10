"use client";
import {useState, useRef, useEffect} from "react";
import {Trash2, RotateCcw, Pencil, Check, X, FileCheck} from "lucide-react";
import {Button} from "../ui/button.tsx";
import {Input} from "../ui/input.tsx";
import {cn} from "../../app/cn.js";
import type {Snapshot} from "@/lib/notebooks/schema.ts";

export type SnapshotEntryProps = {
  snapshot: Snapshot;
  index: number;
  isSelected: boolean;
  onSelect: (snapshot: Snapshot) => void;
  onDelete: (snapshotId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onRestore: (snapshotId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onRename: (snapshotId: string, newName: string) => void;
};

export function SnapshotEntry({
  snapshot,
  index,
  isSelected,
  onSelect,
  onDelete,
  onRestore,
  onRename,
}: SnapshotEntryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(snapshot.name ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleStartEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setEditName(snapshot.name ?? "");
    setIsEditing(true);
  }

  function handleSave(e?: React.MouseEvent) {
    e?.stopPropagation();
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== snapshot.name) {
      onRename(snapshot.id, trimmedName);
    }
    setIsEditing(false);
  }

  function handleCancel(e?: React.MouseEvent) {
    e?.stopPropagation();
    setIsEditing(false);
    setEditName(snapshot.name ?? "");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }

  const isCurrentVersion = index === 0;
  const displayName = snapshot.name ?? "Untitled snapshot";
  const canEdit = !isCurrentVersion; // Don't allow editing the current version

  // Current version (first entry) - distinct styling, no name (like git staging area)
  if (isCurrentVersion) {
    return (
      <div
        key={snapshot.id}
        className={cn(
          "p-3 cursor-pointer transition-colors border-b-2 border-stone-200",
          isSelected
            ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-l-emerald-500"
            : "bg-gradient-to-r from-stone-50/50 to-stone-100/50 hover:from-emerald-50/50 hover:to-teal-50/50",
        )}
        onClick={() => onSelect(snapshot)}
      >
        <div className={cn("flex items-center justify-between gap-2")}>
          <div className={cn("flex items-center gap-2")}>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold",
                "bg-emerald-100 text-emerald-700 border border-emerald-200",
              )}
            >
              <FileCheck className={cn("w-3 h-3")} />
              Current
            </div>
            <span className={cn("text-xs text-stone-500")}>{formatDate(snapshot.created)}</span>
          </div>
          <div className={cn("flex items-center")}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => onDelete(snapshot.id, e)}
              className={cn("h-6 w-6 text-stone-500 hover:text-red-600")}
            >
              <Trash2 className={cn("w-4 h-4")} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Historical snapshots - original styling
  return (
    <div
      key={snapshot.id}
      className={cn(
        "p-3 border-b border-stone-100 cursor-pointer transition-colors",
        isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-stone-50",
      )}
      onClick={() => !isEditing && onSelect(snapshot)}
    >
      <div className={cn("flex items-start justify-between gap-2")}>
        <div className={cn("flex-1 min-w-0")}>
          {isEditing ? (
            <div className={cn("flex items-center gap-1")} onClick={(e) => e.stopPropagation()}>
              <Input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn("h-7 text-sm")}
                placeholder="Snapshot name"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleSave}
                className={cn("h-7 w-7 text-green-600 hover:text-green-700")}
              >
                <Check className={cn("w-4 h-4")} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCancel}
                className={cn("h-7 w-7 text-stone-500 hover:text-stone-700")}
              >
                <X className={cn("w-4 h-4")} />
              </Button>
            </div>
          ) : (
            <>
              <div className={cn("flex items-center gap-1")}>
                <div
                  className={cn("font-medium text-sm", snapshot.name === null ? "text-stone-500" : "text-stone-900")}
                >
                  {displayName}
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleStartEdit}
                    className={cn("h-5 w-5 text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100")}
                  >
                    <Pencil className={cn("w-3 h-3")} />
                  </Button>
                )}
              </div>
              <div className={cn("text-xs text-stone-500 mt-1")}>{formatDate(snapshot.created)}</div>
            </>
          )}
        </div>
        {!isEditing && (
          <div className={cn("flex items-center")}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => onDelete(snapshot.id, e)}
              className={cn("h-6 w-6 text-stone-500 hover:text-red-600")}
            >
              <Trash2 className={cn("w-4 h-4")} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => onRestore(snapshot.id, e)}
              className={cn("h-6 w-6 text-stone-500 hover:text-blue-600")}
            >
              <RotateCcw className={cn("w-4 h-4")} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Create relative time formatter
  const rtf = new Intl.RelativeTimeFormat("en", {numeric: "auto"});

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return rtf.format(-diffMins, "minute");
  if (diffHours < 24) return rtf.format(-diffHours, "hour");
  if (diffDays < 7) return rtf.format(-diffDays, "day");

  // For older dates, use DateTimeFormat
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
