import Link from "next/link";

/**
 * Explicit edit affordance for every row in the staff console. Rows also keep
 * their title link, so staff can open an item either way.
 */
export function EditButton({ href, label = "Edit" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="btn btn-outline h-7 px-3 text-[11px] uppercase tracking-[0.1em]">
      {label}
    </Link>
  );
}
