import { useLoaderData } from "react-router";
import {
  Box,
  Flex,
  Text,
  ScrollArea,
  SimpleGrid,
  Card,
  Button,
} from "@mantine/core";
import { Avatar } from "../Avatar/Avatar";
import { Result } from "~/types";
import { IconUserMinus, IconUserPlus } from "@tabler/icons-react";

type RequestProfile = {
  profile: {
    data: Result;
  };
};

type LoaderData = {
  data: {
    pendingFriendships: {
      friends: Result[];
    };
    requestProfile: RequestProfile[];
    receivedRequestsProfile: RequestProfile[];
  };
};

export const FriendRequest = () => {
  const loaderData = useLoaderData() as LoaderData;

  const requestProfiles = loaderData.data.requestProfile;
  const friendRequests = loaderData.data.pendingFriendships.friends;
  const receivedRequestsProfiles = loaderData.data.receivedRequestsProfile;

  const RequestList = ({
    title,
    profiles,
  }: {
    title: string;
    profiles: RequestProfile[];
  }) => {
    return (
      <Box>
        <Text fw={600} mb="sm">
          {title}
        </Text>

        {profiles.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No pending friend requests
          </Text>
        ) : (
          <ScrollArea h={500} type="scroll" w="100%">
            <SimpleGrid spacing="lg">
              {profiles.map((entry) => {
                const friend = entry.profile.data;

                return (
                  <Card
                    key={friend.user_id}
                    p="lg"
                    radius="md"
                    shadow="sm"
                    withBorder
                    style={{ borderRadius: 12 }}
                  >
                    <Flex align="center" justify="space-between">
                      {/* LEFT SIDE */}
                      <Flex direction="row">
                        <Avatar
                          backgroundColor="grey"
                          name={friend.full_name}
                          size={64}
                          status="online"
                        />

                        <Flex direction="column" px="md">
                          <Text fw={700} fz="xl">
                            {friend.full_name}
                          </Text>
                          <Text c="dimmed" fz="sm">
                            {friend.bio || "No bio provided"}
                          </Text>
                        </Flex>
                      </Flex>

                      {/* RIGHT SIDE */}
                      <Flex align="center" gap="xs">
                        <Flex direction="column">
                          {title === "RECEIVED REQUESTS" ? (
                            <Flex direction="row" gap="md">
                              <Button variant="outline" color="black">
                                <IconUserPlus color="green" />
                              </Button>
                              <Button variant="outline" color="black">
                                <IconUserMinus color="red" />
                              </Button>
                            </Flex>
                          ) : (
                            <>
                              <Text>Friend Request sent</Text>
                              <Text c="dimmed">Pending</Text>
                            </>
                          )}
                        </Flex>
                      </Flex>
                    </Flex>
                  </Card>
                );
              })}
            </SimpleGrid>
          </ScrollArea>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Flex direction="row" gap="md" p="lg">
        <Flex direction="column" gap="xl" p="lg">
          {/* RECEIVED REQUESTS */}
          <RequestList
            title="RECEIVED REQUESTS"
            profiles={receivedRequestsProfiles}
          />

          {/* SENT REQUESTS */}
          <RequestList title="SENT REQUESTS" profiles={requestProfiles} />
        </Flex>
      </Flex>
    </Box>
  );
};
