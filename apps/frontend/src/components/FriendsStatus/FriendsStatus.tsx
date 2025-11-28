import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  ScrollArea,
  SimpleGrid,
  Text,
} from "@mantine/core";

import { IconClock, IconMessageCircle, IconTrophy } from "@tabler/icons-react";
import { FRIENDS_VIEW_PROFILE } from "~/constants";
import { Avatar } from "../Avatar/Avatar";
import { useLoaderData } from "react-router";
import { Friends } from "~/types";
export const FriendsStatus = () => {
  const loaderdata = useLoaderData();
  const friends = loaderdata?.data?.friendsList?.data?.friends ?? [];
  type friends = {
    friends: Friends;
  };
  /*
  interface Friend {
    name: string;
    subject: string;
    status: string;
    streak: string;
    studyLength: number;
    numBadges: number;
    activity: "online" | "studying" | "offline";
  }
  const friends: Friend[] = [
    {
      activity: "online",
      name: "Sarah Chen",
      numBadges: 24,
      status: "2 hours ago",
      streak: "15 day streak",
      studyLength: 206,
      subject: "Physics",
    },
    {
      activity: "studying",
      name: "Mike Johnson",
      numBadges: 16,
      status: "Currently Studying",
      streak: "8 day streak",
      studyLength: 148,
      subject: "Mathematics",
    },
    {
      activity: "offline",
      name: "Emma Wilson",
      numBadges: 35,
      status: "6 hours ago",
      streak: "22 day streak",
      studyLength: 311,
      subject: "Chemistry",
    },
    {
      activity: "online",
      name: "Alex Rodriguez",
      numBadges: 12,
      status: "1 hours ago",
      streak: "3 day streak",
      studyLength: 93,
      subject: "History",
    },
  ];
*/

  return (
    <Box>
      <Flex direction="row" gap="md" p="lg">
        <ScrollArea h={500} type="scroll" w="100%">
          <SimpleGrid spacing="lg" w="100%">
            {friends.length == 0 ? (
              <Center>
                {" "}
                <Text>Go make some friends</Text>{" "}
              </Center>
            ) : (
              friends.map((friend: friends) => (
                <Card
                  key={friend.friends.id}
                  p="lg"
                  radius="md"
                  shadow="sm"
                  style={{ borderRadius: "12px" }}
                  w="100%"
                  withBorder
                >
                  <Flex align="center" justify="space-between">
                    {/* LEFT SIDE: Avatar + Info */}
                    <Flex direction="row">
                      <Avatar
                        backgroundColor="grey"
                        name={friend.friends.id || "John Doe"}
                        size={64}
                        status={"online"}
                      />

                      <Flex direction="column" px="md">
                        <Text fw={700} fz="xl">
                          {friend.friends.id}
                        </Text>

                        <Text c="dimmed" fz="sm">
                          {`${friend.friends.id} - ${friend.friends.id}`}
                        </Text>

                        {/* Stats */}
                        <Flex direction="row">
                          <Text
                            c="dimmed"
                            fz="sm"
                            style={{
                              alignItems: "center",
                              display: "flex",
                              gap: 6,
                            }}
                          >
                            <IconTrophy color="grey" />
                            {friend.friends.id}
                          </Text>

                          <Text
                            c="dimmed"
                            fz="sm"
                            p="xs"
                            style={{
                              alignItems: "center",
                              display: "flex",
                              gap: 6,
                            }}
                          >
                            <IconClock color="grey" />
                            {`${friend.friends.id}h`}
                          </Text>

                          <Text
                            c="dimmed"
                            fz="sm"
                            p="xs"
                            style={{
                              alignItems: "center",
                              display: "flex",
                              gap: 6,
                            }}
                          >
                            {`${friend.friends.id} badges`}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>

                    {/* RIGHT SIDE: Buttons */}
                    <Flex align="center" gap="xs">
                      <Button variant="transparent">
                        <IconMessageCircle color="black" />
                      </Button>

                      <Button color="black" variant="outline">
                        {FRIENDS_VIEW_PROFILE}
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              ))
            )}
          </SimpleGrid>
        </ScrollArea>
      </Flex>
    </Box>
  );
};
