export type FeedLoader = {
  data: {
    feed: {
      user: {
        full_name: string;
      };
      badge?: {
        name: string;
        description: string;
      };
      session?: {
        total_time: number;
        subject: string;
      };
      timestamp: string;
    }[];
  };
};

export type FeedItem = {
  user: {
    fullName: string;
  };
  badge?: {
    name: string;
    description: string;
  };
  session?: {
    totalTime: number;
    subject: string;
  };
  timestamp: string;
};

export type HomeFeed = FeedItem[];
