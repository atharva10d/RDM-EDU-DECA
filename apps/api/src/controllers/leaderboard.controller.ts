import { Request, Response } from 'express';
import { QuizAttemptModel } from '../models/QuizAttempt';
import { LeaderboardEntry } from '@edudeca/types';

export const getLeaderboardByLevel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const levelNumber = parseInt(req.params.level, 10) || 1;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
    const activeUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || '';

    // Aggregate real attempts from MongoDB for the requested level
    const aggregatedRanks = await QuizAttemptModel.aggregate([
      {
        $match: {
          level: levelNumber,
        },
      },
      {
        $sort: {
          score: -1,
          timeTaken: 1,
        },
      },
      {
        $group: {
          _id: '$userId',
          bestScore: { $first: '$score' },
          total: { $first: '$total' },
          totalQuestions: { $first: '$totalQuestions' },
          bestTime: { $first: '$timeTaken' },
          completedAt: { $first: '$completedAt' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const liveEntries: Array<{
      userId: string;
      name: string;
      institution: string;
      rawScore: number;
      rawTime: number;
      total: number;
      color: string;
      isCurrentUser: boolean;
      rdmBalance?: number;
      level?: number;
    }> = aggregatedRanks.map((item, idx) => ({
      userId: String(item._id),
      name: item.user?.name || `Student Whiz #${idx + 1}`,
      institution: item.user?.institution || 'Top Whiz Institute',
      rawScore: item.bestScore,
      rawTime: item.bestTime,
      total: item.total || item.totalQuestions || 10,
      color: ['teal', 'amber', 'purple', 'blue', 'pink'][idx % 5],
      isCurrentUser: String(item._id) === activeUserId,
      rdmBalance: item.user?.rdmBalance,
      level: item.user?.level,
    }));

    const mergedList = [...liveEntries];

    // Sort strictly by: 1) Score descending, 2) Time taken ascending
    mergedList.sort((a, b) => {
      if (b.rawScore !== a.rawScore) {
        return b.rawScore - a.rawScore;
      }
      return a.rawTime - b.rawTime;
    });

    // Map into standard LeaderboardEntry with sequential ranks
    const rankings: LeaderboardEntry[] = mergedList.slice(0, limit).map((item, index) => {
      const minutes = Math.floor((item.rawTime || 0) / 60);
      const seconds = (item.rawTime || 0) % 60;
      const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}s`;

      return {
        rank: index + 1,
        userId: item.userId,
        name: item.name,
        score: `${item.rawScore}/${item.total}`,
        time: formattedTime,
        rawScore: item.rawScore,
        rawTime: item.rawTime,
        color: item.color,
        institution: item.institution,
        isCurrentUser: item.isCurrentUser,
        rdmBalance: item.rdmBalance,
        level: item.level,
      };
    });

    res.status(200).json({
      success: true,
      level: levelNumber,
      totalParticipants: rankings.length,
      data: rankings,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Leaderboard Controller] Aggregation error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to aggregate leaderboard.',
    });
  }
};

export const getGlobalLeaderboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
    const activeUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || '';
    const colors = ['teal', 'gold', 'purple', 'blue', 'pink', 'amber'];

    const attemptedUsers = await QuizAttemptModel.aggregate<{
      _id: string;
      totalScore: number;
      totalQuestions: number;
      totalEarnedRdm: number;
      lastTimeTaken: number;
      lastCompletedAt: Date;
      level: number;
      user?: {
        name?: string;
        institution?: string;
        level?: number;
      };
    }>([
      { $sort: { completedAt: -1 } },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          totalQuestions: { $sum: '$total' },
          totalEarnedRdm: { $sum: '$earnedRdm' },
          lastTimeTaken: { $first: '$timeTaken' },
          lastCompletedAt: { $first: '$completedAt' },
          level: { $max: '$level' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $sort: {
          totalEarnedRdm: -1,
          totalScore: -1,
          lastCompletedAt: 1,
        },
      },
      { $limit: limit },
    ]);

    const rankings: LeaderboardEntry[] = attemptedUsers.map((item, idx) => ({
      rank: idx + 1,
      userId: String(item._id),
      name: item.user?.name || 'Whiz Student',
      score: `${item.totalScore}/${item.totalQuestions}`,
      time: `${item.totalEarnedRdm} RDM`,
      rawScore: item.totalScore,
      rawTime: item.lastTimeTaken,
      color: colors[idx % colors.length],
      institution: item.user?.institution || '',
      isCurrentUser: String(item._id) === activeUserId,
      rdmBalance: item.totalEarnedRdm,
      level: item.user?.level || item.level,
    }));

    res.status(200).json({
      success: true,
      totalParticipants: rankings.length,
      data: rankings,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Leaderboard Controller] Global ranking error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve national leaderboard.',
    });
  }
};

