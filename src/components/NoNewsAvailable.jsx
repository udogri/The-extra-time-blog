import React from 'react';
import { Box, Image, Text, VStack } from '@chakra-ui/react';
import NoNetwork from '../assets/Questions-amico.svg'; // Adjust the path as necessary

const NoNewsAvailable = ({ category }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bg="gray.50"
      borderRadius="md"
      borderColor="gray.200"
      boxShadow="sm"
      p={6}
      w="100%"
      textAlign="center"
    >
      <VStack spacing={4}>
        <Image
          src={NoNetwork} // Replace with your custom illustration/image URL
          alt="No News"
          w={{base:"200px", md: "300px"}}
          borderRadius="md"
        />
        <Text fontSize={{base:"20px", md: "50px"}} fontWeight="bold" color="gray.600">
          Oops
        </Text>
        <Text fontSize={{base:"12px", md: "15px"}} color="gray.500">
          Something went wrong,
        </Text>
        <Text fontSize="15px" color="gray.500">
          Please try again later.
        </Text>
      </VStack>
    </Box>
  );
};

export default NoNewsAvailable;
