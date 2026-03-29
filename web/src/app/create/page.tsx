import { createShiori } from "@/app/create/actions";
import { Header } from "@/components/features/common/Header";
import { CreateForm } from "@/components/features/create/CreateForm";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-[#F5F4F1]">
      <Header className="max-w-[480px] px-5" />
      <div className="mx-auto max-w-[480px]">
        <CreateForm action={createShiori} />
      </div>
    </main>
  );
}
