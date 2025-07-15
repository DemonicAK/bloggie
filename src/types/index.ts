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
