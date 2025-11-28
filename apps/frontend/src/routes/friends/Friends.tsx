import {
  ActionIcon,
  Box,
  Container,
  Flex,
  SegmentedControl,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useActionData, useRevalidator } from 'react-router-dom';
import {
  FindFriends,
  FriendRequest,
  FriendsHeader,
  FriendsStatus,
} from '~/components';
import { FRIENDS_TAB_FRIENDS, FRIENDS_TAB_REQUESTS } from '~/constants';
import { friendsTabs as tabs } from '~/constants/friends';
import type { Result } from '~/types';

export const Friends = () => {
  const [selectedTab, setSelectedTab] = useState(
    FRIENDS_TAB_FRIENDS.toLowerCase(),
  );
  const [searchResults, setSearchResults] = useState<Result[] | null>(null);

  const actionData = useActionData();

  const revalidator = useRevalidator();

  useEffect(() => {
    if (actionData && actionData.formtype === 'searchFriends') {
      setSearchResults(actionData.data.results);
    }
  }, [actionData]);

  const isSearching = searchResults !== null;

  return (
    <Container fluid p='xl'>
      <FriendsHeader isHidden={!isSearching} />

      {isSearching ? (
        <FindFriends results={searchResults} />
      ) : (
        <Flex direction='column' gap='lg' w='100%'>
          {/* Top bar: Tabs + Refresh */}
          <Flex align='center' justify='space-between' w='100%'>
            <Box style={{ flex: 1 }}>
              <SegmentedControl
                data={tabs.map((t) => ({ label: t, value: t.toLowerCase() }))}
                fullWidth
                onChange={setSelectedTab}
                radius='xl'
                size='md'
                value={selectedTab}
              />
            </Box>

            <ActionIcon
              color='black'
              ml='md'
              onClick={() => revalidator.revalidate()}
              size='lg'
              variant='outline'
            >
              <IconRefresh size={24} />
            </ActionIcon>
          </Flex>

          <Box>
            {selectedTab === FRIENDS_TAB_FRIENDS.toLowerCase() && (
              <FriendsStatus />
            )}
            {selectedTab === FRIENDS_TAB_REQUESTS.toLowerCase() && (
              <FriendRequest />
            )}
          </Box>
        </Flex>
      )}
    </Container>
  );
};
