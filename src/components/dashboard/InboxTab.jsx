import PropTypes from 'prop-types';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, IconButton, Text, Button
} from '@chakra-ui/react';
import { MdOutlineMarkEmailRead, MdOutlineMarkEmailUnread } from 'react-icons/md';

const InboxTab = ({ messages, onToggleRead, onDeleteMessage }) => {
  return (
    <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100" overflowX="auto">
      <Heading size="md" mb={6} color="gray.900" fontWeight="700">Inbox Messages ({messages.length})</Heading>

      {messages.length === 0 ? (
        <Text fontSize="sm" color="gray.400" textAlign="center" py={8}>
          No messages received.
        </Text>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th color="gray.500">Status</Th>
              <Th color="gray.500">From</Th>
              <Th color="gray.500">Message</Th>
              <Th color="gray.500">Date</Th>
              <Th color="gray.500" textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {messages.map((msg) => (
              <Tr key={msg.id} bg={!msg.read ? "teal.50" : "transparent"}>
                <Td>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    colorScheme={msg.read ? "gray" : "teal"}
                    icon={msg.read ? <MdOutlineMarkEmailRead size={18} /> : <MdOutlineMarkEmailUnread size={18} />}
                    onClick={() => onToggleRead(msg)}
                    title={msg.read ? "Mark as Unread" : "Mark as Read"}
                    aria-label={msg.read ? "Mark as Unread" : "Mark as Read"}
                  />
                </Td>
                <Td>
                  <Text fontWeight="600" color="gray.850">{msg.name}</Text>
                  <Text fontSize="10px" color="gray.400">{msg.email}</Text>
                </Td>
                <Td maxW="300px">
                  <Text fontSize="sm" color="gray.700" noOfLines={3} whiteSpace="pre-wrap">{msg.message}</Text>
                </Td>
                <Td color="gray.500">
                  {msg.date ? new Date(msg.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </Td>
                <Td textAlign="right">
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    colorScheme="red" 
                    onClick={() => onDeleteMessage(msg.id)}
                  >
                    Delete
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

InboxTab.propTypes = {
  messages: PropTypes.array.isRequired,
  onToggleRead: PropTypes.func.isRequired,
  onDeleteMessage: PropTypes.func.isRequired,
};

export default InboxTab;
