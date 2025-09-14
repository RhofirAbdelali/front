import { useEffect, useState } from "react";

type Product = { id: number; code: string; label: string; active: boolean };

export default function App() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const api = import.meta.env.VITE_API_URL as string;

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await fetch(`${api}/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Product[] = await res.json();
        setCount(Array.isArray(data) ? data.length : 0);
      } catch (e: any) {
        setError(e.message || "Erreur réseau");
      }
    })();
  }, [api]);

  return (
    <div style={{maxWidth: 720, margin: "40px auto", fontFamily: "system-ui"}}>
      <h1>Test connexion API</h1>
      <p>Base URL : <code>{api}</code></p>
      {error ? (
        <div style={{color:"#b91c1c", background:"#fee2e2", padding:10, borderRadius:8}}>
          Erreur : {error}
        </div>
      ) : count === null ? (
        <div>Chargement…</div>
      ) : (
        <div style={{fontSize:18, fontWeight:700}}>Produits : {count}</div>
      )}
      <p style={{color:"#6b7280"}}>Si le nombre s’affiche, la connexion est OK. Sinon, vérifie l’URL et la CORS.</p>
    </div>
  );
}
