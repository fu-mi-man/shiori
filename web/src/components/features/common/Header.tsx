import Image from "next/image";
import Link from "next/link";

export function Header({ className = "max-w-xl px-6" }: { className?: string }) {
  return (
    <header className="bg-[#3D8A5A]">
      <div className={`mx-auto flex h-14 items-center ${className}`}>
        <Link
          className="flex items-center gap-2 font-[family-name:var(--font-outfit)] font-bold text-white text-xl tracking-tight"
          href="/"
        >
          <Image alt="" className="rounded-lg" height={32} src="/tabiji-logo.png" width={32} />
          Tabiji
        </Link>
      </div>
    </header>
  );
}
