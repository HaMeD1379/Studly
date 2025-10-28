import {
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { equalPasswords } from "~/utilities/testing/passwordValidation";
import { displayNotifications } from "~/utilities/notifications/displayNotifications";
import { useState } from "react";
import { Box } from "@mantine/core";

export function UpdatePassword() {
  const passwordLen = 8;
  const checkRules = (value: string) => ({
    matchesLen: value.length > passwordLen,
    hasLowercase: /[a-z]/.test(value),
    hasUppercase: /[A-Z]/.test(value),
    hasDigit: /\d/.test(value),
    hasSpecial: /[@#$%^&*()\-_+=]/.test(value),
  });

  const navigate = useNavigate();

  const [password_1, setPassword_1] = useState("");
  const [password_2, setPassword_2] = useState("");
  const [error, setError] = useState("");

  const rules = checkRules(password_1);
  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (equalPasswords(password_1, password_2)) {
        navigate("/study");
        displayNotifications("Password Change Successful", "", "green");
        navigate("/study");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        console.log(err);
      } else {
        setError("An unexpected error occurred");
        console.log(error);
      }
    }
  };

  return (
    <Box
      style={{
        backgroundColor: "#f0f0f0",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "center",
        margin: "0",
      }}
    >
      <Container size={420} my={40} className="classes.container">
        <Paper withBorder shadow="xl" p={22} mt={30} radius="lg">
          <Text c={rules.matchesLen ? "green" : "red"}>
            • Password must be at least one 8 characters long
          </Text>
          <Text c={rules.hasLowercase ? "green" : "red"}>
            • Password must contain at least one lowercase letter
          </Text>
          <Text c={rules.hasUppercase ? "green" : "red"}>
            • Password must contain at least one uppercase letter
          </Text>
          <Text c={rules.hasDigit ? "green" : "red"}>
            • Password must contain at least one digit (0-9)
          </Text>
          <Text c={rules.hasSpecial ? "green" : "red"}>
            • Password must contain at least one special character (@, #, $, %,
            ^, &, *, (, ), -, _, +, =)
          </Text>
        </Paper>
        <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
          <Title ta="center" ff="Inter, sans-serif">
            Join Studly
          </Title>
          <Text
            c="gray"
            style={{
              fontSize: "var(--mantine-font-size-xs)",
              textAlign: "center",
              marginTop: "5px",
            }}
          >
            Create your account and start your gamified learning journey
          </Text>
          <form onSubmit={handleClick}>
            <PasswordInput
              onChange={(e) => setPassword_1(e.target.value)}
              label="Enter new Password"
              placeholder="Create a password"
              required
              mt="md"
              radius="md"
            />
            <PasswordInput
              onChange={(e) => setPassword_2(e.target.value)}
              label="Confirm New Password"
              placeholder="Confirm your password"
              required
              mt="md"
              radius="md"
            />
            <Button
              fullWidth
              mt="xl"
              radius="md"
              styles={{
                root: {
                  backgroundColor: "black",
                  color: "white",
                  fontWeight: 500,
                  "&:hover": { backgroundColor: "#222" },
                },
              }}
              type="submit"
            >
              Update Password
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
