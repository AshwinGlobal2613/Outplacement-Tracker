"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lists } from "@/lib/types";

interface Props {
  value: string;          // comma-separated string e.g. "Ashwin,Saima"
  listKey: keyof Lists;
  options: string[];
  placeholder?: string;
  canCreate?: boolean;
  canDelete?: boolean;
  onChange: (value: string) => void;
  onNewOption?: () => void;
  onOptionDeleted?: () => void;
}

function toArray(val: string): string[] {
  return val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

function fromArray(arr: string[]): string {
  return arr.join(",");
}

export function MultiCreatableSelect({
  value, listKey, options, placeholder = "Select people…",
  canCreate = false, canDelete = false,
  onChange, onNewOption, onOptionDeleted,
}: Props) {
  const selected = toArray(value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter(
    (o) => o.toLowerCase().includes(query.toLowerCase())
  );
  const showCreate =
    canCreate &&
    query.trim() &&
    !options.some((o) => o.toLowerCase() === query.toLowerCase().trim()) &&
    !selected.includes(query.trim());

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(fromArray(next));
  }

  function removeChip(opt: string) {
    onChange(fromArray(selected.filter((s) => s !== opt)));
  }

  async function handleCreate() {
    const trimmed = query.trim();
    if (!trimmed) return;
    await fetch("/api/lists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: listKey, value: trimmed }),
    });
    toggle(trimmed);
    onNewOption?.();
    setQuery("");
    inputRef.current?.focus();
  }

  async function handleDeleteOption(e: React.MouseEvent, opt: string) {
    e.stopPropagation();
    await fetch("/api/lists", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: listKey, value: opt }),
    });
    if (selected.includes(opt)) {
      onChange(fromArray(selected.filter((s) => s !== opt)));
    }
    onOptionDeleted?.();
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger box */}
      <div
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className={cn(
          "min-h-[38px] w-full cursor-text rounded-lg border border-border bg-background px-2.5 py-1.5 flex flex-wrap items-center gap-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors"
        )}
      >
        {/* Selected chips */}
        {selected.map((s) => (
          <span
            key={s}
            className="flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {s}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeChip(s); }}
              className="hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Search input */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setOpen(false); setQuery(""); }
            if (e.key === "Enter" && showCreate) { e.preventDefault(); handleCreate(); }
            if (e.key === "Backspace" && !query && selected.length > 0) {
              removeChip(selected[selected.length - 1]);
            }
          }}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground pointer-events-none" />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && !showCreate && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No options found</p>
            )}
            {filtered.map((opt) => {
              const isSelected = selected.includes(opt);
              return (
                <div
                  key={opt}
                  className="group flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent"
                >
                  <button
                    type="button"
                    onClick={() => toggle(opt)}
                    className="flex flex-1 items-center gap-2.5 text-left"
                  >
                    <span className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border bg-transparent"
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                    </span>
                    <span className={cn("font-medium", isSelected ? "text-primary" : "text-foreground")}>
                      {opt}
                    </span>
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteOption(e, opt)}
                      className="ml-2 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      title={`Remove "${opt}"`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {showCreate && (
            <button
              type="button"
              onClick={handleCreate}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-primary hover:bg-sidebar-accent transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
