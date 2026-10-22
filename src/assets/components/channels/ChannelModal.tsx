// src/components/channels/ChannelModal.tsx

interface Props {
  open: boolean;
  selected: any;
  setSelected: (c: any) => void;
  isCreating: boolean;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}

export default function ChannelModal({
  open,
  selected,
  setSelected,
  isCreating,
  onClose,
  onSave,
  saving,
}: Props) {
  if (!open || !selected) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="my-auto flex max-h-[calc(100dvh-24px)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isCreating ? "Nuevo canal" : "Editar canal"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Completa la información del canal
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Ej: Galas GDL"
              value={selected.name || ""}
              onChange={(e) =>
                setSelected({ ...selected, name: e.target.value })
              }
            />
          </div>

          {/* Telegram ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Telegram ID
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="@canal o -100..."
              value={selected.telegramId || ""}
              onChange={(e) =>
                setSelected({ ...selected, telegramId: e.target.value })
              }
            />
            <p className="text-xs text-gray-400">
              Usa <code>@username</code> si es público, o <code>-100...</code>{" "}
              si es privado.
            </p>
          </div>

          {/* Cuenta */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Cuenta de Telegram
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={selected.accountId || 1}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  accountId: Number(e.target.value),
                })
              }
            >
              <option value={1}>Cuenta 1</option>
              <option value={2}>Cuenta 2</option>
            </select>
            <p className="text-xs text-gray-400">
              La cuenta que enviará los mensajes a este canal.
            </p>
          </div>

          {/* Estado */}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 transition hover:bg-gray-100">
            <input
              type="checkbox"
              className="h-5 w-5 accent-green-600"
              checked={!!selected.isActive}
              onChange={(e) =>
                setSelected({ ...selected, isActive: e.target.checked })
              }
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Activar canal
              </span>
              <p className="text-xs text-gray-400">
                Solo los canales activos reciben anuncios.
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={saving}
            className="w-full rounded-lg bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 disabled:opacity-50 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}