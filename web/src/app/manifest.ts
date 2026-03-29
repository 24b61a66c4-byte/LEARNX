import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LearnX",
    short_name: "LearnX",
    description: "AI-powered learning for all students, all ages. Learn anything with adaptive explanations, voice, and practice.",
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
