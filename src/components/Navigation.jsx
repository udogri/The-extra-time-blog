// Updated Navbar.jsx
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
} from '@chakra-ui/react';
import { NavLink as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { auth } from '../firebaseConfig';
import PropTypes from 'prop-types';

const Navbar = ({ isAuthenticated, onOpenNewsletter }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'About', path: '/about' },
    { name: 'Profile', path: '/profile' },
    { name: 'Newsletter', action: onOpenNewsletter },
  ];

  const handleLinkClick = () => {
    if (isOpen) onClose();
  };

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      try {
        await auth.signOut();
        toast({
          title: 'Logged out',
          description: 'You have successfully logged out.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        toast({
          title: 'Error',
          description: 'Failed to log out. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
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
        px={4}
        py={2}
        fontSize={{ base: '12px', sm: '14px', md: '16px' }}
        textAlign="center"
        color="teal.500"
        fontWeight={isActive ? 'bold' : 'normal'}
        textDecoration="none"
        whiteSpace="nowrap"
        _focus={{ boxShadow: 'none' }}
        _after={{
          content: '""',
          position: 'absolute',
          left: 0,
          bottom: '-2px',
          width: isActive ? '100%' : '0%',
          height: '2px',
          bg: 'teal.500',
          transition: 'width 0.3s ease',
        }}
        _hover={{ _after: { width: '100%' } }}
      >
        {name}
      </Box>
    );
  };

  NavItem.propTypes = {
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
  };

  return (
    <Box
      bg="white"
      px={4}
      color="white"
      w="100vw"
      boxShadow="2xl"
      position="fixed"
      zIndex="1000"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Text
          fontSize={{ base: '16px', sm: '18px', md: '22px' }}
          cursor="pointer"
          fontWeight="bold"
          color="teal.500"
          onClick={() => navigate('/')}
          whiteSpace="nowrap"
        >
          Extra Time Blog
        </Text>

        {/* Desktop Links */}
        <HStack
          as="nav"
          spacing={6}
          display={{ base: 'none', md: 'flex' }}
          justifyContent="center"
          flex="1"
        >
          {links.map((link) =>
            link.path ? (
              <NavItem key={link.name} name={link.name} path={link.path} />
            ) : (
              <Button
                key={link.name}
                onClick={() => {
                  link.action();
                  handleLinkClick();
                }}
                variant="ghost"
                color="teal.500"
                fontSize={{ base: '12px', sm: '14px', md: '16px' }}
                _hover={{ bg: 'gray.100' }}
                _focus={{ boxShadow: 'none' }}
              >
                {link.name}
              </Button>
            )
          )}
        </HStack>

        {/* Desktop Login/Logout */}
        <Button
          display={{ base: 'none', md: 'flex' }}
          bg="teal.500"
          color="white"
          fontWeight="bold"
          px={5}
          borderRadius="full"
          _hover={{
            transform: 'translateY(-2px)',
            bg: 'gray.100',
          }}
          transition="0.25s"
          onClick={handleAuthClick}
          _focus={{ boxShadow: 'none' }}
        >
          {isAuthenticated ? 'Logout' : 'Login'}
        </Button>

        {/* Mobile Menu Toggle */}
        <IconButton
          size="md"
          bg="transparent"
          color="teal.500"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          _focus={{ boxShadow: 'none' }}
          aria-label="Toggle Navigation"
          display={{ base: 'flex', md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
      </Flex>

      {/* Mobile Menu */}
      {isOpen && (
        <Box
          position="absolute"
          top="64px"
          left="0"
          width="100%"
          bg="white"
          px={4}
          py={4}
          zIndex="999"
          display={{ md: 'none' }}
        >
          <Stack as="nav" spacing={4} align="center">
            {links.map((link) =>
              link.action ? (
                <Box
                  key={link.name}
                  onClick={() => {
                    link.action();
                    handleLinkClick();
                  }}
                  px={4}
                  py={2}
                  cursor="pointer"
                  color="teal.500"
                  fontSize={{ base: '14px', sm: '15px' }}
                  _hover={{ textDecoration: 'underline' }}
                  _focus={{ boxShadow: 'none' }}
                  whiteSpace="nowrap"
                >
                  {link.name}
                </Box>
              ) : (
                <NavItem key={link.name} name={link.name} path={link.path} />
              )
            )}

            <Button
              bg="teal.500"
              color="white"
              fontWeight="bold"
              borderRadius="full"
              py={6}
              onClick={() => {
                onClose();
                handleAuthClick();
              }}
              _focus={{ boxShadow: 'none' }}
            >
              {isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

Navbar.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  onOpenNewsletter: PropTypes.func.isRequired,
};

export default Navbar;
