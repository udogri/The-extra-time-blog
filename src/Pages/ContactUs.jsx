import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  useToast,
} from '@chakra-ui/react';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = () => {
    if (!name || !email || !message) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all fields before submitting.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setIsLoading(true);

    // Simulate an API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Message Sent',
        description: 'Thank you for contacting us. We will get back to you soon.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      setName('');
      setEmail('');
      setMessage('');
    }, 2000);
  };

  return (
    <Box
      bg="gray.100"
      minH="100vh"
      w="100vw"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={4}
    >
      <Box
        maxW="500px"
        w="100%"
        bg="white"
        p={8}
        borderRadius="md"
        boxShadow="lg"
      >
        <Heading mb={6} textAlign="center">
          Contact Us
        </Heading>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Your Name</FormLabel>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email Address</FormLabel>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Message</FormLabel>
            <Textarea
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </FormControl>
          <Button
            colorScheme="teal"
            w="full"
            isLoading={isLoading}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default ContactUs;
