import type { StudySession } from '~/types';
import { hoursAndMinutes } from '../date';

export const calculateHistoryStatistics = (summaryList: StudySession[]) => {
  const historyList: Record<string, number> = {};
  let allTimeStudyHours = 0;
  if (!summaryList) return [{}, ''] as const;
  for (let i = 0; i < summaryList.length; i++) {
    const subject = summaryList[i].subject;
    if (subject in historyList) {
      historyList[subject] += summaryList[i].totalMinutes;
      allTimeStudyHours = allTimeStudyHours + summaryList[i].totalMinutes;
    } else {
      historyList[subject] = summaryList[i].totalMinutes;
    }
    allTimeStudyHours = allTimeStudyHours + summaryList[i].totalMinutes;
  }
  return [historyList, hoursAndMinutes(allTimeStudyHours)] as const;
};
