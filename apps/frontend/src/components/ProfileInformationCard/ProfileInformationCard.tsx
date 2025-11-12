import { Button, Card, Flex, Text, TextInput } from "@mantine/core";
import { IconCamera } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { displayNotifications } from "~/utilities/notifications";
import { Avatar } from "../Avatar/Avatar";
import { Form, useActionData } from "react-router-dom";

export const profileInformationCard = () => {
  const userName = localStorage.getItem("fullName") || "John Doe";
  const [_fullName, setFullName] = useState("");
  const [_email, setEmail] = useState("");
  const [bioText, setBioText] = useState("");
  const [textCount, setTextCount] = useState(0);
  const actionData = useActionData();
  const changeName = (name: string) => {
    setFullName(name);
    localStorage.setItem("fullName", name);
  };
  const changeEmail = (email_input: string) => {
    setEmail(email_input);
    localStorage.setItem("email", email_input);
  };
  const wordCounter = (text: string) => {
    const maxLength = 200;
    setTextCount(Math.min(text.length, maxLength));
  };

  useEffect(() => {
    if (actionData && !actionData.success) {
      const message = actionData.message;
      if (message === "Profile updated successfully") {
        displayNotifications(
          "Update Successful",
          "User Information has been updated",
          "green"
        );
      } else {
        displayNotifications("Update Failed", "Please try again later", "red");
      }
    }
  }, [actionData]);

  const onClick = () => {
    if (_fullName) {
      localStorage.setItem("fullName", _fullName);
    }
    if (_email) {
      localStorage.setItem("email", _email);
    }
    if (bioText) {
    }
  };

  return (
    <Card p="lg" radius="lg" shadow="sm" w="100%" withBorder>
      <Form id="profile-form" method="PATCH" onSubmit={onClick}>
        <Text data-testid="profile-info-text" fw={700}>
          Profile Information
        </Text>
        <Text c="dimmed" data-testid="profile-info-subtext">
          Update your personal information and profile details
        </Text>
        <Flex align="center" direction="row" gap="md" p="xs">
          <Avatar
            backgroundColor="#959595"
            data-testid="avatar-user"
            name={userName}
            size={80}
            textColor="#fff"
          />
          <Flex direction="column" p="sm">
            <Button
              c="dark"
              data-testid="avatar-change-btn"
              fw={700}
              leftSection={<IconCamera size={14} />}
              onClick={() => {
                displayNotifications(
                  "Not Supported",
                  "The action you have requested is not available at this time",
                  "red"
                );
              }}
              style={{ borderColor: "black" }}
              variant="outline"
            >
              Change Avatar
            </Button>
            <Text c="dimmed" data-testid="accepted-images">
              JPG,PNG up to 5MB
            </Text>
          </Flex>
        </Flex>
        <Flex direction="row" gap="sm" w="100%">
          <Flex direction="column" flex={1} gap="sm">
            <Text data-testid="name-text" fw={700}>
              Full Name
            </Text>
            <TextInput
              name="fullName"
              data-testid="name-text-update"
              onChange={(e) => changeName(e.target.value)}
              radius="md"
              size="md"
              variant="filled"
              defaultValue={localStorage.getItem("fullName") || "Full Name"}
              w="100%"
            />
          </Flex>

          <Flex direction="column" flex={1} gap="sm">
            <Text data-testid="email-text" fw={700}>
              Email Address
            </Text>
            <TextInput
              data-testid="email-text-update"
              onChange={(e) => changeEmail(e.target.value)}
              defaultValue={localStorage.getItem("email") || "user@gmail.com"}
              radius="md"
              size="md"
              variant="filled"
              w="100%"
            />
          </Flex>
        </Flex>
        <Text data-testid="bio-text" fw={600}>
          Bio
        </Text>
        <TextInput
          name="bio"
          data-testid="bio-text-update"
          maxLength={200}
          onChange={(e) => wordCounter(e.target.value)}
          placeholder="Update your bio"
          radius="md"
          size="lg"
          variant="filled"
          w="100%"
        ></TextInput>
        <Text c="dimmed" data-testid="word-counter">
          {textCount}/200 characters
        </Text>
      </Form>
    </Card>
  );
};
