import {
  Anchor,
  Box,
  Button,
  Center,
  Checkbox,
  Container,
  Group,
  Image,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import placeholder from "~/assets/landscape-placeholder.svg";
import { useNavigate, Form, useActionData } from "react-router-dom";
import { useState } from "react";
import { displayNotifications } from "~/utilities/notifications/displayNotifications";
import { validateEmail } from "~/utilities/validation";
import { loginAction } from "~/actions";

export function LoginForm() {
  const navigate = useNavigate();
  //display notifications based on the response from the api so like error messages

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    if (!email || !password || !(email && validateEmail(email))) {
      e.preventDefault();
      displayNotifications("Mismatch", "Provide a valid Email", "red");
    }
  };

  return (
    <Box
      style={{
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        margin: '0',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <Container my={40} size={420}>
        <Paper mt={30} p={22} radius='md' shadow='sm' withBorder>
          <Center>
            <Image
              alt='Description of your image'
              h={200}
              src={placeholder}
              w='auto'
            />
          </Center>
          <Title ff='Inter, sans-serif' ta='center'>
            Welcome to Studly
          </Title>
          <Text
            c='gray'
            style={{
              fontSize: 'var(--mantine-font-size-xs)',
              marginTop: '5px',
              textAlign: 'center',
            }}
          >
            Sign in to your account to continue your learning journey
          </Text>
          <Form method="post" onSubmit={handleLogin}>
            <TextInput
              label="Email"
              name="email"
              placeholder="you@mantine.dev"
              required
              radius="md"
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
              label="Password"
              name="password"
              placeholder="Your password"
              required
              mt="md"
              radius="md"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Group justify='space-between' mt='lg'>
              <Checkbox label='Remember me' />
              <br />
              <Anchor
                c='black'
                component='button'
                onClick={() => navigate('/forgot-password')}
                size='sm'
              >
                Forgot password?
              </Anchor>
            </Group>
            <Button
              fullWidth
              mt='xl'
              radius='md'
              styles={{
                root: {
                  '&:hover': { backgroundColor: '#222' },
                  backgroundColor: 'black',
                  color: 'white',
                  fontWeight: 500,
                },
              }}
              type='submit'
            >
              Sign in
            </Button>
          </Form>
          <br />
          <Text
            style={{
              color: 'var(--mantine-color-dimmed)',
              fontSize: 'var(--mantine-font-size-xs)',
              marginTop: '5px',
              textAlign: 'center',
            }}
          >
            Do not have an account?{' '}
            <Anchor
              onClick={() => navigate('/signup')}
              styles={{
                root: {
                  color: 'black',
                  fontWeight: 400,
                },
              }}
            >
              Sign Up
            </Anchor>
          </Text>
        </Paper>
      </Container>
    </Box>
  );
}
