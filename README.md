# Bloggie - Modern Blogging Platform

A beautiful, modern blogging platform built with Next.js 15+ (App Router), Firebase, and Tailwind CSS. Features real-time authentication, likes, bookmarks, comments, and a stunning animated UI.

![Bloggie Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Bloggie+-+Modern+Blogging+Platform)

## ✨ Features

### 🔐 Authentication
- Firebase Email/Password authentication
- User registration and login
- Profile management with username and photo
- Protected routes for authenticated users

### 📝 Blog Features
- Create, read blogs with rich content
- Like/unlike blogs (toggle functionality)
- Bookmark system for saving favorite blogs
- Comment system with nested discussions
- Latest and most popular blog feeds
- User profile pages with all their blogs

### 🎨 UI/UX
- Beautiful gradient backgrounds with animated blobs
- Glass morphism design elements
- Smooth animations with Framer Motion
- Responsive design for all devices
- Custom scrollbars and hover effects
- Floating cards with elegant transitions

### 📱 Pages & Routing
- `/` - Home page (latest & popular blogs)
- `/blog/[id]` - Individual blog post with comments
- `/user/[username]` - User profile with their blogs
- `/dashboard` - User dashboard for creating and managing blogs

## 🚀 Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS with custom animations
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Type Safety**: TypeScript
- **Form Handling**: React Hook Form with Zod validation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd bloggie
```

### 2. Install dependencies
```bash
npm install
```

### 3. Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Get your Firebase configuration

### 4. Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Firestore Rules
Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for profiles
    }
    
    // Blogs are readable by all, writable by authenticated users
    match /blogs/{blogId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.authorId || 
         request.auth.uid in resource.data.likes ||
         request.auth.uid in resource.data.bookmarks);
    }
  }
}
```

### 6. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

### Users Collection
```typescript
{
  uid: string;
  username: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  createdAt: Date;
}
```

### Blogs Collection
```typescript
{
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorPhotoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  likes: string[]; // Array of user IDs
  bookmarks: string[]; // Array of user IDs
  comments: Comment[];
}
```

### Comments Schema
```typescript
{
  id: string;
  blogId: string;
  authorId: string;
  authorUsername: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: Date;
  likes: string[]; // Array of user IDs
}
```

## 🎨 UI Components

### Animated Components
- `FloatingCard` - Animated cards with hover effects
- `GradientBackground` - Animated gradient with floating blobs
- `AnimatedCounter` - Spring-animated counters
- `GlowingButton` - Buttons with glow effects

### Form Components
- `CreateBlogForm` - Rich blog creation form
- `AuthModal` - Authentication modal with validation
- `BlogCard` - Blog preview cards with actions

## 🔧 Customization

### Themes
The app uses a blue-to-purple gradient theme. To customize:
1. Update the gradient colors in `globals.css`
2. Modify the Tailwind color classes throughout components
3. Adjust the animated blob colors in `GradientBackground`

### Animations
All animations use Framer Motion. Customize in:
- `src/components/ui/animated.tsx` - Core animated components
- Individual component files for specific animations

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Heroku

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for authentication and database
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations
- Lucide for beautiful icons

---

**Happy Blogging! 🎉**
