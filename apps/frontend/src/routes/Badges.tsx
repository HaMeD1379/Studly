import { Navbar } from '~/components'
import { Box, Text } from '@mantine/core'

export const Badges = () => {
  return (
    <Navbar>
      <Box mx={48} w={1150}>
        <Text size='xl' fw={700}>Badge Collection</Text>
        <Text size='md' fw={300} mb={32}>Earn badges by completing and hitting milestones</Text>
      </Box>
    </Navbar>
  );
};