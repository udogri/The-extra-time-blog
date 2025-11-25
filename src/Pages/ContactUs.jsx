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
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa6";

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
      bgGradient="linear(to-br, teal.600, teal.700, gray.900)"
      justify="center"
      w="100vw"
      align="center"
      p={{ base: 3, md: 6 }}
    >
      <Flex
        bg="white"
        borderRadius="2xl"
        boxShadow="2xl"
        overflow="hidden"
        w={{ base: "100%", sm: "95%", md: "850px" }}
        flexDir={{ base: "column", md: "row" }}
      >
        {/* Left Side - Form */}
        <Box flex="1" p={{ base: 4, sm: 6, md: 10 }}>
          <Heading
            fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
            textAlign="center"
            mb={{ base: 4, md: 6 }}
            color="teal.700"
          >
            Contact Us
          </Heading>

          <VStack spacing={{ base: 3, md: 5 }}>
            <FormControl isRequired>
              <FormLabel fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>
                Your Name
              </FormLabel>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                focusBorderColor="teal.500"
                size={{ base: "sm", md: "md" }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>
                Email Address
              </FormLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                focusBorderColor="teal.500"
                size={{ base: "sm", md: "md" }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>
                Message
              </FormLabel>
              <Textarea
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                focusBorderColor="teal.500"
                resize="none"
                size={{ base: "sm", md: "md" }}
              />
            </FormControl>

            <Button
              colorScheme="teal"
              w="full"
              size={{ base: "md", md: "lg" }}
              isLoading={isLoading}
              onClick={handleSubmit}
              _hover={{ transform: "scale(1.02)" }}
              transition="all 0.2s ease"
            >
              Send Message
            </Button>
          </VStack>

          <HStack justify="center" mt={{ base: 4, md: 6 }} spacing={{ base: 2, md: 5 }} wrap="wrap">
            {[FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaInstagram].map((Icon, idx) => (
              <IconButton
                key={idx}
                as={Link}
                to="#"
                icon={<Icon size={18} />}
                aria-label="Social Link"
                variant="ghost"
                size={{ base: "sm", md: "lg" }}
                color="gray.600"
                _hover={{
                  color: "teal.500",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.2s ease"
              />
            ))}
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
          p={{ base: 6, md: 10 }}
          textAlign="center"
        >
          <Heading size={{ base: "md", md: "lg" }} mb={{ base: 2, md: 4 }}>
            Let's Connect 🌍
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} color="gray.100" maxW={{ base: "90%", md: "300px" }}>
            Have questions, feedback, or partnership ideas? We’d love to hear from you.
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default ContactUs;
