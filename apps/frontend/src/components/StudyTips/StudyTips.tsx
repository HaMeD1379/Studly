import { Flex, Text } from '@mantine/core'
import { IconBulbFilled, IconTargetArrow, IconDeviceMobileOff, IconTrophyFilled } from '@tabler/icons-react'

export const StudyTips = () => {
  return (
    <Flex p={24} direction='column' bdrs={8} bd='1px solid lightgray'>
      <Text pb={24}>Study Tips</Text>
      <Flex direction='column' rowGap={8}>
        <Flex align='center' gap={6}>
          <IconBulbFilled color='#FFDD69' size={15} />
          <Text>Take regular breaks to maintain focus</Text>
        </Flex>
        <Flex align='center' gap={6}>
          <IconTargetArrow color='#DE4777' size={15} />
          <Text>Set specific goals for each session</Text>
        </Flex>
        <Flex align='center' gap={6}>
          <IconDeviceMobileOff color='#696CBB' size={15} />
          <Text>Remove distractions from your study area</Text>
        </Flex>
        <Flex align='center' gap={6}>
          <IconTrophyFilled color='#F3B752' size={15} />
          <Text>Celebrate completing your sessions</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}