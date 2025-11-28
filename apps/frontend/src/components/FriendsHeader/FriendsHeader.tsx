import {
  Box,
  Card,
  Center,
  Flex,
  Input,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import {
  FRIENDS_HEADER_DESCRIPTION,
  FRIENDS_SEARCHBAR_PLACEHOLDER,
  FRIENDS_TAB_FRIENDS,
  FRIENDS_CARD_ONLINE,
  FRIENDS_CARD_STUDYING,
  FRIENDS_TAB_REQUESTS,
} from "~/constants";
import { IconCircleFilled, IconUserPlus, IconUsers } from "@tabler/icons-react";
import { useLoaderData, Form, useSubmit } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
export const FriendsHeader = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState(searchTerm);
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  useEffect(() => {
    // Set a timeout to update the searchTerm state after 500ms of inactivity
    const timeoutId = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 700);

    // Clean up the previous timeout if the inputValue changes again
    return () => {
      clearTimeout(timeoutId);
    };
  }, [inputValue]); // The effect runs every time inputValue changes

  useEffect(() => {
    if (searchTerm) {
      submit(formRef.current);
    }
  }, [searchTerm]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const loaderdata = useLoaderData();
  const friendCount = loaderdata.data.friendCount.data.count;
  const requestCount = loaderdata.data.requestCount.data.count;

  const stats = [
    {
      icon: <IconUsers color="blue" size={28} />,
      label: FRIENDS_TAB_FRIENDS,
      value: friendCount,
    },
    {
      icon: <IconUserPlus color="#40c057" size={28} />,
      label: FRIENDS_TAB_REQUESTS,
      value: requestCount,
    },
    {
      icon: <IconCircleFilled color="#40c057" size={28} />,
      label: FRIENDS_CARD_ONLINE,
      value: "2",
    },
    {
      icon: <IconCircleFilled color="blue" size={28} />,
      label: FRIENDS_CARD_STUDYING,
      value: "1",
    },
  ];

  return (
    <Box>
      <Flex direction="column" gap="md" p="lg" w="30%">
        <Text data-testid="Friends header" fw={700} fz="h1">
          {FRIENDS_TAB_FRIENDS}
        </Text>
        <Text c="dimmed">{FRIENDS_HEADER_DESCRIPTION}</Text>
        <Form ref={formRef} method="post">
          <Input type="hidden" name="formtype" value="searchFriend" />
          <TextInput
            name="searchUser"
            leftSection={<IconSearch />}
            placeholder={FRIENDS_SEARCHBAR_PLACEHOLDER}
            variant="filled"
            onChange={(e) => handleInputChange(e)}
          />
        </Form>
      </Flex>

      <Flex direction="row" gap="md" p="lg">
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg" w="100%">
          {stats.map((item) => (
            <Card
              data-testid={`${item.label
                .toLowerCase()
                .replace(/\s+/g, "-")}-card`}
              key={item.label}
              p="lg"
              radius="md"
              shadow="sm"
              style={{ borderRadius: "12px" }}
              withBorder
            >
              <Center style={{ flexDirection: "column", gap: "6px" }}>
                {item.icon}
                <Text fw={700} fz="xl">
                  {item.value}
                </Text>
                <Text c="dimmed" fz="sm">
                  {item.label}
                </Text>
              </Center>
            </Card>
          ))}
        </SimpleGrid>
      </Flex>
    </Box>
  );
};
