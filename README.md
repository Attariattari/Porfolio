<<<<<<< HEAD
# 🚀 Muhyo Tech | Professional Portfolio Website

A modern, high-performance portfolio website built with cutting-edge web technologies. Crafted to showcase professional services, projects, and expertise with an elegant, responsive design.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Muhyo Tech** is a professional full-stack portfolio website designed to help senior software engineers, UX architects, and full-stack developers showcase their work. The platform features:

- **Dynamic Content Management** - Admin dashboard for managing blogs, projects, and services
- **Real-time Notifications** - Event-driven architecture for instant updates
- **Secure Authentication** - JWT-based authentication system with email verification
- **Image Optimization** - Cloudinary integration for efficient media management
- **SEO Optimized** - Server-side rendering with metadata optimization
- **Responsive Design** - Mobile-first approach with smooth animations
- **Dark/Light Theme** - Theme persistence with Tailwind CSS

---

## ✨ Features

### Frontend Features
- **Hero Section** - Animated hero with typewriter effect and floating elements
- **Portfolio Showcase** - Dynamic project portfolio with filtering and modal views
- **Blog System** - Rich content blog with categories and search functionality
- **Services Page** - Service offerings with detailed descriptions
- **Admin Dashboard** - Comprehensive management system for content
- **Contact Form** - Email-integrated contact system
- **Social Integration** - WhatsApp business integration
- **Performance Metrics** - Lazy loading and code splitting

### Backend Features
- **RESTful API** - Complete REST API with Express.js
- **Database** - MongoDB with Mongoose ORM
- **Authentication** - JWT tokens with refresh mechanism
- **Email System** - NodeMailer integration for email campaigns
- **File Upload** - Cloudinary integration for media management
- **Event Bus** - Real-time event handling and notifications
- **Admin Approvals** - Content moderation system
- **Security** - Environment-based secret management

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **React 18+** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Zustand** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **NextAuth.js** - Authentication library

### Services & Tools
- **Cloudinary** - Image management and optimization
- **NodeMailer** - Email service
- **Vercel** - Deployment platform
- **NextAuth** - Authentication framework

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.17 or later)
- **npm** (v9+) or **yarn** (v3+)
- **MongoDB** (local or Atlas connection)
- **Git**

### Required Accounts
- MongoDB Atlas (or local MongoDB)
- Cloudinary account
- Gmail account (for SMTP)

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Attariattari/muhyo-tech.git
cd muhyo-tech
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root directory using `.env.sample` as a template:

```bash
cp .env.sample .env.local
```

Configure the following variables in `.env.local`:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Authentication
AUTH_SECRET=your_secret_key_here_minimum_32_chars_long_!!!

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name

# SMTP (Email Service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Environment
NODE_ENV=development
```

---

## 🚀 Running the Application

### Development Server

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Create an optimized production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## 📂 Project Structure

```
muhyo-tech/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Admin dashboard routes
│   │   ├── (main)/            # Public routes
│   │   ├── api/               # API routes
│   │   └── layout.jsx         # Root layout
│   ├── components/            # React components
│   │   ├── admin/             # Admin components
│   │   └── ui/                # UI components
│   ├── lib/                   # Utilities and helpers
│   │   ├── auth.js            # Authentication logic
│   │   ├── dbConnect.js       # Database connection
│   │   ├── config.js          # Configuration
│   │   └── data.js            # Static data
│   ├── models/                # Database models
│   ├── controllers/           # Business logic
│   └── proxy.js               # Auth proxy configuration
├── public/                    # Static assets
├── .env.sample               # Environment variables template
├── package.json              # Dependencies
├── next.config.mjs           # Next.js configuration
└── tailwind.config.js        # Tailwind CSS configuration
```

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (if configured) |

---

## 🌐 Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy is using Vercel:

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Configure environment variables in Vercel dashboard

3. **Deploy**
   - Click "Deploy"
   - Your site will be live!

### Environment Variables on Vercel

Add all `.env.local` variables to Vercel project settings under "Environment Variables".

### Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connection verified
- [ ] Cloudinary credentials set
- [ ] SMTP email configuration tested
- [ ] Build passes without errors

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork the repository**
```bash
git clone https://github.com/your-username/muhyo-tech.git
```

2. **Create a feature branch**
```bash
git checkout -b feature/AmazingFeature
```

3. **Commit your changes**
```bash
git commit -m 'Add some AmazingFeature'
```

4. **Push to the branch**
```bash
git push origin feature/AmazingFeature
```

5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 About

**Muhyo Tech** - Building amazing websites with modern technology, clean code, and secure architecture.

### Get in Touch
- **Email** - [attariattari549@gmail.com](mailto:attariattari549@gmail.com)
- **LinkedIn** - [Ghulam Muhyo Din](https://www.linkedin.com/in/ghulam-muhyo-din-web-designer/)
- **GitHub** - [Attariattari](https://github.com/Attariattari)
- **Website** - [muhyo-tech.vercel.app](https://muhyo-tech.vercel.app)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Framer Motion](https://www.framer.com/motion) - Animation library
- [MongoDB](https://www.mongodb.com) - Database
- [Vercel](https://vercel.com) - Hosting platform

---

<div align="center">

**Made with ❤️ by Muhyo Tech**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Active-brightgreen)

</div>
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
>>>>>>> d0f3240e6da17def667e3556d65dc513fb181d8d
