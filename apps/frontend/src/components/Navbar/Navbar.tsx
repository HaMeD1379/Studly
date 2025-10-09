import { AppShell } from '@mantine/core'

type NavbarProps = {
  children: React.ReactNode;
}

export const Navbar = ({ children }: NavbarProps) => {

  return (
    <AppShell
      padding={64}
      navbar={{
        width: 200,
        breakpoint: 'sm'
      }}
    >
      <AppShell.Navbar>
        Text
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}