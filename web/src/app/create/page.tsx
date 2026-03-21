import { createShiori } from "@/app/create/actions";
import { CreateForm } from "@/components/features/create/CreateForm";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-[#F5F4F1]">
      <div className="mx-auto max-w-[480px]">
        <header className="flex h-14 items-center bg-[#3D8A5A] px-5">
          <h1 className="font-semibold text-lg text-white tracking-tight">しおりを作る</h1>
        </header>
        {/* コンテンツエリア */}
        <CreateForm action={createShiori} showPassphrase />
      </div>
    </main>
  );
}
