import { useState } from 'react';
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

const Navbar = ({ isAuthenticated }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'About', path: '/about' },
    { name: 'Profile', path: '/profile'},
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

  // CHAKRA-UI BASED NAVLINK WITH ANIMATED UNDERLINE
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
        fontSize={{ base: "14px", md: "16px" }}
        textAlign="center"
        color="white"
        fontWeight={isActive ? "bold" : "normal"}
        textDecoration="none"
        _after={{
          content: '""',
          position: "absolute",
          left: "0",
          bottom: "-2px",
          width: isActive ? "100%" : "0%",
          height: "2px",
          bg: "white",
          transition: "width 0.3s ease",
        }}
        _hover={{
          _after: { width: "100%" },
        }}
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
    <Box bg="teal.500" px={4} color="white" w="100%" minWidth="100vw">
      <Flex h={16} alignItems="center" justifyContent="space-between">

        <Text
          fontSize={{ base: "15px", md: "22px" }}
          cursor="pointer"
          fontWeight="bold"
          onClick={() => navigate('/')}
        >
          Extra Time Blog
        </Text>

        {/* DESKTOP NAV LINKS - CENTERED */}
        <HStack
          as="nav"
          spacing={6}
          display={{ base: 'none', md: 'flex' }}
          justifyContent="center"
          flex="1"
        >
          {links.map(
            (link) =>
              (!link.authRequired || isAuthenticated) && (
                <NavItem key={link.name} name={link.name} path={link.path} />
              )
          )}
        </HStack>

        {/* DESKTOP LOGIN / LOGOUT BUTTON */}
        <Button
          display={{ base: "none", md: "flex" }}
          bg="white"
          color="teal.700"
          fontWeight="bold"
          px={5}
          borderRadius="full"
          _hover={{
            transform: "translateY(-2px)",
            bg: "gray.100",
          }}
          transition="0.25s"
          onClick={handleAuthClick}
        >
          {isAuthenticated ? "Logout" : "Login"}
        </Button>

        {/* MOBILE MENU TOGGLE */}
        <IconButton
          size="md"
          bg="transparent"
          color="white"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          _focus={{ boxShadow: "none" }}
          aria-label="Toggle Navigation"
          display={{ base: "flex", md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
      </Flex>

      {/* MOBILE MENU */}
      {isOpen && (
        <Box
          position="absolute"
          top="64px"           // height of navbar
          left="0"
          width="100%"
          bg="teal.500"
          px={4}
          py={4}
          zIndex="999"
          display={{ md: 'none' }}
        >

          <Stack as="nav" spacing={4} align="center">
            {links.map(
              (link) =>
                (!link.authRequired || isAuthenticated) && (
                  <NavItem key={link.name} name={link.name} path={link.path} />
                )
            )}

            {/* MOBILE LOGIN / LOGOUT */}
            <Button
              bg="white"
              color="teal.700"
              fontWeight="bold"
              borderRadius="full"
              py={6}
              onClick={() => {
                onClose();
                handleAuthClick();
              }}
            >
              {isAuthenticated ? "Logout" : "Login"}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;
