import { TopBar } from "@/components/TopBar";
import { PostForm } from "@/components/PostForm";
import { getPost } from "@/lib/api";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post;
  try {
    post = await getPost(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <TopBar title={`EDIT // ${slug.toUpperCase()}`} />
      <div className="flex-1 overflow-y-auto bg-[#0d1516] p-6">
        <div className="mb-6 border-b border-[#333333] pb-4">
          <h2 className="font-mono text-xl font-semibold text-[#dce4e5] uppercase tracking-tight">
            EDIT_ENTRY
          </h2>
          <p className="font-mono text-xs text-[#849396] mt-1">
            Slug cannot be changed after creation.
          </p>
        </div>
        <PostForm mode="edit" initial={post} />
      </div>
    </>
  );
}
