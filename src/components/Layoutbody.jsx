import { Box } from "@chakra-ui/react";
import Footer from "./Footer";
import Navigation from "./Navigation";

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navigation />

      <Box flex="1" px={{ base: 4, md: 8 }} py={6}>
        {children}
      </Box>

      <Footer />
    </Box>
  );
};

export default Layout;
