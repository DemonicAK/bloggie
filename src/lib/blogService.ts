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
  startAfter,
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

/**
 * This file contains all the functions needed to interact with blogs in Firestore.
 
 */

// Helper function to convert Firestore documents to our Blog type

//  time debugging timestamp issues, 
const convertFirestoreDocToBlog = (firestoreDoc: QueryDocumentSnapshot<DocumentData>): Blog => {
  const docData = firestoreDoc.data();
  
  // console.log('Converting Firestore doc to Blog:', firestoreDoc.id); // test
  
  return {
    id: firestoreDoc.id,
    title: docData.title || '',
    content: docData.content || '',
    authorId: docData.authorId || '',
    authorUsername: docData.authorUsername || '',
    // Convert Firestore Timestamps to JavaScript Dates - this was tricky to get right
    createdAt: docData.createdAt?.toDate() || new Date(),
    updatedAt: docData.updatedAt?.toDate() || new Date(),
    // Ensure comments have proper structure and IDs
    comments: (docData.comments || []).map((commentData: DocumentData, commentIndex: number) => ({
      ...commentData,
      id: commentData.id || `comment-${commentIndex}`, // Fallback ID for old comments
      createdAt: commentData.createdAt?.toDate() || new Date(),
    })),
    // Ensure arrays exist even if empty - prevents crashes
    likes: docData.likes || [],
    bookmarks: docData.bookmarks || [],
    // Additional fields that might exist
    ...(docData.tags && { tags: docData.tags }),
    ...(docData.viewCount && { viewCount: docData.viewCount }),
    ...(docData.isPublished !== undefined && { isPublished: docData.isPublished }),
  } as Blog;
};

// Helper function to get user data by ID - used throughout the app
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // console.log('Fetching user by ID:', userId); // test
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: userDoc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt)
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// Helper function to get multiple users efficiently
export const getUsersByIds = async (userIds: string[]): Promise<Record<string, User>> => {
  try {
    const userPromises = userIds.map(userId => getUserById(userId));
    const users = await Promise.all(userPromises);
    
    const userMap: Record<string, User> = {};
    users.forEach((user, index) => {
      if (user) {
        userMap[userIds[index]] = user;
      }
    });
    
    return userMap;
  } catch (error) {
    console.error('Error getting users by IDs:', error);
    return {};
  }
};

