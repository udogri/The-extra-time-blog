import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { NavLink as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { auth } from '../firebaseConfig'; // Ensure Firebase is correctly configured
import { MdLogout } from 'react-icons/md';
import PropTypes from 'prop-types';

const Navbar = ({ isAuthenticated }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Add Article', path: '/add-article' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'About', path: '/about' },
    { name: 'Profile', path: '/profile', authRequired: true },
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
          position: 'top',
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
          position: 'top',
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
          fontSize: {base:"12px", md: "15px"}
        }}
        
      >
        {name}
      </RouterLink>
    );
  };

  NavLink.propTypes = {
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
  };

  Navbar.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
  };

  return (
    
    <Box bg="teal.500" px={4} color="white" w="100%" minWidth="100vw">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <Text fontSize={{base:"15px", md: "20px"}} cursor="pointer" fontWeight="bold" onClick={() => navigate(`/`)}>
            Extra Time Blog
          </Text>
          <HStack as="nav" align="center" spacing={4} display={{ base: 'none', md: 'flex' }}>
            {links.map((link) => (
              (!link.authRequired || isAuthenticated) && (
                <NavLink key={link.name} name={link.name} path={link.path} />
              )
            ))}
          </HStack>
        </HStack>
          
          <Menu>
  <MenuButton
    display={{ base: 'none', md: 'flex' }}
    as={IconButton}
    icon={<MdLogout />}
    fontSize="24px"
    color="white"
    bg="transparent"
    _hover={{
      transform: 'scale(1.2)',
      transition: 'transform 0.2s ease-in-out',
      bg: 'transparent',
      outline: 'none', // Remove outline on hover
    }}
    _focus={{ boxShadow: 'none', bg: 'transparent' }}
    _active={{ bg: 'transparent' }}
    _expanded={{ bg: 'transparent' }} // when dropdown is open
  />
  <MenuList bg="teal.500" border="none">
    <MenuItem
      onClick={handleAuthClick}
      bg="teal.500"
      _active={{ outline: 'none', bg: 'transparent' }}
      _hover={{  color: 'gray.800', outline: 'none', // Remove outline on hover
      
      }}
      color="white"
    >
      Confirm Logout
    </MenuItem>
  </MenuList>
</Menu>
          <IconButton
            size="md"
            bg="transparent"
            color="white"
            _hover={{
      transform: 'scale(1.2)',
      transition: 'transform 0.2s ease-in-out',
      bg: 'transparent',
      outline: 'none', // Remove outline on hover
    }}            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
    _focus={{ boxShadow: 'none', bg: 'transparent' }}
    _active={{ bg: 'transparent' }}
    _expanded={{ bg: 'transparent' }} // when dropdown is open
            aria-label="Toggle Navigation"
            display={{ base: 'flex', md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
        </Flex>

      {isOpen && (
  <Box
    position="absolute"
    top="63px" /* adjust depending on your Navbar height */
    left="0"
    width="100%"
    bg="teal.500"
    zIndex="10"
    display={{ md: 'none' }}
    px={4}
    py={4}
  >
    <Stack as="nav" spacing={4}>
      {links.map((link) => (
        (!link.authRequired || isAuthenticated) && (
          <NavLink key={link.name} name={link.name} path={link.path} />
        )
      ))}
      <Menu>
  <MenuButton
    as={IconButton}
    icon={<MdLogout />}
    fontSize="24px"
    color="white"
    bg="transparent"
    _hover={{
      transform: 'scale(1.2)',
      transition: 'transform 0.2s ease-in-out',
      bg: 'transparent',
      outline: 'none', // Remove outline on hover
    }}
    _focus={{ boxShadow: 'none', bg: 'transparent' }}
    _active={{ bg: 'transparent' }}
    _expanded={{ bg: 'transparent' }} // when dropdown is open
  />
  <MenuList bg="teal.500" border="none">
    <MenuItem
      onClick={handleAuthClick}
      bg="teal.500"
      _active={{ outline: 'none', bg: 'transparent' }}
      _hover={{  color: 'gray.800', outline: 'none', // Remove outline on hover
      
      }}
      color="white"
    >
      Confirm Logout
    </MenuItem>
  </MenuList>
</Menu>
    </Stack>
  </Box>
)}

    </Box>
  );
};

export default Navbar;
