export const getGateErrorAction = (reason: string) => {
  switch (reason) {
    case 'LEVEL_LOCKED_AHEAD':
      return {
        title: 'Level Locked',
        message: 'Complete your current level first.',
        navigate: 'Dashboard',
      };
    case 'LEVEL_PASSED':
      return {
        title: 'Already Passed',
        message: 'You already passed this level!',
        navigate: 'Dashboard',
      };
    case 'DAILY_LOCK':
      return {
        title: 'Daily Limit',
        message: 'Come back tomorrow to continue.',
        navigate: 'Dashboard',
      };
    case 'TRIALS_EXHAUSTED':
      return {
        title: 'Attempts Exhausted',
        message: "You've used all 10 attempts today. Come back tomorrow.",
        navigate: 'Dashboard',
      };
    case 'CLASS_LEVEL_REQUIRED':
      return {
        title: 'Profile Incomplete',
        message: 'You must set your class level to 11 or 12 in your profile.',
        navigate: 'Profile',
      };
    default:
      return {
        title: 'Challenge Locked',
        message: 'You cannot play this challenge right now.',
        navigate: 'Dashboard',
      };
  }
};
