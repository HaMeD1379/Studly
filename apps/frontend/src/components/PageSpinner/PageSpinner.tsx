import { Flex, Loader } from '@mantine/core';
import { Navbar } from '~/components';

export const PageSpinner = () => {
  return (
    <Navbar>
      <Flex justify='center' pt={100}>
        <Loader c='blue' size={100} />
      </Flex>
    </Navbar>
  );
};
