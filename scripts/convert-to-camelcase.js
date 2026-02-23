// Helper script to track snake_case to camelCase conversions
// Common property mappings from Prisma schema

const propertyMappings = {
  // User properties
  'password_hash': 'passwordHash',
  'display_name': 'displayName',
  'avatar_url': 'avatarUrl',
  'cover_photo_url': 'coverPhotoUrl',
  'profile_title': 'profileTitle',
  'points_balance': 'pointsBalance',
  'total_spent': 'totalSpent',
  'total_xp': 'totalXp',
  'instagram_url': 'instagramUrl',
  'twitter_url': 'twitterUrl',
  'portfolio_url': 'portfolioUrl',
  'years_experience': 'yearsExperience',
  'available_for_work': 'availableForWork',
  'profile_visibility': 'profileVisibility',
  'notify_reactions': 'notifyReactions',
  'notify_comments': 'notifyComments',
  'notify_artist_contests': 'notifyArtistContests',
  'notify_follows': 'notifyFollows',
  'show_contests_joined': 'showContestsJoined',
  'show_contests_won': 'showContestsWon',
  'last_active_at': 'lastActiveAt',
  'email_verified': 'emailVerified',
  'email_verification_token': 'emailVerificationToken',
  'password_reset_token': 'passwordResetToken',
  'password_reset_expires': 'passwordResetExpires',
  'created_at': 'createdAt',
  'updated_at': 'updatedAt',
  
  // Contest properties
  'start_date': 'startDate',
  'end_date': 'endDate',
  'thumbnail_url': 'thumbnailUrl',
  'created_by': 'createdById',
  'prize_pool': 'prizePool',
  'prize_pool_distributed': 'prizePoolDistributed',
  'finalized_at': 'finalizedAt',
  'has_sponsor': 'hasSponsor',
  'sponsor_name': 'sponsorName',
  'sponsor_logo_url': 'sponsorLogoUrl',
  'sponsor_prize_amount': 'sponsorPrizeAmount',
  
  // Entry properties
  'user_id': 'userId',
  'contest_id': 'contestId',
  'phase_1_url': 'phase1Url',
  'phase_2_url': 'phase2Url',
  'phase_3_url': 'phase3Url',
  'phase_4_url': 'phase4Url',
  'vote_count': 'voteCount',
  'comment_count': 'commentCount',
  'share_count': 'shareCount',
  'final_rank': 'finalRank',
  'submitted_at': 'submittedAt',
  'approved_at': 'approvedAt',
  'rejection_reason': 'rejectionReason',
  'last_activity_at': 'lastActivityAt',
  
  // Winner properties
  'entry_id': 'entryId',
  'votes_received': 'votesReceived',
  'prize_amount': 'prizeAmount',
  
  // Comment properties
  'entry_id': 'entryId',
  'parent_id': 'parentId',
  'is_pinned': 'isPinned',
  
  // Notification properties
  'actor_id': 'actorId',
  'reaction_type': 'reactionType',
  
  // XP properties
  'xp_amount': 'xpAmount',
  'awarded_at': 'awardedAt',
  'claimed_at': 'claimedAt',
  'claim_date': 'claimDate',
  'claim_type': 'claimType',
};

console.log('Property mappings ready for conversion');
console.log(`Total mappings: ${Object.keys(propertyMappings).length}`);
