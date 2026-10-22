// src/router/index.tsx

import { createBrowserRouter, Navigate } from "react-router-dom";

import AnnouncementsPage from "../pages/AnnouncementsPage";

import QueuePage from "../pages/QueuePage";
import TemplatesPage from "../pages/TemplatesPage";
import Layout from "../assets/components/layout/Layout";
import CronSettingsPage from "../pages/CronSettingsPage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/announcements" replace />,
      },
      {
        path: "announcements",
        element: <AnnouncementsPage />,
      },
      {
        path: "queue",
        element: <QueuePage />,
      },
      {
        path: "templates",
        element: <TemplatesPage />,
      },
      {
  path: "cron-settings",
  element: <CronSettingsPage />,
}
    ],
  },
  {
    path: "*",
    element: <Navigate to="/announcements" replace />,
  },
]);