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
import {
  IconCircleFilled,
  IconSearch,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import {
  FRIENDS_CARD_ONLINE,
  FRIENDS_CARD_STUDYING,
  FRIENDS_HEADER_DESCRIPTION,
  FRIENDS_SEARCHBAR_PLACEHOLDER,
  FRIENDS_TAB_FRIENDS,
  FRIENDS_TAB_REQUESTS,
  FRIENDS_TAB_SUGGESTIONS,
} from '~/constants';
export const FriendsHeader = () => {
  const tabs = [
    FRIENDS_TAB_FRIENDS,
    FRIENDS_TAB_REQUESTS,
    FRIENDS_TAB_SUGGESTIONS,
  ];

  const stats = [
    {
      icon: <IconUsers color='blue' size={28} />,
      label: FRIENDS_TAB_FRIENDS,
      value: '4',
    },
    {
      icon: <IconUserPlus color='#40c057' size={28} />,
      label: FRIENDS_TAB_REQUESTS,
      value: '2',
    },
    {
      icon: <IconCircleFilled color='#40c057' size={28} />,
      label: FRIENDS_CARD_ONLINE,
      value: '2',
    },
    {
      icon: <IconCircleFilled color='blue' size={28} />,
      label: FRIENDS_CARD_STUDYING,
      value: '1',
    },
  ];

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
