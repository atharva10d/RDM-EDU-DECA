import { CommunityMember, CommunityRoom } from '@edudeca/types';
import { edudecaApi } from './edudecaApi';
import { mapReferralMine, type ReferralMine } from './studentLoop/mapReferralMine';

function roomFromMine(mine: ReferralMine, hostId?: string): CommunityRoom | null {
  if (!mine.code) return null;
  const members: CommunityMember[] = mine.entries.map((entry) => ({
    userId: entry.refereeUserId,
    name: entry.name || 'Student',
    institution: '',
    classGrade: '',
    level: 1,
    rdmBalance: 0,
    joinedAt: entry.creditedAt,
  }));
  return {
    hostId: hostId ?? '',
    hostName: 'Student',
    hostInstitution: '',
    roomCode: mine.code,
    members,
    totalMembers: members.length,
    collectiveRdm: 0,
  };
}

export const referralService = {
  fetchMine: async (): Promise<ReferralMine> => {
    return mapReferralMine(await edudecaApi.getReferralMine());
  },

  fetchMyRoom: async (userId?: string): Promise<CommunityRoom | null> => {
    const mine = await referralService.fetchMine();
    return roomFromMine(mine, userId);
  },

  fetchJoinedRoom: async (_userId?: string): Promise<CommunityRoom | null> => {
    return null;
  },

  joinCommunityRoom: async (
    roomCode: string,
    _userId?: string,
  ): Promise<{ room: CommunityRoom; awardedRdm: number; message: string }> => {
    await edudecaApi.claimReferral(roomCode);
    return {
      room: {
        hostId: '',
        hostName: 'Student',
        hostInstitution: '',
        roomCode,
        members: [],
        totalMembers: 0,
        collectiveRdm: 0,
      },
      awardedRdm: 0,
      message: 'Referral claimed.',
    };
  },

  submitBatchReferrals: async (
    _contacts: Array<{ name: string; phone?: string; email?: string }>,
    _userId?: string,
  ): Promise<{ insertedCount: number; rewardRdm: number; totalEarned: number }> => {
    return { insertedCount: 0, rewardRdm: 0, totalEarned: 0 };
  },

  fetchMyReferrals: async (_userId?: string) => [],
};
