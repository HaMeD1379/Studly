import { AppShell, Button, Text, Flex, Divider } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router';
import {
	IconMedal,
	IconHome,
	IconClock,
	IconMedal2,
	IconLogout,
} from '@tabler/icons-react';

type NavbarProps = {
	children: React.ReactNode;
};

type StyledButtonProps = {
	children: React.ReactNode;
	path: string;
	onClick?: () => void;
};

export const Navbar = ({ children }: NavbarProps) => {
	return (
		<AppShell
			padding={24}
			navbar={{
				width: 200,
				breakpoint: 'sm',
			}}
		>
			<AppShell.Navbar p="md">
				{/* Wrap the whole navbar content in a vertical Flex */}
				<Flex direction="column" h="100%">
					{/* Header */}
					<Flex align="center" py={8} pl={16} gap={4}>
						<IconMedal color="#228be6" />
						<Text fw={900} size="lg">
							Studly
						</Text>
					</Flex>

					<Divider my="sm" />

					{/* Main navigation buttons */}
					<Flex direction="column" gap={4}>
						<StyledButton path="/home">
							<Flex align="center" gap={4}>
								<IconHome size={20} />
								Home
							</Flex>
						</StyledButton>
						<StyledButton path="/study">
							<Flex align="center" gap={4}>
								<IconClock size={20} />
								Study Session
							</Flex>
						</StyledButton>
						<StyledButton path="/badges">
							<Flex align="center" gap={4}>
								<IconMedal2 size={20} />
								Badges
							</Flex>
						</StyledButton>
					</Flex>

					{/* Spacer pushes logout to bottom */}
					<Flex direction="column" mt="auto">
						<Divider my="sm" />
						<StyledButton path="/">
							<Flex align="center" gap={4}>
								<IconLogout size={20} />
								Logout
							</Flex>
						</StyledButton>
					</Flex>
				</Flex>
			</AppShell.Navbar>

			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
};

const StyledButton = ({ children, path, onClick }: StyledButtonProps) => {
	const navigate = useNavigate();
	const currentPath = useLocation()?.pathname;
	const handleClick = () => {
		if (onClick) onClick(); //execute onclick method if we get one
		navigate(path);
	};

	return (
		<Button
			onClick={handleClick}
			variant={currentPath === path ? 'filled' : 'transparent'}
			color={currentPath === path ? 'blue' : 'dark-gray'}
			justify="left"
			radius="md"
			fullWidth
		>
			{children}
		</Button>
	);
};
