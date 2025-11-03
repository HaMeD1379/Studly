import { Navbar, ProfileCard, ProfileStatistics, UserCard } from "~/components";
import { Container, Stack } from "@mantine/core";
export const UserProfile = () => {
  return (
    <Navbar>
      <Container size="md" p="xl">
        <Stack>
          <UserCard />

          <ProfileCard />

          <ProfileStatistics />
        </Stack>
      </Container>
    </Navbar>
  );
};
