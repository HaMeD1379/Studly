import {
  Box,
  Card,
  Center,
  Flex,
  SegmentedControl,
  SimpleGrid,
  Text,
  TextInput,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import {
  FRIENDS_HEADER_DESCRIPTION,
  FRIENDS_SEARCHBAR_PLACEHOLDER,
  FRIENDS_TAB_FRIENDS,
} from '~/constants';
import { stats, friendsTabs as tabs } from '~/constants/friends';
export const FriendsHeader = () => {
  return (
    <Box>
      <Flex direction='column' gap='md' p='lg' w='30%'>
        <Text data-testid='Friends header' fw={700} fz='h1'>
          {FRIENDS_TAB_FRIENDS}
        </Text>
        <Text c='dimmed'>{FRIENDS_HEADER_DESCRIPTION}</Text>
        <TextInput
          leftSection={<IconSearch />}
          placeholder={FRIENDS_SEARCHBAR_PLACEHOLDER}
          variant='filled'
        />
      </Flex>

      <Flex direction='row' gap='md' p='lg'>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing='lg' w='100%'>
          {stats.map((item) => (
            <Card
              data-testid={`${item.label
                .toLowerCase()
                .replace(/\s+/g, '-')}-card`}
              key={item.label}
              p='lg'
              radius='md'
              shadow='sm'
              style={{ borderRadius: '12px' }}
              withBorder
            >
              <Center style={{ flexDirection: 'column', gap: '6px' }}>
                {item.icon}
                <Text fw={700} fz='xl'>
                  {item.value}
                </Text>
                <Text c='dimmed' fz='sm'>
                  {item.label}
                </Text>
              </Center>
            </Card>
          ))}
        </SimpleGrid>
      </Flex>

      <Flex p='lg'>
        <SegmentedControl
          data={tabs.map((t) => ({ label: t, value: t.toLowerCase() }))}
          fullWidth
          radius='xl'
          size='md'
        />
      </Flex>
    </Box>
  );
};
