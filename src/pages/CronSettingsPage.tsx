// src/pages/CronSettingsPage.tsx

import { useEffect, useState } from "react";
import {
  getCronConfig,
  updateQueueCron,
  updateProcessorCron,
  updateInterval,
  updateAttempts,
} from "../api/cron.api";

// 🔥 Helper: convertir minutos a expresión cron
// 60 min → "0 0 * * * *"
// 30 min → "0 */30 * * * *"
// 45 min → "0 */45 * * * *" (no es exacto, pero funciona)
function minutesToCron(minutes: number): string {
  if (minutes === 60) return "0 0 * * * *";
  if (minutes === 120) return "0 0 */2 * * *";
  if (minutes === 180) return "0 0 */3 * * *";
  if (minutes === 240) return "0 0 */4 * * *";
  if (minutes === 360) return "0 0 */6 * * *";
  if (minutes === 720) return "0 0 */12 * * *";
  if (minutes === 1440) return "0 0 0 * * *";
  return `0 */${minutes} * * * *`;
}

// 🔥 Helper: extraer minutos de una expresión cron
// "0 */30 * * * *" → 30
// "0 0 * * * *"    → 60
// "0 0 */2 * * *"  → 120
function cronToMinutes(cron: string): number {
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 2) return 10;

  const minute = parts[1];
  const hour = parts[2];

  // "0 0 * * * *" → 60 min
  if (minute === "0" && hour === "*") return 60;
  // "0 0 */2 * * *" → 120 min
  if (minute === "0" && hour.startsWith("*/")) {
    return parseInt(hour.replace("*/", ""), 10) * 60;
  }
  // "0 */30 * * * *" → 30 min
  if (minute.startsWith("*/")) {
    return parseInt(minute.replace("*/", ""), 10);
  }

  return 10;
}

export default function CronSettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulario en minutos
  const [queueMinutes, setQueueMinutes] = useState(10);
  const [processorMinutes, setProcessorMinutes] = useState(10);
  const [interval, setIntervalMinutes] = useState(60);
  const [attempts, setAttempts] = useState(3);

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

  useEffect(() => {
    fetchConfig();
  }, []);

  const saveQueueCron = async () => {
    setSaving(true);
    try {
      const cron = minutesToCron(queueMinutes);
      await updateQueueCron(cron);
      await fetchConfig();
      alert(`✅ Queue cron actualizado a cada ${queueMinutes} min`);
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.message ?? error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const saveProcessorCron = async () => {
    setSaving(true);
    try {
      const cron = minutesToCron(processorMinutes);
      await updateProcessorCron(cron);
      await fetchConfig();
      alert(`✅ Processor cron actualizado a cada ${processorMinutes} min`);
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.message ?? error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const saveInterval = async () => {
    setSaving(true);
    try {
      await updateInterval(interval);
      await fetchConfig();
      alert("✅ Intervalo actualizado");
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.message ?? error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const saveAttempts = async () => {
    setSaving(true);
    try {
      await updateAttempts(attempts);
      await fetchConfig();
      alert("✅ Máximo de intentos actualizado");
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.message ?? error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Cargando...</p>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Configuración de crons
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Cambia las frecuencias en caliente, sin reiniciar
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Queue Cron */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-gray-800">
            📋 Cron del QueueService
          </h2>
          <p className="mb-3 text-xs text-gray-500">
            Cada cuántos minutos se genera una fila en la cola.
            <br />
            Actual:{" "}
            <code className="rounded bg-gray-100 px-1">
              {config.queueCron}
            </code>{" "}
            ({cronToMinutes(config.queueCron)} min)
          </p>

          {/* 🔥 Input en minutos */}
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Frecuencia en minutos
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              step="1"
              value={queueMinutes}
              onChange={(e) =>
                setQueueMinutes(Math.max(1, Number(e.target.value)))
              }
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <span className="shrink-0 text-sm text-gray-500">min</span>
          </div>

          {/* Preview del cron generado */}
          <p className="mt-2 text-xs text-gray-500">
            Se ejecutará:{" "}
            <code className="rounded bg-gray-100 px-1">
              {minutesToCron(queueMinutes)}
            </code>
          </p>

          {/* Botones rápidos */}
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
            onClick={saveQueueCron}
            disabled={saving}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {/* Processor Cron */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 font-bold text-gray-800">
            📤 Cron del ProcessorService
          </h2>
          <p className="mb-3 text-xs text-gray-500">
            Cada cuántos minutos se procesa 1 item de la cola.
            <br />
            Actual:{" "}
            <code className="rounded bg-gray-100 px-1">
              {config.processorCron}
            </code>{" "}
            ({cronToMinutes(config.processorCron)} min)
          </p>

          <label className="mb-1 block text-xs font-medium text-gray-600">
            Frecuencia en minutos
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              step="1"
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
            {[5, 10, 15, 20, 30, 60].map((m) => (
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
            onClick={saveProcessorCron}
            disabled={saving}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {/* Intervalo por canal */}
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

          <label className="mb-1 block text-xs font-medium text-gray-600">
            Minutos entre envíos
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              step="1"
              value={interval}
              onChange={(e) =>
                setIntervalMinutes(Math.max(1, Number(e.target.value)))
              }
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <span className="shrink-0 text-sm text-gray-500">min</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {[30, 60, 90, 120, 180, 240].map((m) => (
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
            onClick={saveInterval}
            disabled={saving}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {/* Máximo intentos */}
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

          <label className="mb-1 block text-xs font-medium text-gray-600">
            Número de intentos
          </label>
          <input
            type="number"
            min="1"
            max="10"
            step="1"
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
            onClick={saveAttempts}
            disabled={saving}
            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}