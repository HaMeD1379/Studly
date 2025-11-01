import {
  Flex,
  SegmentedControl,
  Pagination,
  Text,
  SimpleGrid,
  Box,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import {
  BadgeCollectionFilterStatus,
  BADGES_PER_COLLECTION_PAGE,
} from '~/constants';
import type { Badge, UnlockedBadge } from '~/types';
import { formatToYYYYMMDD } from '~/utilities/date';
import { IconMedal2 } from '@tabler/icons-react';

type BadgeCollectionProps = {
  unlockedBadges: UnlockedBadge[];
  allBadges: Badge[];
};

type VisibleBadgeValue = {
  badge: Badge;
  timeUnlocked?: number;
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
        timeUnlocked: foundBadge?.timeUnlocked,
      };
    });

    setTotalPages(Math.ceil(rowsUsed.length / BADGES_PER_COLLECTION_PAGE));
    setVisibleValues(mappedVisibleRows);
  }, [page, filterStatus, allBadges, unlockedBadges]);

  return (
    <Flex my="lg" gap="lg" direction="column">
      <Box>
        <SegmentedControl
          value={filterStatus}
          onChange={setFilterStatus}
          size="sm"
          radius="lg"
          data={Object.values(BadgeCollectionFilterStatus)}
        />
      </Box>
      {filterStatus === BadgeCollectionFilterStatus.Unlocked &&
      unlockedBadges.length === 0 ? (
        <Flex
          p={142}
          bdrs={8}
          bd="1px solid lightgray"
          direction="column"
          align="center"
        >
          <Text c="gray">No badges unlocked yet!</Text>
          <Text c="gray">Start studying to earn badges!</Text>
        </Flex>
      ) : filterStatus === BadgeCollectionFilterStatus.AllBadges &&
        allBadges.length === 0 ? (
        <Flex
          p={142}
          bdrs={8}
          bd="1px solid lightgray"
          direction="column"
          align="center"
        >
          <Text c="gray">There are no badges to display here</Text>
          <Text c="gray">Please try again later</Text>
        </Flex>
      ) : (
        <SimpleGrid cols={3} spacing="lg">
          {visibleValues.map((value) => {
            const badge = value.badge;
            const timeUnlocked = value.timeUnlocked;

            return (
              <Flex
                key={`badge-${badge.name}`}
                p={24}
                gap={4}
                bd="1px solid lightgray"
                bdrs={8}
                direction="column"
              >
                <Text fw={700}>{badge.name}</Text>
                <Text fw={300}>{badge.description}</Text>
                {timeUnlocked ? (
                  <Flex align="center" gap={4}>
                    <IconMedal2 size={16} color="#04A740" />
                    <Text c="#04A740">
                      Unlocked {formatToYYYYMMDD(timeUnlocked)}
                    </Text>
                  </Flex>
                ) : (
                  <Text c="lightgray">Locked</Text>
                )}
              </Flex>
            );
          })}
        </SimpleGrid>
      )}
      <Flex justify="center" mt={visibleValues.length > 3 ? 0 : 150}>
        <Pagination total={totalPages} value={page} onChange={setPage} />
      </Flex>
    </Flex>
  );
};
