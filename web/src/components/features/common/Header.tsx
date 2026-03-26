import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-14 items-center bg-[#3D8A5A] px-5">
      <Link
        className="font-[family-name:var(--font-outfit)] font-bold text-white text-xl tracking-tight"
        href="/"
      >
        Tabiji
      </Link>
    </header>
  );
}
