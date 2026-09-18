import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/directions", changeFrequency: "monthly", priority: 0.9 },
    { path: "/schedule", changeFrequency: "daily", priority: 0.9 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
    { path: "/team", changeFrequency: "monthly", priority: 0.8 },
    { path: "/reviews", changeFrequency: "weekly", priority: 0.8 },
    { path: "/contacts", changeFrequency: "yearly", priority: 0.7 },
    { path: "/about", changeFrequency: "yearly", priority: 0.6 },
    { path: "/faq", changeFrequency: "yearly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
