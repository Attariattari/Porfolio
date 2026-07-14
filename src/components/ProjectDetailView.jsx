import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Code2,
  ExternalLink,
  Github,
  Layers,
  Lightbulb,
  MonitorSmartphone,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";
import { ensureMuhyoTechAlt, getProjectMediaAlt } from "@/lib/mediaAlt";
import {
  GlassCard,
  ProjectBookingButton,
  ProjectHeroMotion,
  ProjectLightboxButton,
  SectionHeading,
} from "@/components/ProjectDetailInteractions";

const iconMap = {
  Award,
  CheckCircle2,
  Code2,
  Layers,
  Lightbulb,
  MonitorSmartphone,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Target,
};

const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
const text = (...values) => values.find((value) => typeof value === "string" && value.trim()) || "";
const imageUrl = (image) => (typeof image === "string" ? image : image?.url || "");
const safeImageUrl = (image, fallback) => getSafeImageSrc(imageUrl(image) || image, fallback);
const groupTechStack = (techStack = []) => ({
  frontend: techStack.filter((tech) => /next|react|tailwind|framer|three|d3|typescript/i.test(tech)),
  backend: techStack.filter((tech) => /node|express|api|fastapi|go|prisma/i.test(tech)),
  database: techStack.filter((tech) => /mongo|mongoose|postgres|redis|firebase/i.test(tech)),
  tools: techStack.filter((tech) => /vercel|aws|docker|github|vs code/i.test(tech)),
  integrations: techStack.filter((tech) => /cloudinary|stripe|socket|web3|solidity|biometrics|google|maps|nodemailer|analytics|search console/i.test(tech)),
});

const uniqueImages = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const url = imageUrl(item);
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
};

const FeatureCard = ({ item }) => {
  const Icon = iconMap[item.icon] || CheckCircle2;
  return (
    <GlassCard>
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-3 text-lg font-bold text-foreground">{item.title}</h3>
      <p className="text-sm font-medium leading-relaxed text-muted-foreground">
        {item.description}
      </p>
    </GlassCard>
  );
};

