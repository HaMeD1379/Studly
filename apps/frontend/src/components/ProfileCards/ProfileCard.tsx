import {
  Card,
  Center,
  Container,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconAward,
  IconClock,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

export const ProfileCard = () => {
  const stats = [
    {
      label: "Day Streak",
      value: "12",
      icon: <IconTrendingUp color="green" size={28} />,
    },
    {
      label: "Total Study",
      value: "257h",
      icon: <IconClock color="blue" size={28} />,
    },
    {
      label: "Badges",
      value: "18",
      icon: <IconAward color="orange" size={28} />,
    },
    {
      label: "Friends",
      value: "24",
      icon: <IconUsers color="purple" size={28} />,
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg" w="100%">
      {stats.map((item) => (
        <Card
          key={item.label}
          data-testid={`${item.label.toLowerCase().replace(/\s+/g, "-")}-card`}
          p="lg"
          radius="md"
          shadow="sm"
          withBorder
          style={{ borderRadius: "12px" }}
        >
          <Center style={{ flexDirection: "column", gap: "6px" }}>
            {item.icon}
            <Text fw={700} fz="xl">
              {item.value}
            </Text>
            <Text c="dimmed" fz="sm">
              {item.label}
            </Text>
          </Center>
        </Card>
      ))}
    </SimpleGrid>
  );
};
