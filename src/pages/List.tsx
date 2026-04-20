import { useEffect, useState } from "react";
import {
  getAnnouncements,
  updateAnnouncement,
  createAnnouncement,
} from "../api/announcement.api";

export default function List() {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = () => {
    getAnnouncements().then((res) => setData(res.data));
  };

  useEffect(() => {
    fetchData();
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
      savedMessageId: Number(selected.savedMessageId), // 🔥 importante
    };

    if (isCreating) {
      await createAnnouncement(payload);
    } else {
      await updateAnnouncement(selected.id, payload);
    }

    setOpen(false);
    fetchData();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Anuncios</h1>

        <button
          onClick={handleCreateOpen}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Nuevo anuncio
        </button>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="w-full border rounded-xl overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Fecha Inicio</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {data.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{a.id}</td>
                <td className="p-3">{a.name}</td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      a.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {a.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td className="p-3">{a.startDate}</td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => toggleActive(a)}
                    className={`px-3 py-1 rounded text-white text-sm ${
                      a.isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {a.isActive ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    onClick={() => handleEdit(a)}
                    className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {isCreating ? "Nuevo anuncio" : "Editar anuncio"}
            </h2>

            <div className="flex flex-col gap-3">
              <input
                className="border p-2 rounded"
                placeholder="Nombre"
                value={selected.name || ""}
                onChange={(e) =>
                  setSelected({ ...selected, name: e.target.value })
                }
              />

              <input
                type="date"
                className="border p-2 rounded"
                value={selected.startDate || ""}
                onChange={(e) =>
                  setSelected({ ...selected, startDate: e.target.value })
                }
              />

              <input
                type="date"
                className="border p-2 rounded"
                value={selected.endDate || ""}
                onChange={(e) =>
                  setSelected({ ...selected, endDate: e.target.value })
                }
              />

              <input
                type="time"
                className="border p-2 rounded"
                value={selected.startTime || ""}
                onChange={(e) =>
                  setSelected({ ...selected, startTime: e.target.value })
                }
              />

              <input
                type="time"
                className="border p-2 rounded"
                value={selected.endTime || ""}
                onChange={(e) =>
                  setSelected({ ...selected, endTime: e.target.value })
                }
              />

              {/* 🔥 NUEVO CAMPO */}
              <input
                type="number"
                className="border p-2 rounded"
                placeholder="Saved Message ID"
                value={selected.savedMessageId || ""}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    savedMessageId: e.target.value,
                  })
                }
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!selected.isActive}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      isActive: e.target.checked,
                    })
                  }
                />
                Activo
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded"
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