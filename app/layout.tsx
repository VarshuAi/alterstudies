import "./globals.css";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/context/AuthContext";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata = {
  title: "AlterStudies",
  description: "Free NEET prep — Class 11 & 12",
  themeColor: "#0EA5E9",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <ServiceWorker />
        </AuthProvider>
      </body>
    </html>
  );
}
