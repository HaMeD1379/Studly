import {
  Box,
  Flex,
  Pagination,
  SegmentedControl,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { IconMedal2 } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import {
  BADGES_LOCKED,
  BADGES_PER_COLLECTION_PAGE,
  BADGES_UNLOCKED,
  BadgeCollectionFilterStatus,
  NO_BADGES_LINE_1,
  NO_BADGES_LINE_2,
  NO_UNLOCKED_BADGES_LINE_1,
  NO_UNLOCKED_BADGES_LINE_2,
} from '~/constants';
import type { Badge, UnlockedBadge } from '~/types';

type BadgeCollectionProps = {
  unlockedBadges: UnlockedBadge[];
  allBadges: Badge[];
};

type VisibleBadgeValue = {
  badge: Badge;
  earnedAt?: string;
};

export const BadgeCollection = ({
  unlockedBadges,
  allBadges,
}: BadgeCollectionProps) => {
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<string>(
    BadgeCollectionFilterStatus.Unlocked,
  );
  const [visibleValues, setVisibleValues] = useState<VisibleBadgeValue[]>([]);

  useEffect(() => {
    const rowsUsed =
      filterStatus === BadgeCollectionFilterStatus.AllBadges
        ? allBadges
        : unlockedBadges;
    const rowsVisible = rowsUsed.slice(
      (page - 1) * BADGES_PER_COLLECTION_PAGE,
      page * BADGES_PER_COLLECTION_PAGE,
    );

    const mappedVisibleRows: VisibleBadgeValue[] = rowsVisible.map((row) => {
      const foundBadge = unlockedBadges.find(
        (unlockedBadge) => unlockedBadge.name === row.name,
      );

      return {
        badge: row,
        earnedAt: foundBadge?.earnedAt,
      };
    });

    setTotalPages(Math.ceil(rowsUsed.length / BADGES_PER_COLLECTION_PAGE));
    setVisibleValues(mappedVisibleRows);
  }, [page, filterStatus, allBadges, unlockedBadges]);

  return (
    <Flex direction='column' gap='lg' my='lg'>
      <Box>
        <SegmentedControl
          data={Object.values(BadgeCollectionFilterStatus)}
          onChange={setFilterStatus}
          radius='lg'
          size='sm'
          value={filterStatus}
        />
      </Box>
      {filterStatus === BadgeCollectionFilterStatus.Unlocked &&
      unlockedBadges.length === 0 ? (
        <Flex
          align='center'
          bd='1px solid lightgray'
          bdrs={8}
          direction='column'
          p={142}
        >
          <Text c='gray'>{NO_UNLOCKED_BADGES_LINE_1}</Text>
          <Text c='gray'>{NO_UNLOCKED_BADGES_LINE_2}</Text>
        </Flex>
      ) : filterStatus === BadgeCollectionFilterStatus.AllBadges &&
        allBadges.length === 0 ? (
        <Flex
          align='center'
          bd='1px solid lightgray'
          bdrs={8}
          direction='column'
          p={142}
        >
          <Text c='gray'>{NO_BADGES_LINE_1}</Text>
          <Text c='gray'>{NO_BADGES_LINE_2}</Text>
        </Flex>
      ) : (
        <SimpleGrid cols={3} spacing='lg'>
          {visibleValues.map((value) => {
            const badge = value.badge;
            const earnedAt = value.earnedAt;

            return (
              <Flex
                bd='1px solid lightgray'
                bdrs={8}
                direction='column'
                gap={4}
                key={`badge-${badge.name}`}
                p={24}
              >
                <Text fw={700}>{badge.name}</Text>
                <Text fw={300}>{badge.description}</Text>
                {earnedAt ? (
                  <Flex align='center' gap={4}>
                    <IconMedal2 color='#04A740' size={16} />
                    <Text c='#04A740'>
                      {BADGES_UNLOCKED} {earnedAt}
                    </Text>
                  </Flex>
                ) : (
                  <Text c='lightgray'>{BADGES_LOCKED}</Text>
                )}
              </Flex>
            );
          })}
        </SimpleGrid>
      )}
      <Flex justify='center' mt={visibleValues.length > 3 ? 0 : 150}>
        <Pagination onChange={setPage} total={totalPages} value={page} />
      </Flex>
    </Flex>
  );
};
