import { AppShell, Button, Text, Flex, Divider } from '@mantine/core'
import { useNavigate, useLocation } from 'react-router';
import { IconMedal, IconHome, IconClock } from '@tabler/icons-react';

type NavbarProps = {
  children: React.ReactNode;
}

type StyledButtonProps = {
  children: React.ReactNode,
  path: string
}

export const Navbar = ({ children }: NavbarProps) => {
  return (
    <AppShell
      padding={24}
      navbar={{
        width: 200,
        breakpoint: 'sm'
      }}
    >
      <AppShell.Navbar>
        <Flex align='center' py={8} pl={32} gap={4}>
          <IconMedal color='#228be6' />
          <Text fw={900} size='lg'>Studly</Text>
        </Flex>
        <Divider py={8}/>
        <StyledButton path='/home'>
          <Flex align='center' gap={4}>
            <IconHome size={20}/>
            Home
          </Flex>
        </StyledButton>
        <StyledButton path='/study'>
          <Flex align='center' gap={4}>
            <IconClock size={20} />
            Study Session
          </Flex>
        </StyledButton>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

const StyledButton = ({ children, path }: StyledButtonProps) => {
  const navigate = useNavigate();
  const currentPath = useLocation()?.pathname;

  return (
    <Button
      onClick={() => navigate(path)}
      mx={16}
      my={2}
      bdrs={8}
      variant={currentPath === path ? 'filled' : 'transparent'}
      color={currentPath === path ? 'blue' : 'dark-gray'}
      justify='left'
    >
      {children}
    </Button>
  )
}