import "./globals.css";
import TitleBar from "@/components/TitleBar";
import SessionExpiredHandler from "@/components/SessionExpiredHandler";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata = {
  title: "Anlinet",
  description: "Aplicacion de administracion de usuarios de red",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body>
        <SessionExpiredHandler />
        <TitleBar />
        <main className="flex-1 overflow-auto">
          {children}
          <ToastProvider />
        </main>
      </body>
    </html>
  );
}
