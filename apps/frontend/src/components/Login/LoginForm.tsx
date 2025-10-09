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
  MantineProvider,
  Image,
  Center,
} from "@mantine/core";
import classes from "./AuthenticationTitle.module.css";
import placeholder from "~/assets/landscape-placeholder.svg";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const navigate = useNavigate();
  const theme = createTheme({
    fontSizes: {
      xs: "0.5rem",
      sm: "0.9rem",
      md: "1.1rem",
      lg: "1.25rem",
      xl: "1.5rem",
    },

    fontFamily: "Verdana, sans-serif",
    fontFamilyMonospace: "Monaco, Courier, monospace",

    headings: {
      fontFamily: "Outfit, sans-serif",
    },
  });

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <Center>
          <Image
            h={200}
            w="auto"
            src={placeholder}
            alt="Description of your image"
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
          placeholder="you@mantine.dev"
          required
          radius="md"
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
          styles={{
            root: {
              backgroundColor: "black",
              color: "white",
              fontWeight: 500,
              "&:hover": { backgroundColor: "#222" },
            },
          }}
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
