# TechBlog

A modern, fast blogging platform built with Next.js, TypeScript, and Firebase.

[![Live Demo](https://img.shields.io/badge/🌍_Live_Demo-techblog.arijitkar.com-brightgreen)](https://techblog.arijitkar.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## About

Techblog is a clean, performant blogging platform designed for technical writers and developers. Built with modern web technologies, it offers a seamless writing and reading experience with real-time features and excellent performance.

### Key Features

- ✅ **Real-time blogging** with live updates
- ✅ **User authentication** via Firebase Auth
- ✅ **Rich text editor** with markdown support
- ✅ **Responsive design** with dark/light themes
- ✅ **Comment system** with real-time interactions
- ✅ **Image uploads** via Cloudinary
- ✅ **SEO optimized** with automatic meta generation
- ✅ **PWA ready** with offline support

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DemonicAK/techblog.git
   cd techblog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Optional: Cloudinary for image uploads
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

4. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Deploy security rules: `firebase deploy --only firestore:rules`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Google Analytics (optional)

### 2. Enable Authentication
1. Go to Authentication → Sign-in method
2. Enable Email/Password
3. Enable Google (configure OAuth consent screen)

### 3. Set up Firestore
1. Go to Firestore Database → Create database
2. Start in test mode (we'll deploy security rules later)
3. Choose a location

### 4. Deploy Security Rules
```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript checks |

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── lib/                 # Utility functions and services
├── types/               # TypeScript type definitions
└── contexts/            # React Context providers
```

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write TypeScript for type safety
- Add comments for complex logic
- Test your changes locally
- Update documentation if needed

### Issue Reporting

Found a bug or have a feature request? Please [open an issue](https://github.com/DemonicAK/techblog/issues) with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations

---

**Built with ❤️ by [Arijit Kar](https://github.com/DemonicAK)**
