import PropTypes from 'prop-types';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Text
} from '@chakra-ui/react';

const SubscribersTab = ({ subscribers, onDeleteSubscriber }) => {
  return (
    <Box bg="cardBg" p={6} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl" overflowX="auto">
      <Heading size="md" mb={6} color="text" fontWeight="700">Subscribers ({subscribers.length})</Heading>

      {subscribers.length === 0 ? (
        <Text fontSize="sm" color="mutedText" textAlign="center" py={8}>
          No email subscribers found.
        </Text>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th color="mutedText">Email Address</Th>
              <Th color="mutedText">Subscribed Date</Th>
              <Th color="mutedText" textAlign="right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {subscribers.map((sub) => (
              <Tr key={sub.id}>
                <Td fontWeight="600" color="text">{sub.email}</Td>
                <Td color="mutedText">
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
