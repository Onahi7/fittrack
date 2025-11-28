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

// Groups - placeholder implementations (backend endpoints needed)
export async function createGroup(userId: string, groupData: Omit<Group, 'id' | 'creatorId' | 'memberIds' | 'memberCount' | 'createdAt'>) {
  console.warn('Groups feature not yet implemented in backend');
  return { id: 'placeholder' };
}

export async function joinGroup(groupId: string, userId: string) {
  console.warn('Groups feature not yet implemented in backend');
}

export async function leaveGroup(groupId: string, userId: string) {
  console.warn('Groups feature not yet implemented in backend');
}

export async function getGroups(category?: string) {
  console.warn('Groups feature not yet implemented in backend');
  return [];
}

export async function getUserGroups(userId: string) {
  console.warn('Groups feature not yet implemented in backend');
  return [];
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

// Posts - placeholder implementations (backend endpoints needed)
export async function createPost(postData: Omit<Post, 'id' | 'likes' | 'commentCount' | 'createdAt'>) {
  console.warn('Posts feature not yet implemented in backend');
  return { id: 'placeholder' };
}

export async function getFeedPosts(userId: string, limitCount = 20) {
  console.warn('Posts feature not yet implemented in backend');
  return [];
}

export async function getGroupPosts(groupId: string) {
  console.warn('Posts feature not yet implemented in backend');
  return [];
}

export async function likePost(postId: string, userId: string) {
  console.warn('Posts feature not yet implemented in backend');
}

export async function deletePost(postId: string) {
  console.warn('Posts feature not yet implemented in backend');
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

// Challenges - placeholder implementations (backend endpoints needed)
export async function createChallenge(userId: string, challengeData: Omit<Challenge, 'id' | 'creatorId' | 'participantCount' | 'createdAt'>) {
  console.warn('Challenges feature not yet implemented in backend');
  return { id: 'placeholder' };
}

export async function joinChallenge(challengeId: string, userId: string) {
  console.warn('Challenges feature not yet implemented in backend');
}

export async function updateChallengeProgress(challengeId: string, userId: string, progress: number) {
  console.warn('Challenges feature not yet implemented in backend');
}

export async function getActiveChallenges() {
  console.warn('Challenges feature not yet implemented in backend');
  return [];
}

export async function getUserChallenges(userId: string) {
  console.warn('Challenges feature not yet implemented in backend');
  return [];
}

export async function getChallengeLeaderboard(challengeId: string) {
  console.warn('Challenges feature not yet implemented in backend');
  return [];
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
