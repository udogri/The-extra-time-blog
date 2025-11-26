// NewsletterModal.jsx
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    VStack,
    HStack,
    Input,
    Button,
    Text,
    useToast,
  } from "@chakra-ui/react";
  import { useState } from "react";
  
  const NewsletterModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState("");
    const toast = useToast();
  
    const handleSubscribe = () => {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        return;
      }
  
      console.log("Subscribed:", email);
  
      toast({
        title: "Subscribed!",
        description: "You have successfully joined our newsletter.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
  
      setEmail(""); // clear input
      onClose();
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="scale">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          p={6}
          borderRadius="2xl"
          bgGradient="linear(to-r, teal.100, teal.50)"
          boxShadow="lg"
        >
          <ModalHeader textAlign="center" fontSize={{ base: "lg", md: "2xl" }}>
            Join Our Newsletter
          </ModalHeader>
          <ModalCloseButton />
  
          <ModalBody>
            <VStack spacing={5} w="100%">
              <Text
                fontSize={{ base: "sm", md: "md" }}
                color="gray.700"
                textAlign="center"
              >
                Stay updated with our latest news and updates.
              </Text>
  
              <HStack w="100%">
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="white"
                  color="black"
                  _placeholder={{ color: "gray.400" }}
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius="md"
                  fontSize={{ base: "sm", md: "md" }}
                  _focus={{
                    borderColor: "teal.400",
                    boxShadow: "0 0 0 1px teal.400",
                  }}
                />
                <Button
                  colorScheme="teal"
                  onClick={handleSubscribe}
                  fontSize={{ base: "sm", md: "md" }}
                  px={{ base: 3, md: 5 }}
                  borderRadius="md"
                  _hover={{ bg: "teal.500" }}
                >
                  Subscribe
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };
  
  export default NewsletterModal;
  