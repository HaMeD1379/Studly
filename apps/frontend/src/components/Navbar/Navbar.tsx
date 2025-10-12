import { AppShell, Button, Text, Divider } from '@mantine/core'
import { useNavigate, useLocation } from 'react-router';

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
        <Text py={8} pl={32} fw={900} size='lg'>Studly</Text>
        <Divider py={8}/>
        <StyledButton path='/home'>Home</StyledButton>
        <StyledButton path='/study'>Study Session</StyledButton>
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