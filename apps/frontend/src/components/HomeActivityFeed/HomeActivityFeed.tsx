import { Box, Flex, Pagination, Pill, SimpleGrid, Text } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useLoaderData } from 'react-router';
import {
  FEED_ITEMS_PER_PAGE,
  HOME_FEED_BADGE_PILL_TEXT,
  HOME_FEED_BADGE_TEXT,
  HOME_FEED_BADGE_TIMESTAMP_PREFIX,
  HOME_FEED_SESSION_PILL_TEXT,
  HOME_FEED_SESSION_TEXT,
  HOME_FEED_SESSION_TIMESTAMP_PREFIX,
} from '~/constants';
import type { FeedItem } from '~/types';
import {
  formatISOToYYYYMMDD,
  formatMinutesToHoursAndMinutes,
} from '~/utilities/time';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

export const HomeActivityFeed = () => {
  const [page, setPage] = useState<number>(1);

  const loaderData = useLoaderData();
  const data = loaderData.data?.homeFeed;

  const totalPages = useMemo(
    () => Math.ceil(data.length / FEED_ITEMS_PER_PAGE),
    [data],
  );
  const visibleRows = useMemo(() => {
    const start = (page - 1) * FEED_ITEMS_PER_PAGE;
    return data.slice(start, start + FEED_ITEMS_PER_PAGE);
  }, [page, data]);

  return loaderData?.error ? (
    <ErrorBoundary />
  ) : (
    <Flex direction='column' h={435} justify='space-between' pt='md' px='md'>
      <SimpleGrid cols={3} spacing='sm'>
        {visibleRows.map((dataRow: FeedItem) => (
          <Box
            bd='1px solid lightgray'
            bdrs={8}
            key={`home-activity-row-${dataRow.timestamp}`}
            p={16}
          >
            {dataRow.badge && (
              <>
                <Flex align='center' justify='space-between'>
                  <Flex direction='row'>
                    <Text fw={500}>{dataRow.user.fullName}</Text>
                    <Text pl={4}>{HOME_FEED_BADGE_TEXT}</Text>
                  </Flex>
                  <Pill c='blue'>{HOME_FEED_BADGE_PILL_TEXT}</Pill>
                </Flex>
                <Box bd='1px solid lightgray' bdrs={8} mt='sm' p='xs'>
                  <Text fw={700}>{dataRow.badge.name}</Text>
                  <Text>{dataRow.badge.description}</Text>
                </Box>
                <Text pt='sm'>
                  {HOME_FEED_BADGE_TIMESTAMP_PREFIX}{' '}
                  {formatISOToYYYYMMDD(dataRow.timestamp)}
                </Text>
              </>
            )}
            {dataRow.session && (
              <>
                <Flex align='center' justify='space-between'>
                  <Flex direction='row'>
                    <Text fw={500}>{dataRow.user.fullName}</Text>
                    <Text pl={4}>{HOME_FEED_SESSION_TEXT}</Text>
                  </Flex>
                  <Pill c='green'>{HOME_FEED_SESSION_PILL_TEXT}</Pill>
                </Flex>
                <Box bd='1px solid lightgray' bdrs={8} mt='sm' p='xs'>
                  <Text fw={700}>{dataRow.session.subject}</Text>
                  <Text>
                    {formatMinutesToHoursAndMinutes(
                      dataRow.session.totalTime,
                      true,
                    )}
                  </Text>
                </Box>
                <Text pt='sm'>
                  {HOME_FEED_SESSION_TIMESTAMP_PREFIX}{' '}
                  {formatISOToYYYYMMDD(dataRow.timestamp)}
                </Text>
              </>
            )}
          </Box>
        ))}
      </SimpleGrid>
      <Flex justify='center'>
        <Pagination onChange={setPage} total={totalPages} value={page} />
      </Flex>
    </Flex>
  );
};
