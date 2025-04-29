import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  IconButton,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';

const About = () => {
  const bg = useColorModeValue('gray.100', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.200');

  return (
    <Box
      bg={bg}
      minH="100vh"
      w='100vw'
      display="flex"
      justifyContent="center"
      alignItems="center"
      p="30px"
    >
      
        <VStack spacing={6}>
          {/* Avatar Section */}
          <Avatar size="xl" name="Extra Time" src="https://via.placeholder.com/150" />
          <Heading as="h1" size="lg" textAlign="center">
            About us
          </Heading>
          <Text fontSize="md" color={textColor} textAlign="center">
          Welcome to <strong>Extra Time Blog</strong>, your go-to source for the latest and most reliable news
        from Nigeria and around the world. Our mission is to keep you informed and engaged with 
        accurate reporting, insightful analysis, and in-depth coverage of the stories that matter.
          </Text>
          <Heading as="h1" size="lg" textAlign="center">
            Our focus
          </Heading>
          <Text fontSize="md" color={textColor} textAlign="center">
          At Extra Time Blog, we shine a spotlight on local news in Nigeria, bringing you the most 
        important updates from across the country. From politics and business to sports and 
        entertainment, we cover all the major events shaping the nation.
          </Text>
          <Text fontSize="md" color={textColor} textAlign="center">
          But we don&apos;t stop there. We also bring you breaking news and significant developments 
        from around the world. Whether it&apos;s global politics, economic trends, or cultural 
        shifts, Extra Time Blog provides you with a comprehensive view of what&apos;s happening beyond 
        Nigeria&apos;s borders.
          </Text>
          <Heading as="h2" size="lg" textAlign="center">
            Why choose Extra Time Blog?
          </Heading>
          <Text fontSize="md" color={textColor} textAlign="center">
          Our team of dedicated journalists and editors is committed to delivering the truth 
        with integrity and transparency. We believe in the power of journalism to inform, 
        educate, and inspire positive change. By choosing Extra Time Blog, you&apos;re not just staying 
        informed; you&apos;re joining a community that values accurate information and meaningful 
        discourse.
          </Text>

          {/* Social Media Links */}
          <HStack spacing={4}>
            <Link href="https://facebook.com" isExternal>
              <IconButton
                aria-label="Facebook"
                icon={<FaFacebook />}
                background="transparent"
              />
            </Link>
            <Link href="https://twitter.com" isExternal>
              <IconButton
                aria-label="Twitter"
                icon={<FaTwitter />}
                background="transparent"
              />
            </Link>
            <Link href="https://linkedin.com" isExternal>
              <IconButton
                aria-label="LinkedIn"
                icon={<FaLinkedin />}
                background="transparent"
              />
            </Link>
            <Link href="https://github.com" isExternal>
              <IconButton
                aria-label="GitHub"
                icon={<FaGithub />}
                background="transparent"
              />
            </Link>
            <Link href="https://instagram.com" isExternal>
              <IconButton
                aria-label="Instagram"
                icon={<FaInstagram />}
                background="transparent"
              />
            </Link>
          </HStack>
        </VStack>
    </Box>
  );
};

export default About;
