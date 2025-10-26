import { MantineProvider } from '@mantine/core';
import { render as testingLibraryRender } from '@testing-library/react';
import { type ReactNode } from 'react';

export const render = (ui: ReactNode) => {
  return testingLibraryRender(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MantineProvider>{children}</MantineProvider>
    )
  });
}
