import {
	Anchor,
	Button,
	Checkbox,
	Container,
	Group,
	Paper,
	PasswordInput,
	Text,
	TextInput,
	Title,
	Image,
	Center,
	Box,
} from '@mantine/core';
import placeholder from '~/assets/landscape-placeholder.svg';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { displayNotifications } from '~/utilities/notifications/displayNotifications';
import { validateEmail } from '~/utilities/validation';
export function LoginForm() {
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (email && password) {
			if (!validateEmail(email)) {
				displayNotifications('Mismatch', 'Provide a valid Email', 'red');
			}
			navigate('/study');
		}
	};

	return (
		<Box
			style={{
				backgroundColor: '#f0f0f0',
				padding: '20px',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '100vh',
				margin: '0',
			}}
		>
			<Container size={420} my={40}>
				<Paper withBorder shadow="sm" p={22} mt={30} radius="md">
					<Center>
						<Image
							h={200}
							w="auto"
							src={placeholder}
							alt="Description of your image"
						/>
					</Center>
					<Title ta="center" ff="Inter, sans-serif">
						Welcome to Studly
					</Title>
					<Text
						c="gray"
						style={{
							fontSize: 'var(--mantine-font-size-xs)',
							textAlign: 'center',
							marginTop: '5px',
						}}
					>
						Sign in to your account to continue your learning journey
					</Text>
					<form onSubmit={handleLogin}>
						<TextInput
							label="Email"
							placeholder="you@mantine.dev"
							required
							radius="md"
							onChange={(e) => setEmail(e.target.value)}
						/>
						<PasswordInput
							label="Password"
							placeholder="Your password"
							required
							mt="md"
							radius="md"
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Group justify="space-between" mt="lg">
							<Checkbox label="Remember me" />
							<br />
							<Anchor
								c="black"
								component="button"
								size="sm"
								onClick={() => navigate('/forgot-password')}
							>
								Forgot password?
							</Anchor>
						</Group>
						<Button
							type="submit"
							fullWidth
							mt="xl"
							radius="md"
							styles={{
								root: {
									backgroundColor: 'black',
									color: 'white',
									fontWeight: 500,
									'&:hover': { backgroundColor: '#222' },
								},
							}}
						>
							Sign in
						</Button>
					</form>
					<br />
					<Text
						style={{
							color: 'var(--mantine-color-dimmed)',
							fontSize: 'var(--mantine-font-size-xs)',
							textAlign: 'center',
							marginTop: '5px',
						}}
					>
						Do not have an account?{' '}
						<Anchor
							styles={{
								root: {
									color: 'black',
									fontWeight: 400,
								},
							}}
							onClick={() => navigate('/signup')}
						>
							Sign Up
						</Anchor>
					</Text>
				</Paper>
			</Container>
		</Box>
	);
}
