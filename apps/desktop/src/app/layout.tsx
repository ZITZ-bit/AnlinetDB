import "./globals.css";
import TitleBar from "@/components/TitleBar";

export const metadata = {
  title: "Anlinet",
  description: "Aplicacion de administracion de usuarios de red",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body>
        <TitleBar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
