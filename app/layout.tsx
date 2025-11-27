export const metadata = {
  title: "Gym Planner",
  description: "Offline-first workout planner and tracker",
};

import "./globals.css";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-800">
        <ServiceWorkerRegistrar />
        <div className="max-w-md mx-auto p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
