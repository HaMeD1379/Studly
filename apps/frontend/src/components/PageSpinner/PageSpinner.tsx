import { Flex, Loader } from '@mantine/core';

export const PageSpinner = () => {
  return (
    <Flex justify='center' pt={100}>
      <Loader aria-label='loading-spinner' c='blue' size={100} />
    </Flex>
  );
};
