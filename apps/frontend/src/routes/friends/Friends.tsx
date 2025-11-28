import { Container, SegmentedControl, Text } from "@mantine/core";
import {
  FriendsHeader,
  FriendsStatus,
  FindFriends,
  FriendRequest,
} from "~/components";
import { friendsTabs as tabs } from "~/constants/friends";
import { useEffect, useState } from "react";
import { useActionData } from "react-router-dom";
import {
  FRIENDS_TAB_FRIENDS,
  FRIENDS_TAB_REQUESTS,
  FRIENDS_TAB_RECEIVED_REQUESTS,
} from "~/constants";
import { Result } from "~/types";

export const Friends = () => {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [searchResults, setSearchResults] = useState<Result[] | null>(null);

  const actionData = useActionData();

  useEffect(() => {
    if (actionData && actionData.formtype === "searchFriends") {
      setSearchResults(actionData.data.results);
    }
  }, [actionData]);

  const isSearching = searchResults !== null;

  return (
    <Container fluid p="xl">
      <FriendsHeader />
      {isSearching ? (
        <FindFriends
          results={searchResults}
          onClear={() => setSearchResults(null)}
        />
      ) : (
        <>
          <SegmentedControl
            data={tabs.map((t) => ({ label: t, value: t.toLowerCase() }))}
            fullWidth
            radius="xl"
            size="md"
            onChange={(value) => {
              setSelectedTab(value);
            }}
          />
          {selectedTab === FRIENDS_TAB_FRIENDS.toLowerCase() && (
            <FriendsStatus />
          )}
          {selectedTab === FRIENDS_TAB_REQUESTS.toLowerCase() && (
            <FriendRequest />
          )}
          {selectedTab === FRIENDS_TAB_RECEIVED_REQUESTS.toLowerCase() && (
            <Text>Show suggested friends here</Text>
          )}
        </>
      )}
    </Container>
  );
};
