import Link from "next/link";

export function Header({ className = "max-w-xl px-6" }: { className?: string }) {
  return (
    <header className="bg-[#3D8A5A]">
      <div className={`mx-auto flex h-14 items-center ${className}`}>
        <Link
          className="font-[family-name:var(--font-outfit)] font-bold text-white text-xl tracking-tight"
          href="/"
        >
          Tabiji
        </Link>
      </div>
    </header>
  );
}
