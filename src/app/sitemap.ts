import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${base}/courses`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/playground`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/about`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/contact`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${base}/legal/terms`, priority: 0.2 },
    { url: `${base}/legal/privacy`, priority: 0.2 },
    { url: `${base}/legal/refunds`, priority: 0.2 },
  ];

  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    return [
      ...staticRoutes,
      ...courses.map((c) => ({
        url: `${base}/courses/${c.slug}`,
        lastModified: c.updatedAt,
        priority: 0.8,
        changeFrequency: "weekly" as const,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
