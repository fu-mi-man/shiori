import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
};

export function EditButton({ id }: Props) {
  return (
    <Button
      asChild
      className="h-11 flex-1 cursor-pointer rounded-full bg-white font-semibold text-[#3D8A5A] text-[13px] hover:bg-white/90 [a]:hover:bg-white/90"
    >
      <Link href={`/i/${id}/edit`}>編集する</Link>
    </Button>
  );
}
