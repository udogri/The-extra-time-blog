import { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Textarea, VStack,
  Heading, useToast, HStack, IconButton, Text,
} from '@chakra-ui/react';
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa6';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const SOCIAL_LINKS = [
  { Icon: FaTwitter, label: 'Twitter', href: '#' },
  { Icon: FaLinkedin, label: 'LinkedIn', href: '#' },
  { Icon: FaGithub, label: 'GitHub', href: '#' },
  { Icon: FaFacebook, label: 'Facebook', href: '#' },
  { Icon: FaInstagram, label: 'Instagram', href: '#' },
];

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      toast({ title: 'Please fill in all fields', status: 'warning', duration: 3000, isClosable: true, position: 'top' });
      return;
    }
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        name: form.name,
        email: form.email,
        message: form.message,
        date: new Date().toISOString(),
        read: false
      });
      toast({ title: 'Message sent', description: "We'll get back to you soon.", status: 'success', duration: 4000, isClosable: true, position: 'top' });
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast({ title: 'Error sending message', description: error.message, status: 'error', duration: 4000, isClosable: true, position: 'top' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = {
    size: 'md',
    borderRadius: 'lg',
    bg: '#0b0f19',
    color: 'white',
    border: '1px solid',
    borderColor: 'whiteAlpha.100',
    focusBorderColor: 'teal.400',
    _hover: { borderColor: 'whiteAlpha.300' },
    _placeholder: { color: 'gray.550', fontSize: 'sm' },
  };

  return (
    <Box minH="100vh" w="100vw" bg="#0b0f19" display="flex" justifyContent="center" alignItems="center" p={{ base: 4, md: 8 }} pt="80px">
      <Box
        w="100%"
        maxW="800px"
        bg="#161e2e"
        borderRadius="2xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        boxShadow="2xl"
        overflow="hidden"
        display={{ base: 'block', md: 'flex' }}
      >
        {/* Left — Form */}
        <Box flex="3" p={{ base: 6, md: 10 }}>
          <Heading size="md" fontWeight="700" letterSpacing="-0.02em" color="white" mb={1}>
            Get in Touch
          </Heading>
          <Text fontSize="sm" color="gray.400" mb={7}>
            Have a question or partnership idea? We'd love to hear from you.
          </Text>

          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="gray.450" textTransform="uppercase" mb={1.5}>
                Name
              </FormLabel>
              <Input
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange('name')}
                {...inputStyles}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="gray.450" textTransform="uppercase" mb={1.5}>
                Email
              </FormLabel>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange('email')}
                {...inputStyles}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="gray.450" textTransform="uppercase" mb={1.5}>
                Message
              </FormLabel>
              <Textarea
                placeholder="Tell us what's on your mind…"
                value={form.message}
                onChange={handleChange('message')}
                rows={5}
                resize="none"
                {...inputStyles}
              />
            </FormControl>

            <Button
              colorScheme="teal"
              size="md"
              borderRadius="full"
              fontWeight="600"
              fontSize="sm"
              letterSpacing="0.03em"
              isLoading={isLoading}
              loadingText="Sending…"
              onClick={handleSubmit}
              mt={1}
              _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
              transition="all 0.2s"
            >
              Send Message
            </Button>
          </VStack>

          {/* Social Icons */}
          <HStack spacing={1} mt={8}>
            {SOCIAL_LINKS.map(({ Icon, label, href }) => (
              <IconButton
                key={label}
                as="a"
                href={href}
                icon={<Icon size={14} />}
                aria-label={label}
                variant="ghost"
                size="sm"
                color="gray.400"
                borderRadius="full"
                _hover={{ color: 'teal.400', bg: 'whiteAlpha.100' }}
                transition="all 0.2s"
              />
            ))}
          </HStack>
        </Box>

        {/* Right — Info Panel */}
        <Box
          flex="2"
          bg="#0b0f19"
          color="white"
          display="flex"
          flexDir="column"
          alignItems="flex-start"
          justifyContent="flex-end"
          p={{ base: 6, md: 10 }}
          minH={{ base: '200px', md: 'auto' }}
          position="relative"
          overflow="hidden"
          borderLeft={{ md: '1px solid' }}
          borderTop={{ base: '1px solid', md: 'none' }}
          borderColor="whiteAlpha.100"
        >
          {/* Decorative circle */}
          <Box
            position="absolute"
            top="-60px"
            right="-60px"
            w="200px"
            h="200px"
            borderRadius="full"
            bg="purple.500"
            opacity={0.12}
          />
          <Box
            position="absolute"
            bottom="-40px"
            left="-40px"
            w="150px"
            h="150px"
            borderRadius="full"
            bg="teal.400"
            opacity={0.08}
          />

          <Box position="relative" zIndex={1}>
            <Box w="32px" h="2px" bg="teal.400" mb={5} borderRadius="full" />
            <Heading size="md" fontWeight="700" letterSpacing="-0.02em" mb={3} lineHeight="1.3">
              Let's build something together
            </Heading>
            <Text fontSize="sm" color="gray.400" lineHeight="1.7" maxW="220px">
              We're always open to thoughtful conversations, feedback, and new ideas.
            </Text>

            <VStack align="flex-start" spacing={3} mt={7}>
              {[
                { label: 'Email', value: 'oudogri@gmail.com' },
              ].map(({ label, value }) => (
                <Box key={label}>
                  <Text fontSize="9px" color="teal.400" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase">{label}</Text>
                  <Text fontSize="sm" color="whiteAlpha.800">{value}</Text>
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ContactUs;