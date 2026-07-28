import PropTypes from 'prop-types';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Text
} from '@chakra-ui/react';

const SubscribersTab = ({ subscribers, onDeleteSubscriber }) => {
  return (
    <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100" overflowX="auto">
      <Heading size="md" mb={6} color="gray.900" fontWeight="700">Subscribers ({subscribers.length})</Heading>

      {subscribers.length === 0 ? (
        <Text fontSize="sm" color="gray.400" textAlign="center" py={8}>
          No email subscribers found.
        </Text>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th color="gray.500">Email Address</Th>
              <Th color="gray.500">Subscribed Date</Th>
              <Th color="gray.500" textAlign="right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {subscribers.map((sub) => (
              <Tr key={sub.id}>
                <Td fontWeight="600" color="gray.800">{sub.email}</Td>
                <Td color="gray.500">
                  {sub.date ? new Date(sub.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </Td>
                <Td textAlign="right">
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    colorScheme="red" 
                    onClick={() => onDeleteSubscriber(sub.id)}
                  >
                    Remove
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

SubscribersTab.propTypes = {
  subscribers: PropTypes.array.isRequired,
  onDeleteSubscriber: PropTypes.func.isRequired,
};

export default SubscribersTab;
