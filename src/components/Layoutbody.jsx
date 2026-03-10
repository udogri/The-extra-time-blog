import { Box } from "@chakra-ui/react";
import Footer from "./Footer";
import Navigation from "./Navigation";

/**
 * Root layout wrapper.
 * - Navigation is fixed at the top (60px tall), so we pad the main content area.
 * - Footer sits flush at the bottom.
 */
const Layout = ({ children }) => {
  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      bg="gray.50"
      overflowX="hidden"
      w="100%"
    >
      {/* Fixed top nav — Navigation itself handles position: fixed */}
      <Navigation />

      {/* Main content area — offset by navbar height */}
      <Box
        as="main"
        flex="1"
        pt="60px"
        w="100%"
      >
        {children}
      </Box>

      <Footer />
    </Box>
  );
};

export default Layout;