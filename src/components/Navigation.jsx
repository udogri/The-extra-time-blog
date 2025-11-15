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
  chakra,
  Slide,
} from "@chakra-ui/react";
import { NavLink as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { auth } from "../firebaseConfig";
import PropTypes from "prop-types";

const ModernNavLink = ({ name, path, isActive, onClick }) => {
  return (
    <chakra.div
      onClick={onClick}
      position="relative"
      cursor="pointer"
      px={2}
      fontSize="15px"
      fontWeight={isActive ? "bold" : "medium"}
      color="white"
      transition="0.25s ease"
      _hover={{ color: "white" }}
    >
      <RouterLink to={path}>{name}</RouterLink>

      {/* Animated underline */}
      <chakra.span
        position="absolute"
        left="0"
        bottom="-3px"
        width={isActive ? "100%" : "0"}
        height="2px"
        bg="white"
        borderRadius="2px"
        transition="width 0.25s ease"
        _groupHover={{ width: "100%" }}
      />
    </chakra.div>
  );
};

const Navbar = ({ isAuthenticated }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const links = [
    { name: "Home", path: "/" },
    { name: "Add Article", path: "/add-article" },
    { name: "Contact Us", path: "/contact" },
    { name: "About", path: "/about" },
    { name: "Profile", path: "/profile", authRequired: true },
  ];

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      try {
        await auth.signOut();
        toast({
          title: "Logged out",
          description: "You have successfully logged out.",
          status: "success",
          duration: 2500,
          isClosable: true,
          position: "top",
        });
        navigate("/login");
      } catch {
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          status: "error",
          duration: 2500,
          isClosable: true,
          position: "top",
        });
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <Box bg="teal.600" px={4} w="100%" minW="100vw"   zIndex="999" boxShadow="md">
      <Flex h="70px" alignItems="center" justifyContent="space-between">
        {/* Logo */}
        <Text
          fontSize={{ base: "16px", md: "20px" }}
          fontWeight="bold"
          color="white"
          cursor="pointer"
          onClick={() => navigate("/")}
        >
          Extra Time Blog
        </Text>

        {/* Desktop links */}
        <HStack spacing={6} display={{ base: "none", md: "flex" }}>
          {links.map(
            (link) =>
              (!link.authRequired || isAuthenticated) && (
                <chakra.div key={link.name} role="group">
                  <ModernNavLink
                    name={link.name}
                    path={link.path}
                    isActive={location.pathname === link.path}
                  />
                </chakra.div>
              )
          )}
        </HStack>

        {/* Desktop login/logout */}
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

        {/* Mobile hamburger */}
        <IconButton
          size="md"
          bg="transparent"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          display={{ base: "flex", md: "none" }}
          color="white"
          onClick={isOpen ? onClose : onOpen}
        />
      </Flex>

      {/* Mobile Menu */}
      <Slide direction="top" in={isOpen}>
        <Box bg="teal.600" px={6} py={4} display={{ md: "none" }}>
          <Stack spacing={4}>
            {links.map(
              (link) =>
                (!link.authRequired || isAuthenticated) && (
                  <chakra.div key={link.name} onClick={onClose} role="group">
                    <ModernNavLink
                      name={link.name}
                      path={link.path}
                      isActive={location.pathname === link.path}
                    />
                  </chakra.div>
                )
            )}

            <Button
              bg="white"
              color="teal.700"
              fontWeight="bold"
              borderRadius="full"
              py={6}
              _hover={{ bg: "gray.200" }}
              onClick={() => {
                onClose();
                handleAuthClick();
              }}
            >
              {isAuthenticated ? "Logout" : "Login"}
            </Button>
          </Stack>
        </Box>
      </Slide>
    </Box>
  );
};

Navbar.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export default Navbar;
