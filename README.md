# Muhyo Tech

Production portfolio, services, content, and administration platform for **Muhyo Tech**, maintained by Pir Ghulam Muhyo Din in Lahore, Pakistan.

[![Website](https://img.shields.io/badge/Website-muhyotech.com-6d5dfc?style=flat-square)](https://www.muhyotech.com)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-149eca?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?style=flat-square&logo=mongodb)
![Status](https://img.shields.io/badge/status-active-success?style=flat-square)

> Current project reference · Updated July 29, 2026

## Platform overview

Muhyo Tech combines a public business website with a database-backed administration system. Public content—including services, projects, articles, skills, goals, resume information, and contact details—is managed from the admin console and delivered through the Next.js App Router.

The platform also includes an editorial automation system for topic planning, long-form and supporting article generation, image preparation, quality review, social sharing content, publishing, and Featured article selection.

## Current capabilities

### Public website

- Responsive portfolio and service presentation
- Dynamic projects, services, blog, skills, goals, resume, and contact content
- Individual service, project, and article detail pages
- Contact and WhatsApp inquiry paths
- Theme-aware UI, animations, image galleries, and lightboxes
- Canonical metadata, structured data, sitemap, robots rules, and legacy blog redirects
- AI-readable brand information through `/llms.txt`

### Administration

- Central dashboard for public website content
- Project, service, blog, profile, resume, skills, goals, and message management
- Secure session-based admin access and account security controls
- Google OAuth account-linking support
- Cloudinary media upload and image management
- Published, pending, and draft content states
- Cache invalidation and optional real-time content events

### AI editorial system

- Persistent AI, manual, and fallback topic queues
- Duplicate-aware topic validation against existing blogs and used plans
- Pillar-first content clusters: one detailed Pillar article followed by two related Supporting articles
- Strict parent verification that prevents Supporting generation before its Pillar blog exists
- Detailed Pillar articles targeting complete subject coverage rather than word-count padding
- Focused Supporting articles for narrow questions and internal topical support
- AI quality review, retry limits, and safe failure handling
- Topic usage tracking so completed topics are not selected again
- Article-specific image prompts with varied visual direction and color themes
- Image readiness and quality audit data
- Platform-specific LinkedIn, Facebook, X, and WhatsApp post generation
- Second-pass social editorial review for factual accuracy, tone, claims, jargon, and professionalism
- Quality-based Featured article selection instead of automatically featuring every new post

## Editorial sequence

Each content cluster follows this enforced order:

```text
Detailed Pillar article
        |
        +--> Supporting article 1
        |
        +--> Supporting article 2
        |
        +--> Next Pillar cluster
```

A Supporting topic is eligible only when its linked Pillar topic is marked as used **and** the actual Pillar blog still exists. If no duplicate-safe Pillar topic is available, automated generation stops instead of producing an unrelated Supporting fallback.

## Featured article qualification

Featured placement is earned through editorial signals rather than publication date alone. The ranking process considers:

- AI review status and quality score
- Article type and appropriate content depth
- Useful H2/H3 structure
- SEO title, focus keyword, and description completeness
- Lists, practical guidance, mistakes, best practices, tables, and FAQs where appropriate
- Cover-image readiness and audit data
- Category and topic-cluster diversity

The public blog does not label ordinary recent posts as Featured when no article passes the qualification threshold.

## Technology

| Area | Current stack |
| --- | --- |
| Application | Next.js 16.1.6, React 19.2.3, App Router |
| Styling | Tailwind CSS 4, Framer Motion |
| Data | MongoDB, Mongoose 9 |
| Forms and state | React Hook Form, Zustand, TanStack Query, Zod |
| Authentication | Signed sessions with `jose`, bcrypt hashing, Google OAuth |
| Media | Cloudinary |
| AI | Google Generative AI integration |
| Email | Nodemailer/SMTP |
| Caching | Application cache with optional Redis |
| UI utilities | Lucide, Swiper, Recharts, Sonner, dnd-kit |
| Observability | Optional Vercel Analytics and Speed Insights |

## Repository structure

```text
.
|-- public/                         Static assets
|-- src/
|   |-- app/
|   |   |-- (main)/                Public routes
|   |   |-- (admin)/               Admin and authentication routes
|   |   |-- api/                   APIs, cron handlers, and integrations
|   |   |-- llms.txt/              AI-readable brand route
|   |   |-- robots.js              Crawler policy
|   |   `-- sitemap.js             Dynamic sitemap
|   |-- components/                Public and admin interfaces
|   |-- controllers/               Application business logic
|   |-- lib/
|   |   |-- ai/blog/               Topics, articles, images, and social content
|   |   |-- cron/                  Scheduled pipeline orchestration
|   |   `-- server/                Server-only helpers
|   `-- models/                    Mongoose schemas and models
|-- .env.sample                    Environment variable reference
|-- package.json                   Dependencies and scripts
`-- README.md                      Project documentation
```

## Local development

Requirements:

- A current Node.js LTS release
- npm
- MongoDB connection
- Service credentials for the integrations being used

Setup:

```bash
npm install
copy .env.sample .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Webpack development server |
| `npm run build` | Create the production build |
| `npm start` | Start a completed production build |
| `npm run lint` | Run ESLint |
| `npm run clean` | Remove `.next` on Windows |

## Environment configuration

Use `.env.sample` as the source of truth. Never commit `.env.local` or expose credentials in client-side code.

| Group | Variables |
| --- | --- |
| Database | `MONGODB_URI` |
| Application URLs | `APP_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BASE_URL` |
| Authentication | `AUTH_SECRET`, `SESSION_SECRET`, `AUTH_SESSION_DAYS`, `SUPER_ADMIN_EMAIL` |
| Email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` |
| Cloudinary | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| AI | `GEMINI_API_KEY`; optional model and timeout overrides |
| Blog automation | `AUTO_PUBLISH_AI_BLOGS`, `ALLOW_PUBLISH_WITHOUT_BLOG_IMAGE`, `DEFAULT_BLOG_FALLBACK_IMAGE_URL` |
| Image upload links | `BLOG_IMAGE_UPLOAD_SECRET`, `BLOG_IMAGE_UPLOAD_LINK_TTL_HOURS` |
| Scheduled routes | `CRON_SECRET` |
| Optional services | `REDIS_URL`, analytics and Socket.IO feature flags |

`OPENAI_API_KEY` is present in the environment template for optional integrations; the current editorial generator uses the configured Gemini service.

## Scheduled editorial operation

Protected cron handlers coordinate daily blog processing and Featured ranking refreshes. Production schedulers must send the configured `CRON_SECRET`. A topic is moved through its queue states and linked to the resulting blog, allowing interrupted processing to recover without intentionally reusing a completed topic.

Automated publishing behavior remains controlled by environment settings and image readiness. Failed quality checks stop or retry within bounded limits instead of silently publishing degraded content.

## SEO and discovery

- Dynamic sitemap and crawler rules
- Canonical production URLs
- Page-specific metadata and social previews
- Organization, person, service, project, and article structured data where relevant
- Redirects for retired duplicate blog slugs
- `/llms.txt` for concise AI-oriented brand context
- Admin and private API areas excluded from public discovery

Production verification should include:

```text
https://www.muhyotech.com/sitemap.xml
https://www.muhyotech.com/robots.txt
https://www.muhyotech.com/llms.txt
```

## Deployment

The application is designed for Vercel-compatible deployment.

Before release:

1. Configure all required production environment variables.
2. Confirm MongoDB, Cloudinary, SMTP, OAuth, and AI credentials.
3. Set canonical URL variables to `https://www.muhyotech.com`.
4. Configure protected scheduled requests with `CRON_SECRET`.
5. Verify public metadata, redirects, sitemap, robots, and `/llms.txt`.
6. Confirm admin routes and secrets are not publicly exposed.

## Safe dependency updates

Dependabot proposes weekly patch and minor dependency updates in isolated pull
requests. Review the Vercel preview and run the local production smoke test
before manual approval. Updates never merge or deploy automatically.

See [Safe Automated Dependency Updates](docs/AUTOMATED_DEPENDENCY_UPDATES.md)
for the approval checklist, major-version policy, and rollback procedure.

## Contact

- Website: [muhyotech.com](https://www.muhyotech.com)
- Contact: [muhyotech.com/contact](https://www.muhyotech.com/contact)
- LinkedIn: [Ghulam Muhyo Din](https://www.linkedin.com/in/ghulam-muhyo-din-web-designer/)
- GitHub: [Attariattari](https://github.com/Attariattari)
- X: [@GhulamMuhyo](https://x.com/GhulamMuhyo)
- Facebook: [Muhyo Tech](https://www.facebook.com/muhyotech)

## Ownership

This repository is private and proprietary unless a separate license or repository setting states otherwise. Maintained by Muhyo Tech and Pir Ghulam Muhyo Din.
