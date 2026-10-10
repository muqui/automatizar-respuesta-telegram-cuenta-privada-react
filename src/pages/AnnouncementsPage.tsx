// src/pages/AnnouncementsPage.tsx

import { useEffect, useState } from "react";
import {
  getAnnouncements,
  updateAnnouncement,
  createAnnouncement,
  deleteAnnouncement,
} from "../api/announcement.api";
import { getTemplates } from "../api/template.api";
import {
  AnnouncementCard,
  AnnouncementHeader,
  AnnouncementModal,
  AnnouncementTable,
} from "../assets/components/announcements";

export default function AnnouncementsPage() {
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

  // 🔥 Pre-rellenar fechas y horas al crear
  const handleCreateOpen = () => {
    const today = new Date();

    // Fecha inicio: 2 días antes
    const start = new Date(today);
    start.setDate(start.getDate() - 2);

    // Fecha fin: 2 días después
    const end = new Date(today);
    end.setDate(end.getDate() + 2);

    // Formatear a YYYY-MM-DD (formato del input type="date")
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setSelected({
      name: "",
      startDate: formatDate(start),   // 🔥 2 días antes
      endDate: formatDate(end),       // 🔥 2 días después
      startTime: "00:01",             // 🔥 12:01 AM
      endTime: "23:59",               // 🔥 11:59 PM
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

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-5 md:p-6 lg:p-8">
      <AnnouncementHeader onCreate={handleCreateOpen} />

      {/* Tarjetas para móvil */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
        {data.map((a) => (
          <AnnouncementCard
            key={a.id}
            announcement={a}
            onToggle={toggleActive}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Tabla para escritorio */}
      <AnnouncementTable
        data={data}
        onToggle={toggleActive}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <AnnouncementModal
        open={open}
        selected={selected}
        setSelected={setSelected}
        isCreating={isCreating}
        templates={templates}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}