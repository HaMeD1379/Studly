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
import classes from "./ForgotPassword.module.css";
import { useNavigate } from "react-router";

export function ForgotPassword() {
  const navigate = useNavigate();
  return (
    <Container size={460} my={30}>
      <Title className={classes.title} ta="center">
        Forgot your password?
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Enter your email to get a reset link
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <TextInput label="Your email" placeholder="me@mantine.dev" required />
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
          >
            Reset password
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
