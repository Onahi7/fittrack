import { api } from './api';
import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios client for community endpoints
const communityClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Firebase token to all requests
communityClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Collection names for community features (for reference)
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

// Groups - using real backend endpoints
export async function createGroup(userId: string, groupData: Omit<Group, 'id' | 'creatorId' | 'memberIds' | 'memberCount' | 'createdAt'>) {
  const response = await api.groups.create({
    name: groupData.name,
    description: groupData.description,
    category: groupData.category,
    imageUrl: groupData.imageUrl,
    isPrivate: groupData.isPrivate,
  });
  return response.data;
}

export async function joinGroup(groupId: string, userId: string) {
  const response = await api.groups.join(parseInt(groupId));
  return response.data;
}

export async function leaveGroup(groupId: string, userId: string) {
  const response = await api.groups.leave(parseInt(groupId));
  return response.data;
}

export async function getGroups(category?: string) {
  const response = await api.groups.getAll();
  return response.data;
}

export async function getUserGroups(userId: string) {
  const response = await api.groups.getUserGroups();
  return response.data;
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

// Posts - using real backend endpoints
export async function createPost(postData: Omit<Post, 'id' | 'likes' | 'commentCount' | 'createdAt'>) {
  const response = await api.posts.create({
    content: postData.content,
    imageUrl: postData.imageUrl,
  });
  return response.data;
}

export async function getFeedPosts(userId: string, limitCount = 20) {
  const response = await api.posts.getAll(limitCount);
  return response.data;
}

export async function getGroupPosts(groupId: string) {
  const response = await api.posts.getAll();
  return response.data;
}

export async function likePost(postId: string, userId: string) {
  const response = await api.posts.like(parseInt(postId));
  return response.data;
}

export async function deletePost(postId: string) {
  const response = await api.posts.delete(parseInt(postId));
  return response.data;
}

// ==================== CHALLENGES ====================

export interface Challenge {
  id?: number;
  name: string;
  description: string;
  type: 'water' | 'meals' | 'streak' | 'custom';
  goal: number;
  duration: number; // in days
  startDate: unknown;
  endDate: unknown;
  participantCount?: number;
  creatorId: string;
  imageUrl?: string;
  isPremiumChallenge?: boolean;
  requiresSubscription?: boolean;
  subscriptionTier?: string;
  gift30Days?: boolean;
  hasDynamicTasks?: boolean;
  createdAt?: unknown;
}

// Challenges - using real backend endpoints
export async function createChallenge(userId: string, challengeData: Omit<Challenge, 'id' | 'creatorId' | 'participantCount' | 'createdAt'>) {
  const response = await api.challenges.create({
    name: challengeData.name,
    description: challengeData.description,
    type: challengeData.type,
    goal: challengeData.goal,
    duration: challengeData.duration,
    startDate: new Date(challengeData.startDate as any).toISOString(),
    imageUrl: challengeData.imageUrl,
  });
  return response.data;
}

export async function joinChallenge(challengeId: string, userId: string) {
  const response = await api.challenges.join(parseInt(challengeId));
  return response.data;
}

export async function updateChallengeProgress(challengeId: string, userId: string, progress: number) {
  const response = await api.challenges.updateProgress(parseInt(challengeId), progress);
  return response.data;
}

export async function getActiveChallenges() {
  const response = await api.challenges.getAll();
  return response.data;
}

export async function getUserChallenges(userId: string) {
  const response = await api.challenges.getUserChallenges();
  // Backend returns {challenge, participation} structure, extract just the challenges
  return response.data.map((item: any) => item.challenge || item);
}

export async function getChallengeLeaderboard(challengeId: string) {
  const response = await api.challenges.getLeaderboard(parseInt(challengeId));
  return response.data;
}

// ==================== FRIENDSHIPS (Using Buddies API) ====================

export async function sendFriendRequest(fromUserId: string, toUserId: string) {
  try {
    const response = await communityClient.post('/buddies/request', {
      buddyUserId: toUserId,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

export async function acceptFriendRequest(requestId: string, fromUserId: string, toUserId: string) {
  try {
    const response = await communityClient.post(`/buddies/requests/${requestId}/accept`);
    return response.data;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

export async function getFriends(userId: string) {
  try {
    const response = await communityClient.get('/buddies/active');
    return response.data || [];
  } catch (error) {
    console.error('Error getting friends:', error);
    return [];
  }
}

export async function getFriendRequests(userId: string) {
  try {
    const response = await communityClient.get('/buddies/requests/pending');
    return response.data || [];
  } catch (error) {
    console.error('Error getting friend requests:', error);
    return [];
  }
}

// Suggested friends
export async function getSuggestedFriends() {
  try {
    const response = await communityClient.get('/buddies/suggested');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching suggested friends:', error);
    return [];
  }
}

// Reject friend request
export async function rejectFriendRequest(requestId: string) {
  try {
    const response = await communityClient.post(`/buddies/requests/${requestId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
}

// Remove friend (unbuddy)
export async function removeFriend(buddyId: string) {
  try {
    const response = await communityClient.delete(`/buddies/${buddyId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
}
