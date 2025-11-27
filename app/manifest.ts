import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gym Planner",
    short_name: "GymPlanner",
    description: "Offline-first workout planner and tracker",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0ea5e9",
    icons: [
      // Temporary data-URI placeholders; replace with real files in /public/icons
      { src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAQAAAD0b0jQAAAAGUlEQVR42u3BMQEAAADCoPVPbQ0PoAAAAAAAAKkNYgAAB1yH3gAAAABJRU5ErkJggg==", sizes: "192x192", type: "image/png" },
      { src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAQAAAB2oVQeAAAAGUlEQVR42u3BMQEAAADCoPVPbQ0PoAAAAAAAAKkNYgAAB1yH3gAAAABJRU5ErkJggg==", sizes: "512x512", type: "image/png" },
      { src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAQAAAD0b0jQAAAAGUlEQVR42u3BMQEAAADCoPVPbQ0PoAAAAAAAAKkNYgAAB1yH3gAAAABJRU5ErkJggg==", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAQAAAB2oVQeAAAAGUlEQVR42u3BMQEAAADCoPVPbQ0PoAAAAAAAAKkNYgAAB1yH3gAAAABJRU5ErkJggg==", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
