import { render as testingLibraryRender } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

export const render = (ui: React.ReactNode) => {
	return testingLibraryRender(<>={ui}</>, {
		wrapper: ({ children }: { children: React.ReactNode }) => (
			<MantineProvider env="test">{children}</MantineProvider>
		),
	});
};
