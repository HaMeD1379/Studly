import { AppShell, Button, Divider, Flex, Text } from '@mantine/core';
import {
  IconClock,
  IconHome,
  IconLogout,
  IconMedal,
  IconMedal2,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { Form, Outlet, useLocation, useNavigate, useNavigation } from 'react-router-dom';
import { BADGES, HOME, LOGOUT, PROFILE, SETTINGS, STUDY } from '~/constants';
import { PageSpinner } from '../PageSpinner/PageSpinner';
import { useState } from 'react';

type StyledButtonProps = {
  children: React.ReactNode;
  currentlySelectedPath: string;
  path: string;
  onClick: () => void;
  isSubmit?: boolean;
};

export const Navbar = () => {
  const navigation = useNavigation();
  const location = useLocation().pathname;
  const isLoading = navigation.state === "loading";

  const [currentlySelectedPath, setCurrentlySelectedPath] = useState<string>(location);

  return (
    <AppShell
      navbar={{
        breakpoint: 'sm',
        width: 200,
      }}
      padding={24}
    >
      <AppShell.Navbar p='md'>
        <Flex direction='column' h='100%'>
          <Flex align='center' gap={4} pl={16} py={8}>
            <IconMedal color='#228be6' />
            <Text fw={900} size='lg'>
              Studly
            </Text>
          </Flex>
          <Divider my='sm' />
          <Flex direction='column' gap={4}>
            <StyledButton path={HOME} currentlySelectedPath={currentlySelectedPath} onClick={() => setCurrentlySelectedPath(HOME)}>
              <Flex align='center' gap={4}>
                <IconHome size={20} />
                Home
              </Flex>
            </StyledButton>
            <StyledButton path={STUDY} currentlySelectedPath={currentlySelectedPath} onClick={() => setCurrentlySelectedPath(STUDY)}>
              <Flex align='center' gap={4}>
                <IconClock size={20} />
                Study Session
              </Flex>
            </StyledButton>
            <StyledButton path={BADGES} currentlySelectedPath={currentlySelectedPath} onClick={() => setCurrentlySelectedPath(BADGES)}>
              <Flex align='center' gap={4}>
                <IconMedal2 size={20} />
                Badges
              </Flex>
            </StyledButton>
            <StyledButton path={PROFILE} currentlySelectedPath={currentlySelectedPath} onClick={() => setCurrentlySelectedPath(PROFILE)}>
              <Flex align='center' gap={4}>
                <IconUser size={20} />
                Profile
              </Flex>
            </StyledButton>
            <StyledButton path={SETTINGS} currentlySelectedPath={currentlySelectedPath} onClick={() => setCurrentlySelectedPath(SETTINGS)}>
              <Flex align='center' gap={4}>
                <IconSettings size={20} />
                Settings
              </Flex>
            </StyledButton>
          </Flex>

          <Flex direction='column' mt='auto'>
            <Divider my='sm' />
            <Form action={LOGOUT} method='post'>
              <StyledButton path={LOGOUT} currentlySelectedPath={currentlySelectedPath} onClick={(() => setCurrentlySelectedPath(LOGOUT))} isSubmit>
                <Flex align='center' gap={4}>
                  <IconLogout size={20} />
                  Logout
                </Flex>
              </StyledButton>
            </Form>
          </Flex>
        </Flex>
      </AppShell.Navbar>

      <AppShell.Main>{isLoading ? <PageSpinner /> : <Outlet />}</AppShell.Main>
    </AppShell>
  );
};

const StyledButton = ({ children, currentlySelectedPath, path, onClick, isSubmit = false }: StyledButtonProps) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (isSubmit) {
      return;
    }

    onClick();
    navigate(path);
  };

  return (
    <Button
      {...(isSubmit ? { type: 'submit' } : {})}
      color={currentlySelectedPath === path ? 'blue' : 'dark-gray'}
      fullWidth
      justify='left'
      onClick={handleClick}
      radius='md'
      variant={currentlySelectedPath === path ? 'filled' : 'transparent'}
    >
      {children}
    </Button>
  );
};
