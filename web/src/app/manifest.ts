import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LearnX",
    short_name: "LearnX",
    description: "App-grade web learning for engineering students.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe5",
    theme_color: "#0f766e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
