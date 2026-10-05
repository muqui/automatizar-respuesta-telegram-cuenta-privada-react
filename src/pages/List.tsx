import { useEffect, useState } from "react";
import {
  getAnnouncements,
  updateAnnouncement,
  createAnnouncement,
  deleteAnnouncement,
} from "../api/announcement.api";
import { getTemplates } from "../api/template.api";

export default function List() {
  const [data, setData] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = () => {
    getAnnouncements().then((res) => setData(res.data));
  };

  const fetchTemplates = () => {
    getTemplates().then((res) => setTemplates(res.data));
  };

  useEffect(() => {
    fetchData();
    fetchTemplates();
  }, []);

  const toggleActive = async (a: any) => {
    await updateAnnouncement(a.id, {
      isActive: !a.isActive,
    });
    fetchData();
  };

  const handleEdit = (a: any) => {
    setSelected(a);
    setIsCreating(false);
    setOpen(true);
  };

  const handleCreateOpen = () => {
    setSelected({
      name: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      isActive: true,
      savedMessageId: "",
    });
    setIsCreating(true);
    setOpen(true);
  };

  const handleDelete = async (a: any) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el anuncio "${a.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await deleteAnnouncement(a.id);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el anuncio");
    }
  };

  const formatTime = (time: string) =>
    time?.length === 5 ? `${time}:00` : time;

  const handleSave = async () => {
    const payload = {
      name: selected.name,
      startDate: selected.startDate,
      endDate: selected.endDate,
      startTime: formatTime(selected.startTime),
      endTime: formatTime(selected.endTime),
      isActive: selected.isActive,
      savedMessageId: Number(selected.savedMessageId),
    };

    if (isCreating) {
      await createAnnouncement(payload);
    } else {
      await updateAnnouncement(selected.id, payload);
    }

    setOpen(false);
    fetchData();
  };

  // Busca el template seleccionado para mostrar info adicional
  const selectedTemplate = templates.find(
    (t) => t.messageId === Number(selected?.savedMessageId)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-5 md:p-6 lg:p-8">
      {/* ENCABEZADO */}
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Anuncios
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra tus anuncios y su estado
          </p>
        </div>

        <button
          onClick={handleCreateOpen}
          className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] sm:w-auto sm:py-2.5"
        >
          + Nuevo anuncio
        </button>
      </div>

      {/* TARJETAS PARA MOVIL */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
        {data.map((a) => (
          <div
            key={a.id}
            className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-medium text-gray-400">
                  Anuncio #{a.id}
                </p>
                <h2 className="break-words text-base font-bold text-gray-800">
                  {a.name}
                </h2>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  a.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {a.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="mb-4 space-y-3 rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-500">
                  <span className="mr-2 inline-block align-middle text-gray-400">
                    📅
                  </span>
                  Fecha de inicio
                </span>
                <span className="text-right text-sm font-medium text-gray-800">
                  {a.startDate || "No definida"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-500">
                  <span className="mr-2 inline-block align-middle text-gray-400">
                    📅
                  </span>
                  Fecha de fin
                </span>
                <span className="text-right text-sm font-medium text-gray-800">
                  {a.endDate || "No definida"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleActive(a)}
                className={`flex-1 min-w-[100px] rounded-lg px-2 py-2.5 text-sm font-semibold text-white transition active:scale-95 ${
                  a.isActive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {a.isActive ? "Desactivar" : "Activar"}
              </button>

              <button
                onClick={() => handleEdit(a)}
                className="flex-1 min-w-[100px] rounded-lg bg-blue-600 px-2 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
              >
                Editar
              </button>

              <button
                onClick={() => handleDelete(a)}
                className="flex-1 min-w-[100px] rounded-lg bg-red-700 px-2 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 active:scale-95"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* TABLA PARA ESCRITORIO */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold text-gray-600">
                  ID
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold text-gray-600">
                  Nombre
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold text-gray-600">
                  Estado
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold text-gray-600">
                  Fecha Inicio
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-center font-semibold text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                    {a.id}
                  </td>

                  <td className="max-w-[220px] truncate px-4 py-4 font-medium text-gray-800">
                    {a.name}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex w-20 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                        a.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {a.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                    {a.startDate}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleActive(a)}
                        className={`min-w-24 rounded-lg px-3 py-2 text-xs font-semibold text-white transition active:scale-95 ${
                          a.isActive
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {a.isActive ? "Desactivar" : "Activar"}
                      </button>

                      <button
                        onClick={() => handleEdit(a)}
                        className="min-w-20 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 active:scale-95"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleDelete(a)}
                        className="min-w-20 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-800 active:scale-95"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5">
          <div className="my-auto flex max-h-[calc(100dvh-24px)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-40px)]">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {isCreating ? "Nuevo anuncio" : "Editar anuncio"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Completa la información del anuncio
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                aria-label="Cerrar"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Nombre del anuncio"
                  value={selected.name || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    className="w-full min-w-0 rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={selected.startDate || ""}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    className="w-full min-w-0 rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={selected.endDate || ""}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    className="w-full min-w-0 rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={selected.startTime || ""}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Hora de fin
                  </label>
                  <input
                    type="time"
                    className="w-full min-w-0 rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={selected.endTime || ""}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* SELECT DE TEMPLATES */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Plantilla (Saved Message)
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={selected.savedMessageId || ""}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      savedMessageId: e.target.value,
                    })
                  }
                >
                  <option value="">-- Selecciona una plantilla --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.messageId}>
                      {t.keyword && t.keyword.trim() !== ""
                        ? `${t.keyword} (msgId: ${t.messageId})`
                        : `Sin keyword (msgId: ${t.messageId})`}
                    </option>
                  ))}
                </select>

                {selectedTemplate && (
                  <p className="mt-1 text-xs text-gray-500">
                    Template #{selectedTemplate.id} · messageId{" "}
                    {selectedTemplate.messageId}
                    {selectedTemplate.keyword
                      ? ` · keyword: ${selectedTemplate.keyword}`
                      : ""}
                  </p>
                )}
              </div>

              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition hover:bg-gray-100">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-green-600"
                  checked={!!selected.isActive}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      isActive: e.target.checked,
                    })
                  }
                />
                <span className="text-sm font-medium text-gray-700">
                  Activar anuncio
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-lg bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 sm:w-auto sm:py-2.5"
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto sm:py-2.5"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}