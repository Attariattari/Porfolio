import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Blog, Project, Service, SiteConfig, About } from "@/models/Portfolio";
import User from "@/models/AdminModels";
import { getAuthSession } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!session || !["user", "admin", "super-admin", "root-super-admin"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    await dbConnect();

    const searchRegex = new RegExp(query, "i");

    // Search across modules
    const [blogs, projects, services, users, settings, about] = await Promise.all([
      Blog.find({
        $or: [
          { title: searchRegex },
          { summary: searchRegex },
          { slug: searchRegex },
          { tags: searchRegex },
        ],
      })
        .limit(10)
        .lean(),
      Project.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { slug: searchRegex },
          { techStack: searchRegex },
        ],
      })
        .limit(10)
        .lean(),
      Service.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { slug: searchRegex },
        ],
      })
        .limit(10)
        .lean(),
      User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
        ],
      })
        .limit(10)
        .lean(),
      SiteConfig.find({
        $or: [
          { siteTitle: searchRegex },
          { adminName: searchRegex },
          { email: searchRegex },
          { "seo.title": searchRegex },
          { "seo.description": searchRegex },
        ]
      })
        .limit(1)
        .lean(),
      About.find({
        $or: [
          { bio: searchRegex },
          { longDescription: searchRegex },
          { mission: searchRegex },
        ]
      })
        .limit(1)
        .lean(),
    ]);

    // Format results
    const results = [
      ...blogs.map((b) => ({
        id: b._id.toString(),
        title: b.title,
        description: b.summary,
        type: "Blog",
        route: `/admin/blogs?highlight=${b._id}`,
      })),
      ...projects.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        type: "Project",
        route: `/admin/projects?highlight=${p._id}`,
      })),
      ...services.map((s) => ({
        id: s._id.toString(),
        title: s.title,
        description: s.description,
        type: "Service",
        route: `/admin/services?highlight=${s._id}`,
      })),
      ...users.map((u) => ({
        id: u._id.toString(),
        title: u.name || u.email,
        description: u.email,
        type: "User",
        route: `/admin/users?highlight=${u._id}`,
      })),
      ...settings.map((s) => ({
        id: s._id.toString(),
        title: "System Settings",
        description: `Configuration for ${s.siteTitle}`,
        type: "Settings",
        route: `/admin/settings?highlight=${s._id}`,
      })),
      ...about.map((a) => ({
        id: a._id.toString(),
        title: "About Profile",
        description: a.bio,
        type: "About",
        route: `/admin/about?highlight=${a._id}`,
      })),
    ];

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
