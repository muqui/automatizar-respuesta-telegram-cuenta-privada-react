// src/pages/QueuePage.tsx

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  getQueue,
  getQueueStats,
  deleteQueueItem,
  reorderQueue,
} from "../api/queue.api";

// ── Helpers ────────────────────────────────────────────────
const formatDate = (date: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateFull = (date: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Card sortable (móvil) ──────────────────────────────────
function SortableCard({
  q,
  onDelete,
}: {
  q: any;
  onDelete: (q: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-xl border bg-white p-4 shadow-sm ${
        isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        {/* 🔥 Handle de drag (móvil) */}
        <div
          {...attributes}
          {...listeners}
          className="-ml-2 -mt-2 cursor-grab rounded-lg p-2 text-gray-400 active:cursor-grabbing"
          title="Arrastra para reordenar"
        >
          ⋮⋮
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400">#{q.id}</p>
          <h3 className="mt-1 break-words font-bold text-gray-800">
            📢 {q.announcement?.name ?? `#${q.announcementId}`}
          </h3>
        </div>
      </div>

      <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500">📺 Canal</span>
          <span className="text-right font-medium text-gray-800">
            {q.channel?.name ?? `#${q.channelId}`}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500">🕐 Programado</span>
          <span className="text-right text-xs font-medium text-gray-800">
            {formatDateFull(q.scheduledAt)}
          </span>
        </div>
      </div>

      {/* 🔥 Botón eliminar (móvil) */}
      <button
        onClick={() => onDelete(q)}
        className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        🗑️ Eliminar
      </button>
    </div>
  );
}

// ── Fila sortable (escritorio) ─────────────────────────────
function SortableRow({
  q,
  onDelete,
}: {
  q: any;
  onDelete: (q: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-t border-gray-100 ${
        isDragging ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      {/* Handle de drag */}
      <td
        {...attributes}
        {...listeners}
        className="cursor-grab px-4 py-3 text-center text-gray-400 active:cursor-grabbing"
        title="Arrastra para reordenar"
      >
        ⋮⋮
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

      {/* 🔥 Botón eliminar (escritorio) */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onDelete(q)}
          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 active:scale-95"
          title="Eliminar de la cola"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}

// ── Página ─────────────────────────────────────────────────
export default function QueuePage() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "sent" | "error">(
    "all",
  );
  const [saving, setSaving] = useState(false);

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

  // 🔥 Sensores: mouse, touch y teclado
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 🔥 Drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = data.findIndex((q) => q.id === active.id);
    const newIndex = data.findIndex((q) => q.id === over.id);

    const newData = arrayMove(data, oldIndex, newIndex);
    setData(newData);

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

  // 🔥 Eliminar
  const handleDelete = async (q: any) => {
    const confirmar = window.confirm(
      `¿Eliminar el envío #${q.id}?\n\n` +
        `Anuncio: ${q.announcement?.name ?? `#${q.announcementId}`}\n` +
        `Canal: ${q.channel?.name ?? `#${q.channelId}`}\n` +
        `Programado: ${formatDateFull(q.scheduledAt)}`,
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

  const isSortable = filter === "pending" || filter === "all";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Cola de envíos
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isSortable
            ? "Arrastra ⋮⋮ para reordenar los envíos pendientes"
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

      {saving && (
        <div className="mb-3 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
          💾 Guardando nuevo orden...
        </div>
      )}

      {loading ? (
        <p className="p-6 text-center text-gray-500">Cargando...</p>
      ) : (
        <>
          {/* 📱 Móvil: cards sortables */}
          <div className="lg:hidden">
            {isSortable ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={data.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {data.map((q) => (
                      <SortableCard
                        key={q.id}
                        q={q}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {data.map((q) => (
                  <div
                    key={q.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3">
                      <p className="text-xs text-gray-400">#{q.id}</p>
                      <h3 className="mt-1 break-words font-bold text-gray-800">
                        📢 {q.announcement?.name ?? `#${q.announcementId}`}
                      </h3>
                    </div>

                    <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500">📺 Canal</span>
                        <span className="text-right font-medium text-gray-800">
                          {q.channel?.name ?? `#${q.channelId}`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500">🕐 Programado</span>
                        <span className="text-right text-xs font-medium text-gray-800">
                          {formatDateFull(q.scheduledAt)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(q)}
                      className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🖥️ Escritorio: tabla sortable */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              {isSortable ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={data.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="w-12 px-4 py-3 text-center font-semibold text-gray-600">
                            ↕️
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
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((q) => (
                          <SortableRow
                            key={q.id}
                            q={q}
                            onDelete={handleDelete}
                          />
                        ))}
                      </tbody>
                    </table>
                  </SortableContext>
                </DndContext>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
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
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((q) => (
                      <tr key={q.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500">{q.id}</td>
                        <td className="px-4 py-3 font-medium">
                          {q.announcement?.name ?? `#${q.announcementId}`}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {q.channel?.name ?? `#${q.channelId}`}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {formatDate(q.scheduledAt)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDelete(q)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 active:scale-95"
                            title="Eliminar de la cola"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {data.length === 0 && (
            <p className="p-6 text-center text-gray-500">
              No hay envíos en la cola
            </p>
          )}
        </>
      )}
    </div>
  );
}