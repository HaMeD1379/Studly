import { IconArrowLeft } from "@tabler/icons-react";
import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import classes from "~/Styles/ForgotPassword.module.css";
import { useNavigate } from "react-router";
import { validateEmail } from "~/utilities/testing/emailValidation";
import { useRef } from "react";
import { notifications } from "@mantine/notifications";

export function ForgotPassword() {
  const navigate = useNavigate();
  const email = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    if (email.current) {
      if (validateEmail(email.current.value)) {
        notifications.show({
          title: "Accepted",
          message: "A reset link has been sent to your email",
          color: "green",
        });
        navigate("/");
      }
    }
  };
  return (
    <Container size={460} my={30}>
      <Title className={classes.title} ta="center">
        Forgot your password?
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Enter your email to get a reset link
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <TextInput
          label="Your email"
          placeholder="me@mantine.dev"
          required
          ref={email}
        />
        <Group justify="space-between" mt="lg" className={classes.controls}>
          <Anchor c="dimmed" size="sm" className={classes.control}>
            <Center inline>
              <IconArrowLeft
                size={12}
                stroke={1.5}
                onClick={() => navigate("/")}
              />
              <Box ml={5}>Back to the login page</Box>
            </Center>
          </Anchor>
          <Button
            className={classes.control}
            styles={{
              root: {
                backgroundColor: "black",
                color: "white",
                fontWeight: 500,
                "&:hover": { backgroundColor: "#222" },
              },
            }}
            onClick={handleClick}
          >
            Reset password
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
