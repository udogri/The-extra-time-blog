import {
  Box, VStack, HStack, Heading, Text, IconButton, Flex, Avatar, SimpleGrid, Badge, Divider
} from "@chakra-ui/react";
import { useOutletContext } from "react-router-dom";
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaFacebook } from "react-icons/fa";
import { FiCode, FiFeather, FiCpu, FiTrendingUp } from "react-icons/fi";

const About = () => {
  const { siteSettings } = useOutletContext();

  const dynamicSocials = [
    { Icon: FaTwitter,   label: "Twitter",   href: siteSettings?.socials?.twitter || "#", color: "#1DA1F2" },
    { Icon: FaLinkedin,  label: "LinkedIn",  href: siteSettings?.socials?.linkedin || "#", color: "#0A66C2" },
    { Icon: FaGithub,    label: "GitHub",    href: siteSettings?.socials?.github || "#", color: "#24292e" },
    { Icon: FaFacebook,  label: "Facebook",  href: siteSettings?.socials?.facebook || "#", color: "#1877F2" },
    { Icon: FaInstagram, label: "Instagram", href: siteSettings?.socials?.instagram || "#", color: "#E1306C" },
  ].filter(s => s.href && s.href !== '#');

  const frontendSkills = ["React.js", "JavaScript (ES6+)", "HTML5 & CSS3", "Chakra UI", "Framer Motion", "Vite", "React Router"];
  const designSkills = ["Figma", "Adobe Photoshop", "Adobe Illustrator", "Branding Assets", "Typography"];
  const databaseSkills = ["Firebase Auth", "Firestore", "Git & GitHub", "REST APIs", "ImgBB integration"];

  return (
    <Box minH="100vh" bg="bg" overflowX="hidden" pt="80px" pb={16}>
      
      {/* Hero Intro */}
      <Box
        bg="cardBg"
        position="relative"
        overflow="hidden"
        width="100vw"
        left="50%"
        transform="translateX(-50%)"
        py={{ base: 12, md: 16 }}
        textAlign="center"
        borderBottom="1px solid"
        borderColor="border"
        mb={10}
      >
        <Box position="absolute" top="-50px" left="-50px" w="240px" h="240px" borderRadius="full" bg="purple.500" opacity={0.08} pointerEvents="none" />
        <Box position="absolute" bottom="-50px" right="-50px" w="280px" h="280px" borderRadius="full" bg="teal.400" opacity={0.06} pointerEvents="none" />

        <Box position="relative" zIndex={1} maxW="700px" mx="auto" px={6}>
          <Box display="inline-flex" px={3} py={0.5} borderRadius="full" bg="hoverBg" border="1px solid" borderColor="borderMuted" mb={4}>
            <Text fontSize="xs" color="teal.400" fontWeight="600" letterSpacing="0.05em" textTransform="uppercase">
              The Developer & Designer
            </Text>
          </Box>
          <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="800" color="text" mb={4} letterSpacing="-0.03em">
            Hi, I'm <Box as="span" color="teal.400">{siteSettings?.bioName || "Creative Developer"}</Box>
          </Heading>
          <Text fontSize="sm" color="mutedText" lineHeight="1.7" maxW="520px" mx="auto">
            {siteSettings?.description || "Frontend Web Developer with a passion for creative visual design, UI components, and sharing thoughts on life and coding."}
          </Text>
        </Box>
      </Box>

      {/* Main Container */}
      <Box maxW="900px" mx="auto" px={{ base: 4, md: 8 }}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          
          {/* Main Card: Avatar and bio */}
          <Box gridColumn={{ base: "span 1", md: "span 2" }} bg="cardBg" p={6} borderRadius="xl" border="1px solid" borderColor="borderMuted" boxShadow="sm" _hover={{ borderColor: "teal.500", boxShadow: "0 12px 24px -10px rgba(49, 151, 149, 0.1)" }} transition="all 0.3s ease">
            <Flex direction={{ base: "column", sm: "row" }} gap={6} align={{ base: "center", sm: "flex-start" }}>
              <Avatar 
                src={siteSettings?.avatarUrl || ""} 
                name={siteSettings?.bioName || "Creative Developer"} 
                size="xl" 
                bg="teal.500" 
                color="white"
                boxShadow="sm"
              />
              <VStack align="flex-start" spacing={3} flex="1">
                <HStack spacing={2}>
                  <Box w="3px" h="14px" bg="teal.500" borderRadius="full" />
                  <Text fontSize="xs" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" color="teal.400">
                    My Story
                  </Text>
                </HStack>
                <Text fontSize="sm" color="mutedText" lineHeight="1.7">
                  {siteSettings?.bioText || "I build responsive, clean, and interactive interfaces. Focused on React and frontend architectures, I balance full-time web development with creative graphics design, layouts, and lifestyle writing."}
                </Text>
              </VStack>
            </Flex>

            <Divider borderColor="border" my={6} />

            {/* Creative Philosophy */}
            <Heading size="xs" color="text" textTransform="uppercase" letterSpacing="0.05em" mb={3} display="flex" alignItems="center" gap={2}>
              <FiTrendingUp color="#14b8a6" /> My Philosophy
            </Heading>
            <Text fontSize="xs" color="mutedText" lineHeight="1.6">
              I believe software development shouldn't just be about complex engineering. It should be visually pleasing, accessible, and delightful to interact with. By merging frontend expertise with graphics design tools, I aim to craft pixel-perfect websites that feel natural and alive.
            </Text>
          </Box>

          {/* Socials & Contact Info */}
          <Box bg="cardBg" p={6} borderRadius="xl" border="1px solid" borderColor="borderMuted" boxShadow="sm" _hover={{ borderColor: "teal.500", boxShadow: "0 12px 24px -10px rgba(49, 151, 149, 0.1)" }} transition="all 0.3s ease" display="flex" flexDirection="column" justify="space-between">
            <VStack align="stretch" spacing={5}>
              <Box>
                <Text fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                  Email Contact
                </Text>
                <Text fontSize="sm" fontWeight="600" color="text">
                  {siteSettings?.contactEmail || "hello@creativedev.com"}
                </Text>
              </Box>
              
              <Box>
                <Text fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase" letterSpacing="0.05em" mb={3}>
                  Interests & Hobbies
                </Text>
                <Flex gap={1} flexWrap="wrap">
                  <Badge colorScheme="gray" variant="subtle" fontSize="10px">UI Coding</Badge>
                  <Badge colorScheme="gray" variant="subtle" fontSize="10px">Illustration</Badge>
                  <Badge colorScheme="gray" variant="subtle" fontSize="10px">Gaming</Badge>
                  <Badge colorScheme="gray" variant="subtle" fontSize="10px">Sports</Badge>
                  <Badge colorScheme="gray" variant="subtle" fontSize="10px">Tech Writing</Badge>
                </Flex>
              </Box>
            </VStack>

            <Box pt={6}>
              <Divider borderColor="border" mb={4} />
              <Text fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase" letterSpacing="0.05em" mb={2} textAlign="center">
                Let's Connect
              </Text>
              <HStack justify="center" spacing={2}>
                {dynamicSocials.map(({ Icon, label, href, color }) => (
                  <IconButton
                    key={label}
                    as="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    icon={<Icon size={14} />}
                    size="sm"
                    variant="ghost"
                    color="mutedText"
                    borderRadius="full"
                    _hover={{ color, bg: "hoverBg" }}
                  />
                ))}
              </HStack>
            </Box>
          </Box>

        </SimpleGrid>

        {/* ── Skills Matrix Section ── */}
        <Box bg="cardBg" p={6} borderRadius="xl" border="1px solid" borderColor="borderMuted" boxShadow="sm" _hover={{ borderColor: "teal.500", boxShadow: "0 12px 24px -10px rgba(49, 151, 149, 0.1)" }} transition="all 0.3s ease">
          <Heading size="sm" mb={6} color="text" fontWeight="700" letterSpacing="-0.01em">
            ⚡ Skills Inventory
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            
            {/* Frontend */}
            <VStack align="stretch" spacing={3}>
              <HStack spacing={2}>
                <FiCode color="#14b8a6" />
                <Text fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase">Frontend Dev</Text>
              </HStack>
              <Flex gap={1.5} flexWrap="wrap">
                {frontendSkills.map(skill => (
                  <Badge key={skill} colorScheme="teal" variant="subtle" fontSize="10px" borderRadius="md" px={2} py={0.5}>
                    {skill}
                  </Badge>
                ))}
              </Flex>
            </VStack>

            {/* Design */}
            <VStack align="stretch" spacing={3}>
              <HStack spacing={2}>
                <FiFeather color="#8b5cf6" />
                <Text fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase">Graphic Design</Text>
              </HStack>
              <Flex gap={1.5} flexWrap="wrap">
                {designSkills.map(skill => (
                  <Badge key={skill} colorScheme="blue" variant="subtle" fontSize="10px" borderRadius="md" px={2} py={0.5}>
                    {skill}
                  </Badge>
                ))}
              </Flex>
            </VStack>

            {/* Tools */}
            <VStack align="stretch" spacing={3}>
              <HStack spacing={2}>
                <FiCpu color="#14b8a6" />
                <Text fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase">Workflow & Data</Text>
              </HStack>
              <Flex gap={1.5} flexWrap="wrap">
                {databaseSkills.map(skill => (
                  <Badge key={skill} colorScheme="teal" variant="subtle" fontSize="10px" borderRadius="md" px={2} py={0.5}>
                    {skill}
                  </Badge>
                ))}
              </Flex>
            </VStack>

          </SimpleGrid>
        </Box>

      </Box>
    </Box>
  );
};

export default About;