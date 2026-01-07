import {Pencil, AsteriskIcon, CheckIcon} from "lucide-react";
import {useEffect, useRef, useState} from "react";

export type NotebookTitleProps = {
  title: string;
  setTitle: (notebook: string) => void;
  isDraft: boolean;
  isDirty: boolean;
  onCreate: () => void;
};

export function NotebookTitle({title, setTitle, isDraft, isDirty, onCreate}: NotebookTitleProps) {
  const [showInput, setShowInput] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showInput) titleRef.current?.focus?.();
  }, [showInput]);

  useEffect(() => {
    setTitleDraft(title);
  }, [title]);

  // Only submit rename when blur with valid title.
  function onTitleBlur() {
    setShowInput(false);
    // The title can't be empty.
    if (!titleDraft) return setTitleDraft(title);
    setTitle(titleDraft);
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitleDraft(e.target.value);
  }

  function onTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      onTitleBlur();
      titleRef.current?.blur?.();
    }
  }

  function onRename() {
    setShowInput(true);
    setTitleDraft(title);
  }

  return (
    <div className="flex items-center gap-2">
      {isDraft && (
        <button onClick={onCreate} className="bg-green-700 text-white rounded-md px-3 py-1 text-sm hover:bg-green-800">
          Create
        </button>
      )}
      {!showInput && !isDraft && (
        <button onClick={onRename}>
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {showInput || isDraft ? (
        <input
          type="text"
          value={titleDraft}
          onChange={onTitleChange}
          onBlur={onTitleBlur}
          onKeyDown={onTitleKeyDown}
          ref={titleRef}
          className="border border-gray-200 rounded-md px-3 py-1 text-sm bg-white"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
      ) : (
        <span className="text-sm py-1 border border-gray-100 rounded-md">{title}</span>
      )}
      {isDraft ? (
        isDirty ? (
          <AsteriskIcon
            className="w-4 h-4 text-amber-600 animate-pulse"
            data-tooltip-id="action-tooltip"
            data-tooltip-content="Unsaved changes"
            data-tooltip-place="bottom"
          />
        ) : null
      ) : (
        <CheckIcon
          className="w-4 h-4 text-green-600"
          data-tooltip-id="action-tooltip"
          data-tooltip-content="Saved"
          data-tooltip-place="bottom"
        />
      )}
    </div>
  );
}
