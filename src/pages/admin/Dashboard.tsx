import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

type TariffVersion = Record<string, any>;
type Subscription = {
  id: number; productCode?: string; status?: string; createdAt?: string;
  primeTTC?: number; currency?: string;
};

const COLORS = ["#fa3899","#c20f66","#9e1053","#ff6eb6","#ffa3d1"];

export default function Dashboard() {
  const [versions, setVersions] = useState<TariffVersion[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async ()=>{
      setLoading(true);
      try {
        const [vRes, sRes] = await Promise.all([
          apiFetch("/admin/tariff-versions"),
          apiFetch("/admin/subscriptions")
        ]);
        setVersions(await vRes.json());
        setSubs(await sRes.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpi = useMemo(() => {
    const total = subs.length;
    const signed = subs.filter(s => (s.status||"").toUpperCase()==="SIGNED").length;
    const totalPrime = subs.reduce((sum, s)=> sum + (Number(s.primeTTC)||0), 0);
    const avgPrime = total ? totalPrime/total : 0;
    const today = new Date();
    const todayCount = subs.filter(s => isSameDay(s.createdAt, today)).length;
    const monthCount = subs.filter(s => isSameMonth(s.createdAt, today)).length;
    const activeVersionsCount = versions.filter((v:any)=> v?.isActive===true || String(v?.isActive)==="true").length;
    const ccy = (subs.find(s => s.currency)?.currency) || "EUR";
    return { total, signed, totalPrime, avgPrime, todayCount, monthCount, activeVersionsCount, ccy };
  }, [subs, versions]);

  const lineData = useMemo(()=>{
    const map = new Map<string, number>();
    subs.forEach(s=>{
      if(!s.createdAt) return;
      const d = new Date(s.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      map.set(key, (map.get(key)||0)+1);
    });
    return Array.from(map.entries()).sort(([a],[b])=> a.localeCompare(b))
      .map(([k,v])=> ({ month: k, count: v }));
  }, [subs]);

  const pieData = useMemo(()=>{
    const map = new Map<string, number>();
    subs.forEach(s=> {
      const k = (s.productCode||"-").toString();
      map.set(k, (map.get(k)||0)+1);
    });
    return Array.from(map.entries()).map(([name, value])=> ({ name, value }));
  }, [subs]);

  const barData = useMemo(()=>{
    const map = new Map<string, number>();
    subs.forEach(s=>{
      const st = (s.status||"-").toUpperCase();
      map.set(st, (map.get(st)||0)+1);
    });
    return Array.from(map.entries()).map(([name, value])=> ({ name, value }));
  }, [subs]);

  if (loading) return <div>Chargement…</div>;

  return (
    <div style={{display:"grid", gap:16}}>
      {/* KPI */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
        gap:35
      }}>
        <Card title="Souscriptions" value={kpi.total.toLocaleString("fr-FR")} />
        <Card title="Signées" value={kpi.signed.toLocaleString("fr-FR")} />
        <Card title="Prime TTC totale" value={fmtMoney(kpi.totalPrime, kpi.ccy)} />
        <Card title="Aujourd’hui" value={kpi.todayCount.toLocaleString("fr-FR")} />
        <Card title="Ce mois" value={kpi.monthCount.toLocaleString("fr-FR")} />
      </div>

      {/* Graphiques */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"1.2fr 1fr 1fr",
        gap:30
      }}>
        <Panel title="Evolution des souscriptions (mensuel)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#fa3899" strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Répartition par produit">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie dataKey="value" data={pieData} innerRadius={50} outerRadius={90} paddingAngle={3}>
                {pieData.map((_, i)=> <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Statuts">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false}/>
              <Tooltip />
              <Bar dataKey="value" fill="#c20f66" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

function Card({title, value}:{title:string; value:string}) {
  return (
    <div style={{
      border:"1px solid #f5dcea", borderRadius:14, background:"#fff", padding:14
    }}>
      <div style={{fontSize:12, color:"#6b7280"}}>{title}</div>
      <div style={{fontSize:26, fontWeight:800}}>{value}</div>
    </div>
  );
}

function Panel({title, children}:{title:string; children:React.ReactNode}) {
  return (
    <div style={{
      border:"1px solid #f5dcea", borderRadius:14, background:"#fff", padding:14
    }}>
      <div style={{fontWeight:800, marginBottom:8}}>{title}</div>
      {children}
    </div>
  );
}

function fmtMoney(v?: number, ccy?: string) {
  if (v == null) return "-";
  try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: ccy || "EUR" }).format(v); }
  catch { return `${v} ${ccy || "EUR"}`; }
}
function isSameDay(iso?: string, ref?: Date) {
  if (!iso || !ref) return false;
  const d = new Date(iso);
  return d.getFullYear()===ref.getFullYear() && d.getMonth()===ref.getMonth() && d.getDate()===ref.getDate();
}
function isSameMonth(iso?: string, ref?: Date) {
  if (!iso || !ref) return false;
  const d = new Date(iso);
  return d.getFullYear()===ref.getFullYear() && d.getMonth()===ref.getMonth();
}
