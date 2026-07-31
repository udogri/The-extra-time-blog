import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Stack,
  Text,
  useDisclosure,
  useToast,
  useColorMode,
} from '@chakra-ui/react';
import { NavLink as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { FiSun, FiMoon } from 'react-icons/fi';
import { auth } from '../firebaseConfig';
import PropTypes from 'prop-types';

const Navbar = ({ isAuthenticated, isAdmin, onOpenNewsletter }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    { name: 'About', path: '/about' },
    ...(isAdmin ? [{ name: 'Dashboard', path: '/profile' }] : []),
    { name: 'Newsletter', action: onOpenNewsletter },
  ];

  const handleLinkClick = () => { if (isOpen) onClose(); };

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      try {
        await auth.signOut();
        toast({ title: 'Signed out', status: 'success', duration: 3000, isClosable: true, position: 'top' });
        navigate('/login');
      } catch {
        toast({ title: 'Error signing out', status: 'error', duration: 3000, isClosable: true, position: 'top' });
      }
    } else {
      navigate('/login');
    }
  };

  const NavItem = ({ name, path }) => {
    const isActive = location.pathname === path;
    return (
      <Box
        as={RouterLink}
        to={path}
        onClick={handleLinkClick}
        position="relative"
        px={1}
        py={2}
        fontSize="sm"
        letterSpacing="0.06em"
        textTransform="uppercase"
        fontWeight="500"
        color={isActive ? 'navText' : 'navTextMuted'}
        textDecoration="none"
        whiteSpace="nowrap"
        transition="color 0.2s"
        _hover={{ color: 'navText', textDecoration: 'none' }}
        _focus={{ boxShadow: 'none' }}
        _after={{
          content: '""',
          position: 'absolute',
          left: 0,
          bottom: '-1px',
          width: isActive ? '100%' : '0%',
          height: '1px',
          bg: 'teal.400',
          transition: 'width 0.25s ease',
        }}
        sx={{ '&:hover::after': { width: '100%' } }}
      >
        {name}
      </Box>
    );
  };

  NavItem.propTypes = { name: PropTypes.string.isRequired, path: PropTypes.string.isRequired };

  return (
    <Box
      bg="navBg"
      borderBottom="1px solid"
      borderColor="navBorder"
      px={6}
      color="navText"
      w="100vw"
      position="fixed"
      zIndex="1000"
      backdropFilter="blur(12px)"
      sx={{ bg: 'navBg' }}
    >
      <Flex h="60px" alignItems="center" justifyContent="space-between" maxW="1200px" mx="auto">
        {/* Wordmark */}
        <Text
          fontSize={{ base: 'sm', md: 'md' }}
          fontWeight="700"
          letterSpacing="0.12em"
          textTransform="uppercase"
          color="navText"
          cursor="pointer"
          onClick={() => navigate('/')}
          whiteSpace="nowrap"
          _hover={{ color: 'teal.400' }}
          transition="color 0.2s"
        >
          Oruaro
          <Box as="span" color="teal.400" ml={1}>·</Box>
        </Text>

        {/* Desktop Links */}
        <HStack as="nav" spacing={7} display={{ base: 'none', md: 'flex' }}>
          {links.map((link) =>
            link.path ? (
              <NavItem key={link.name} name={link.name} path={link.path} />
            ) : (
              <Box
                key={link.name}
                onClick={() => { link.action(); handleLinkClick(); }}
                position="relative"
                px={1}
                py={2}
                fontSize="sm"
                letterSpacing="0.06em"
                textTransform="uppercase"
                fontWeight="500"
                color="navTextMuted"
                cursor="pointer"
                transition="color 0.2s"
                _hover={{ color: 'navText' }}
              >
                {link.name}
              </Box>
            )
          )}
        </HStack>

        {/* Right Section */}
        <HStack spacing={3}>
          {/* Theme Toggle Button */}
          <IconButton
            size="sm"
            variant="ghost"
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
            aria-label="Toggle Color Mode"
            borderRadius="full"
            color="navText"
            _hover={{ bg: 'whiteAlpha.100' }}
            _focus={{ boxShadow: 'none' }}
          />

          {isAuthenticated && (
            <Button
              display={{ base: 'none', md: 'flex' }}
              size="sm"
              variant="outline"
              borderColor="navBorder"
              color="navText"
              fontSize="xs"
              letterSpacing="0.08em"
              textTransform="uppercase"
              fontWeight="600"
              px={5}
              borderRadius="full"
              _hover={{ bg: 'whiteAlpha.100', borderColor: 'teal.400', color: 'teal.400' }}
              transition="all 0.2s"
              onClick={handleAuthClick}
              _focus={{ boxShadow: 'none' }}
            >
              Sign Out
            </Button>
          )}

          {/* Mobile Toggle */}
          <IconButton
            size="sm"
            bg="transparent"
            color="navTextMuted"
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={4} h={4} />}
            _focus={{ boxShadow: 'none' }}
            _hover={{ bg: 'whiteAlpha.100' }}
            aria-label="Toggle Navigation"
            display={{ base: 'flex', md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
        </HStack>
      </Flex>

      {/* Mobile Menu */}
      {isOpen && (
        <Box
          position="absolute"
          top="60px"
          left="0"
          width="100%"
          bg="navBgMobile"
          backdropFilter="blur(16px)"
          borderBottom="1px solid"
          borderColor="navBorder"
          px={6}
          py={6}
          zIndex="999"
          display={{ md: 'none' }}
        >
          <Stack as="nav" spacing={5} align="flex-start">
            {links.map((link) =>
              link.action ? (
                <Box
                  key={link.name}
                  onClick={() => { link.action(); handleLinkClick(); }}
                  fontSize="sm"
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  fontWeight="500"
                  color="navTextMuted"
                  cursor="pointer"
                  _hover={{ color: 'navText' }}
                >
                  {link.name}
                </Box>
              ) : (
                <NavItem key={link.name} name={link.name} path={link.path} />
              )
            )}
            {isAuthenticated && (
              <Button
                size="sm"
                variant="outline"
                borderColor="teal.500"
                color="teal.400"
                fontSize="xs"
                letterSpacing="0.08em"
                textTransform="uppercase"
                fontWeight="600"
                px={6}
                borderRadius="full"
                mt={2}
                _hover={{ bg: 'teal.500', color: 'white' }}
                transition="all 0.2s"
                onClick={() => { onClose(); handleAuthClick(); }}
              >
                Sign Out
              </Button>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

Navbar.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool,
  onOpenNewsletter: PropTypes.func.isRequired,
};

export default Navbar;