// Create a new blog post
export const createNewBlogPost = async (blogData: CreateBlogData, authorUserId: string): Promise<string> => {
  try {
    // console.log('Creating new blog post for user:', authorUserId); // test
    
    // First, let's get the author's information
    const authorDocRef = doc(db, 'users', authorUserId);
    const authorSnapshot = await getDoc(authorDocRef);
    
    if (!authorSnapshot.exists()) {
      throw new Error('Author not found. Please make sure you are logged in.');
    }
    
    const authorInfo = authorSnapshot.data() as User;
    
    // Prepare the blog data for Firestore
    const newBlogData = {
      ...blogData,
      authorId: authorUserId,
      authorUsername: authorInfo.username,
      authorDisplayName: authorInfo.displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: [], // Start with empty likes array
      bookmarks: [], // Start with empty bookmarks array
      comments: [], // Start with empty comments array
      viewCount: 0, // Track how many times the blog is viewed
      isPublished: true, // Assume published by default
      // Add some default tags if none provided
      tags: (blogData as CreateBlogData & { tags?: string[] }).tags || ['programming', 'tech'],
    };
    
    // console.log('Prepared blog data:', newBlogData); // test
    
    // Add the document to Firestore
    const blogDocRef = await addDoc(collection(db, 'blogs'), newBlogData);
    
    // console.log('Blog created successfully with ID:', blogDocRef.id); // test
    
    return blogDocRef.id;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw new Error(`Failed to create blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get a single blog post by ID
export const getBlogPostById = async (blogId: string): Promise<Blog | null> => {
  try {
    // console.log('Fetching blog with ID:', blogId); // test
    
    const blogDocRef = doc(db, 'blogs', blogId);
    const blogSnapshot = await getDoc(blogDocRef);
    
    if (!blogSnapshot.exists()) {
      console.warn('Blog not found with ID:', blogId); // Warn instead of error
      return null;
    }
    
    const blogData = convertFirestoreDocToBlog(blogSnapshot);
    
    // Increment view count (fire and forget - don't wait for it)
    updateDoc(blogDocRef, {
      viewCount: ((blogData as Blog & { viewCount?: number }).viewCount || 0) + 1
    }).catch(err => {
      console.warn('Failed to update view count:', err); // Non-critical error
    });
    
    return blogData;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw new Error('Failed to load blog post. Please check your connection.');
  }
};

// Get all blog posts with pagination
export const getAllBlogPosts = async (
  limitCount: number = 10, 
  lastDocumentId?: string
): Promise<{ blogs: Blog[]; hasMore: boolean; lastDoc?: string }> => {
  try {
    // console.log('Fetching blogs with limit:', limitCount, 'lastDoc:', lastDocumentId); // test
    
    const blogsCollectionRef = collection(db, 'blogs');
    let blogsQuery = query(
      blogsCollectionRef,
      where('isPublished', '==', true), // Only get published blogs
      orderBy('createdAt', 'desc'),
      limit(limitCount + 1) // Fetch one extra to check if there are more
    );
    
    // If we have a starting point for pagination
    if (lastDocumentId) {
      const lastDocSnapshot = await getDoc(doc(db, 'blogs', lastDocumentId));
      if (lastDocSnapshot.exists()) {
        blogsQuery = query(
          blogsCollectionRef,
          where('isPublished', '==', true),
          orderBy('createdAt', 'desc'),
          startAfter(lastDocSnapshot),
          limit(limitCount + 1)
        );
      }
    }
    
    const querySnapshot = await getDocs(blogsQuery);
    const fetchedBlogs = querySnapshot.docs.map(convertFirestoreDocToBlog);
    
    // Check if we have more blogs to load
    const hasMoreBlogs = fetchedBlogs.length > limitCount;
    const blogsToReturn = hasMoreBlogs ? fetchedBlogs.slice(0, limitCount) : fetchedBlogs;
    const lastDocForNextQuery = blogsToReturn.length > 0 ? blogsToReturn[blogsToReturn.length - 1].id : undefined;
    
    // console.log(`Fetched ${blogsToReturn.length} blogs, hasMore: ${hasMoreBlogs}`); 
    
    return {
      blogs: blogsToReturn,
      hasMore: hasMoreBlogs,
      lastDoc: lastDocForNextQuery,
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to load blog posts. Please try again later.');
  }
};

// Get blogs by a specific author
export const getBlogsByAuthor = async (authorUsername: string, limitCount: number = 10): Promise<Blog[]> => {
  try {
    // console.log('Fetching blogs by author:', authorUsername);
    
    const blogsCollectionRef = collection(db, 'blogs');
    const authorBlogsQuery = query(
      blogsCollectionRef,
      where('authorUsername', '==', authorUsername),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(authorBlogsQuery);
    const authorBlogs = querySnapshot.docs.map(convertFirestoreDocToBlog);
    
    // console.log(`Found ${authorBlogs.length} blogs by ${authorUsername}`); 
    
    return authorBlogs;
  } catch (error) {
    console.error('Error fetching blogs by author:', error);
    throw new Error(`Failed to load blogs by ${authorUsername}`);
  }
};

export const getMostPopularBlogs = async (limitCount: number = 2): Promise<Blog[]> => {
  try {
    // console.log('Fetching most popular blogs'); // test
    
    const blogsQuery = query(
      collection(db, 'blogs'),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'), // We'll sort by likes length on client side
      limit(50) // Get more to sort by likes
    );
    
    const querySnapshot = await getDocs(blogsQuery);
    const allBlogs = querySnapshot.docs.map(convertFirestoreDocToBlog);
    
    // Sort by likes count and return limited results
    const popularBlogs = allBlogs
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, limitCount);
    
    // console.log(`Found ${popularBlogs.length} popular blogs`); // test
    
    return popularBlogs;
  } catch (error) {
    console.error('Error fetching popular blogs:', error);
    throw new Error('Failed to load popular blogs. Please try again later.');
  }
};

// Get all blogs by a specific user
export const getUserOwnBlogs = async (userId: string): Promise<Blog[]> => {
  try {
    // console.log('Fetching blogs for user:', userId); // test
    
    const userBlogsQuery = query(
      collection(db, 'blogs'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(userBlogsQuery);
    const userBlogs = querySnapshot.docs.map(convertFirestoreDocToBlog);
    
    // console.log(`Found ${userBlogs.length} blogs for user ${userId}`); // test
    
    return userBlogs;
  } catch (error) {
    console.error('Error getting user blogs:', error);
    throw new Error('Failed to load user blogs. Please try again later.');
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

// Toggle like on a blog post
export const toggleBlogLike = async (blogId: string, userId: string): Promise<void> => {
  try {
    // console.log('Toggling like for blog:', blogId, 'by user:', userId); // test
    
    const blogDocRef = doc(db, 'blogs', blogId);
    const blogSnapshot = await getDoc(blogDocRef);
    
    if (!blogSnapshot.exists()) {
      throw new Error('Blog post not found.');
    }
    
    const blogData = blogSnapshot.data() as Blog;
    const currentLikes = blogData.likes || [];
    const userHasLiked = currentLikes.includes(userId);
    
    if (userHasLiked) {
      // Remove like
      await updateDoc(blogDocRef, {
        likes: arrayRemove(userId)
      });
      // console.log('Like removed'); // test
    } else {
      // Add like
      await updateDoc(blogDocRef, {
        likes: arrayUnion(userId)
      });
      // console.log('Like added'); // test
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw new Error('Failed to update like. Please try again.');
  }
};

// Toggle bookmark on a blog post
export const toggleBlogBookmark = async (blogId: string, userId: string): Promise<void> => {
  try {
    // console.log('Toggling bookmark for blog:', blogId, 'by user:', userId); // test
    
    const blogDocRef = doc(db, 'blogs', blogId);
    const blogSnapshot = await getDoc(blogDocRef);
    
    if (!blogSnapshot.exists()) {
      throw new Error('Blog post not found.');
    }
    
    const blogData = blogSnapshot.data() as Blog;
    const currentBookmarks = blogData.bookmarks || [];
    const userHasBookmarked = currentBookmarks.includes(userId);
    
    if (userHasBookmarked) {
      // Remove bookmark
      await updateDoc(blogDocRef, {
        bookmarks: arrayRemove(userId)
      });
      // console.log('Bookmark removed'); // test
    } else {
      // Add bookmark
      await updateDoc(blogDocRef, {
        bookmarks: arrayUnion(userId)
      });
      // console.log('Bookmark added'); // test
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw new Error('Failed to update bookmark. Please try again.');
  }
};

// Add a comment to a blog post
export const addCommentToBlog = async (blogId: string, commenterUserId: string, commentContent: CreateCommentData): Promise<void> => {
  try {
    // console.log('Adding comment to blog:', blogId, 'by user:', commenterUserId); // test
    
    // Get the commenter's information first
    const commenterDocRef = doc(db, 'users', commenterUserId);
    const commenterSnapshot = await getDoc(commenterDocRef);
    
    if (!commenterSnapshot.exists()) {
      throw new Error('User not found. Please make sure you are logged in.');
    }
    
    const commenterData = commenterSnapshot.data() as User;
    
    // Create the comment object
    const newComment = {
      id: `${commenterUserId}-${Date.now()}`, // Generate a unique ID
      blogId,
      authorId: commenterUserId,
      authorUsername: commenterData.username,
      authorDisplayName: commenterData.displayName,
      content: commentContent.content,
      createdAt: Timestamp.now(), // Use Timestamp.now() for consistency
      likes: [] // Start with empty likes array
    };
    
    // console.log('Prepared comment data:', newComment); // test
    
    // Add the comment to the blog's comments array
    const blogDocRef = doc(db, 'blogs', blogId);
    await updateDoc(blogDocRef, {
      comments: arrayUnion(newComment)
    });
    
    // console.log('Comment added successfully'); // test
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error(`Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Validate username according to our rules
export const checkUsernameValidity = (username: string): { isValid: boolean; errors: string[] } => {
  const validationErrors: string[] = [];
  const cleanUsername = username.toLowerCase().trim();

  // console.log('Validating username:', cleanUsername); // test

  if (!cleanUsername) {
    validationErrors.push('Username is required');
  } else {
    // Check length requirements
    if (cleanUsername.length < 3) {
      validationErrors.push('Username must be at least 3 characters long');
    }
    if (cleanUsername.length > 20) {
      validationErrors.push('Username must be less than 20 characters long');
    }
    
    // Check character requirements
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      validationErrors.push('Username can only contain letters, numbers, and underscores');
    }
    
    // Username cannot start with a number
    if (/^[0-9]/.test(cleanUsername)) {
      validationErrors.push('Username cannot start with a number');
    }
    
    // Username cannot have consecutive underscores
    if (/__+/.test(cleanUsername)) {
      validationErrors.push('Username cannot contain consecutive underscores');
    }
    
    // Reserved usernames that we don't allow
    const reservedUsernames = ['admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'blog', 'help', 'support'];
    if (reservedUsernames.includes(cleanUsername)) {
      validationErrors.push('This username is reserved and cannot be used');
    }
  }

  const isUsernameValid = validationErrors.length === 0;
  
  // console.log('Username validation result:', { isValid: isUsernameValid, errors: validationErrors }); // test
  
  return {
    isValid: isUsernameValid,
    errors: validationErrors,
  };
};

// Search blogs by content (simple text search - could be enhanced with full-text search)
export const searchBlogsByKeyword = async (searchKeyword: string, limitCount: number = 10): Promise<Blog[]> => {
  try {
    // console.log('Searching blogs with keyword:', searchKeyword); // test
    
    if (!searchKeyword.trim()) {
      return [];
    }
    
    const blogsCollectionRef = collection(db, 'blogs');
    
    // Note: Firestore doesn't have built-in full-text search
    // This is a simple implementation that searches in title and tags
    // For production, consider using Algolia or Elasticsearch
    
    const titleSearchQuery = query(
      blogsCollectionRef,
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(titleSearchQuery);
    const allBlogs = querySnapshot.docs.map(convertFirestoreDocToBlog);
    
    // Filter blogs that contain the search keyword (case-insensitive)
    const searchLowerCase = searchKeyword.toLowerCase();
    const matchingBlogs = allBlogs.filter(blog => 
      blog.title.toLowerCase().includes(searchLowerCase) ||
      blog.content.toLowerCase().includes(searchLowerCase) ||
      (blog as Blog & { tags?: string[] }).tags?.some((tag: string) => tag.toLowerCase().includes(searchLowerCase))
    );
    
    // console.log(`Found ${matchingBlogs.length} blogs matching "${searchKeyword}"`); // test
    
    return matchingBlogs.slice(0, limitCount);
  } catch (error) {
    console.error('Error searching blogs:', error);
    throw new Error('Search failed. Please try again.');
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

// Check if username already exists in the database
export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    // console.log('Checking if username exists:', username); // test
    
    const normalizedUsername = username.toLowerCase().trim();
    
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '==', normalizedUsername),
      limit(1)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const usernameExists = !querySnapshot.empty;
    
    // console.log('Username exists result:', usernameExists); // test
    
    return usernameExists;
  } catch (error) {
    console.error('Error checking username existence:', error);
    // Return true to be safe (assume username exists if we can't check)
    return true;
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

// Backward compatibility aliases for existing code
export const createBlog = (userId: string, blogData: CreateBlogData) => createNewBlogPost(blogData, userId);
export const getBlog = getBlogPostById;
export const getBlogs = getAllBlogPosts;
export const getUserBlogs = getUserOwnBlogs;
export const getMostLikedBlogs = getMostPopularBlogs;

// console.log('Blog service loaded successfully'); // test
