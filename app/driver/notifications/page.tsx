import type { Metadata } from "next";
import { NotificationsPage } from "@/components/notifications/NotificationsPage";

export const metadata: Metadata = {
  title: "Notificaciones | Flexpress",
};

export default function DriverNotificationsPage() {
  return <NotificationsPage />;
}
