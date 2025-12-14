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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="theme-color" content="#111827" />
      </head>
      <body className="min-h-screen bg-gray-900 text-gray-100">
        <ServiceWorkerRegistrar />
        <div className="max-w-md mx-auto p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
