# Muhyo Tech

Professional portfolio, content platform, and admin-managed software services website for Muhyo Tech, the personal software development brand of Pir Ghulam Muhyo Din.

Live site: https://www.muhyotech.com  
Founder: Pir Ghulam Muhyo Din  
Location: Lahore, Pakistan  
Phone: +92 322 4458481  
WhatsApp: https://wa.me/923224458481  
Business email: MuhyoTech@gmail.com  
Resume/contact email: attariattari549@gmail.com  
Last updated: July 2026

## Overview

Muhyo Tech is a full-stack portfolio and digital services platform built with Next.js, React, MongoDB, and a secure admin dashboard. It presents services, projects, blogs, resume data, goals, contact channels, and SEO/AI-friendly discovery files.

The website is designed to represent Muhyo Tech professionally for clients, search engines, AI assistants, and technical reviewers.

## What Muhyo Tech Offers

- Performance-first web development
- UI/UX design and responsive interfaces
- SaaS dashboards and admin systems
- API and backend system development
- MongoDB-powered dynamic content
- SEO and digital growth strategy
- Cloud deployment and DevOps setup
- Blog publishing and portfolio management
- Secure admin authentication and approvals
- AI/search discovery support with `/llms.txt`

## Key Public Pages

- Home: https://www.muhyotech.com
- About: https://www.muhyotech.com/about
- Services: https://www.muhyotech.com/services
- Projects: https://www.muhyotech.com/projects
- Blog: https://www.muhyotech.com/blog
- Goals: https://www.muhyotech.com/goals
- Skills: https://www.muhyotech.com/skills
- Resume: https://www.muhyotech.com/resume
- Contact: https://www.muhyotech.com/contact
- AI profile: https://www.muhyotech.com/llms.txt
- Sitemap: https://www.muhyotech.com/sitemap.xml
- Robots: https://www.muhyotech.com/robots.txt

## Features

- Dynamic portfolio data for services, projects, blogs, goals, skills, and resume content
- Admin dashboard for managing public content
- Secure admin login with passkey-based authentication
- Google OAuth account linking flow
- Super Admin transfer and security controls
- MongoDB/Mongoose data layer
- SEO metadata, canonical URLs, sitemap, robots, and JSON-LD schema
- Detailed `/llms.txt` file for AI assistants and answer engines
- Contact form and WhatsApp project inquiry path
- Blog automation and AI-assisted editorial tooling
- Cloudinary image upload and media handling
- Responsive public UI with animation and modern design

## Tech Stack

### Core

- Next.js 16
- React 19
- Tailwind CSS 4
- MongoDB
- Mongoose
- Node.js

### UI and State

- Framer Motion
- Lucide React
- Zustand
- React Hook Form
- TanStack Query
- Sonner
- Swiper
- Recharts

### Backend and Security

- Next.js App Router API routes
- JWT sessions with `jose`
- bcrypt passkey hashing
- Nodemailer email delivery
- Rate limiting
- Admin approval workflows
- Google OAuth integration

### Media, Automation, and AI

- Cloudinary
- Google Generative AI package
- Blog image generation helpers
- SEO audit helpers
- `/llms.txt` AI knowledge profile

## Project Structure

```txt
muhyo-tech/
├── public/                    Static assets and images
├── src/
│   ├── app/                   Next.js App Router pages and API routes
│   │   ├── (main)/            Public website routes
│   │   ├── (admin)/           Admin dashboard and auth routes
│   │   ├── api/               Backend API endpoints
│   │   ├── llms.txt/          AI profile route
│   │   ├── robots.js          Robots configuration
│   │   └── sitemap.js         Dynamic sitemap
│   ├── components/            Public and admin UI components
│   ├── controllers/           Business logic and data controllers
│   ├── lib/                   Auth, SEO, config, data, mail, AI helpers
│   └── models/                Mongoose models
├── package.json
├── next.config.mjs
├── eslint.config.mjs
└── README.md
```

## Environment Variables

Create `.env.local` from `.env.sample` and configure the project secrets.

Important variables include:

```env
APP_URL=https://www.muhyotech.com
NEXT_PUBLIC_SITE_URL=https://www.muhyotech.com
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_secure_auth_secret
SESSION_SECRET=your_secure_session_secret
SUPER_ADMIN_EMAIL=your_super_admin_email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://www.muhyotech.com/api/auth/google/callback
```

For local development, the app can still run on `http://localhost:3000`, but public SEO and AI files should point to the production domain.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

Run linting:

```bash
npm run lint
```

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run clean` | Remove the `.next` build folder on Windows |

## SEO And AI Discovery

Muhyo Tech includes a strong discovery setup:

- `src/app/sitemap.js` generates public URLs for search engines.
- `src/app/robots.js` allows public pages and blocks admin/API areas.
- `src/components/schema/OrganizationSchema.jsx` adds Organization JSON-LD.
- `src/app/(main)/about/page.jsx` adds Person JSON-LD for Pir Ghulam Muhyo Din.
- `src/app/llms.txt/route.js` provides a detailed AI-readable brand profile.

The `/llms.txt` route is intentionally configured to use the production domain so AI systems do not learn local development links.

## Admin And Security Notes

- Admin routes live under `/admin`.
- API routes live under `/api`.
- Private admin and API routes are excluded from public AI/source guidance.
- Super Admin and Google OAuth account linking use extra verification rules.
- Passkeys are hashed before storage.
- Sensitive values must stay in environment variables, never in committed code.

## Deployment

Recommended deployment platform: Vercel.

Deployment checklist:

- Set `APP_URL` and `NEXT_PUBLIC_SITE_URL` to `https://www.muhyotech.com`
- Add MongoDB credentials
- Add auth/session secrets
- Add SMTP credentials
- Add Google OAuth credentials
- Confirm `GOOGLE_REDIRECT_URI`
- Run a production build
- Verify `/sitemap.xml`, `/robots.txt`, and `/llms.txt`

## Contact

For projects, collaboration, or technical inquiries:

- Website: https://www.muhyotech.com/contact
- WhatsApp: https://wa.me/923224458481
- Phone: +92 322 4458481
- Email: MuhyoTech@gmail.com
- LinkedIn: https://www.linkedin.com/in/ghulam-muhyo-din-web-designer/
- GitHub: https://github.com/Attariattari
- X/Twitter: https://x.com/GhulamMuhyo
- Facebook: https://www.facebook.com/MuhammadMuhyoDinAttari

## License

This project is private/proprietary unless a license file or repository setting states otherwise.

## Maintainer

Maintained by Muhyo Tech and Pir Ghulam Muhyo Din.
