import { Button, Flex, Progress, Text } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { useCallback, useEffect, useState } from 'react';

type StudySessionProps = {
  startStudyTimestamp?: number;
  endStudyTimestamp?: number;
  onStartStudy: () => void;
  onStopStudy: () => void;
};

export const StudySession = ({
  startStudyTimestamp = 0,
  endStudyTimestamp = 0,
  onStartStudy,
  onStopStudy,
}: StudySessionProps) => {
  const [progressBarPercent, setProgressBarPercent] = useState<number>(0);
  const [formattedTimeLeft, setFormattedTimeLeft] = useState<string>('00:00');
  const [fullFormattedTimeLeft, setFullFormattedTimeLeft] =
    useState<string>('0 seconds');

  const calculateNextInterval = useCallback(() => {
    const now = Date.now();

    const secondsLeft = Math.floor(Math.max(endStudyTimestamp - now, 0) / 1000);
    const totalSeconds = Math.floor(
      (endStudyTimestamp - startStudyTimestamp) / 1000,
    );
    const elapsedSeconds = totalSeconds - secondsLeft;
    const progressBarPercent =
      startStudyTimestamp &&
      endStudyTimestamp &&
      (elapsedSeconds / totalSeconds) * 100;

    setProgressBarPercent(progressBarPercent);

    const minutesLeft = Math.floor(secondsLeft / 60);
    const hoursLeft = Math.floor(minutesLeft / 60);

    const secondsLeftModulo = secondsLeft % 60;
    const minutesLeftModulo = minutesLeft % 60;
    const hoursLeftModulo = hoursLeft % 60;

    if (hoursLeft) {
      setFormattedTimeLeft(
        `${hoursLeftModulo}:${minutesLeftModulo < 10 ? `0${minutesLeftModulo}` : minutesLeftModulo}`,
      );
      setFullFormattedTimeLeft(
        `${hoursLeftModulo} hours and ${minutesLeftModulo} minutes`,
      );
    } else {
      setFormattedTimeLeft(
        `${minutesLeftModulo}:${secondsLeftModulo < 10 ? `0${secondsLeftModulo}` : secondsLeftModulo}`,
      );
      setFullFormattedTimeLeft(
        `${minutesLeft ? `${minutesLeft} minutes` : `${secondsLeft} seconds`}`,
      );
    }

    if (progressBarPercent >= 100) {
      onStopStudy();
    }
  }, [endStudyTimestamp, onStopStudy, startStudyTimestamp]);

  const interval = useInterval(calculateNextInterval, 1000);

  useEffect(() => {
    if (startStudyTimestamp > 0) {
      calculateNextInterval();
      interval.start();
    } else {
      interval.stop();
      setProgressBarPercent(0);
      setFormattedTimeLeft('00:00');
      setFullFormattedTimeLeft('0 seconds');
    }

    return () => interval.stop();
  }, [calculateNextInterval, interval, startStudyTimestamp]);

  return (
    <Flex bd='1px solid lightgray' bdrs={8} direction='column' p={24}>
      <Text fw={600} size='sm'>
        Current Session
      </Text>
      <Text size='sm'>Configure your study session</Text>
      <Flex align='center' direction='column' py={8}>
        <Text fw={700} style={{ fontSize: 54 }}>
          {formattedTimeLeft}
        </Text>
      </Flex>
      <Progress size='lg' transitionDuration={200} value={progressBarPercent} />
      <Flex align='center' direction='column'>
        <Text size='sm'>{fullFormattedTimeLeft} remaining</Text>
      </Flex>
      <Flex gap='sm' justify='center' pt={24}>
        <Button disabled={startStudyTimestamp > 0} onClick={onStartStudy}>
          Start
        </Button>
        <Button disabled={startStudyTimestamp === 0} onClick={onStopStudy}>
          Stop
        </Button>
      </Flex>
    </Flex>
  );
};
