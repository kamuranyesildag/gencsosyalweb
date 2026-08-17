import { useEffect, useState } from "react";

export function Home() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/health")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Sunucuya bağlanılamadı.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <h2 className="text-2xl font-bold mb-4">Hoş Geldiniz</h2>
      <p className="text-slate-600 mb-6">
        Genç Sosyal platformuna hoş geldiniz. Altyapı kurulumu başarılı.
      </p>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold mb-2">Sistem Durumu</h3>
        {loading ? (
          <p className="text-slate-500">Kontrol ediliyor...</p>
        ) : error ? (
          <p className="text-red-500 font-medium">{error}</p>
        ) : (
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center">
              <span className="w-24 font-medium">API:</span>
              <span className={health?.data?.api === 'ok' ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {health?.data?.api?.toUpperCase()}
              </span>
            </li>
            <li className="flex items-center">
              <span className="w-24 font-medium">Veritabanı:</span>
              <span className={health?.data?.database === 'ok' ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {health?.data?.database?.toUpperCase()}
              </span>
            </li>
            <li className="flex items-center">
              <span className="w-24 font-medium">Ortam:</span>
              <span>{health?.data?.environment}</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
