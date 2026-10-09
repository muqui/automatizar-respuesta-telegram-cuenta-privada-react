// src/components/announcements/AnnouncementTable.tsx

interface Props {
  data: any[];
  onToggle: (a: any) => void;
  onEdit: (a: any) => void;
  onDelete: (a: any) => void;
}

export default function AnnouncementTable({
  data,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  return (
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
                      onClick={() => onToggle(a)}
                      className={`min-w-24 rounded-lg px-3 py-2 text-xs font-semibold text-white transition active:scale-95 ${
                        a.isActive
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {a.isActive ? "Desactivar" : "Activar"}
                    </button>

                    <button
                      onClick={() => onEdit(a)}
                      className="min-w-20 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 active:scale-95"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => onDelete(a)}
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
  );
}