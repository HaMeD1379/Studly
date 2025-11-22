import { describe, expect } from 'vitest';
import type { StudySession } from '~/types';
import { calculateHistoryStatistics } from './calculateHistoryStatistics';

describe('CalculateHistoryStatistics', () => {
  const studySessions: StudySession[] = [
    {
      endTime: '2025-11-19T14:30:00Z',
      subject: 'Mathematics',
      totalMinutes: 90,
    },
    {
      endTime: '2025-11-19T15:15:00Z',
      subject: 'Biology',
      totalMinutes: 45,
    },
    {
      endTime: '2025-11-19T16:30:00Z',
      subject: 'Chemistry',
      totalMinutes: 60,
    },
    {
      endTime: '2025-11-19T17:00:00Z',
      subject: 'History',
      totalMinutes: 30,
    },
  ];

  const list = {
    Biology: 45,
    Chemistry: 60,
    History: 30,
    Mathematics: 90,
  };

  it('returns corrects value', () => {
    const [historyList, totalHours] = calculateHistoryStatistics(studySessions);
    expect(totalHours).toBe('3 hours 45 minutes');
    expect(historyList).toEqual(list);
  });
});
