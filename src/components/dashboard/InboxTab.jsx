import PropTypes from 'prop-types';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, IconButton, Text, Button, useColorModeValue
} from '@chakra-ui/react';
import { MdOutlineMarkEmailRead, MdOutlineMarkEmailUnread } from 'react-icons/md';

const InboxTab = ({ messages, onToggleRead, onDeleteMessage }) => {
  const unreadBg = useColorModeValue('teal.50', 'rgba(49, 151, 149, 0.15)');

  return (
    <Box bg="cardBg" p={6} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl" overflowX="auto">
      <Heading size="md" mb={6} color="text" fontWeight="700">Inbox Messages ({messages.length})</Heading>

      {messages.length === 0 ? (
        <Text fontSize="sm" color="mutedText" textAlign="center" py={8}>
          No messages received.
        </Text>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th color="mutedText">Status</Th>
              <Th color="mutedText">From</Th>
              <Th color="mutedText">Message</Th>
              <Th color="mutedText">Date</Th>
              <Th color="mutedText" textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {messages.map((msg) => (
              <Tr key={msg.id} bg={!msg.read ? unreadBg : "transparent"}>
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
                  <Text fontWeight="600" color="text">{msg.name}</Text>
                  <Text fontSize="10px" color="mutedText">{msg.email}</Text>
                </Td>
                <Td maxW="300px">
                  <Text fontSize="sm" color="text" noOfLines={3} whiteSpace="pre-wrap">{msg.message}</Text>
                </Td>
                <Td color="mutedText">
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
