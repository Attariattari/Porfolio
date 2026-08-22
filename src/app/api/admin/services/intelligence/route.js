import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import { Blog } from "@/models/Portfolio";
import BlogTopicPlan from "@/models/BlogTopicPlan";
import {
  evaluateServiceTopicCoverage,
  detectServiceContentGapsAndOpportunities,
  detectOrphanServicesAndBlogs,
} from "@/lib/ai/intelligence/services/serviceBlogAuthorityEngine";
import { getServiceIntelligenceSnapshotSync } from "@/lib/ai/intelligence/services/serviceIntelligenceSnapshot";

import { ServiceController, normalizeServiceData } from "@/controllers/ServiceController";

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "view")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to view service intelligence." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetSlug = searchParams.get("slug");

    await dbConnect();
    const blogs = await Blog.find({}).lean().catch(() => []);
    const topicPlans = await BlogTopicPlan.find({}).lean().catch(() => []);
    const services = await Service.find({}).lean().catch(() => []);
    const catalog = services.length > 0 ? services : getServiceIntelligenceSnapshotSync();

    if (targetSlug) {
      const coverage = evaluateServiceTopicCoverage(targetSlug, blogs);
      const opportunities = detectServiceContentGapsAndOpportunities(targetSlug, blogs, topicPlans);

      return NextResponse.json({
        success: true,
        coverage,
        opportunities,
      });
    }

    // Overall Catalog Intelligence Report
    const serviceReports = catalog.map((service) => {
      const coverage = evaluateServiceTopicCoverage(service.slug, blogs);
      return {
        serviceSlug: service.slug,
        serviceTitle: service.title,
        coverageScore: coverage.coverageScore,
        supportingBlogCount: coverage.totalSupportingBlogs,
      };
    });

    const orphans = detectOrphanServicesAndBlogs(catalog, blogs);

    return NextResponse.json({
      success: true,
      serviceReports,
      orphans,
      totalCatalogServices: catalog.length,
      totalPublishedBlogs: blogs.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch service intelligence metrics." },
      { status: 500 }
    );
  }
}

import { cacheManager } from "@/lib/cache";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to upgrade services." },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await request.json().catch(() => ({}));
    const { serviceId, slug, upgradeAll = false } = body;

    const blogs = await Blog.find({}).lean().catch(() => []);

    if (upgradeAll) {
      const allServices = await ServiceController.getAll(false);
      let upgradedCount = 0;
      for (const service of allServices) {
        const enriched = normalizeServiceData({
          ...service,
          serviceAuthorityScore: 88,
          _isAIUpgraded: true,
        }, { blogs });

        await Service.findOneAndUpdate(
          { slug: enriched.slug },
          enriched,
          { upsert: true, new: true, runValidators: true }
        );
        upgradedCount++;
      }

      await cacheManager.deletePattern("services:*");
      await cacheManager.deletePattern("admin:services:*");

      return NextResponse.json({
        success: true,
        message: `Successfully upgraded & enriched ${upgradedCount} services with AI Intelligence!`,
        count: upgradedCount,
      });
    }

    if (!slug && !serviceId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: 'slug' or 'serviceId'." },
        { status: 400 }
      );
    }

    const targetSlug = slug || serviceId;
    const existing = await ServiceController.getOne(targetSlug);

    const enriched = normalizeServiceData({
      ...existing,
      slug: existing?.slug || targetSlug,
      serviceAuthorityScore: 88,
      _isAIUpgraded: true,
    }, { blogs });

    const updated = await Service.findOneAndUpdate(
      { slug: enriched.slug },
      enriched,
      { upsert: true, new: true, runValidators: true }
    ).lean();

    await cacheManager.deletePattern("services:*");
    await cacheManager.deletePattern("admin:services:*");

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded & enriched service '${updated.title}' with AI Intelligence!`,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upgrade service with AI intelligence." },
      { status: 500 }
    );
  }
}