export default function ProjectDetailView({
  project,
  relatedProjects = [],
  relatedServices = [],
}) {
  const galleryImages = (() => {
    const gallery = asArray(project.galleryImages).length
      ? asArray(project.galleryImages)
      : [
          ...(project.thumbnail || project.thumbnailImage
            ? [{ url: project.thumbnail || project.thumbnailImage, alt: project.title }]
            : []),
          ...asArray(project.gallery).map((url, index) => ({
            url,
            alt: `${project.title} screenshot ${index + 1}`,
          })),
        ];

    return uniqueImages(gallery);
  })();

  const lightboxImages = galleryImages.map(imageUrl);
  const lightboxAlts = galleryImages.map((image, index) =>
    ensureMuhyoTechAlt(
      image?.alt,
      getProjectMediaAlt(project, "gallery", index),
    ),
  );
  const heroImage = text(
    project.heroImage,
    project.thumbnailImage,
    project.thumbnail,
    project.image,
    lightboxImages[0],
  );
  const techStack = asArray(project.techStack);
  const technologies =
    project.technologies &&
    typeof project.technologies === "object" &&
    !Array.isArray(project.technologies)
      ? project.technologies
      : groupTechStack(techStack);
  const liveUrl = text(project.liveUrl, project.liveLink, project.demoLink);
  const githubUrl = text(project.githubUrl, project.gitLink, project.githubLink);
  const overview = text(project.overview, project.longDescription, project.details, project.description);
  const problem = text(project.problem, project.problemSolved, project.purpose);
  const goals = asArray(project.goals);
  const responsibilities = asArray(project.responsibilities);
  const features = asArray(project.features);
  const modules = asArray(project.modules);
  const processSteps = asArray(project.processSteps);
  const challenges = asArray(project.challenges);
  const results = asArray(project.results);

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[5%] h-[420px] w-[420px] rounded-full bg-accent/5 blur-[110px]" />
        <div className="absolute right-[8%] top-[28%] h-[380px] w-[380px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:px-12">
        <Link
          href="/projects"
          className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <ProjectHeroMotion>
            <div className="mb-6 flex flex-wrap gap-3">
              {[project.category, project.projectType || project.purpose, project.status || project.publishStatus]
                .filter(Boolean)
                .map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-bold text-accent"
                  >
                    {badge}
                  </span>
                ))}
            </div>

            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
              {project.title}
            </h1>
            <p className="mb-8 text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
              {text(project.shortDescription, project.description)}
            </p>

            <div className="mb-8 flex flex-wrap gap-2">
              {techStack.slice(0, 8).map((tech) => (
                <span
                  key={tech}
                  className="rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-xs font-bold text-foreground/80"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              {liveUrl && (
                <Link href={liveUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full rounded-2xl sm:w-auto">
                    View Live Project <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              {githubUrl && (
                <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full rounded-2xl sm:w-auto">
                    View Source Code <Github className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <ProjectBookingButton
                projectTitle={project.title}
                variant={liveUrl ? "secondary" : "primary"}
                className="w-full rounded-2xl sm:w-auto"
              >
                Similar Project
              </ProjectBookingButton>
            </div>
          </ProjectHeroMotion>

          {heroImage && (
            <ProjectLightboxButton
              images={lightboxImages}
              alts={lightboxAlts}
              imageAlt={getProjectMediaAlt(project, "hero")}
              initialIndex={0}
              variant="hero"
              className="theme-media-frame group relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-border/70 bg-card text-left"
            >
              <Image
                src={getSafeImageSrc(heroImage)}
                alt={getProjectMediaAlt(project, "hero")}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="theme-image-wash absolute inset-0" />
            </ProjectLightboxButton>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-20 px-4 pb-20 md:px-8 lg:px-12">
        {overview && (
          <section>
            <SectionHeading eyebrow="Project overview" title="What this project is" />
            <GlassCard>
              <p className="text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
                {overview}
              </p>
            </GlassCard>
          </section>
        )}

        {(problem || goals.length > 0) && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {problem && (
              <GlassCard>
                <Target className="mb-5 h-8 w-8 text-accent" />
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-foreground">The Challenge</h2>
                  {(project.projectType || project.purpose) && (
                    <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-bold text-accent">
                      {project.projectType || project.purpose}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  {problem}
                </p>
              </GlassCard>
            )}
            {goals.length > 0 && (
              <GlassCard>
                <Lightbulb className="mb-5 h-8 w-8 text-accent" />
                <h2 className="mb-4 text-2xl font-bold text-foreground">Project Goals</h2>
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div key={goal} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span className="text-sm font-medium text-muted-foreground">{goal}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </section>
        )}

        {(project.role || responsibilities.length > 0) && (
          <section>
            <SectionHeading eyebrow="My role" title="What I handled" />
            <GlassCard>
              {project.role && (
                <p className="mb-6 text-base font-medium leading-relaxed text-muted-foreground">
                  {project.role}
                </p>
              )}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {responsibilities.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-sm font-bold text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </section>
        )}

        {features.length > 0 && (
          <section>
            <SectionHeading eyebrow="Key features" title="Core functionality" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((item) => (
                <FeatureCard key={item.title} item={item} />
              ))}
            </div>
          </section>
        )}

        {modules.length > 0 && (
          <section>
            <SectionHeading eyebrow="Pages / modules" title="What is included" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {modules.map((module) => (
                <GlassCard key={module.title}>
                  <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-bold text-accent">
                    {module.type || "Module"}
                  </span>
                  <h3 className="mb-3 text-lg font-bold text-foreground">{module.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                    {module.description}
                  </p>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {(Object.values(technologies).some((items) => asArray(items).length > 0) || techStack.length > 0) && (
          <section>
            <SectionHeading eyebrow="Technologies" title="Stack used" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(technologies).map(([group, items]) =>
                asArray(items).length > 0 ? (
                  <GlassCard key={group}>
                    <h3 className="mb-5 capitalize text-lg font-bold text-foreground">
                      {group}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {asArray(items).map((item) => (
                        <span key={item} className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs font-bold text-foreground/80">
                          {item}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                ) : null,
              )}
            </div>
          </section>
        )}

        {galleryImages.length > 0 && (
          <section>
            <SectionHeading eyebrow="Screenshots" title="Project gallery" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {galleryImages.map((image, index) => (
                <ProjectLightboxButton
                  key={`${imageUrl(image)}-${index}`}
                  images={lightboxImages}
                  alts={lightboxAlts}
                  imageAlt={getProjectMediaAlt(project, "gallery", index)}
                  initialIndex={index}
                  className="group relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/10 bg-card text-left"
                >
                  <Image
                    src={safeImageUrl(image)}
                    alt={ensureMuhyoTechAlt(
                      image.alt,
                      getProjectMediaAlt(project, "gallery", index),
                    )}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {image.caption && (
                    <div className="theme-image-caption absolute inset-x-0 bottom-0 p-5">
                      <p className="text-sm font-bold text-foreground">{image.caption}</p>
                    </div>
                  )}
                </ProjectLightboxButton>
              ))}
            </div>
          </section>
        )}

        {processSteps.length > 0 && (
          <section>
            <SectionHeading eyebrow="Development process" title="How it was built" />
            <div className="space-y-5">
              {processSteps.map((step, index) => (
                <GlassCard key={`${step.title}-${index}`}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground text-sm font-black">
                      {step.step || index + 1}
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-bold text-foreground">{step.title}</h3>
                      <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {challenges.length > 0 && (
          <section>
            <SectionHeading eyebrow="Challenges & solutions" title="Case-study decisions" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {challenges.map((item) => (
                <GlassCard key={item.title}>
                  <h3 className="mb-4 text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="mb-5 text-sm font-medium leading-relaxed text-muted-foreground">
                    {item.problem}
                  </p>
                  <div className="rounded-2xl border border-accent/20 bg-accent/10 p-5">
                    <p className="text-xs font-bold text-accent mb-2">Solution</p>
                    <p className="text-sm font-medium leading-relaxed text-foreground/80">
                      {item.solution}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {results.length > 0 && (
          <section>
            <SectionHeading eyebrow="Results / impact" title="Practical outcome" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {results.map((item) => (
                <GlassCard key={item.title}>
                  <Award className="mb-5 h-7 w-7 text-accent" />
                  <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {relatedServices.length > 0 && (
          <section>
            <SectionHeading eyebrow="Related services" title="Services connected to this work" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {relatedServices.map((service) => (
                <Link key={service.slug} href={`/services/${service.slug}`}>
                  <GlassCard className="h-full">
                    <h3 className="mb-3 text-lg font-bold text-foreground">{service.title}</h3>
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                      {service.shortDescription || service.description}
                    </p>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedProjects.length > 0 && (
          <section>
            <SectionHeading eyebrow="Related projects" title="More work to explore" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedProjects.map((item) => (
                <Link key={item.slug || item.id} href={`/projects/${item.slug}`}>
                  <GlassCard className="h-full overflow-hidden p-0">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={getSafeImageSrc(item.thumbnail || item.thumbnailImage || item.image)}
                        alt={getProjectMediaAlt(item)}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <p className="mb-2 text-xs font-bold text-accent">{item.category}</p>
                      <h3 className="mb-3 text-lg font-bold text-foreground">{item.title}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-accent/10 via-background to-accent/5 p-10 text-center md:p-16">
          <h2 className="mb-5 text-4xl font-black tracking-tight text-foreground md:text-6xl">
            Want a Similar Project?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
            Let&apos;s discuss your idea and build a modern, scalable, and professional web solution for your business.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <ProjectBookingButton
              projectTitle={project.title}
              className="w-full rounded-2xl sm:w-auto"
            >
              Book a Call <ArrowRight className="h-4 w-4" />
            </ProjectBookingButton>
            <Link href="/contact">
              <Button variant="outline" className="w-full rounded-2xl sm:w-auto">
                Send Message
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="secondary" className="w-full rounded-2xl sm:w-auto">
                View Services
              </Button>
            </Link>
          </div>
        </section>
      </section>

    </main>
  );
}
