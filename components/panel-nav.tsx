"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/panel", label: "Özet" },
  { href: "/panel/istekler", label: "Yorum iste" },
  { href: "/panel/ayarlar", label: "Ayarlar & QR" },
];

export function PanelNav() {
  const p = usePathname();
  return (
    <nav className="nav" aria-label="Panel">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={p === i.href ? "on" : ""}>{i.label}</Link>
      ))}
    </nav>
  );
}
