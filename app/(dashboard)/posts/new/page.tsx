import { TopBar } from "@/components/TopBar";
import { PostForm } from "@/components/PostForm";

export default function NewPostPage() {
  return (
    <>
      <TopBar title="NEW_POST" />
      <div className="flex-1 overflow-y-auto bg-[#0d1516] p-6">
        <div className="mb-6 border-b border-[#333333] pb-4">
          <h2 className="font-mono text-xl font-semibold text-[#dce4e5] uppercase tracking-tight">
            CREATE_NEW_ENTRY
          </h2>
          <p className="font-mono text-xs text-[#849396] mt-1">
            Fields marked with <span className="text-[#ff571a]">*</span> are required.
          </p>
        </div>
        <PostForm mode="create" />
      </div>
    </>
  );
}
