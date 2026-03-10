import {
  Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody,
  VStack, Input, Button, Text, useToast, Box, HStack, Kbd,
} from "@chakra-ui/react";
import { useState } from "react";

const NewsletterModal = ({ isOpen, onClose }) => {
  const [email, setEmail]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubscribe = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "You're in! 🎉",
        description: "We'll send the best stories straight to your inbox.",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setEmail("");
      onClose();
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubscribe();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom" size="md">
      <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.500" />

      <ModalContent
        borderRadius="2xl"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="2xl"
        mx={4}
      >
        {/* Top accent band */}
        <Box h="4px" bgGradient="linear(to-r, teal.400, teal.600)" />

        <ModalCloseButton
          top={4}
          right={4}
          size="sm"
          color="gray.400"
          borderRadius="full"
          _hover={{ bg: "gray.100", color: "gray.700" }}
        />

        <ModalBody px={{ base: 6, md: 10 }} pt={8} pb={10}>
          <VStack spacing={6} align="stretch">

            {/* Icon */}
            <Box
              w="48px" h="48px" borderRadius="xl" bg="teal.50"
              display="flex" alignItems="center" justifyContent="center"
              fontSize="xl"
            >
              ✉️
            </Box>

            {/* Copy */}
            <VStack spacing={1} align="flex-start">
              <Text fontSize="xl" fontWeight="700" letterSpacing="-0.02em" color="gray.900">
                Stay in the loop
              </Text>
              <Text fontSize="sm" color="gray.500" lineHeight="1.6">
                Get the best stories delivered to your inbox — no spam, ever. Unsubscribe anytime.
              </Text>
            </VStack>

            {/* Input + Button */}
            <VStack spacing={3} align="stretch">
              <Input
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                size="md"
                borderRadius="lg"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                focusBorderColor="teal.400"
                _placeholder={{ color: "gray.400", fontSize: "sm" }}
                _hover={{ borderColor: "gray.300" }}
                fontSize="sm"
              />

              <Button
                colorScheme="teal"
                size="md"
                borderRadius="full"
                fontWeight="600"
                fontSize="sm"
                isLoading={isLoading}
                loadingText="Subscribing…"
                onClick={handleSubscribe}
                _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                transition="all 0.2s"
              >
                Subscribe for Free
              </Button>
            </VStack>

            {/* Fine print */}
            <Text fontSize="xs" color="gray.400" textAlign="center">
              By subscribing you agree to our{" "}
              <Text as="span" color="teal.500" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                Privacy Policy
              </Text>
              .
            </Text>

          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NewsletterModal;