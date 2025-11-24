import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names for community features
export const COMMUNITY_COLLECTIONS = {
  GROUPS: 'groups',
  POSTS: 'posts',
  COMMENTS: 'comments',
  CHALLENGES: 'challenges',
  CHALLENGE_PARTICIPANTS: 'challengeParticipants',
  FRIENDSHIPS: 'friendships',
  FRIEND_REQUESTS: 'friendRequests',
  REACTIONS: 'reactions',
} as const;

// ==================== GROUPS ====================

export interface Group {
  id?: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  creatorId: string;
  memberIds: string[];
  memberCount: number;
  isPrivate: boolean;
  createdAt?: unknown;
}

export async function createGroup(userId: string, groupData: Omit<Group, 'id' | 'creatorId' | 'memberIds' | 'memberCount' | 'createdAt'>) {
  return await addDoc(collection(db, COMMUNITY_COLLECTIONS.GROUPS), {
    ...groupData,
    creatorId: userId,
    memberIds: [userId],
    memberCount: 1,
    createdAt: serverTimestamp(),
  });
}

export async function joinGroup(groupId: string, userId: string) {
  const groupRef = doc(db, COMMUNITY_COLLECTIONS.GROUPS, groupId);
  await updateDoc(groupRef, {
    memberIds: arrayUnion(userId),
    memberCount: increment(1),
  });
}

export async function leaveGroup(groupId: string, userId: string) {
  const groupRef = doc(db, COMMUNITY_COLLECTIONS.GROUPS, groupId);
  await updateDoc(groupRef, {
    memberIds: arrayRemove(userId),
    memberCount: increment(-1),
  });
}

export async function getGroups(category?: string) {
  const groupsRef = collection(db, COMMUNITY_COLLECTIONS.GROUPS);
  let q = query(groupsRef, orderBy('memberCount', 'desc'), limit(50));
  
  if (category) {
    q = query(groupsRef, where('category', '==', category), orderBy('memberCount', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getUserGroups(userId: string) {
  const q = query(
    collection(db, COMMUNITY_COLLECTIONS.GROUPS),
    where('memberIds', 'array-contains', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ==================== POSTS ====================

export interface Post {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  groupId?: string;
  type: 'meal' | 'progress' | 'milestone' | 'general';
  likes: number;
  commentCount: number;
  createdAt?: unknown;
}

export async function createPost(postData: Omit<Post, 'id' | 'likes' | 'commentCount' | 'createdAt'>) {
  return await addDoc(collection(db, COMMUNITY_COLLECTIONS.POSTS), {
    ...postData,
    likes: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function getFeedPosts(userId: string, limitCount = 20) {
  const q = query(
    collection(db, COMMUNITY_COLLECTIONS.POSTS),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getGroupPosts(groupId: string) {
  const q = query(
    collection(db, COMMUNITY_COLLECTIONS.POSTS),
    where('groupId', '==', groupId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function likePost(postId: string, userId: string) {
  const postRef = doc(db, COMMUNITY_COLLECTIONS.POSTS, postId);
  await updateDoc(postRef, {
    likes: increment(1),
  });
  
  // Track user's like
  await addDoc(collection(db, COMMUNITY_COLLECTIONS.REACTIONS), {
    postId,
    userId,
    type: 'like',
    createdAt: serverTimestamp(),
  });
}

export async function deletePost(postId: string) {
  await deleteDoc(doc(db, COMMUNITY_COLLECTIONS.POSTS, postId));
}

// ==================== CHALLENGES ====================

export interface Challenge {
  id?: string;
  name: string;
  description: string;
  type: 'water' | 'meals' | 'streak' | 'custom';
  goal: number;
  duration: number; // in days
  startDate: unknown;
  endDate: unknown;
  participantCount: number;
  creatorId: string;
  imageUrl?: string;
  createdAt?: unknown;
}

export async function createChallenge(userId: string, challengeData: Omit<Challenge, 'id' | 'creatorId' | 'participantCount' | 'createdAt'>) {
  return await addDoc(collection(db, COMMUNITY_COLLECTIONS.CHALLENGES), {
    ...challengeData,
    creatorId: userId,
    participantCount: 1,
    createdAt: serverTimestamp(),
  });
}

export async function joinChallenge(challengeId: string, userId: string) {
  const challengeRef = doc(db, COMMUNITY_COLLECTIONS.CHALLENGES, challengeId);
  await updateDoc(challengeRef, {
    participantCount: increment(1),
  });

  // Add participant record
  await addDoc(collection(db, COMMUNITY_COLLECTIONS.CHALLENGE_PARTICIPANTS), {
    challengeId,
    userId,
    progress: 0,
    joinedAt: serverTimestamp(),
  });
}

export async function updateChallengeProgress(challengeId: string, userId: string, progress: number) {
  const q = query(
    collection(db, COMMUNITY_COLLECTIONS.CHALLENGE_PARTICIPANTS),
    where('challengeId', '==', challengeId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.docs[0]) {
    const docRef = doc(db, COMMUNITY_COLLECTIONS.CHALLENGE_PARTICIPANTS, snapshot.docs[0].id);
    await updateDoc(docRef, { progress });
  }
}

export async function getActiveChallenges() {
  const now = Timestamp.now();
  const q = query(
    collection(db, COMMUNITY_COLLECTIONS.CHALLENGES),
    where('endDate', '>=', now),
    orderBy('endDate', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getUserChallenges(userId: string) {
  const q = query(
    collection(db, COMMUNITY_COLLECTIONS.CHALLENGE_PARTICIPANTS),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getChallengeLeaderboard(challengeId: string) {
  const q = query(
    collection(db, COMMUNITY_COLLECTIONS.CHALLENGE_PARTICIPANTS),
    where('challengeId', '==', challengeId),
    orderBy('progress', 'desc'),
    limit(10)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ==================== FRIENDSHIPS ====================

export async function sendFriendRequest(fromUserId: string, toUserId: string) {
  return await addDoc(collection(db, COMMUNITY_COLLECTIONS.FRIEND_REQUESTS), {
    fromUserId,
    toUserId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function acceptFriendRequest(requestId: string, fromUserId: string, toUserId: string) {
  // Update request status
  await updateDoc(doc(db, COMMUNITY_COLLECTIONS.FRIEND_REQUESTS, requestId), {
    status: 'accepted',
  });

  // Create friendship
  await addDoc(collection(db, COMMUNITY_COLLECTIONS.FRIENDSHIPS), {
    user1Id: fromUserId,
    user2Id: toUserId,
    createdAt: serverTimestamp(),
  });
}

export async function getFriends(userId: string) {
  const q1 = query(
    collection(db, COMMUNITY_COLLECTIONS.FRIENDSHIPS),
    where('user1Id', '==', userId)
  );
  const q2 = query(
    collection(db, COMMUNITY_COLLECTIONS.FRIENDSHIPS),
    where('user2Id', '==', userId)
  );

  const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  
  return [
    ...snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    ...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() })),
  ];
}

export async function getFriendRequests(userId: string) {
  const q = query(
    collection(db, COMMUNITY_COLLECTIONS.FRIEND_REQUESTS),
    where('toUserId', '==', userId),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
