import React from 'react';
import { Box, Text, Button, VStack, Image } from '@chakra-ui/react';

const NetworkError = ({ onRetry }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      h="100vh"
      bg="gray.50"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      p={6}
      w="100vw"
      textAlign="center"
    >
      <VStack spacing={4}>
        <Image
          src="https://via.placeholder.com/150/FF0000/FFFFFF?text=Network+Error" // Replace with a custom error illustration
          alt="Network Error"
          maxW="200px"
          borderRadius="md"
          boxShadow="base"
        />
        <Text fontSize="lg" fontWeight="bold" color="gray.600">
          Unable to fetch articles
        </Text>
        <Text fontSize="sm" color="gray.500">
          Please check your internet connection and try again.
        </Text>
        <Button colorScheme="teal" onClick={onRetry}>
          Retry
        </Button>
      </VStack>
    </Box>
  );
};

export default NetworkError;
