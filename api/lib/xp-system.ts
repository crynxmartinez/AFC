import prisma from './prisma'

export async function awardXP(
  userId: string,
  actionType: string,
  referenceId?: string,
  description?: string
): Promise<{ success: boolean; xpAwarded: number; newLevel?: number }> {
  try {
    // Get XP reward configuration
    const reward = await prisma.xpReward.findUnique({
      where: { actionType },
    })

    if (!reward || !reward.enabled) {
      return { success: false, xpAwarded: 0 }
    }

    // Check for daily limit on certain actions
    if (actionType === 'share_entry' || actionType === 'daily_login') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const existingClaim = await prisma.dailyXpClaim.findFirst({
        where: {
          userId,
          action: actionType,
          claimedAt: { gte: today },
        },
      })

      if (existingClaim) {
        return { success: false, xpAwarded: 0 }
      }

      // Record daily claim
      await prisma.dailyXpClaim.create({
        data: {
          userId,
          action: actionType,
          claimedAt: new Date(),
        },
      })
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, totalXp: true },
    })

    if (!user) {
      return { success: false, xpAwarded: 0 }
    }

    // Create XP transaction
    await prisma.xpTransaction.create({
      data: {
        userId,
        actionType,
        xpAmount: reward.xpAmount,
        referenceId,
        description: description || reward.description,
      },
    })

    // Update user XP
    const newXp = user.xp + reward.xpAmount
    const newTotalXp = user.totalXp + reward.xpAmount

    // Check for level up
    let newLevel = user.level
    let leveledUp = false

    while (true) {
      const nextLevelConfig = await prisma.levelConfig.findUnique({
        where: { level: newLevel + 1 },
      })

      if (!nextLevelConfig || newXp < nextLevelConfig.xpRequired) {
        break
      }

      newLevel++
      leveledUp = true
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        totalXp: newTotalXp,
        level: newLevel,
      },
    })

    // Award level rewards if leveled up
    if (leveledUp) {
      const levelRewards = await prisma.levelReward.findMany({
        where: {
          level: newLevel,
          autoGrant: true,
        },
      })

      for (const levelReward of levelRewards) {
        if (levelReward.rewardType === 'points') {
          await prisma.user.update({
            where: { id: userId },
            data: {
              pointsBalance: { increment: parseInt(levelReward.rewardValue) },
            },
          })
        } else if (levelReward.rewardType === 'badge') {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeName: levelReward.rewardValue,
              badgeIcon: '🏆',
            },
          })
        }
      }
    }

    return {
      success: true,
      xpAwarded: reward.xpAmount,
      newLevel: leveledUp ? newLevel : undefined,
    }
  } catch (error) {
    console.error('Award XP error:', error)
    return { success: false, xpAwarded: 0 }
  }
}

export async function getLevelProgress(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      level: true,
      xp: true,
      totalXp: true,
    },
  })

  if (!user) {
    return null
  }

  const [currentLevel, nextLevel] = await Promise.all([
    prisma.levelConfig.findUnique({
      where: { level: user.level },
    }),
    prisma.levelConfig.findUnique({
      where: { level: user.level + 1 },
    }),
  ])

  return {
    user,
    currentLevel,
    nextLevel,
    xpToNextLevel: nextLevel ? nextLevel.xpRequired - user.xp : 0,
    progressPercentage: nextLevel 
      ? Math.min(100, (user.xp / nextLevel.xpRequired) * 100)
      : 100,
  }
}
