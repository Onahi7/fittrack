import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getGroups,
  getUserGroups,
  getFeedPosts,
  getActiveChallenges,
  getUserChallenges,
  getChallengeLeaderboard,
  getFriends,
  getFriendRequests,
  type Group,
  type Post,
  type Challenge,
} from '@/lib/community';

// Hook to manage groups
export function useGroups(category?: string) {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchGroups = async () => {
      try {
        setLoading(true);
        const fetchedGroups = await getGroups(category);
        setGroups(fetchedGroups as Group[]);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [currentUser, category]);

  return { groups, loading, error };
}

// Hook to manage user's groups
export function useUserGroups() {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchUserGroups = async () => {
      try {
        setLoading(true);
        const userGroups = await getUserGroups(currentUser.uid);
        setGroups(userGroups as Group[]);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGroups();
  }, [currentUser]);

  return { groups, loading, error };
}

// Hook to manage feed posts
export function useFeed(limitCount = 20) {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const feedPosts = await getFeedPosts(currentUser.uid, limitCount);
        setPosts(feedPosts as Post[]);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser, limitCount]);

  return { posts, loading, error, refetch: () => getFeedPosts(currentUser?.uid || '', limitCount) };
}

// Hook to manage challenges
export function useChallenges() {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChallenges = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const activeChallenges = await getActiveChallenges();
      setChallenges(activeChallenges as Challenge[]);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [currentUser]);

  return { challenges, loading, error, refetch: fetchChallenges };
}

// Hook to manage user's challenges
export function useUserChallenges() {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserChallenges = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userChallenges = await getUserChallenges(currentUser.uid);
      setChallenges(userChallenges as Challenge[]);
      setError(null);
    } catch (err) {
      // Silently handle - challenges not yet implemented
      setChallenges([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserChallenges();
  }, [currentUser]);

  return { challenges, loading, error, refetch: fetchUserChallenges };
}

interface LeaderboardEntry {
  id?: string;
  challengeId: string;
  userId: string;
  progress: number;
  joinedAt?: unknown;
}

// Hook to manage challenge leaderboard
export function useChallengeLeaderboard(challengeId: string) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getChallengeLeaderboard(challengeId);
        setLeaderboard(data as LeaderboardEntry[]);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [challengeId]);

  return { leaderboard, loading, error };
}

interface FriendshipBuddy {
  displayName?: string;
  photoURL?: string;
}

interface Friendship {
  id?: string;
  user1Id: string;
  user2Id: string;
  createdAt?: unknown;
  buddy?: FriendshipBuddy; // enriched by backend
  sharedGoals?: string[];  // optional enrichment
}

// Hook to manage friends
export function useFriends() {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchFriends = async () => {
      try {
        setLoading(true);
        const userFriends = await getFriends(currentUser.uid);
        setFriends(userFriends as Friendship[]);
        setError(null);
      } catch (err) {
        // Silently handle - return empty array if error
        setFriends([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [currentUser]);

  return { friends, loading, error };
}

interface FriendRequestUser {
  displayName?: string;
  photoURL?: string;
  goals?: string[];
}

interface FriendRequest {
  id?: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: unknown;
  fromUser?: FriendRequestUser; // enriched by backend
}

// Hook to manage friend requests
export function useFriendRequests() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        setLoading(true);
        const friendRequests = await getFriendRequests(currentUser.uid);
        setRequests(friendRequests as FriendRequest[]);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentUser]);

  return { requests, loading, error };
}
