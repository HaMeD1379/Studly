// ----------------------------------------------------------------------------
// Group: Group 3 — COMP 4350: Software Engineering 2
// Project: Studly
// Author: Hamed Esmaeilzadeh (team member)
// Generated / scaffolded with assistance from ChatGPT (GPT-5 Thinking mini)
// Date: 2025-10-07
// Modified: 2025-10-26
// ----------------------------------------------------------------------------
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
