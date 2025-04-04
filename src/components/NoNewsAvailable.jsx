import React from 'react';
import { Box, Image, Text, VStack } from '@chakra-ui/react';

const NoNewsAvailable = ({ category }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="300px"
      bg="gray.50"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      p={6}
      w="100%"
      textAlign="center"
    >
      <VStack spacing={4}>
        <Image
          src="https://via.placeholder.com/150/gray/FFFFFF/?text=No+News" // Replace with your custom illustration/image URL
          alt="No News"
          maxW="200px"
          borderRadius="md"
          boxShadow="base"
        />
        <Text fontSize="lg" fontWeight="bold" color="gray.600">
          No {category} news available
        </Text>
        <Text fontSize="sm" color="gray.500">
          Please check back later for updates.
        </Text>
      </VStack>
    </Box>
  );
};

export default NoNewsAvailable;
