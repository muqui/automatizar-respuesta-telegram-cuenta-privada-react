// src/components/layout/Sidebar.tsx

import { useState } from "react";
import { NavLink } from "react-router-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  {
    to: "/announcements",
    label: "Anuncios",
    icon: "📢",
  },
  {
    to: "/queue",
    label: "Cola de envíos",
    icon: "📋",
  },
  {
    to: "/templates",
    label: "Plantillas",
    icon: "📄",
  },
];

export default function Sidebar({ isOpen, onClose }: Props) {
  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-900 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo / Título */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
          <div>
            <h1 className="text-lg font-bold">Panel</h1>
            <p className="text-xs text-gray-400">Administración</p>
          </div>

          {/* Botón cerrar (móvil) */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Menú */}
        <nav className="flex flex-col gap-1 p-4">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}