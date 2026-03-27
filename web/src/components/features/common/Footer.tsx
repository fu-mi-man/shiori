import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#3D8A5A] px-6 pt-8 pb-10">
      <div className="mx-auto flex flex-col items-center gap-4">
        <Link
          className="flex items-center gap-2 font-[family-name:var(--font-outfit)] font-bold text-2xl text-white tracking-tight"
          href="/"
        >
          <Image alt="" className="rounded-lg" height={36} src="/tabiji-logo.png" width={36} />
          Tabiji
        </Link>
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
        <span className="text-white/[.53] text-xs">© Tabiji</span>
      </div>
    </footer>
  );
}
