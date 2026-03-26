import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#3D8A5A] px-6 pt-8 pb-10">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        <span className="font-bold text-2xl text-white tracking-tight">Shiori</span>
        <span className="text-base text-white/80">旅のしおり作成サービス</span>
        <nav className="flex flex-col items-center gap-2 pt-2">
          <Link
            className="text-white/[.67] text-xs leading-relaxed hover:text-white/80"
            href="/privacy"
          >
            プライバシーポリシー
          </Link>
          <Link
            className="text-white/[.67] text-xs leading-relaxed hover:text-white/80"
            href="/terms"
          >
            利用規約
          </Link>
        </nav>
        <span className="text-white/[.53] text-xs">© Shiori</span>
      </div>
    </footer>
  );
}
