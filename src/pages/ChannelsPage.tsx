// src/pages/ChannelsPage.tsx

import { useEffect, useState } from "react";
import {
  getChannels,
  getChannelsStats,
  toggleChannel,
  createChannel,
  updateChannel,
} from "../api/channel.api";
import ChannelModal from "../assets/components/channels/ChannelModal";


export default function ChannelsPage() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [accountFilter, setAccountFilter] = useState<0 | 1 | 2>(0);

  // 🔥 Modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);

    const filters: any = {};
    if (filter === "active") filters.isActive = true;
    if (filter === "inactive") filters.isActive = false;
    if (accountFilter !== 0) filters.accountId = accountFilter;

    Promise.all([getChannels(filters), getChannelsStats()])
      .then(([channelsRes, statsRes]) => {
        setData(channelsRes.data);
        setStats(statsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [filter, accountFilter]);

  // 🔥 Toggle
  const handleToggle = async (c: any) => {
    setToggling(c.id);
    try {
      await toggleChannel(c.id);
      fetchData();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo cambiar el estado");
    } finally {
      setToggling(null);
    }
  };

  // 🔥 Abrir modal para crear
  const handleCreateOpen = () => {
    setSelected({
      name: "",
      telegramId: "",
      accountId: 1,
      isActive: true,
    });
    setIsCreating(true);
    setOpen(true);
  };

  // 🔥 Abrir modal para editar
  const handleEdit = (c: any) => {
    setSelected({ ...c });
    setIsCreating(false);
    setOpen(true);
  };

  // 🔥 Guardar
  const handleSave = async () => {
    if (!selected.name?.trim()) {
      alert("El nombre es requerido");
      return;
    }
    if (!selected.telegramId?.trim()) {
      alert("El Telegram ID es requerido");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: selected.name.trim(),
        telegramId: selected.telegramId.trim(),
        accountId: selected.accountId ?? 1,
        isActive: selected.isActive ?? true,
      };

      if (isCreating) {
        await createChannel(payload);
      } else {
        await updateChannel(selected.id, payload);
      }

      setOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error al guardar:", error);
      alert(
        `Error: ${error.response?.data?.message ?? error.message}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const getAccountLabel = (accountId: number) =>
    accountId === 1 ? "Cuenta 1" : "Cuenta 2";

  const getAccountColor = (accountId: number) =>
    accountId === 1
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Canales
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los canales de Telegram
          </p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 sm:w-auto sm:py-2.5"
        >
          + Nuevo canal
        </button>
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
            <p className="text-xs font-medium text-gray-500">Activos</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {stats.active}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Cuenta 1</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {stats.activeByAccount1}/{stats.byAccount1}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Cuenta 2</p>
            <p className="mt-1 text-2xl font-bold text-purple-600">
              {stats.activeByAccount2}/{stats.byAccount2}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { key: "all", label: "Todos" },
            { key: "active", label: "Activos" },
            { key: "inactive", label: "Inactivos" },
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

        <div className="ml-auto flex gap-2">
          {(
            [
              { key: 0, label: "Todas" },
              { key: 1, label: "Cuenta 1" },
              { key: 2, label: "Cuenta 2" },
            ] as const
          ).map((a) => (
            <button
              key={a.key}
              onClick={() => setAccountFilter(a.key as 0 | 1 | 2)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                accountFilter === a.key
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="p-6 text-center text-gray-500">Cargando...</p>
      ) : (
        <>
          {/* 📱 Móvil */}
          <div className="space-y-2 lg:hidden">
            {data.map((c) => (
              <div
                key={c.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">#{c.id}</p>
                    <h3 className="mt-1 break-words font-bold text-gray-800">
                      📺 {c.name}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                      c.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">🔗 Telegram</span>
                    <span className="font-mono text-xs text-gray-800">
                      {c.telegramId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500">👤 Cuenta</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getAccountColor(
                        c.accountId,
                      )}`}
                    >
                      {getAccountLabel(c.accountId)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleToggle(c)}
                    disabled={toggling === c.id}
                    className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50 ${
                      c.isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {toggling === c.id
                      ? "..."
                      : c.isActive
                      ? "Desactivar"
                      : "Activar"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 🖥️ Escritorio */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Telegram</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Cuenta</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Estado</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{c.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">
                          {c.telegramId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getAccountColor(
                            c.accountId,
                          )}`}
                        >
                          {getAccountLabel(c.accountId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex w-20 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                            c.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {c.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            className="min-w-20 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleToggle(c)}
                            disabled={toggling === c.id}
                            className={`min-w-24 rounded-lg px-3 py-2 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-50 ${
                              c.isActive
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                          >
                            {toggling === c.id
                              ? "..."
                              : c.isActive
                              ? "Desactivar"
                              : "Activar"}
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
              No hay canales con esos filtros
            </p>
          )}
        </>
      )}

      {/* 🔥 Modal */}
      <ChannelModal
        open={open}
        selected={selected}
        setSelected={setSelected}
        isCreating={isCreating}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}