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
import { useState } from 'react';
import {
  Form,
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from 'react-router-dom';
import {
  BADGES,
  HOME,
  LOGOUT,
  NAVBAR_BADGES,
  NAVBAR_HEADER,
  NAVBAR_HOME,
  NAVBAR_LOGOUT,
  NAVBAR_PROFILE,
  NAVBAR_SETTINGS,
  NAVBAR_STUDY,
  PROFILE,
  SETTINGS,
  STUDY,
} from '~/constants';
import { PageSpinner } from '../PageSpinner/PageSpinner';

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
  const isLoading = navigation.state === 'loading';

  const [currentlySelectedPath, setCurrentlySelectedPath] =
    useState<string>(location);

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
              onClick={() => setCurrentlySelectedPath(HOME)}
              path={HOME}
            >
              <Flex align='center' gap={4}>
                <IconHome size={20} />
                {NAVBAR_HOME}
              </Flex>
            </StyledButton>
            <StyledButton
              currentlySelectedPath={currentlySelectedPath}
              onClick={() => setCurrentlySelectedPath(STUDY)}
              path={STUDY}
            >
              <Flex align='center' gap={4}>
                <IconClock size={20} />
                {NAVBAR_STUDY}
              </Flex>
            </StyledButton>
            <StyledButton
              currentlySelectedPath={currentlySelectedPath}
              onClick={() => setCurrentlySelectedPath(BADGES)}
              path={BADGES}
            >
              <Flex align='center' gap={4}>
                <IconMedal2 size={20} />
                {NAVBAR_BADGES}
              </Flex>
            </StyledButton>
            <StyledButton
              currentlySelectedPath={currentlySelectedPath}
              onClick={() => setCurrentlySelectedPath(PROFILE)}
              path={PROFILE}
            >
              <Flex align='center' gap={4}>
                <IconUser size={20} />
                {NAVBAR_PROFILE}
              </Flex>
            </StyledButton>
            <StyledButton
              currentlySelectedPath={currentlySelectedPath}
              onClick={() => setCurrentlySelectedPath(SETTINGS)}
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
            <Form action={LOGOUT} method='post'>
              <StyledButton
                currentlySelectedPath={currentlySelectedPath}
                isSubmit
                onClick={() => setCurrentlySelectedPath(LOGOUT)}
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
