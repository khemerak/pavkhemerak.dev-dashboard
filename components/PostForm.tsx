"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPostDetail } from "@/lib/api";

interface PostFormProps {
  initial?: Partial<BlogPostDetail>;
  mode: "create" | "edit";
}

const CATEGORY_COLORS = [
  { label: "Cyan (General)", value: "border-primary/50 text-primary-container" },
  { label: "Orange (Rust/System)", value: "border-secondary/50 text-secondary-light" },
  { label: "Green (Security)", value: "border-tertiary/50 text-tertiary-light" },
  { label: "Blue (Cloud)", value: "border-primary/50 text-primary-container" },
];

export function PostForm({ initial, mode }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    date: initial?.date ?? new Date().toISOString().split("T")[0],
    readTime: initial?.readTime ?? "5 min read",
    category: initial?.category ?? "",
    categoryColor: initial?.categoryColor ?? "border-primary/50 text-primary-container",
    imageUrl: initial?.imageUrl ?? "",
    imageAlt: initial?.imageAlt ?? "",
    tags: (initial?.tags ?? []).join(", "),
    codeSnippet: initial?.codeSnippet ?? "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      imageUrl: form.imageUrl || "",
      imageAlt: form.imageAlt || "",
      codeSnippet: form.codeSnippet || "",
    };

    try {
      const url = mode === "create" ? "/api/blog-proxy" : `/api/blog-proxy/${initial?.slug}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.text();
        setError(err || "Operation failed");
      } else {
        setSuccess(mode === "create" ? "Post created!" : "Post updated!");
        setTimeout(() => router.push("/posts"), 800);
      }
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      {error && (
        <div className="border border-[#ff571a]/50 bg-[#ff571a]/5 px-4 py-3 font-mono text-xs text-[#ff571a]">
          ERROR: {error}
        </div>
      )}
      {success && (
        <div className="border border-[#00f13d]/50 bg-[#00f13d]/5 px-4 py-3 font-mono text-xs text-[#00f13d]">
          SUCCESS: {success}
        </div>
      )}

      {/* Row: Slug + Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="SLUG" required>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="my-post-slug"
            required
            disabled={mode === "edit"}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </Field>
        <Field label="DATE" required>
          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
        </Field>
      </div>

      {/* Title */}
      <Field label="TITLE" required>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Post title..."
          required
        />
      </Field>

      {/* Excerpt */}
      <Field label="EXCERPT" required>
        <textarea
          value={form.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          placeholder="Short summary of the post..."
          rows={3}
          required
        />
      </Field>

      {/* Content */}
      <Field label="CONTENT (MARKDOWN)">
        <textarea
          value={form.content}
          onChange={(e) => update("content", e.target.value)}
          placeholder="Full markdown content..."
          rows={14}
          className="font-mono text-xs"
        />
      </Field>

      {/* Row: Category + Color + ReadTime */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="CATEGORY" required>
          <input
            type="text"
            value={form.category}
            onChange={(e) => update("category", e.target.value.toUpperCase())}
            placeholder="GENERAL"
            required
          />
        </Field>
        <Field label="CATEGORY_COLOR">
          <select
            value={form.categoryColor}
            onChange={(e) => update("categoryColor", e.target.value)}
          >
            {CATEGORY_COLORS.map((c) => (
              <option key={c.label} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="READ_TIME">
          <input
            type="text"
            value={form.readTime}
            onChange={(e) => update("readTime", e.target.value)}
            placeholder="5 min read"
          />
        </Field>
      </div>

      {/* Row: Image URL + Alt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="IMAGE_URL">
          <input
            type="text"
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="https://... or /assets/img/..."
          />
        </Field>
        <Field label="IMAGE_ALT">
          <input
            type="text"
            value={form.imageAlt}
            onChange={(e) => update("imageAlt", e.target.value)}
            placeholder="Descriptive alt text"
          />
        </Field>
      </div>

      {/* Tags */}
      <Field label="TAGS (COMMA-SEPARATED)">
        <input
          type="text"
          value={form.tags}
          onChange={(e) => update("tags", e.target.value)}
          placeholder="rust, web, security"
        />
      </Field>

      {/* Code Snippet */}
      <Field label="CODE_SNIPPET (OPTIONAL)">
        <textarea
          value={form.codeSnippet}
          onChange={(e) => update("codeSnippet", e.target.value)}
          placeholder="Optional code snippet to display on the card..."
          rows={4}
          className="font-mono text-xs"
        />
      </Field>

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="font-mono text-xs uppercase tracking-widest px-6 py-3 border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "EXECUTING..." : mode === "create" ? "[ CREATE_POST ]" : "[ SAVE_CHANGES ]"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/posts")}
          className="font-mono text-xs uppercase tracking-widest px-6 py-3 border border-[#333333] text-[#849396] hover:border-[#849396] hover:text-[#dce4e5] transition-all duration-75"
        >
          [ CANCEL ]
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-widest text-[#849396] mb-1.5">
        {label}{required && <span className="text-[#ff571a] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
