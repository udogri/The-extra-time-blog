import { useEffect, useState } from 'react';
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
  useColorModeValue,
} from '@chakra-ui/react';
import { NavLink as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { MdLogout } from 'react-icons/md';
import { auth } from '../firebaseConfig';

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
    if (isOpen) onClose(); // Close mobile menu
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

  const NavLink = ({ name, path }) => {
    const isActive = location.pathname === path;
    const activeBg = useColorModeValue('teal.600', 'teal.700');
    return (
      <RouterLink
        to={path}
        onClick={handleLinkClick}
        style={{
          padding: '10px 18px',
          borderRadius: '8px',
          textAlign: 'center',
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          fontSize: '15px',
          backgroundColor: isActive ? activeBg : 'transparent',
          color: isActive ? 'white' : 'white',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = activeBg)}
        onMouseLeave={(e) =>
          (e.target.style.backgroundColor = isActive ? activeBg : 'transparent')
        }
      >
        {name}
      </RouterLink>
    );
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box
      bg="teal.500"
      px={{ base: 4, md: 8 }}
      color="white"
      w="100%"
      boxShadow="sm"
      position="relative"
      zIndex={20}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <Text
            fontSize={{ base: '18px', md: '24px' }}
            cursor="pointer"
            fontWeight="bold"
            onClick={() => navigate('/')}
            _hover={{ color: 'teal.100', transition: '0.3s' }}
          >
            Extra Time Blog
          </Text>

          <HStack
            as="nav"
            align="center"
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
          >
            {links.map((link) => (
              <NavLink key={link.name} name={link.name} path={link.path} />
            ))}
          </HStack>
        </HStack>

        <HStack spacing={4}>
          <Menu>
            <MenuButton
              display={{ base: 'none', md: 'flex' }}
              as={IconButton}
              icon={<MdLogout />}
              fontSize="24px"
              bg="transparent"
              _hover={{ transform: 'scale(1.2)', bg: 'teal.600' }}
              _focus={{ boxShadow: 'none' }}
              _active={{ bg: 'teal.600' }}
            />
            <MenuList bg="teal.500" border="none">
              <MenuItem
                onClick={handleAuthClick}
                bg="teal.500"
                _hover={{ bg: 'teal.600', color: 'white' }}
              >
                Confirm Logout
              </MenuItem>
            </MenuList>
          </Menu>

          <IconButton
            size="md"
            bg="transparent"
            color="white"
            _hover={{ transform: 'scale(1.2)', bg: 'teal.600' }}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Toggle Navigation"
            display={{ base: 'flex', md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
            _focus={{ boxShadow: 'none' }}
          />
        </HStack>
      </Flex>

      {isOpen && (
        <Box
          position="absolute"
          top="64px"
          left="0"
          width="100%"
          bg="teal.500"
          zIndex="10"
          display={{ md: 'none' }}
          px={4}
          py={4}
          borderTop="1px solid rgba(255,255,255,0.2)"
        >
          <Stack as="nav" spacing={4}>
            {links.map((link) => (
              <NavLink key={link.name} name={link.name} path={link.path} />
            ))}

            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<MdLogout />}
                bg="transparent"
                color="white"
                _hover={{ bg: 'teal.600' }}
                _focus={{ boxShadow: 'none' }}
              >
                Logout
              </MenuButton>
              <MenuList bg="teal.500" border="none">
                <MenuItem
                  onClick={handleAuthClick}
                  bg="teal.500"
                  _hover={{ bg: 'teal.600', color: 'white' }}
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
