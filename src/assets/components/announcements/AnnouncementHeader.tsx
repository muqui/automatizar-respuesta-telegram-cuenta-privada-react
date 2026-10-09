// src/components/announcements/AnnouncementHeader.tsx

interface Props {
  onCreate: () => void;
}

export default function AnnouncementHeader({ onCreate }: Props) {
  return (
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
        onClick={onCreate}
        className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] sm:w-auto sm:py-2.5"
      >
        + Nuevo anuncio
      </button>
    </div>
  );
}