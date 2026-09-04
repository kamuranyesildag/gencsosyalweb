import { db } from "../../src/db/index.js";
import { users, profiles, follows, blocks, communities, communityMembers, posts } from "../../src/db/schema.js";
import { eq, and, or, sql, inArray, notInArray } from "drizzle-orm";
import { getBlockedIds } from "../utils/blocks.js";

export interface FollowSuggestionUser {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  avatar: string | null;
  bio: string | null;
  isVerified: boolean;
  mutualFollowers: number;
  reason: string;
  commonCommunities?: number;
  commonInterests?: string[];
}

export interface FollowSuggestionsResult {
  users: FollowSuggestionUser[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface FollowSuggestionsOptions {
  limit?: number;
  offset?: number;
  excludeIds?: number[];
}

/**
 * Professional Follow Suggestions (People You May Know) Algorithm
 * Evaluates candidates based on:
 *  - 2nd degree social graph (Follows of Follows / Common Followers) (+40)
 *  - Common communities (+25)
 *  - Shared profile interests (+20)
 *  - Profile completeness & verification (+10)
 *  - Recent user activity (+5)
 *
 * Excludes:
 *  - Current user
 *  - Already followed users
 *  - Blocked & blocker users
 *  - Inactive / disabled accounts
 *  - Private accounts (per privacy rules)
 */
export async function getFollowSuggestions(
  currentUserId: number,
  options: FollowSuggestionsOptions = {}
): Promise<FollowSuggestionsResult> {
  const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);
  const offset = Math.max(options.offset ?? 0, 0);

  // 1. Collect user's social context and exclusions
  const followingRows = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, currentUserId));
  const followingIds = followingRows.map((r: any) => r.followingId);

  const blockedIds = await getBlockedIds(currentUserId);

  const excludedIdsSet = new Set<number>([
    currentUserId,
    ...followingIds,
    ...blockedIds,
    ...(options.excludeIds || [])
  ]);
  const excludedArray = Array.from(excludedIdsSet);

  // 2. Fetch current user's profile interests & location
  const myProfile = await db
    .select({
      interests: profiles.interests,
      location: profiles.location
    })
    .from(profiles)
    .where(eq(profiles.userId, currentUserId))
    .limit(1);

  const myInterests: string[] = Array.isArray(myProfile[0]?.interests)
    ? (myProfile[0].interests as string[])
    : [];

  // 3. Fetch current user's joined communities
  const myCommunities = await db
    .select({
      communityId: communityMembers.communityId,
      communityName: communities.name
    })
    .from(communityMembers)
    .innerJoin(communities, eq(communityMembers.communityId, communities.id))
    .where(eq(communityMembers.userId, currentUserId));

  const myCommunityIds = myCommunities.map((c: any) => c.communityId);
  const myCommunityNameMap = new Map<number, string>();
  myCommunities.forEach((c: any) => myCommunityNameMap.set(c.communityId, c.communityName));

  // 4. Social Graph Signal: 2nd degree follows (Follows of Follows / Common Followers)
  const mutualFollowersMap = new Map<number, number>();
  if (followingIds.length > 0) {
    const mutualConditions = [inArray(follows.followerId, followingIds)];
    if (excludedArray.length > 0) {
      mutualConditions.push(notInArray(follows.followingId, excludedArray));
    }

    const mutualRows = await db
      .select({
        candidateId: follows.followingId,
        mutualCount: sql<number>`count(distinct ${follows.followerId})`.as("mutual_count")
      })
      .from(follows)
      .where(and(...mutualConditions))
      .groupBy(follows.followingId);

    mutualRows.forEach((r: any) => {
      mutualFollowersMap.set(r.candidateId, Number(r.mutualCount) || 0);
    });
  }

  // 5. Shared Communities Signal
  const sharedCommunityMap = new Map<number, { count: number; firstCommunityName?: string }>();
  if (myCommunityIds.length > 0) {
    const commConditions = [inArray(communityMembers.communityId, myCommunityIds)];
    if (excludedArray.length > 0) {
      commConditions.push(notInArray(communityMembers.userId, excludedArray));
    }

    const commRows = await db
      .select({
        candidateId: communityMembers.userId,
        communityId: communityMembers.communityId,
        communityName: communities.name
      })
      .from(communityMembers)
      .innerJoin(communities, eq(communityMembers.communityId, communities.id))
      .where(and(...commConditions));

    commRows.forEach((r: any) => {
      const current = sharedCommunityMap.get(r.candidateId) || { count: 0, firstCommunityName: r.communityName };
      current.count += 1;
      if (!current.firstCommunityName) current.firstCommunityName = r.communityName;
      sharedCommunityMap.set(r.candidateId, current);
    });
  }

  // 6. Query candidate pool from database
  // Candidates must be active, not excluded, and not private accounts
  const userConditions = [
    eq(users.isActive, true),
    or(eq(profiles.isPrivate, false), sql`${profiles.isPrivate} IS NULL`)
  ];
  if (excludedArray.length > 0) {
    userConditions.push(notInArray(users.id, excludedArray));
  }

  const candidateUsers = await db
    .select({
      id: users.id,
      username: users.username,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      interests: profiles.interests,
      location: profiles.location
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(...userConditions))
    .limit(100);

  if (candidateUsers.length === 0) {
    return {
      users: [],
      pagination: {
        limit,
        offset,
        total: 0,
        hasMore: false
      }
    };
  }

  // 7. Recent post activity
  const candidateIds = candidateUsers.map((c: any) => c.id);
  const postActivityMap = new Map<number, number>();
  if (candidateIds.length > 0) {
    const activityRows = await db
      .select({
        userId: posts.userId,
        postCount: sql<number>`count(*)`.as("post_count")
      })
      .from(posts)
      .where(and(
        inArray(posts.userId, candidateIds),
        eq(posts.moderationStatus, "APPROVED")
      ))
      .groupBy(posts.userId);

    activityRows.forEach((a: any) => postActivityMap.set(a.userId, Number(a.postCount) || 0));
  }

  // 8. Calculate recommendation scores and generate human-readable reasons
  const COMMON_FOLLOWERS_WEIGHT = 40;
  const COMMON_COMMUNITIES_WEIGHT = 25;
  const COMMON_INTERESTS_WEIGHT = 20;
  const PROFILE_SIMILARITY_WEIGHT = 10;
  const RECENT_ACTIVITY_WEIGHT = 5;

  interface ScoredCandidate extends FollowSuggestionUser {
    _score: number;
  }

  const scoredCandidates: ScoredCandidate[] = candidateUsers.map((candidate: any) => {
    const mutualCount = mutualFollowersMap.get(candidate.id) || 0;
    const commSignal = sharedCommunityMap.get(candidate.id);
    const commCount = commSignal?.count || 0;

    const candidateInterests: string[] = Array.isArray(candidate.interests)
      ? (candidate.interests as string[])
      : [];

    const commonInterests = myInterests.filter((interest) =>
      candidateInterests.some((ci) => ci.toLowerCase().trim() === interest.toLowerCase().trim())
    );

    let profileScore = 0;
    if (candidate.displayName && candidate.displayName !== candidate.username) profileScore += 3;
    if (candidate.avatarUrl) profileScore += 4;
    if (candidate.bio && candidate.bio.trim().length > 10) profileScore += 3;
    if (candidate.isVerified) profileScore += 5;

    const postCount = postActivityMap.get(candidate.id) || 0;
    const activityScore = Math.min(postCount * 2, 10);

    const totalScore =
      (mutualCount * COMMON_FOLLOWERS_WEIGHT) +
      (commCount * COMMON_COMMUNITIES_WEIGHT) +
      (commonInterests.length * COMMON_INTERESTS_WEIGHT) +
      (profileScore > 0 ? PROFILE_SIMILARITY_WEIGHT : 0) +
      (activityScore > 0 ? RECENT_ACTIVITY_WEIGHT : 0);

    // Reason determination (strictly verified from database signals)
    let reason = "Önerilen kullanıcı";
    if (mutualCount > 0) {
      reason = mutualCount === 1 ? "1 ortak takip" : `${mutualCount} ortak takip`;
    } else if (commCount > 0 && commSignal?.firstCommunityName) {
      reason = `${commSignal.firstCommunityName} topluluğundan`;
    } else if (commonInterests.length > 0) {
      reason = `${commonInterests[0]} ile ilgileniyor`;
    } else if (candidate.isVerified) {
      reason = "Onaylı içerik üreticisi";
    } else if (postCount > 0) {
      reason = "Aktif içerik üreticisi";
    } else {
      reason = "Toplulukta yeni ve aktif";
    }

    return {
      id: candidate.id,
      username: candidate.username,
      displayName: candidate.displayName || candidate.username,
      avatarUrl: candidate.avatarUrl || null,
      avatar: candidate.avatarUrl || null,
      bio: candidate.bio || null,
      isVerified: Boolean(candidate.isVerified),
      mutualFollowers: mutualCount,
      reason,
      commonCommunities: commCount,
      commonInterests,
      _score: totalScore
    };
  });

  // Sort by score descending, then newer user ID descending
  scoredCandidates.sort((a, b) => b._score - a._score || b.id - a.id);

  // Pagination slice
  const paginated = scoredCandidates
    .slice(offset, offset + limit)
    .map(({ _score, ...user }) => user);

  return {
    users: paginated,
    pagination: {
      limit,
      offset,
      total: scoredCandidates.length,
      hasMore: offset + limit < scoredCandidates.length
    }
  };
}
