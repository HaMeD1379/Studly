import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  createTheme,
  Image,
  Center,
} from "@mantine/core";
import classes from "~/Styles/AuthenticationTitle.module.css";
import placeholder from "~/assets/landscape-placeholder.svg";
import { useNavigate } from "react-router";
import { validateEmail } from "~/utilities/testing/emailValidation";
import { useRef } from "react";
import { notifications } from "@mantine/notifications";

export function LoginForm() {
  const navigate = useNavigate();
  const email = useRef<HTMLInputElement>(null);
  const passw = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (email.current) {
      if (validateEmail(email.current.value)) {
        navigate("/study");
      }
    }
  };

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <Center>
          <Image
            h={200}
            w="auto"
            src={placeholder}
          />
        </Center>
        <Title ta="center" ff="Inter, sans-serif">
          Welcome to Studly
        </Title>
        <Text c="gray" className={classes.subtitle_2}>
          Sign in to your account to continue your learning journey
        </Text>
        <TextInput
          label="Email"
          placeholder="Your email"
          required
          radius="md"
          ref={email}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          radius="md"
        />
        <Group justify="space-between" mt="lg">
          <Checkbox label="Remember me" />
          <br />
          <Anchor
            c="black"
            component="button"
            size="sm"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </Anchor>
        </Group>
        <Button
          fullWidth
          mt="xl"
          radius="md"
          onClick={handleClick}
        >
          Sign in
        </Button>
        <br />
        <Text className={classes.subtitle}>
          Do not have an account?{" "}
          <Anchor
            styles={{
              root: {
                color: "black",
                fontWeight: 400,
              },
            }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}
