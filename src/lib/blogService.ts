import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  runTransaction,
  Transaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Blog, CreateBlogData, CreateCommentData, User } from '@/types';

// Helper function to process blog data and fix comment dates
const processBlogData = (doc: QueryDocumentSnapshot<DocumentData>): Blog => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    comments: (data.comments || []).map((comment: DocumentData, index: number) => ({
      ...comment,
      id: comment.id || `comment-${index}`,
      createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date(comment.createdAt || Date.now())
    }))
  } as Blog;
};

// Blog functions
export const createBlog = async (userId: string, blogData: CreateBlogData): Promise<string> => {
  try {
    // Get user data first
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as User;
    
    const blogToCreate = {
      ...blogData,
      authorId: userId,
      authorUsername: userData.username, // This will be lowercase
      authorPhotoURL: userData.photoURL || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: [],
      bookmarks: [],
      comments: []
    };

    const docRef = await addDoc(collection(db, 'blogs'), blogToCreate);
    return docRef.id;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

export const getBlog = async (blogId: string): Promise<Blog | null> => {
  try {
    const blogDoc = await getDoc(doc(db, 'blogs', blogId));
    if (blogDoc.exists()) {
      return processBlogData(blogDoc);
    }
    return null;
  } catch (error) {
    console.error('Error getting blog:', error);
    throw error;
  }
};

export const getBlogs = async (limitCount: number = 10): Promise<Blog[]> => {
  try {
    const q = query(
      collection(db, 'blogs'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => processBlogData(doc));
  } catch (error) {
    console.error('Error getting blogs:', error);
    throw error;
  }
};

export const getMostLikedBlogs = async (limitCount: number = 2): Promise<Blog[]> => {
  try {
    const q = query(
      collection(db, 'blogs'),
      orderBy('createdAt', 'desc'), // We'll sort by likes length on client side
      limit(50) // Get more to sort by likes
    );
    
    const querySnapshot = await getDocs(q);
    const blogs = querySnapshot.docs.map(doc => processBlogData(doc));
    
    // Sort by likes count and return limited results
    return blogs
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error getting most liked blogs:', error);
    throw error;
  }
};

export const getUserBlogs = async (userId: string): Promise<Blog[]> => {
  try {
    const q = query(
      collection(db, 'blogs'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => processBlogData(doc));
  } catch (error) {
    console.error('Error getting user blogs:', error);
    throw error;
  }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const normalizedUsername = username.trim();
    
    const q = query(
      collection(db, 'users'),
      where('username', '==', normalizedUsername),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const userData = doc.data();
    
    return {
      uid: doc.id,
      ...userData,
      // Convert Firestore Timestamp to Date
      createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt)
    } as User;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
};

export const getBlogsByUsername = async (username: string): Promise<Blog[]> => {
  try {
    const normalizedUsername = username.toLowerCase().trim();
    
    const q = query(
      collection(db, 'blogs'),
      where('authorUsername', '==', normalizedUsername),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as Blog));
  } catch (error) {
    console.error('Error getting blogs by username:', error);
    throw error;
  }
};

export const updateBlog = async (blogId: string, updates: Partial<CreateBlogData>): Promise<void> => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
};

export const deleteBlog = async (blogId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'blogs', blogId));
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

// Like/Unlike functions
export const toggleLike = async (blogId: string, userId: string): Promise<void> => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    const blogDoc = await getDoc(blogRef);
    
    if (blogDoc.exists()) {
      const blogData = blogDoc.data();
      const likes = blogData.likes || [];
      
      if (likes.includes(userId)) {
        // Unlike
        await updateDoc(blogRef, {
          likes: arrayRemove(userId)
        });
      } else {
        // Like
        await updateDoc(blogRef, {
          likes: arrayUnion(userId)
        });
      }
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Bookmark functions
export const toggleBookmark = async (blogId: string, userId: string): Promise<void> => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    const blogDoc = await getDoc(blogRef);
    
    if (blogDoc.exists()) {
      const blogData = blogDoc.data();
      const bookmarks = blogData.bookmarks || [];
      
      if (bookmarks.includes(userId)) {
        // Remove bookmark
        await updateDoc(blogRef, {
          bookmarks: arrayRemove(userId)
        });
      } else {
        // Add bookmark
        await updateDoc(blogRef, {
          bookmarks: arrayUnion(userId)
        });
      }
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
};

// Comment functions
export const addComment = async (blogId: string, userId: string, commentData: CreateCommentData): Promise<void> => {
  try {
    // Get user data first
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as User;
    
    const comment = {
      id: `${userId}-${Date.now()}`, // Generate unique ID
      blogId,
      authorId: userId,
      authorUsername: userData.username,
      authorPhotoURL: userData.photoURL,
      content: commentData.content,
      createdAt: Timestamp.now(), // Use Timestamp.now() instead of serverTimestamp()
      likes: []
    };

    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      comments: arrayUnion(comment)
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// User functions
export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const normalizedUsername = username.toLowerCase().trim();

  if (!normalizedUsername) {
    errors.push('Username is required');
  } else {
    if (normalizedUsername.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    if (normalizedUsername.length > 20) {
      errors.push('Username must be less than 20 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
    if (/^[0-9]/.test(normalizedUsername)) {
      errors.push('Username cannot start with a number');
    }
    if (normalizedUsername.includes('__')) {
      errors.push('Username cannot contain consecutive underscores');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    // Normalize username to lowercase for consistent checking
    const normalizedUsername = username.toLowerCase().trim();
    
    // Check both users collection and username tracking collection
    const [usersQuery, usernameDoc] = await Promise.all([
      getDocs(query(
        collection(db, 'users'),
        where('username', '==', normalizedUsername),
        limit(1)
      )),
      getDoc(doc(db, 'usernames', normalizedUsername))
    ]);
    
    return !usersQuery.empty || usernameDoc.exists();
  } catch (error) {
    console.error('Error checking username existence:', error);
    throw error;
  }
};

export const reserveUsername = async (username: string, uid: string): Promise<void> => {
  try {
    const normalizedUsername = username.toLowerCase().trim();
    
    // Use a transaction to atomically check and reserve the username
    await runTransaction(db, async (transaction: Transaction) => {
      // Check if username is already taken
      const usernameRef = doc(db, 'usernames', normalizedUsername);
      const usernameDoc = await transaction.get(usernameRef);
      
      if (usernameDoc.exists()) {
        throw new Error('Username is already taken. Please choose a different username.');
      }
      
      // Reserve the username
      transaction.set(usernameRef, {
        uid: uid,
        reservedAt: new Date(),
        username: normalizedUsername
      });
    });
  } catch (error) {
    console.error('Error reserving username:', error);
    throw error;
  }
};
