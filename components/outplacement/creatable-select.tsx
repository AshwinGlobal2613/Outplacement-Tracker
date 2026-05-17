"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lists } from "@/lib/types";

interface Props {
  value: string;
  listKey: keyof Lists;
  options: string[];
  placeholder?: string;
  canCreate?: boolean;
  onChange: (value: string) => void;
  onNewOption?: (value: string) => void;
}

export function CreatableSelect({ value, listKey, options, placeholder = "Select or type…", canCreate = false, onChange, onNewOption }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
  const showCreate = query.trim() && !options.some((o) => o.toLowerCase() === query.toLowerCase().trim());

  async function handleCreate(val: string) {
    const trimmed = val.trim();
    await fetch("/api/lists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: listKey, value: trimmed }),
    });
    onChange(trimmed);
    onNewOption?.(trimmed);
    setQuery(trimmed);
    setOpen(false);
  }

  function handleSelect(val: string) {
    onChange(val);
    setQuery(val);
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className="pointer-events-none h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && !showCreate && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No options found</p>
            )}
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent",
                  opt === value ? "text-primary font-medium" : "text-foreground"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          {showCreate && canCreate && (
            <button
              type="button"
              onClick={() => handleCreate(query)}
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
