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
import {
  SIGN_UP_DESCRIPTION,
  SIGN_UP_HEADER,
  SIGN_UP_RULE_1,
  SIGN_UP_RULE_2,
  SIGN_UP_RULE_3,
  SIGN_UP_RULE_4,
  SIGN_UP_RULE_5,
  STUDY,
  UPDATE_PASSWORD_BUTTON_TEXT,
} from '~/constants';
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
  const [_error, setError] = useState('');

  const rules = checkRules(password_1);
  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (equalPasswords(password_1, password_2)) {
        navigate(STUDY);
        displayNotifications('Password Change Successful', '', 'green');
        navigate(STUDY);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
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
          <Text c={rules.matchesLen ? 'green' : 'red'}>{SIGN_UP_RULE_1}</Text>
          <Text c={rules.hasLowercase ? 'green' : 'red'}>{SIGN_UP_RULE_2}</Text>
          <Text c={rules.hasUppercase ? 'green' : 'red'}>{SIGN_UP_RULE_3}</Text>
          <Text c={rules.hasDigit ? 'green' : 'red'}>{SIGN_UP_RULE_4}</Text>
          <Text c={rules.hasSpecial ? 'green' : 'red'}>{SIGN_UP_RULE_5}</Text>
        </Paper>
        <Paper mt={30} p={22} radius='md' shadow='sm' withBorder>
          <Title ff='Inter, sans-serif' ta='center'>
            {SIGN_UP_HEADER}
          </Title>
          <Text
            c='gray'
            style={{
              fontSize: 'var(--mantine-font-size-xs)',
              marginTop: '5px',
              textAlign: 'center',
            }}
          >
            {SIGN_UP_DESCRIPTION}
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
              {UPDATE_PASSWORD_BUTTON_TEXT}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};
