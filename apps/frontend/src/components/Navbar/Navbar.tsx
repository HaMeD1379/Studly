import { AppShell, Button, Divider, Flex, Text } from '@mantine/core';
import {
  IconClock,
  IconHome,
  IconLogout,
  IconMedal,
  IconMedal2,
} from '@tabler/icons-react';
import { Form, useLocation, useNavigate } from 'react-router-dom';

type NavbarProps = {
  children: React.ReactNode;
};

type StyledButtonProps = {
  children: React.ReactNode;
  path: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
};

export const Navbar = ({ children }: NavbarProps) => {
  return (
    <AppShell
      navbar={{
        breakpoint: 'sm',
        width: 200,
      }}
      padding={24}
    >
      <AppShell.Navbar p='md'>
        {/* Wrap the whole navbar content in a vertical Flex */}
        <Flex direction='column' h='100%'>
          {/* Header */}
          <Flex align='center' gap={4} pl={16} py={8}>
            <IconMedal color='#228be6' />
            <Text fw={900} size='lg'>
              Studly
            </Text>
          </Flex>

          <Divider my='sm' />

          {/* Main navigation buttons */}
          <Flex direction='column' gap={4}>
            <StyledButton path='/home'>
              <Flex align='center' gap={4}>
                <IconHome size={20} />
                Home
              </Flex>
            </StyledButton>
            <StyledButton path='/study'>
              <Flex align='center' gap={4}>
                <IconClock size={20} />
                Study Session
              </Flex>
            </StyledButton>
            <StyledButton path='/badges'>
              <Flex align='center' gap={4}>
                <IconMedal2 size={20} />
                Badges
              </Flex>
            </StyledButton>
          </Flex>

          {/* Spacer pushes logout to bottom */}
          <Flex direction='column' mt='auto'>
            <Divider my='sm' />
            <Form action='/logout' method='post'>
              <StyledButton path='/' type='submit'>
                <Flex align='center' gap={4}>
                  <IconLogout size={20} />
                  Logout
                </Flex>
              </StyledButton>
            </Form>
          </Flex>
        </Flex>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

const StyledButton = ({ children, path, type, onClick }: StyledButtonProps) => {
  const navigate = useNavigate();
  const currentPath = useLocation()?.pathname;
  const handleClick = () => {
    if (onClick) onClick(); //execute onclick method if we get one
    navigate(path);
  };

  return (
    <Button
      {...(type ? { type } : {})}
      color={currentPath === path ? 'blue' : 'dark-gray'}
      fullWidth
      justify='left'
      onClick={handleClick}
      radius='md'
      variant={currentPath === path ? 'filled' : 'transparent'}
    >
      {children}
    </Button>
  );
};
