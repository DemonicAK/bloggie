export interface User {
  uid: string;
  username: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  createdAt: Date;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  createdAt: Date;
  updatedAt: Date;
  likes: string[]; // Array of user IDs who liked
  bookmarks: string[]; // Array of user IDs who bookmarked
  comments: Comment[];
}

export interface Comment {
  id: string;
  blogId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: Date;
  likes: string[]; // Array of user IDs who liked the comment
}

export interface CreateBlogData {
  title: string;
  content: string;
}

export interface CreateCommentData {
  content: string;
}

// Types and interfaces for better code organization
export interface UserFormData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  profileImage: string | File;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

 export interface BlogPageProps {
    params: Promise<{
        id: string;
    }>;
}

export interface ImageSelectorProps {
    onImageSelect?: (file: File | null) => void;
    className?: string;
}