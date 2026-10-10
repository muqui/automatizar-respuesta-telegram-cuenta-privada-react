// src/pages/TemplatesPage.tsx

import { useEffect, useState } from "react";
import { getTemplates } from "../api/template.api";

export default function TemplatesPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getTemplates().then((res) => setData(res.data));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Plantillas
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Mensajes guardados disponibles
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-gray-400">#{t.id}</p>
            <p className="mt-1 font-medium text-gray-800">
              {t.keyword || "(sin keyword)"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              messageId: {t.messageId}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}