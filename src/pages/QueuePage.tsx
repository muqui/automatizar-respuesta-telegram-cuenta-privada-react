// src/pages/QueuePage.tsx

import { useEffect, useState } from "react";
import {
  getQueue,
  getQueueStats,
  deleteQueueItem,
  reorderQueue,
} from "../api/queue.api";

export default function QueuePage() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "sent" | "error">(
    "all",
  );
  const [saving, setSaving] = useState(false);

  // 🔥 Estado del modal "Mover a..."
  const [movingItem, setMovingItem] = useState<any>(null);
  const [movingIndex, setMovingIndex] = useState<number>(-1);

  // 🔥 Cards expandidas (Set de IDs)
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const fetchData = () => {
    setLoading(true);

    const filters: any = { limit: 200 };
    if (filter === "pending") filters.isSent = false;
    if (filter === "sent") filters.isSent = true;

    Promise.all([getQueue(filters), getQueueStats()])
      .then(([queueRes, statsRes]) => {
        setData(queueRes.data);
        setStats(statsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  // 🔥 Toggle expandir/colapsar
  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 🔥 Expandir/colapsar todos
  const expandAll = () => {
    setExpanded(new Set(data.map((q) => q.id)));
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  // 🔥 Modal "Mover a..."
  const handleOpenMove = (q: any, index: number) => {
    setMovingItem(q);
    setMovingIndex(index);
  };

  const handleCloseMove = () => {
    setMovingItem(null);
    setMovingIndex(-1);
  };

  const handleMoveTo = async (targetIndex: number) => {
    if (movingIndex === -1 || movingIndex === targetIndex) {
      handleCloseMove();
      return;
    }

    const newData = [...data];
    const [moved] = newData.splice(movingIndex, 1);
    newData.splice(targetIndex, 0, moved);

    setData(newData);
    handleCloseMove();

    setSaving(true);
    try {
      await reorderQueue(newData.map((q) => q.id));
    } catch (error) {
      console.error("Error al reordenar:", error);
      alert("No se pudo guardar el nuevo orden");
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (q: any) => {
    const confirmar = window.confirm(
      `¿Eliminar el envío #${q.id}?\n\n` +
        `Anuncio: ${q.announcement?.name ?? `#${q.announcementId}`}\n` +
        `Canal: ${q.channel?.name ?? `#${q.channelId}`}`,
    );
    if (!confirmar) return;

    try {
      await deleteQueueItem(q.id);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar");
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (q: any) => {
    if (q.isSent && q.sentAt && !q.errorMessage) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
          ✅
        </span>
      );
    }
    if (q.errorMessage) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
          ❌
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
        ⏳
      </span>
    );
  };

  const isSortable = filter === "pending" || filter === "all";
  const allExpanded = data.length > 0 && expanded.size === data.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Cola de envíos
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isSortable
            ? "Toca 'Mover' para reordenar los envíos pendientes"
            : "Anuncios programados y su estado"}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">
              {stats.total}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Enviadas</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {stats.sent}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Pendientes</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Con error</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {stats.withError}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { key: "all", label: "Todos" },
            { key: "pending", label: "Pendientes" },
            { key: "sent", label: "Enviados" },
            { key: "error", label: "Con error" },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filter === f.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 🔥 Botones expandir/colapsar (solo móvil) */}
      <div className="mb-3 flex gap-2 lg:hidden">
        <button
          onClick={expandAll}
          disabled={allExpanded}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ⬇️ Expandir todo
        </button>
        <button
          onClick={collapseAll}
          disabled={expanded.size === 0}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ⬆️ Colapsar todo
        </button>
      </div>

      {saving && (
        <div className="mb-3 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
          💾 Guardando nuevo orden...
        </div>
      )}

      {loading ? (
        <p className="p-6 text-center text-gray-500">Cargando...</p>
      ) : (
        <>
          {/* 📱 Móvil: cards colapsables */}
          <div className="space-y-2 lg:hidden">
            {data.map((q, index) => {
              const isExpanded = expanded.has(q.id);

              return (
                <div
                  key={q.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition"
                >
                  {/* 🔥 Header de la card (siempre visible) */}
                  <button
                    onClick={() => toggleExpand(q.id)}
                    className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-gray-50 active:bg-gray-100"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-800">
                        {q.announcement?.name ?? `#${q.announcementId}`}
                      </p>
                      <p className="text-xs text-gray-400">id {q.id}</p>
                    </div>

                    <div className="shrink-0">{getStatusBadge(q)}</div>

                    <span
                      className={`shrink-0 text-gray-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* 🔥 Contenido expandido */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-3">
                      <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-500">📺 Canal</span>
                          <span className="text-right font-medium text-gray-800">
                            {q.channel?.name ?? `#${q.channelId}`}
                          </span>
                        </div>

                        {q.channel?.telegramId && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-500">🔗 Telegram</span>
                            <span className="text-right font-mono text-xs text-gray-600">
                              {q.channel.telegramId}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-500">🕐 Programado</span>
                          <span className="text-right text-xs font-medium text-gray-800">
                            {formatDate(q.scheduledAt)}
                          </span>
                        </div>

                        {q.sentAt && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-500">✅ Enviado</span>
                            <span className="text-right text-xs font-medium text-green-600">
                              {formatDate(q.sentAt)}
                            </span>
                          </div>
                        )}

                        {q.errorMessage && (
                          <div className="mt-2 rounded bg-red-50 p-2">
                            <p className="break-words text-xs text-red-700">
                              {q.errorMessage}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 🔥 Botones */}
                      <div className="mt-3 flex gap-2">
                        {isSortable && (
                          <button
                            onClick={() => handleOpenMove(q, index)}
                            className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
                          >
                            ↕️ Mover
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(q)}
                          className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 🖥️ Escritorio: tabla completa (sin colapsar) */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center font-semibold text-gray-600">
                      #
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Anuncio
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Canal
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Programado
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((q, index) => (
                    <tr key={q.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-center text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{q.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {q.announcement?.name ?? `#${q.announcementId}`}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {q.channel?.name ?? `#${q.channelId}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {formatDate(q.scheduledAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(q)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {isSortable && (
                            <button
                              onClick={() => handleOpenMove(q, index)}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-95"
                              title="Mover a otra posición"
                            >
                              ↕️ Mover
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(q)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 active:scale-95"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.length === 0 && (
            <p className="p-6 text-center text-gray-500">
              No hay envíos en la cola
            </p>
          )}
        </>
      )}

      {/* 🔥 MODAL "Mover a..." */}
      {movingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5">
          <div className="my-auto flex max-h-[calc(100dvh-24px)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Mover a otra posición
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  📢 {movingItem.announcement?.name} → 📺{" "}
                  {movingItem.channel?.name}
                </p>
              </div>
              <button
                onClick={handleCloseMove}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <p className="mb-3 text-xs text-gray-500">
                Posición actual:{" "}
                <span className="font-semibold text-blue-600">
                  #{movingIndex + 1}
                </span>
              </p>

              <div className="space-y-1.5">
                {data.map((item, i) => {
                  const isCurrent = i === movingIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMoveTo(i)}
                      disabled={isCurrent}
                      className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                        isCurrent
                          ? "cursor-not-allowed border-blue-300 bg-blue-50 opacity-60"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-400">
                            Posición #{i + 1}
                            {isCurrent && (
                              <span className="ml-2 text-blue-600">
                                (actual)
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 truncate font-medium text-gray-800">
                            {item.announcement?.name} → {item.channel?.name}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-gray-500">
                          {formatDate(item.scheduledAt)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
              <button
                onClick={handleCloseMove}
                className="w-full rounded-lg bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}