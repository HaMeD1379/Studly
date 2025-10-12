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
} from "@mantine/core";
import classes from "~/Styles/AuthenticationTitle.module.css";
import { useNavigate } from "react-router";
import { useRef } from "react";
import { validateEmail } from "~/utilities/testing/emailValidation";
import { equalPasswords } from "~/utilities/testing/passwordValidation";

export function SignUpForm() {
  const navigate = useNavigate();
  const password_1 = useRef<HTMLInputElement>(null);
  const password_2 = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (password_1.current && password_2.current && email.current) {
      if (
        validateEmail(email.current.value) &&
        equalPasswords(password_1.current.value, password_2.current.value)
      ) {
        navigate("/study");
      }
    }
  };

  return (
    <Container size={420} my={40} className="classes.container">
      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <Title ta="center" ff="Inter, sans-serif">
          Join Studly
        </Title>
        <Text c="gray" className={classes.subtitle_2}>
          Create your account and start your gamified learning journey
        </Text>
        <TextInput
          label="Full Name"
          placeholder="Enter your full name"
          required
          radius="md"
        />
        <TextInput
          ref={email}
          label="Email"
          placeholder="yourname@gmail.com"
          required
          radius="md"
        />
        <PasswordInput
          ref={password_1}
          label="Password"
          placeholder="Create a password"
          required
          mt="md"
          radius="md"
        />
        <PasswordInput
          ref={password_2}
          label="Confirm Password"
          placeholder="Confirm your password"
          required
          mt="md"
          radius="md"
        />
        <Group justify="space-between" mt="lg">
          <Checkbox label="I agree to the Terms and Conditions" fw={700} />
        </Group>
        <Button
          fullWidth
          mt="xl"
          radius="md"
          onClick={handleClick}
        >
          Sign Up
        </Button>
        <br />
        <Text className={classes.subtitle}>
          Already have an account?{" "}
          <Anchor
            styles={{
              root: {
                color: "black",
                fontWeight: 400,
              },
            }}
            onClick={() => navigate("/")}
          >
            Sign in
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}
