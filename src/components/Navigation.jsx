import React, { useEffect, useState } from 'react';
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
import { auth } from '../firebaseConfig'; // Ensure Firebase is correctly configured

const Navbar = ({ isAuthenticated }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);

  


  const links = [
    { name: 'Home', path: '/' },
    { name: 'Add Article', path: '/add-article' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'About', path: '/about' },
  ];

  const handleLinkClick = () => {
    if (isOpen) onClose(); // Close menu on mobile
  };

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      // Handle logout
      try {
        await auth.signOut();
        toast({
          title: 'Logged out',
          description: 'You have successfully logged out.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/login'); // Redirect to the login page
      } catch (error) {
        console.error('Logout error:', error);
        toast({
          title: 'Error',
          description: 'Failed to log out. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      navigate('/login'); // Redirect to login
    }
  };

  const NavLink = ({ name, path }) => {
    const isActive = location.pathname === path;
    return (
      <RouterLink
        to={path}
        onClick={handleLinkClick}
        style={{
          padding: '8px 16px',
          borderRadius: '4px',
          textAlign: 'center',
          backgroundColor: isActive ? 'gray.800' : 'transparent',
          textDecoration: 'none',
          fontWeight: isActive ? 'bold' : 'normal',
        }}
        
      >
        {name}
      </RouterLink>
    );
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    
    <Box bg="teal.500" px={4} color="white" w="100%" minWidth="100vw">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <Text fontSize="lg" cursor="pointer" fontWeight="bold" onClick={() => navigate(`/`)}>
            Extra Time Blog
          </Text>
          <HStack as="nav" align="center" spacing={4} display={{ base: 'none', md: 'flex' }}>
            {links.map((link) => (
              <NavLink key={link.name} name={link.name} path={link.path} />
            ))}
          </HStack>
        </HStack>
        <Flex alignItems="center">
          <Button
            size="sm"
            colorScheme={isAuthenticated ? 'red' : 'blue'}
            onClick={handleAuthClick}
            mr={4}
            display={{ base: 'none', md: 'flex' }}
          >
            {isAuthenticated ? 'Logout' : 'Login'}
          </Button>
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Toggle Navigation"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
        </Flex>
      </Flex>

      {isOpen && (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {links.map((link) => (
              <NavLink key={link.name} name={link.name} path={link.path} />
            ))}
            <Button
              size="sm"
              colorScheme={isAuthenticated ? 'red' : 'blue'}
              onClick={handleAuthClick}
            >
              {isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;
