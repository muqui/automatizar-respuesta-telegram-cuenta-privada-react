// src/components/announcements/AnnouncementCard.tsx

interface Props {
  announcement: any;
  onToggle: (a: any) => void;
  onEdit: (a: any) => void;
  onDelete: (a: any) => void;
}

export default function AnnouncementCard({
  announcement: a,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
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
          onClick={() => onToggle(a)}
          className={`flex-1 min-w-[100px] rounded-lg px-2 py-2.5 text-sm font-semibold text-white transition active:scale-95 ${
            a.isActive
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {a.isActive ? "Desactivar" : "Activar"}
        </button>

        <button
          onClick={() => onEdit(a)}
          className="flex-1 min-w-[100px] rounded-lg bg-blue-600 px-2 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
        >
          Editar
        </button>

        <button
          onClick={() => onDelete(a)}
          className="flex-1 min-w-[100px] rounded-lg bg-red-700 px-2 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 active:scale-95"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}