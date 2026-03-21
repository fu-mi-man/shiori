"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
export function CopyUrlButton() {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("URLをコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  return (
    <Button
      className="h-11 flex-1 cursor-pointer rounded-full bg-white font-semibold text-[#3D8A5A] text-[13px] hover:bg-white/90"
      onClick={handleCopy}
    >
      URLをコピー
    </Button>
  );
}
