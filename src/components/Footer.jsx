import {
  Box, Text, HStack, VStack, Link, Divider, IconButton, Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';

const NAV_LINKS = [
  { label: 'Home',       href: '/' },
  { label: 'About',      href: '/about' },
  { label: 'Contact',    href: '/contact' },
  { label: 'Profile',    href: '/profile' },
];

const SOCIAL_LINKS = [
  { Icon: FaTwitter,   label: 'Twitter',   href: '#', hoverColor: '#1DA1F2' },
  { Icon: FaLinkedin,  label: 'LinkedIn',  href: '#', hoverColor: '#0A66C2' },
  { Icon: FaGithub,    label: 'GitHub',    href: '#', hoverColor: '#e5e5e5' },
  { Icon: FaFacebook,  label: 'Facebook',  href: '#', hoverColor: '#1877F2' },
  { Icon: FaInstagram, label: 'Instagram', href: '#', hoverColor: '#E1306C' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate    = useNavigate();

  return (
    <Box bg="gray.900" color="white" w="100%">

      {/* ── Main footer body ── */}
      <Box maxW="1200px" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 10, md: 14 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'flex-start' }}
          gap={{ base: 10, md: 0 }}
        >

          {/* Brand block */}
          <VStack align="flex-start" spacing={3} maxW="260px">
            <Text
              fontSize="lg"
              fontWeight="800"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="white"
              cursor="pointer"
              onClick={() => navigate('/')}
              _hover={{ color: 'teal.400' }}
              transition="color 0.2s"
            >
              Extra Time
              <Box as="span" color="teal.400" ml={1}>·</Box>
            </Text>
            <Text fontSize="sm" color="whiteAlpha.500" lineHeight="1.75">
              Nigeria's independent voice — fast, factual, and unfiltered news from home and around the world.
            </Text>

            {/* Social icons */}
            <HStack spacing={0} mt={1}>
              {SOCIAL_LINKS.map(({ Icon, label, href, hoverColor }) => (
                <IconButton
                  key={label}
                  as="a"
                  href={href}
                  aria-label={label}
                  icon={<Icon size={13} />}
                  size="sm"
                  variant="ghost"
                  color="whiteAlpha.400"
                  borderRadius="full"
                  _hover={{ color: hoverColor, bg: 'whiteAlpha.100' }}
                  transition="all 0.2s"
                />
              ))}
            </HStack>
          </VStack>

          {/* Nav links */}
          <VStack align="flex-start" spacing={3}>
            <Text
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="whiteAlpha.400"
              mb={1}
            >
              Navigation
            </Text>
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                fontSize="sm"
                color="whiteAlpha.700"
                fontWeight="500"
                _hover={{ color: 'teal.400', textDecoration: 'none', pl: '2px' }}
                transition="all 0.15s"
              >
                {label}
              </Link>
            ))}
          </VStack>

          {/* Categories */}
          <VStack align="flex-start" spacing={3}>
            <Text
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="whiteAlpha.400"
              mb={1}
            >
              Categories
            </Text>
            {['Top News', 'Sports News', 'Business News', 'International News', 'Local News'].map((cat) => (
              <Text
                key={cat}
                fontSize="sm"
                color="whiteAlpha.700"
                fontWeight="500"
                cursor="pointer"
                _hover={{ color: 'teal.400', pl: '2px' }}
                transition="all 0.15s"
              >
                {cat}
              </Text>
            ))}
          </VStack>

          {/* Contact blurb */}
          <VStack align="flex-start" spacing={3} maxW="200px">
            <Text
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="whiteAlpha.400"
              mb={1}
            >
              Contact
            </Text>
            <Text fontSize="sm" color="whiteAlpha.700" lineHeight="1.7">
              hello@extratime.com
            </Text>
            <Text fontSize="sm" color="whiteAlpha.700" lineHeight="1.7">
              Lagos, Nigeria
            </Text>
            <Box
              mt={1}
              px={3} py={1}
              borderRadius="full"
              border="1px solid"
              borderColor="teal.700"
              display="inline-flex"
              alignItems="center"
              gap={2}
            >
              <Box w="6px" h="6px" borderRadius="full" bg="teal.400" />
              <Text fontSize="xs" color="teal.400" fontWeight="600">All systems live</Text>
            </Box>
          </VStack>

        </Flex>
      </Box>

      {/* ── Bottom bar ── */}
      <Box borderTop="1px solid" borderColor="whiteAlpha.100">
        <Flex
          maxW="1200px"
          mx="auto"
          px={{ base: 6, md: 10 }}
          py={4}
          justify="space-between"
          align="center"
          flexWrap="wrap"
          gap={2}
        >
          <Text fontSize="xs" color="whiteAlpha.400">
            © {currentYear} Extra Time Blog. All rights reserved.
          </Text>
          <HStack spacing={4}>
            {['Privacy Policy', 'Terms of Use'].map((item) => (
              <Text
                key={item}
                as="a"
                href="#"
                fontSize="xs"
                color="whiteAlpha.400"
                _hover={{ color: 'whiteAlpha.700' }}
                transition="color 0.2s"
                cursor="pointer"
              >
                {item}
              </Text>
            ))}
          </HStack>
        </Flex>
      </Box>

    </Box>
  );
};

export default Footer;