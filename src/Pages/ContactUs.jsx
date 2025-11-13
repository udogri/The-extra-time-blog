import React, { useState } from "react";
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
  HStack,
  IconButton,
  Text,
  Flex,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa6";

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = () => {
    if (!name || !email || !message) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields before submitting.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We’ll get back to you soon.",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setName("");
      setEmail("");
      setMessage("");
    }, 2000);
  };

  return (
    <Flex
      minH="100vh"
      bgGradient="linear(to-br, teal.500, teal.700, gray.900)"
      justify="center"
      align="center"
      p={6}
    >
      <Flex
        bg="white"
        borderRadius="2xl"
        boxShadow="2xl"
        overflow="hidden"
        w={{ base: "100%", md: "850px" }}
        flexDir={{ base: "column", md: "row" }}
      >
        {/* Left Side - Form */}
        <Box flex="1" p={{ base: 6, md: 10 }}>
          <Heading
            fontSize={{ base: "2xl", md: "3xl" }}
            textAlign="center"
            mb={6}
            color="teal.700"
          >
            Contact Us
          </Heading>

          <VStack spacing={5}>
            <FormControl isRequired>
              <FormLabel fontWeight="semibold">Your Name</FormLabel>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                focusBorderColor="teal.500"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="semibold">Email Address</FormLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                focusBorderColor="teal.500"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="semibold">Message</FormLabel>
              <Textarea
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                focusBorderColor="teal.500"
                resize="none"
              />
            </FormControl>

            <Button
              colorScheme="teal"
              w="full"
              size="lg"
              isLoading={isLoading}
              onClick={handleSubmit}
              _hover={{ transform: "scale(1.02)" }}
              transition="all 0.2s ease"
            >
              Send Message
            </Button>
          </VStack>

          <HStack justify="center" mt={6} spacing={5}>
            {[FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaInstagram].map(
              (Icon, idx) => (
                <IconButton
                  key={idx}
                  as={Link}
                  to="#"
                  icon={<Icon />}
                  aria-label="Social Link"
                  variant="ghost"
                  size="lg"
                  color="gray.600"
                  _hover={{
                    color: "teal.500",
                    transform: "translateY(-3px)",
                  }}
                  transition="all 0.2s ease"
                />
              )
            )}
          </HStack>
        </Box>

        {/* Right Side - Illustration or Info */}
        <Box
          flex="1"
          bgGradient="linear(to-b, teal.600, teal.800)"
          color="white"
          display="flex"
          flexDir="column"
          alignItems="center"
          justifyContent="center"
          p={10}
          textAlign="center"
        >
          <Heading size="lg" mb={4}>
            Let's Connect 🌍
          </Heading>
          <Text fontSize="md" color="gray.100" maxW="300px">
            Have questions, feedback, or partnership ideas? We’d love to hear
            from you.
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default ContactUs;
