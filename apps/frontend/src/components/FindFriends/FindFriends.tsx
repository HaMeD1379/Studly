import {
  SimpleGrid,
  Box,
  Center,
  Text,
  ScrollArea,
  Flex,
  Card,
  Button,
  Input,
} from "@mantine/core";
import { Avatar } from "../Avatar/Avatar";
import { Friends, Result } from "~/types";
import { IconMessageCircle, IconUserPlus } from "@tabler/icons-react";
import { FRIENDS_VIEW_PROFILE, FRIENDS_SEARCH_NO_USERS } from "~/constants";
import { useLoaderData, Form, useSubmit, HTMLFormMethod } from "react-router";
import { useState } from "react";
import { userInfo } from "~/store";
type props = {
  results?: Result[];
  onClear: () => void;
};

export const FindFriends = ({ results, onClear }: props) => {
  const [selectedUser, setSelectedUser] = useState("");
  const { userId } = userInfo();
  const submit = useSubmit();
  const loaderdata = useLoaderData();
  const friends = loaderdata?.data?.friendsList?.data?.friends ?? [];
  const notAFriend = results?.filter(
    (item) => !friends.some((friend: Friends) => friend.id === item.user_id)
  );
  const notAFriendIds = notAFriend?.map((user) => user.user_id);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    userIdToSend?: string
  ) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.append("userId", userId);
    formData.append("requestUserId", userIdToSend || selectedUser);
    submit(formData, { method: form.method as HTMLFormMethod });
  };

  return (
    <Box>
      <Flex direction="row" gap="md" p="lg">
        <ScrollArea h={500} type="scroll" w="100%">
          <SimpleGrid spacing="lg" w="100%">
            {!results || results.length == 0 ? (
              <Center>
                {" "}
                <Text>{FRIENDS_SEARCH_NO_USERS}</Text>{" "}
              </Center>
            ) : (
              results.map((friend: Result) => (
                <Card
                  key={friend.user_id}
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
                        name={friend.full_name || "John Doe"}
                        size={64}
                        status={"online"}
                      />

                      <Flex direction="column" px="md">
                        <Text fw={700} fz="xl">
                          {friend.full_name}
                        </Text>

                        <Text c="dimmed" fz="sm">
                          {`${friend.bio}`}
                        </Text>
                      </Flex>
                    </Flex>

                    {/* RIGHT SIDE: Buttons */}
                    <Flex align="center" gap="xs">
                      {notAFriendIds?.includes(friend.user_id) ? (
                        <>
                          <Form
                            method="post"
                            onSubmit={(e) => handleSubmit(e, friend.user_id)}
                            role="form"
                          >
                            <Input
                              type="hidden"
                              name="formtype"
                              value="sendFriendRequest"
                            />
                            <Button
                              color="black"
                              variant="outline"
                              type="submit"
                            >
                              <IconUserPlus />
                            </Button>
                          </Form>
                        </>
                      ) : (
                        <>
                          <Button variant="transparent">
                            <IconMessageCircle color="black" />
                          </Button>
                          <Button color="black" variant="outline">
                            {FRIENDS_VIEW_PROFILE}
                          </Button>
                        </>
                      )}
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
