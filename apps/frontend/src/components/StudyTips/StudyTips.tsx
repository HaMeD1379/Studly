import { Flex, Text } from '@mantine/core';
import {
  IconBulbFilled,
  IconDeviceMobileOff,
  IconTargetArrow,
  IconTrophyFilled,
} from '@tabler/icons-react';
import {
  STUDY_TIPS_1,
  STUDY_TIPS_2,
  STUDY_TIPS_3,
  STUDY_TIPS_4,
  STUDY_TIPS_HEADER,
} from '~/constants';

export const StudyTips = () => {
  return (
    <Flex bd='1px solid lightgray' bdrs={8} direction='column' p={24}>
      <Text pb={24}>{STUDY_TIPS_HEADER}</Text>
      <Flex direction='column' rowGap={8}>
        <Flex align='center' gap={6}>
          <IconBulbFilled color='#FFDD69' size={15} />
          <Text>{STUDY_TIPS_1}</Text>
        </Flex>
        <Flex align='center' gap={6}>
          <IconTargetArrow color='#DE4777' size={15} />
          <Text>{STUDY_TIPS_2}</Text>
        </Flex>
        <Flex align='center' gap={6}>
          <IconDeviceMobileOff color='#696CBB' size={15} />
          <Text>{STUDY_TIPS_3}</Text>
        </Flex>
        <Flex align='center' gap={6}>
          <IconTrophyFilled color='#F3B752' size={15} />
          <Text>{STUDY_TIPS_4}</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
