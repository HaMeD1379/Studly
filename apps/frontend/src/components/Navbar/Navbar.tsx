// ----------------------------------------------------------------------------
// Group: Group 3 — COMP 4350: Software Engineering 2
// Project: Studly
// Author: Hamed Esmaeilzadeh (team member)
// Generated / scaffolded with assistance from ChatGPT (GPT-5 Thinking mini)
// Date: 2025-10-07
// Modified: 2025-10-26
// ----------------------------------------------------------------------------
import { AppShell, Button, Text, Flex, Divider } from '@mantine/core'
import { IconMedal, IconHome, IconClock, IconMedal2 } from '@tabler/icons-react';
import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type NavbarProps = {
  children: ReactNode;
}

type StyledButtonProps = {
  children: ReactNode,
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
        <StyledButton path='/badges'>
          <Flex align='center' gap={4}>
            <IconMedal2 size={20} />
            Badges
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