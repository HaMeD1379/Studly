import { AppShell, Button, Divider, Flex, Text } from '@mantine/core';
import {
  IconClock,
  IconHome,
  IconLogout,
  IconMedal,
  IconMedal2,
  IconSettings,
  IconTrophy,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import {
  Form,
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from 'react-router-dom';
import {
  BADGES,
  FRIENDS,
  FRIENDS_TAB_FRIENDS,
  HOME,
  LEADERBOARD,
  LOGIN,
  LOGOUT,
  NAVBAR_BADGES,
  NAVBAR_HEADER,
  NAVBAR_HOME,
  NAVBAR_LEADERBOARDS,
  NAVBAR_LOGOUT,
  NAVBAR_PROFILE,
  NAVBAR_SETTINGS,
  NAVBAR_STUDY,
  PROFILE,
  SETTINGS,
  STUDY,
} from '~/constants';
import { useNavbar } from '~/context';
import { userInfo } from '~/store';
import { PageSpinner } from '../PageSpinner/PageSpinner';

type StyledButtonProps = {
  children: React.ReactNode;
  currentlySelectedPath: string;
  path: string;
  onClick: (path: string) => void;
  isSubmit?: boolean;
};

export const Navbar = () => {
  const navigate = useNavigate();
  if (!userInfo.getState().accessToken) {
    navigate(LOGIN);
  }

  const navigation = useNavigation();
  const location = useLocation().pathname;
  const isLoading = navigation.state === 'loading';

  const [currentlySelectedPath, setCurrentlySelectedPath] =
    useState<string>(location);

  const { globalPath, setGlobalPath } = useNavbar(); // global

  useEffect(() => {
    if (globalPath !== currentlySelectedPath)
      setCurrentlySelectedPath(globalPath);
  }, [globalPath, currentlySelectedPath]);

  const handleNavClick = (path: string) => {
    setCurrentlySelectedPath(path); // update UI immediately
    setGlobalPath(path); // sync context
    navigate(path); // actually navigate
  };

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
              {NAVBAR_HEADER}
            </Text>
          </Flex>
          <Divider my='sm' />
          <Flex direction='column' gap={4}>
            <StyledButton
              currentlySelectedPath={currentlySelectedPath}
              onClick={() => handleNavClick(HOME)}
              path={HOME}
            >
              <Flex align='center' gap={4}>
                <IconHome size={20} />
                {NAVBAR_HOME}
              </Flex>
            </StyledButton>
            <StyledButton
              currentlySelectedPath={currentlySelectedPath}
              onClick={() => handleNavClick(STUDY)}
              path={STUDY}
            >
              <Flex align='center' gap={4}>
                <IconClock size={20} />
                {NAVBAR_STUDY}
              </Flex>
            </StyledButton>
            <StyledButton
              currentlySelectedPath={currentlySelectedPath}
              onClick={() => handleNavClick(BADGES)}
              path={BADGES}
            >
              <Flex align='center' gap={4}>
                <IconMedal2 size={20} />
                {NAVBAR_BADGES}
              </Flex>
            </StyledButton>
            <StyledButton
              currentlySelectedPath={currentlySelectedPath}
              onClick={() => handleNavClick(FRIENDS)}
              path={FRIENDS}
            >
              <Flex align='center' gap={4}>
                <IconUsers size={20} />
                {FRIENDS_TAB_FRIENDS}
              </Flex>
            </StyledButton>
            <StyledButton
              currentlySelectedPath={currentlySelectedPath}
              onClick={() => handleNavClick(LEADERBOARD)}
              path={LEADERBOARD}
            >
              <Flex align='center' gap={4}>
                <IconTrophy size={20} />
                {NAVBAR_LEADERBOARDS}
              </Flex>
            </StyledButton>
            <StyledButton
              currentlySelectedPath={currentlySelectedPath}
              onClick={() => handleNavClick(PROFILE)}
              path={PROFILE}
            >
              <Flex align='center' gap={4}>
                <IconUser size={20} />
                {NAVBAR_PROFILE}
              </Flex>
            </StyledButton>
            <StyledButton
              currentlySelectedPath={currentlySelectedPath}
              onClick={() => handleNavClick(SETTINGS)}
              path={SETTINGS}
            >
              <Flex align='center' gap={4}>
                <IconSettings size={20} />
                {NAVBAR_SETTINGS}
              </Flex>
            </StyledButton>
          </Flex>

          <Flex direction='column' mt='auto'>
            <Divider my='sm' />
            <Form
              action={LOGOUT}
              method='post'
              onSubmit={() => {
                setGlobalPath(HOME); // or ""
                setCurrentlySelectedPath(HOME); // clear highlight
              }}
            >
              <StyledButton
                currentlySelectedPath={currentlySelectedPath}
                isSubmit
                onClick={() => handleNavClick(HOME)}
                path={LOGOUT}
              >
                <Flex align='center' gap={4}>
                  <IconLogout size={20} />
                  {NAVBAR_LOGOUT}
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

const StyledButton = ({
  children,
  currentlySelectedPath,
  path,
  onClick,
  isSubmit = false,
}: StyledButtonProps) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (isSubmit) {
      return;
    }

    onClick(path);
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
