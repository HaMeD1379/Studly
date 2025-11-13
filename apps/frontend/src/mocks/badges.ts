export const mockAllUnlockedBadges = [
  {
    description: 'TEST_1_DESCRIPTION',
    earnedAt: '2024-04-04',
    name: 'TEST_1_NAME',
  },
  {
    description: 'TEST_2_DESCRIPTION',
    earnedAt: '2024-04-05',
    name: 'TEST_2_NAME',
  },
  {
    description: 'TEST_3_DESCRIPTION',
    earnedAt: '2024-04-06',
    name: 'TEST_3_NAME',
  },
  {
    description: 'TEST_4_DESCRIPTION',
    earnedAt: '2024-04-07',
    name: 'TEST_4_NAME',
  },
  {
    description: 'TEST_5_DESCRIPTION',
    earnedAt: '2024-04-08',
    name: 'TEST_5_NAME',
  },
  {
    description: 'TEST_6_DESCRIPTION',
    earnedAt: '2024-04-09',
    name: 'TEST_6_NAME',
  },
  {
    description: 'TEST_7_DESCRIPTION',
    earnedAt: '2024-04-12',
    name: 'TEST_7_NAME',
  },
  {
    description: 'TEST_8_DESCRIPTION',
    earnedAt: '2024-04-23',
    name: 'TEST_8_NAME',
  },
];

export const mockAllBadges = [
  ...mockAllUnlockedBadges,
  {
    description: 'TEST_9_DESCRIPTION',
    name: 'TEST_9_NAME',
  },
  {
    description: 'TEST_10_DESCRIPTION',
    name: 'TEST_10_NAME',
  },
  {
    description: 'TEST_11_DESCRIPTION',
    name: 'TEST_11_NAME',
  },
  {
    description: 'TEST_12_DESCRIPTION',
    name: 'TEST_12_NAME',
  },
  {
    description: 'TEST_13_DESCRIPTION',
    name: 'TEST_13_NAME',
  },
];

export const mockUnlockedBadgeTimestamp = '2024-04-04T23:12:04Z';

export const mockBadgesResponse = {
  data: {
    badges: [
      {
        earnedAt: null,
        badge: {
          description: 'TEST_DESCRIPTION_1',
          name: 'TEST_NAME_1'
        }
      },
      {
        earnedAt: null,
        badge: {
          description: 'TEST_DESCRIPTION_2',
          name: 'TEST_NAME_2'
        }
      },
      {
        earnedAt: '2024-04-04',
        badge: {
          description: 'TEST_DESCRIPTION_3',
          name: 'TEST_NAME_3'
        }
      },
      {
        earnedAt: '2024-07-05',
        badge: {
          description: 'TEST_DESCRIPTION_4',
          name: 'TEST_NAME_4'
        }
      },
    ]
  },
  error: false,
}

export const mockBadgesLoaderResponse = {
  data: {
    unlockedBadges: [
      {
        earnedAt: '2024-04-04',
        description: 'TEST_DESCRIPTION_3',
        name: 'TEST_NAME_3'
      },
      {
        earnedAt: '2024-07-05',
        description: 'TEST_DESCRIPTION_4',
        name: 'TEST_NAME_4'
      }
    ],
    allBadges: [
      {
        description: 'TEST_DESCRIPTION_1',
        name: 'TEST_NAME_1'
      },
      {
        description: 'TEST_DESCRIPTION_2',
        name: 'TEST_NAME_2'
      },
      {
        description: 'TEST_DESCRIPTION_3',
        name: 'TEST_NAME_3'
      },
      {
        description: 'TEST_DESCRIPTION_4',
        name: 'TEST_NAME_4'
      }
    ]
  },
  error: false,
}

export const mockBadgesErrorResponse = {
  data: {
    allBadges: [],
    unlockedBadges: [],
  },
  error: true,
}