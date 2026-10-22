// src/pages/CronSettingsPage.tsx

import { useEffect, useState } from "react";
import {
  getCronConfig,
  updateQueueCron,
  updateProcessorCron,
  updateInterval,
  updateAttempts,
} from "../api/cron.api";
import {
  getTemplates,
  getTemplatesCount,
  rescanTemplates,
} from "../api/template.api";

function minutesToCron(minutes: number): string {
  if (minutes === 60) return "0 0 * * * *";
  if (minutes === 120) return "0 0 */2 * * *";
  if (minutes === 180) return "0 0 */3 * * *";
  if (minutes === 240) return "0 0 */4 * * *";
  return `0 */${minutes} * * * *`;
}

function cronToMinutes(cron: string): number {
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 2) return 10;
  const minute = parts[1];
  const hour = parts[2];
  if (minute === "0" && hour === "*") return 60;
  if (minute === "0" && hour.startsWith("*/")) {
    return parseInt(hour.replace("*/", ""), 10) * 60;
  }
  if (minute.startsWith("*/")) {
    return parseInt(minute.replace("*/", ""), 10);
  }
  return 10;
}

export default function CronSettingsPage() {
  // ... estados de crons ...
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [queueMinutes, setQueueMinutes] = useState(10);
  const [processorMinutes, setProcessorMinutes] = useState(10);
  const [interval, setIntervalMinutes] = useState(60);
  const [attempts, setAttempts] = useState(3);

  // 🔥 Estados para templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesCount, setTemplatesCount] = useState(0);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [rescanning, setRescanning] = useState(false);
  const [lastRescan, setLastRescan] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchConfig = () => {
    setLoading(true);
    getCronConfig()
      .then((res) => {
        setConfig(res.data);
        setQueueMinutes(cronToMinutes(res.data.queueCron));
        setProcessorMinutes(cronToMinutes(res.data.processorCron));
        setIntervalMinutes(res.data.channelMinIntervalMinutes);
        setAttempts(res.data.maxSendAttempts);
      })
      .finally(() => setLoading(false));
  };

  // 🔥 Cargar templates
  const fetchTemplates = () => {
    setLoadingTemplates(true);
    Promise.all([getTemplates(), getTemplatesCount()])
      .then(([templatesRes, countRes]) => {
        setTemplates(templatesRes.data);
        setTemplatesCount(countRes.data.total);
      })
      .catch((err) => console.error("Error al cargar templates:", err))
      .finally(() => setLoadingTemplates(false));
  };

  useEffect(() => {
    fetchConfig();
    fetchTemplates();
  }, []);

  // 🔥 Recargar templates
  const handleRescan = async () => {
    const confirmar = window.confirm(
      `⚠️ Esto borrará TODOS los templates actuales (${templatesCount}) y volverá a escanear el canal fuente.\n\n¿Continuar?`,
    );
    if (!confirmar) return;

    setRescanning(true);
    try {
      const res = await rescanTemplates();
      setLastRescan(new Date().toLocaleString("es-MX"));
      await fetchTemplates();
      alert(`✅ ${res.data.message}`);
    } catch (error: any) {
      console.error("Error al recargar:", error);
      alert(
        `❌ Error: ${error.response?.data?.message ?? error.message}`,
      );
    } finally {
      setRescanning(false);
    }
  };

  // ... handlers existentes (saveQueueCron, saveProcessorCron, etc.) ...

  // 🔥 Filtrar templates por búsqueda
  const filteredTemplates = templates.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.keyword?.toLowerCase().includes(q) ||
      String(t.messageId).includes(q)
    );
  });

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Cargando...</p>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Cambia frecuencias y administra las plantillas
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ─── Cron QueueService ─── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-gray-800">
            📋 Cron del QueueService
          </h2>
          <p className="mb-3 text-xs text-gray-500">
            Cada cuántos minutos se genera una fila en la cola.
            <br />
            Actual: <code className="rounded bg-gray-100 px-1">{config.queueCron}</code>{" "}
            ({cronToMinutes(config.queueCron)} min)
          </p>

          <label className="mb-1 block text-xs font-medium text-gray-600">
            Frecuencia en minutos
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={queueMinutes}
              onChange={(e) =>
                setQueueMinutes(Math.max(1, Number(e.target.value)))
              }
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <span className="shrink-0 text-sm text-gray-500">min</span>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Se ejecutará:{" "}
            <code className="rounded bg-gray-100 px-1">
              {minutesToCron(queueMinutes)}
            </code>
          </p>

          <div className="mt-2 flex flex-wrap gap-1">
            {[5, 10, 15, 20, 30, 60].map((m) => (
              <button
                key={m}
                onClick={() => setQueueMinutes(m)}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  queueMinutes === m
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>

          <button
            onClick={async () => {
              setSaving(true);
              try {
                await updateQueueCron(minutesToCron(queueMinutes));
                await fetchConfig();
                alert("✅ Queue cron actualizado");
              } catch (e: any) {
                alert(`❌ ${e.message}`);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {/* ─── Cron ProcessorService ─── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-gray-800">
            📤 Cron del ProcessorService
          </h2>
          <p className="mb-3 text-xs text-gray-500">
            Cada cuántos minutos se procesa 1 item de la cola.
            <br />
            Actual: <code className="rounded bg-gray-100 px-1">{config.processorCron}</code>{" "}
            ({cronToMinutes(config.processorCron)} min)
          </p>

          <label className="mb-1 block text-xs font-medium text-gray-600">
            Frecuencia en minutos
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={processorMinutes}
              onChange={(e) =>
                setProcessorMinutes(Math.max(1, Number(e.target.value)))
              }
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <span className="shrink-0 text-sm text-gray-500">min</span>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Se ejecutará:{" "}
            <code className="rounded bg-gray-100 px-1">
              {minutesToCron(processorMinutes)}
            </code>
          </p>

          <div className="mt-2 flex flex-wrap gap-1">
            {[1, 5, 10, 15, 20, 30, 60].map((m) => (
              <button
                key={m}
                onClick={() => setProcessorMinutes(m)}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  processorMinutes === m
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>

          <button
            onClick={async () => {
              setSaving(true);
              try {
                await updateProcessorCron(minutesToCron(processorMinutes));
                await fetchConfig();
                alert("✅ Processor cron actualizado");
              } catch (e: any) {
                alert(`❌ ${e.message}`);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {/* ─── Intervalo por canal ─── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-gray-800">
            ⏱️ Intervalo mínimo por canal
          </h2>
          <p className="mb-3 text-xs text-gray-500">
            Minutos entre envíos al mismo canal.
            <br />
            Actual:{" "}
            <code className="rounded bg-gray-100 px-1">
              {config.channelMinIntervalMinutes} min
            </code>
          </p>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={interval}
              onChange={(e) =>
                setIntervalMinutes(Math.max(1, Number(e.target.value)))
              }
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <span className="shrink-0 text-sm text-gray-500">min</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {[30, 60, 90, 120, 180].map((m) => (
              <button
                key={m}
                onClick={() => setIntervalMinutes(m)}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  interval === m
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>

          <button
            onClick={async () => {
              setSaving(true);
              try {
                await updateInterval(interval);
                await fetchConfig();
                alert("✅ Intervalo actualizado");
              } catch (e: any) {
                alert(`❌ ${e.message}`);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {/* ─── Máximo intentos ─── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-gray-800">
            🔁 Máximo de intentos
          </h2>
          <p className="mb-3 text-xs text-gray-500">
            Intentos antes de descartar un envío.
            <br />
            Actual:{" "}
            <code className="rounded bg-gray-100 px-1">
              {config.maxSendAttempts}
            </code>
          </p>

          <input
            type="number"
            min="1"
            max="10"
            value={attempts}
            onChange={(e) =>
              setAttempts(Math.max(1, Math.min(10, Number(e.target.value))))
            }
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-2 flex flex-wrap gap-1">
            {[1, 2, 3, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => setAttempts(n)}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  attempts === n
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            onClick={async () => {
              setSaving(true);
              try {
                await updateAttempts(attempts);
                await fetchConfig();
                alert("✅ Máximo de intentos actualizado");
              } catch (e: any) {
                alert(`❌ ${e.message}`);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {/* ─── PLANTILLAS (nuevo) ─── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-2xl">
              📄
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="mb-1 font-bold text-gray-800">
                Plantillas de Telegram
              </h2>
              <p className="mb-3 text-xs text-gray-500">
                Borra todas las plantillas actuales y vuelve a escanear el
                canal fuente.
                <br />
                Plantillas actuales:{" "}
                <span className="font-semibold text-purple-600">
                  {templatesCount}
                </span>
                {lastRescan && (
                  <>
                    <br />
                    Última recarga:{" "}
                    <span className="text-gray-600">{lastRescan}</span>
                  </>
                )}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRescan}
                  disabled={rescanning}
                  className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {rescanning
                    ? "🔄 Escaneando..."
                    : "🔄 Borrar y recargar plantillas"}
                </button>

                <button
                  onClick={fetchTemplates}
                  disabled={loadingTemplates || rescanning}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingTemplates ? "Actualizando..." : "🔄 Actualizar"}
                </button>
              </div>

              <p className="mt-3 text-xs text-amber-600">
                ⚠️ Esta acción borra las plantillas de la DB. Los anuncios
                existentes podrían fallar hasta que se vuelvan a cargar.
              </p>
            </div>
          </div>

          {/* 🔥 Lista de templates */}
          {loadingTemplates ? (
            <div className="mt-4 text-center text-sm text-gray-500">
              Cargando plantillas...
            </div>
          ) : templates.length === 0 ? (
            <div className="mt-4 rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
              No hay plantillas cargadas
            </div>
          ) : (
            <div className="mt-4">
              {/* Buscador */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="🔍 Buscar por keyword o messageId..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Contador filtrado */}
              <p className="mb-2 text-xs text-gray-500">
                Mostrando {filteredTemplates.length} de {templates.length}{" "}
                plantillas
              </p>

              {/* Grid de templates */}
              <div className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition hover:bg-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400">#{t.id}</p>
                        <p className="truncate font-medium text-gray-800">
                          {t.keyword?.trim()
                            ? t.keyword
                            : "(sin keyword)"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded bg-purple-100 px-1.5 py-0.5 font-mono text-xs text-purple-700">
                        msg: {t.messageId}
                      </span>
                    </div>
                    {t.groupedId && (
                      <p className="mt-1 truncate text-xs text-gray-400">
                        🖼️ Álbum: {t.groupedId}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <p className="mt-2 text-center text-xs text-gray-500">
                  No hay resultados para "{search}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}