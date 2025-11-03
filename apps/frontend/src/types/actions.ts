export type CreateStudySessionAction = {
  session: {
    id: string;
    userId: string;
    subject: string;
    sessionType: number;
    sessionGoal: string | null;
    startTime: string;
    endTime: string;
    totalMinutes: number;
    date: string;
    insertedAt: string;
    updatedAt: string;
  };
};
