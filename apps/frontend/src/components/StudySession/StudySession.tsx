import { Text, Flex, Progress, Button } from '@mantine/core'
import { useCallback, useEffect, useState } from 'react'
import { useInterval } from '@mantine/hooks'

type StudySessionProps = {
  startStudyTimestamp?: number
  endStudyTimestamp?: number
  onStartStudy: () => void
  onStopStudy: () => void
}

export const StudySession = ({
  startStudyTimestamp = 0,
  endStudyTimestamp = 0,
  onStartStudy,
  onStopStudy
}: StudySessionProps) => {
  const [progressBarPercent, setProgressBarPercent] = useState<number>(0);
  const [formattedTimeLeft, setFormattedTimeLeft] = useState<string>('00:00');
  const [fullFormattedTimeLeft, setFullFormattedTimeLeft] = useState<string>('0 seconds');

  const calculateNextInterval = useCallback(() => {
    const now = Date.now();
    
    const secondsLeft = Math.floor(Math.max(endStudyTimestamp - now, 0) / 1000);
    const totalSeconds = Math.floor((endStudyTimestamp - startStudyTimestamp) / 1000);
    const elapsedSeconds = totalSeconds - secondsLeft;
    const progressBarPercent =
        startStudyTimestamp && endStudyTimestamp &&
        (elapsedSeconds / totalSeconds) * 100
 
    setProgressBarPercent(progressBarPercent);
  
    const minutesLeft = Math.floor(secondsLeft / 60);
    const hoursLeft = Math.floor(minutesLeft / 60)
  
    const secondsLeftModulo = secondsLeft % 60;
    const minutesLeftModulo = minutesLeft % 60;
    const hoursLeftModulo = hoursLeft % 60;

    if (hoursLeft) {
      setFormattedTimeLeft(`${hoursLeftModulo}:${minutesLeftModulo < 10 ? `0${minutesLeftModulo}` : minutesLeftModulo}`);
      setFullFormattedTimeLeft(`${hoursLeftModulo} hours and ${minutesLeftModulo} minutes`)
    } else {
      setFormattedTimeLeft(`${minutesLeftModulo}:${secondsLeftModulo < 10 ? `0${secondsLeftModulo}` : secondsLeftModulo}`);
      setFullFormattedTimeLeft(`${minutesLeft ? `${minutesLeft} minutes` : `${secondsLeft} seconds`}`);
    }

    if (progressBarPercent >= 100) {
      onStopStudy();
    }
  }, [endStudyTimestamp, onStopStudy, startStudyTimestamp])

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
    <Flex p={24} direction='column' bd='1px solid lightgray' bdrs={8}>
      <Text size='sm' fw={600}>Current Session</Text>
      <Text size='sm'>Configure your study session</Text>
      <Flex direction='column' align='center' py={8}>
        <Text style={{ fontSize: 54 }} fw={700}>{formattedTimeLeft}</Text>
      </Flex>
      <Progress value={progressBarPercent} size='lg' transitionDuration={200}/>
      <Flex direction='column' align='center'>
          <Text size='sm'>{fullFormattedTimeLeft} remaining</Text>
      </Flex>
      <Flex justify='center' gap='sm' pt={24}>
        <Button
          onClick={onStartStudy}
          disabled={startStudyTimestamp > 0}
        >
          Start
        </Button>
        <Button
          onClick={onStopStudy}
          disabled={startStudyTimestamp === 0}
        >
          Stop
        </Button>
      </Flex>
    </Flex>
  )
}