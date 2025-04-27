import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Link, 
  Input, 
  Button, 
  Divider, 
  useToast 
} from '@chakra-ui/react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const toast = useToast();

  const handleSubscribe = () => {
    toast({
      title: 'Subscription Successful',
      description: 'You have subscribed to our newsletter!',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
  };

  return (
    <Box bg="gray.800" color="white" py={10} px={6}>
      {/* Links and Newsletter Section */}
      <VStack spacing={8} align="center">
        {/* Links */}
        <HStack spacing={6} wrap="wrap" justify="center" display={{base: 'grid', md: 'flex'}}>
          <Link href="/" fontSize="lg" _hover={{ textDecoration: 'underline', color: 'teal.300' }}>
            Home
          </Link>
          <Link href="/add-article" fontSize="lg" _hover={{ textDecoration: 'underline', color: 'teal.300' }}>
            Add Article
          </Link>
          <Link href="/contact-us" fontSize="lg" _hover={{ textDecoration: 'underline', color: 'teal.300' }}>
            Contact Us
          </Link>
          <Link href="/about" fontSize="lg" _hover={{ textDecoration: 'underline', color: 'teal.300' }}>
            About
          </Link>
        </HStack>

        {/* Subscribe to Newsletter */}
        <VStack spacing={4} w="100%" maxW="500px">
          <Text fontSize="lg" fontWeight="bold">
            Subscribe to our Newsletter
          </Text>
          <HStack spacing={2} w="100%">
            <Input 
              placeholder="Enter your email" 
              bg="white" 
              color="black" 
              _placeholder={{ color: 'gray.400' }}
              border="1px" 
              borderColor="gray.400" 
            />
            <Button 
              colorScheme="teal" 
              onClick={handleSubscribe} 
              flexShrink={0}
            >
              Subscribe
            </Button>
          </HStack>
        </VStack>
      </VStack>

      {/* Divider */}
      <Divider my={8} borderColor="gray.600" />

      {/* Copyright Section */}
      <Text textAlign="center" fontSize="sm">
        &copy; {currentYear} Extra Time Blog. All rights reserved.
      </Text>
    </Box>
  );
};

export default Footer;
