import {
  Box,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { displayNotifications } from '~/utilities/notifications/displayNotifications';
import { equalPasswords } from '~/utilities/testing/passwordValidation';

export const UpdatePassword = () => {
  const passwordLen = 8;
  const checkRules = (value: string) => ({
    hasDigit: /\d/.test(value),
    hasLowercase: /[a-z]/.test(value),
    hasSpecial: /[@#$%^&*()\-_+=]/.test(value),
    hasUppercase: /[A-Z]/.test(value),
    matchesLen: value.length > passwordLen,
  });

  const navigate = useNavigate();

  const [password_1, setPassword_1] = useState('');
  const [password_2, setPassword_2] = useState('');
  const [error, setError] = useState('');

  const rules = checkRules(password_1);
  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (equalPasswords(password_1, password_2)) {
        navigate('/study');
        displayNotifications('Password Change Successful', '', 'green');
        navigate('/study');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        console.log(err);
      } else {
        setError('An unexpected error occurred');
        console.log(error);
      }
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
        minHeight: 'center',
        padding: '20px',
      }}
    >
      <Container className='classes.container' my={40} size={420}>
        <Paper mt={30} p={22} radius='lg' shadow='xl' withBorder>
          <Text c={rules.matchesLen ? 'green' : 'red'}>
            • Password must be at least one 8 characters long
          </Text>
          <Text c={rules.hasLowercase ? 'green' : 'red'}>
            • Password must contain at least one lowercase letter
          </Text>
          <Text c={rules.hasUppercase ? 'green' : 'red'}>
            • Password must contain at least one uppercase letter
          </Text>
          <Text c={rules.hasDigit ? 'green' : 'red'}>
            • Password must contain at least one digit (0-9)
          </Text>
          <Text c={rules.hasSpecial ? 'green' : 'red'}>
            • Password must contain at least one special character (@, #, $, %,
            ^, &, *, (, ), -, _, +, =)
          </Text>
        </Paper>
        <Paper mt={30} p={22} radius='md' shadow='sm' withBorder>
          <Title ff='Inter, sans-serif' ta='center'>
            Join Studly
          </Title>
          <Text
            c='gray'
            style={{
              fontSize: 'var(--mantine-font-size-xs)',
              marginTop: '5px',
              textAlign: 'center',
            }}
          >
            Create your account and start your gamified learning journey
          </Text>
          <form onSubmit={handleClick}>
            <PasswordInput
              label='Enter new Password'
              mt='md'
              onChange={(e) => setPassword_1(e.target.value)}
              placeholder='Create a password'
              radius='md'
              required
            />
            <PasswordInput
              label='Confirm New Password'
              mt='md'
              onChange={(e) => setPassword_2(e.target.value)}
              placeholder='Confirm your password'
              radius='md'
              required
            />
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
              Update Password
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};
