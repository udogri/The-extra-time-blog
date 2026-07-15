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

const Footer = ({ siteSettings }) => {
  const currentYear = new Date().getFullYear();
  const navigate    = useNavigate();

  const dynamicSocials = [
    { Icon: FaTwitter,   label: 'Twitter',   href: siteSettings?.socials?.twitter || '#', hoverColor: '#1DA1F2' },
    { Icon: FaLinkedin,  label: 'LinkedIn',  href: siteSettings?.socials?.linkedin || '#', hoverColor: '#0A66C2' },
    { Icon: FaGithub,    label: 'GitHub',    href: siteSettings?.socials?.github || '#', hoverColor: '#e5e5e5' },
    { Icon: FaFacebook,  label: 'Facebook',  href: siteSettings?.socials?.facebook || '#', hoverColor: '#1877F2' },
    { Icon: FaInstagram, label: 'Instagram', href: siteSettings?.socials?.instagram || '#', hoverColor: '#E1306C' },
  ].filter(s => s.href && s.href !== '#');

  const categories = ['Web Development', 'Graphic Design', 'Life & Hobbies', 'Tutorials'];

  return (
    <Box bg="#0b0f19" color="white" w="100%" position="relative" overflow="hidden">
      
      {/* Sleek top accent gradient line */}
      <Box h="3px" w="100%" bgGradient="linear(to-r, blue.400, teal.400, purple.400)" />

      {/* Main footer body */}
      <Box maxW="1200px" mx="auto" px={{ base: 6, md: 10 }} py={{ base: 12, md: 16 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'flex-start' }}
          gap={{ base: 10, md: 8 }}
        >

          {/* Column 1: Brand block */}
          <VStack align="flex-start" spacing={4} maxW="320px">
            <Text
              fontSize="lg"
              fontWeight="800"
              letterSpacing="0.05em"
              textTransform="uppercase"
              color="white"
              cursor="pointer"
              onClick={() => navigate('/')}
              _hover={{ color: 'teal.300' }}
              transition="color 0.2s"
            >
              {siteSettings?.title || 'Pixels & Code'}
              <Box as="span" color="teal.400" ml={1}>.</Box>
            </Text>
            <Text fontSize="sm" color="gray.400" lineHeight="1.75">
              {siteSettings?.description || "A personal space focused on Frontend engineering, UI/UX, graphic design, and lifestyle logs."}
            </Text>

            {/* Social icons */}
            {dynamicSocials.length > 0 && (
              <HStack spacing={2} pt={2}>
                {dynamicSocials.map(({ Icon, label, href, hoverColor }) => (
                  <IconButton
                    key={label}
                    as="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    icon={<Icon size={14} />}
                    size="sm"
                    variant="ghost"
                    color="gray.400"
                    borderRadius="full"
                    _hover={{ color: hoverColor, bg: 'whiteAlpha.100' }}
                    transition="all 0.2s"
                  />
                ))}
              </HStack>
            )}
          </VStack>

          {/* Column 2: Nav links */}
          <VStack align="flex-start" spacing={3}>
            <Text
              fontSize="xs"
              fontWeight="800"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="teal.400"
              mb={1}
            >
              Navigation
            </Text>
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                fontSize="sm"
                color="gray.300"
                fontWeight="500"
                _hover={{ color: 'teal.300', textDecoration: 'none', pl: '2px' }}
                transition="all 0.15s"
              >
                {label}
              </Link>
            ))}
          </VStack>

          {/* Column 3: Categories */}
          <VStack align="flex-start" spacing={3}>
            <Text
              fontSize="xs"
              fontWeight="800"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="purple.400"
              mb={1}
            >
              Categories
            </Text>
            {categories.map((cat) => (
              <Text
                key={cat}
                fontSize="sm"
                color="gray.300"
                fontWeight="500"
                cursor="pointer"
                _hover={{ color: 'purple.300', pl: '2px' }}
                transition="all 0.15s"
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('writing-log-header')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                {cat}
              </Text>
            ))}
          </VStack>

          {/* Column 4: Contact & System Status */}
          <VStack align="flex-start" spacing={4} maxW="240px">
            <Text
              fontSize="xs"
              fontWeight="800"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="blue.400"
              mb={1}
            >
              Contact
            </Text>
            <Box>
              <Text fontSize="sm" color="gray.300" fontWeight="600">
                {siteSettings?.contactEmail || 'hello@creativedev.com'}
              </Text>
            </Box>
            
            {/* <Box
              px={3} py={1}
              borderRadius="full"
              border="1px solid"
              borderColor="teal.800"
              bg="teal.950"
              display="inline-flex"
              alignItems="center"
              gap={2}
            >
              <Box w="6px" h="6px" borderRadius="full" bg="teal.400" className="pulse-dot" />
              <Text fontSize="10px" color="teal.300" fontWeight="700" letterSpacing="0.05em">ALL SYSTEMS ACTIVE</Text>
            </Box> */}
          </VStack>

        </Flex>
      </Box>

      {/* Bottom Bar */}
      <Box borderTop="1px solid" borderColor="whiteAlpha.100" bg="#070a12">
        <Flex
          maxW="1200px"
          mx="auto"
          px={{ base: 6, md: 10 }}
          py={5}
          justify="space-between"
          align="center"
          flexWrap="wrap"
          gap={4}
        >
          <Text fontSize="xs" color="gray.500">
            © {currentYear} {siteSettings?.title || 'Pixels & Code'}. All rights reserved.
          </Text>
          <HStack spacing={5}>
            {['Privacy Policy', 'Terms of Service'].map((item) => (
              <Text
                key={item}
                as="a"
                href="#"
                fontSize="xs"
                color="gray.500"
                _hover={{ color: 'gray.300' }}
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