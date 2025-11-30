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
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { Form, useActionData, useNavigate } from 'react-router-dom';
import logo from '~/assets/logo.png';
import {
  FORGOT_PASSWORD,
  LOGIN_BUTTON_TEXT,
  LOGIN_DESCRIPTION,
  LOGIN_FORGOT_PASSWORD_BUTTON_TEXT,
  LOGIN_HEADER,
  LOGIN_SIGN_UP_BUTTON_TEXT,
  LOGIN_SIGN_UP_PREFIX,
  SIGNUP,
} from '~/constants';
import { displayNotifications } from '~/utilities/notifications/displayNotifications';
import { validateEmail } from '~/utilities/validation';

export const LoginForm = () => {
  const navigate = useNavigate();
  const actionData = useActionData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    if (!email || !password || !validateEmail(email)) {
      e.preventDefault();
      displayNotifications('Mismatch', 'Provide a valid email', 'red');
    }
  };

  useEffect(() => {
    if (!actionData) return;
    const message = actionData.message;

    if (typeof message === 'string' && message.includes('401')) {
      displayNotifications('Login Error', 'Invalid Credentials', 'red');
    }
  }, [actionData]);

  return (
    <Box
      style={{
        alignItems: 'center',
        background: 'linear-gradient(135deg, #e0f0ff 0%, #4a90e2 100%)',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <Container size={420}>
        <Paper
          p={30}
          radius='xl'
          style={{
            background: 'white',
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
          withBorder
        >
          <Center mb='md'>
            <Image alt='Logo' height={220} src={logo} width='auto' />
          </Center>

          <Stack>
            <Title c='#222' fw={700} order={2} ta='center'>
              {LOGIN_HEADER}
            </Title>
            <Text c='dimmed' ta='center'>
              {LOGIN_DESCRIPTION}
            </Text>
          </Stack>

          <Form method='post' onSubmit={handleLogin}>
            <TextInput
              label='Email'
              mt='md'
              name='email'
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@studly.com'
              radius='md'
              required
              styles={{
                input: { backgroundColor: '#f8f9fa', color: '#222' },
                label: { color: '#222', fontWeight: 500 },
              }}
              variant='filled'
            />
            <PasswordInput
              label='Password'
              mt='md'
              name='password'
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Your password'
              radius='md'
              required
              styles={{
                input: { backgroundColor: '#f8f9fa', color: '#222' },
                label: { color: '#222', fontWeight: 500 },
              }}
              variant='filled'
            />

            <Group mt='md'>
              <Checkbox label='Remember me' />
              <Anchor
                component='button'
                onClick={() => navigate(FORGOT_PASSWORD)}
                size='sm'
                variant='text'
              >
                {LOGIN_FORGOT_PASSWORD_BUTTON_TEXT}
              </Anchor>
            </Group>

            <Button fullWidth mt='xl' radius='md' size='md' type='submit'>
              {LOGIN_BUTTON_TEXT}
            </Button>
          </Form>

          <Text c='dimmed' mt='md' ta='center'>
            {LOGIN_SIGN_UP_PREFIX}{' '}
            <Anchor
              component='button'
              fw={600}
              onClick={() => navigate(SIGNUP)}
            >
              {LOGIN_SIGN_UP_BUTTON_TEXT}
            </Anchor>
          </Text>
        </Paper>
      </Container>
    </Box>
  );
};
