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
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BACK_TO_LOGIN,
  FORGOT_PASSWORD_EMAIL,
  FORGOT_PASSWORD_HEADER,
  LOGIN,
  RESET_PASSWORD_BUTTON_TEXT,
} from '~/constants';
import { displayNotifications } from '~/utilities/notifications/displayNotifications';
import { validateEmail } from '~/utilities/validation';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      displayNotifications('Missing Field', 'Provide a valid email', 'red');
      return;
    }
    if (validateEmail(email)) {
      displayNotifications(
        'Accepted',
        'A reset link has been sent to your email',
        'green',
      );
    }
  };
  return (
    <Container my={30} size={460}>
      <Title
        style={{
          fontfamily: 'Outfit, var(--mantine-font-family)',
          fontSize: '26px',
          fontweight: '500',
          textAlign: 'center',
        }}
      >
        {FORGOT_PASSWORD_HEADER}
      </Title>
      <Text c='dimmed' fz='sm' ta='center'>
        {FORGOT_PASSWORD_EMAIL}
      </Text>

      <Paper mt='xl' p={30} radius='md' shadow='md' withBorder>
        <form onSubmit={handleClick}>
          <TextInput
            label='Your email'
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Your email'
          />
          <Group
            justify='space-between'
            mt='lg'
            style={{
              flexDirection: 'column',
            }}
          >
            <Anchor
              c='dimmed'
              size='sm'
              style={{
                textAlign: 'center',
                width: '100%',
              }}
            >
              <Center inline>
                <IconArrowLeft
                  data-testid='back-arrow'
                  onClick={() => navigate(LOGIN)}
                  size={12}
                  stroke={1.5}
                />
                <Box ml={5}>{BACK_TO_LOGIN}</Box>
              </Center>
            </Anchor>
            <Button
              styles={{
                root: {
                  '&:hover': { backgroundColor: '#222' },
                  backgroundColor: 'black',
                  color: 'white',
                  fontWeight: 500,
                  textAlign: 'center',
                  width: '100%',
                },
              }}
              type='submit'
            >
              {RESET_PASSWORD_BUTTON_TEXT}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};
