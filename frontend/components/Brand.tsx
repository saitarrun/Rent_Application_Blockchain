import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image src="/logo.svg" alt="Rental Suite" width={36} height={36} priority className="rounded-xl" />
      <div>
        <p className="text-sm font-semibold text-slate-100">Rental Suite</p>
        <p className="text-xs text-slate-400">Smart rental agreements</p>
      </div>
    </Link>
  );
}
