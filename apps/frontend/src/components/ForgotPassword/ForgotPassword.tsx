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
import { displayNotifications } from '~/utilities/notifications/displayNotifications';
import { validateEmail } from '~/utilities/validation';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      displayNotifications('Missing Field', 'Provide a valid Email', 'red');
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
        Forgot your password?
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Enter your email to get a reset link
      </Text>

      <Paper mt="xl" p={30} radius="md" shadow="md" withBorder>
        <form onSubmit={handleClick}>
          <TextInput
            label="Your email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
          />
          <Group
            justify="space-between"
            mt="lg"
            style={{
              flexDirection: 'column',
            }}
          >
            <Anchor
              c="dimmed"
              size="sm"
              style={{
                textAlign: 'center',
                width: '100%',
              }}
            >
              <Center inline>
                <IconArrowLeft
                  data-testid="back-arrow"
                  onClick={() => navigate('/')}
                  size={12}
                  stroke={1.5}
                />
                <Box ml={5}>Back to the login page</Box>
              </Center>
            </Anchor>
            <Button
              styles={{
                root: {
                  '&:hover': { backgroundColor: '#222' },
                  backgroundColor: 'black',
                  color: 'white',
                  fontWeight: 500,
                  textAlign: 'center', // move inside root
                  width: '100%', // move inside root
                },
              }}
              type="submit"
            >
              Reset password
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
