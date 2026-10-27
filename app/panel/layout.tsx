import Link from "next/link";
import { requireBusiness } from "@/lib/auth";
import { PanelNav } from "@/components/panel-nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const b = await requireBusiness();
  return (
    <div className="wrap" style={{ paddingBottom: 48 }}>
      <header className="top">
        <Link href="/panel" className="logo"><i>★</i><span className="hide-sm">YorumKart · </span>{b.name}</Link>
        <form action="/cikis" method="post"><button className="btn ghost" type="submit">Çıkış</button></form>
      </header>
      <PanelNav />
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  );
}
