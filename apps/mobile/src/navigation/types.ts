import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Home: undefined;
  PickPath: undefined;
  SignIn: undefined;
  PickDisciplines: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  Quiz: { quizLength?: number; level?: number };
  Results: {
    score: number;
    total: number;
    earnedRdm: number;
    accuracy: number;
    leveledUp?: boolean;
    newLevel?: number;
    reason?: 'won' | 'strikes' | 'time' | 'quit';
    correct?: number;
    strikes?: number;
    xpEarned?: number;
    campaignLevelAtStart?: number;
  };
  Refer: undefined;
  LevelPath: undefined;
  Leaderboard: undefined;
  PickPath: undefined;
  Rewards: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  LevelsTab: undefined;
  RankTab: undefined;
  RewardsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};


