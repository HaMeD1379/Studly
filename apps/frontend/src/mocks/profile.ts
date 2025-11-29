export const mockProfileLoaderData = {
  data: {
    badges: {
      allBadges: [
        {
          description: 'Completed 5 sessions',
          earnedAt: '2025-01-01',
          name: '5 Sessions',
        },
        {
          description: 'Total 3 hours',
          earnedAt: '2025-01-02',
          name: '3 Hours',
        },
        {
          description: 'Study for a total of 30 minutes',
          earnedAt: '2025-11-21',
          name: 'Half Hour Hero',
        },
        {
          description: 'Study for a total of 1 hour',
          earnedAt: '2025-11-21',
          name: 'Hour Hero',
        },
      ],
      unlockedBadges: [
        {
          description: 'Completed 5 sessions',
          earnedAt: '2025-01-01',
          name: '5 Sessions',
        },
        {
          description: 'Total 3 hours',
          earnedAt: '2025-01-02',
          name: '3 Hours',
        },
        {},
      ],
    },
    profileBio: { data: { bio: 'This is my Bio' } },
    sessionSummary: { sessionsLogged: 0, totalMinutesStudied: 0 },
  },
  error: false,
};

export const mockProfileStatisticsLoaderData = {
  data: {
    badges: {
      allBadges: [
        {
          description: 'Completed 5 sessions',
          earnedAt: '2025-01-01',
          name: '5 Sessions',
        },
        {
          description: 'Total 3 hours',
          earnedAt: '2025-01-02',
          name: '3 Hours',
        },
        {
          description: 'Study for a total of 30 minutes',
          earnedAt: '2025-11-21',
          name: 'Half Hour Hero',
        },
        {
          description: 'Study for a total of 1 hour',
          earnedAt: '2025-11-21',
          name: 'Hour Hero',
        },
      ],
      unlockedBadges: [
        {
          description: 'Completed 5 sessions',
          earnedAt: '2025-01-01',
          name: '5 Sessions',
        },
        {
          description: 'Total 3 hours',
          earnedAt: '2025-01-02',
          name: '3 Hours',
        },
        {},
      ],
    },
    sessionSummary: {
      sessionsLogged: 5,
      subjectSummaries: [{ subject: 'Math' }, { subject: 'Physics' }],
      totalMinutesStudied: 180,
    },
    sessions: [
      { subject: 'Math', totalMinutes: 120 },
      { subject: 'Physics', totalMinutes: 60 },
    ],
  },
};
