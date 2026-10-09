// src/components/announcements/AnnouncementModal.tsx

interface Props {
  open: boolean;
  selected: any;
  setSelected: (a: any) => void;
  isCreating: boolean;
  templates: any[];
  onClose: () => void;
  onSave: () => void;
}

export default function AnnouncementModal({
  open,
  selected,
  setSelected,
  isCreating,
  templates,
  onClose,
  onSave,
}: Props) {
  if (!open || !selected) return null;

  const selectedTemplate = templates.find(
    (t) => t.messageId === Number(selected?.savedMessageId)
  );

  return (
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
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nombre</label>
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
                  setSelected({ ...selected, startDate: e.target.value })
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
                  setSelected({ ...selected, endDate: e.target.value })
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
                  setSelected({ ...selected, startTime: e.target.value })
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
                  setSelected({ ...selected, endTime: e.target.value })
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
                setSelected({ ...selected, savedMessageId: e.target.value })
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
                setSelected({ ...selected, isActive: e.target.checked })
              }
            />
            <span className="text-sm font-medium text-gray-700">
              Activar anuncio
            </span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 sm:w-auto sm:py-2.5"
          >
            Cancelar
          </button>

          <button
            onClick={onSave}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto sm:py-2.5"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}