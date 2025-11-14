import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  IconButton,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaInstagram,
} from "react-icons/fa";

const About = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const accentColor = useColorModeValue("teal.500", "teal.300");

  return (
    <Box
      bg={bg}
      minH="100vh"
      w="100vw"
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={{ base: 3, md: 6 }}
      py={{ base: 6, md: 10 }}
    >
      <Box
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="2xl"
        maxW={{ base: "95%", sm: "600px", md: "800px" }}
        w="100%"
        p={{ base: 4, sm: 6, md: 10 }}
        textAlign="center"
      >
        {/* Header Section */}
        <VStack spacing={{ base: 3, md: 4 }}>
          <Avatar
            size={{ base: "xl", sm: "2xl" }}
            name="Extra Time"
            src="https://via.placeholder.com/150"
            border={`3px solid ${accentColor}`}
          />
          <Heading fontSize={{ base: "xl", sm: "2xl", md: "3xl" }} color={accentColor}>
            About Us
          </Heading>
          <Text fontSize={{ base: "sm", sm: "md" }} color={textColor} lineHeight="1.6">
            Welcome to <strong>Extra Time Blog</strong>, your go-to source for the latest and
            most reliable news from Nigeria and around the world. Our mission is to keep you
            informed and engaged with accurate reporting, insightful analysis, and in-depth
            coverage of the stories that matter.
          </Text>
        </VStack>

        {/* Divider */}
        <Divider my={{ base: 6, md: 8 }} borderColor={useColorModeValue("gray.300", "gray.700")} />

        {/* Focus Section */}
        <VStack spacing={{ base: 3, md: 4 }}>
          <Heading fontSize={{ base: "lg", md: "xl" }} color={accentColor}>
            Our Focus
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} color={textColor} lineHeight="1.6">
            At Extra Time Blog, we shine a spotlight on local news in Nigeria, bringing you the
            most important updates from across the country. From politics and business to sports
            and entertainment, we cover all the major events shaping the nation.
          </Text>
          <Text fontSize={{ base: "sm", md: "md" }} color={textColor} lineHeight="1.6">
            But we don&apos;t stop there. We also bring you breaking news and significant
            developments from around the world. Whether it&apos;s global politics, economic
            trends, or cultural shifts, Extra Time Blog provides a comprehensive view of what&apos;s
            happening beyond Nigeria&apos;s borders.
          </Text>
        </VStack>

        <Divider my={{ base: 6, md: 8 }} borderColor={useColorModeValue("gray.300", "gray.700")} />

        {/* Why Choose Us */}
        <VStack spacing={{ base: 3, md: 4 }}>
          <Heading fontSize={{ base: "lg", md: "xl" }} color={accentColor}>
            Why Choose Extra Time Blog?
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} color={textColor} lineHeight="1.6">
            Our team of dedicated journalists and editors is committed to delivering the truth
            with integrity and transparency. We believe in the power of journalism to inform,
            educate, and inspire positive change. By choosing Extra Time Blog, you&apos;re not just
            staying informed; you&apos;re joining a community that values accurate information and
            meaningful discourse.
          </Text>
        </VStack>

        <Divider my={{ base: 6, md: 8 }} borderColor={useColorModeValue("gray.300", "gray.700")} />

        {/* Social Icons */}
        <HStack justify="center" spacing={{ base: 3, md: 5 }} wrap="wrap">
          {[FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaInstagram].map((Icon, index) => (
            <IconButton
              key={index}
              as="a"
              href="#"
              aria-label="Social Link"
              icon={<Icon size={18} />}
              size={{ base: "sm", md: "lg" }}
              variant="ghost"
              color={accentColor}
              _hover={{
                transform: "translateY(-2px)",
                color: useColorModeValue("teal.600", "teal.400"),
              }}
              transition="all 0.2s ease"
            />
          ))}
        </HStack>

        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" mt={{ base: 4, md: 6 }}>
          © {new Date().getFullYear()} Extra Time Blog — All Rights Reserved.
        </Text>
      </Box>
    </Box>
  );
};

export default About;
