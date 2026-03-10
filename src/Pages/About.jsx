import {
  Box, VStack, HStack, Heading, Text, IconButton, Flex,
} from "@chakra-ui/react";
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";

const SOCIAL_LINKS = [
  { Icon: FaTwitter,   label: "Twitter",   href: "#", color: "#1DA1F2" },
  { Icon: FaLinkedin,  label: "LinkedIn",  href: "#", color: "#0A66C2" },
  { Icon: FaGithub,    label: "GitHub",    href: "#", color: "#6e7681" },
  { Icon: FaFacebook,  label: "Facebook",  href: "#", color: "#1877F2" },
  { Icon: FaInstagram, label: "Instagram", href: "#", color: "#E1306C" },
];

const PILLARS = [
  { emoji: "📰", title: "Accurate Reporting", body: "Every story is verified before it's published. We hold ourselves to the highest standards of journalistic integrity." },
  { emoji: "🌍", title: "Local & Global",      body: "From Lagos to London, we cover the stories that shape Nigeria and the world beyond its borders." },
  { emoji: "⚡", title: "Always Current",      body: "Breaking news, live updates, and in-depth analysis — delivered the moment it matters." },
];

const About = () => {
  return (
    /* Page root — no padding here, sections manage their own */
    <Box minH="100vh" bg="gray.50" overflowX="hidden">

      {/* ── Full-bleed hero ── */}
      <Box
        bg="gray.900"
        position="relative"
        overflow="hidden"
        /* Bleed past any Layout padding by stretching to full viewport width */
        width="100vw"
        left="50%"
        transform="translateX(-50%)"
        pt={{ base: 16, md: 24 }}
        pb={{ base: 14, md: 20 }}
        textAlign="center"
      >
        {/* Decorative blobs */}
        <Box position="absolute" top="-80px"  left="-80px"  w="320px" h="320px" borderRadius="full" bg="teal.500" opacity={0.07} pointerEvents="none" />
        <Box position="absolute" bottom="-80px" right="-60px" w="360px" h="360px" borderRadius="full" bg="teal.400" opacity={0.05} pointerEvents="none" />

        {/* Content constrained in centre */}
        <Box position="relative" zIndex={1} maxW="640px" mx="auto" px={{ base: 6, md: 8 }}>

          <Box
            display="inline-flex"
            px={4} py={1}
            borderRadius="full"
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.200"
            mb={6}
          >
            <Text fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="teal.300" fontWeight="600">
              Our Story
            </Text>
          </Box>

          <Heading
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="800"
            letterSpacing="-0.04em"
            lineHeight="1.15"
            color="white"
            mb={5}
          >
            News that{" "}
            <Box as="span" color="teal.400">actually</Box>
            {" "}matters
          </Heading>

          <Text fontSize={{ base: "sm", md: "md" }} color="whiteAlpha.600" lineHeight="1.85" maxW="480px" mx="auto">
            Extra Time Blog is Nigeria's independent voice — fast, factual, and unfiltered.
            We cover everything from local politics to global shifts so you're always in the know.
          </Text>
        </Box>
      </Box>

      {/* ── Pillars ── */}
      <Box maxW="900px" mx="auto" px={{ base: 4, md: 8 }} mt={12}>
        <Flex direction={{ base: "column", md: "row" }} gap={5}>
          {PILLARS.map(({ emoji, title, body }) => (
            <Box
              key={title}
              flex="1"
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.100"
              p={6}
              _hover={{ boxShadow: "md", borderColor: "teal.200", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <Text fontSize="2xl" mb={3}>{emoji}</Text>
              <Text fontWeight="700" fontSize="sm" color="gray.900" mb={2} letterSpacing="-0.01em">
                {title}
              </Text>
              <Text fontSize="sm" color="gray.500" lineHeight="1.75">
                {body}
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>

      {/* ── Mission ── */}
      <Box maxW="900px" mx="auto" px={{ base: 4, md: 8 }} mt={8}>
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={{ base: 6, md: 10 }}>
          <Flex direction={{ base: "column", md: "row" }} gap={10} align="flex-start">
            <Box flexShrink={0} w={{ base: "100%", md: "160px" }}>
              <Box w="28px" h="2px" bg="teal.500" borderRadius="full" mb={3} />
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase" color="teal.500">
                Our Mission
              </Text>
            </Box>
            <VStack align="flex-start" spacing={4} flex="1">
              <Text fontSize={{ base: "sm", md: "md" }} color="gray.600" lineHeight="1.85">
                At Extra Time Blog, we believe journalism is a public service. Our team of dedicated
                reporters and editors works around the clock to deliver stories that are accurate,
                contextual, and fair — from the streets of Lagos to the corridors of global power.
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }} color="gray.600" lineHeight="1.85">
                We don't chase clicks. We chase truth. By choosing Extra Time Blog, you're joining a
                growing community that values honest information and meaningful conversation about
                the issues that shape our world.
              </Text>
            </VStack>
          </Flex>
        </Box>
      </Box>

      {/* ── Stats strip ── */}
      <Box maxW="900px" mx="auto" px={{ base: 4, md: 8 }} mt={6} mb={8}>
        <Box bg="gray.900" borderRadius="xl" p={{ base: 6, md: 8 }}>
          <Flex justify="space-around" flexWrap="wrap" gap={6}>
            {[
              { value: "500+", label: "Articles Published" },
              { value: "50K+", label: "Monthly Readers"    },
              { value: "7",    label: "News Categories"    },
              { value: "100%", label: "Independent"        },
            ].map(({ value, label }) => (
              <Box key={label} textAlign="center">
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800" color="teal.400" letterSpacing="-0.03em">
                  {value}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.500" letterSpacing="0.06em" textTransform="uppercase" mt={1}>
                  {label}
                </Text>
              </Box>
            ))}
          </Flex>
        </Box>
      </Box>

      {/* ── Connect ── */}
      <Box maxW="900px" mx="auto" px={{ base: 4, md: 8 }} pb={16}>
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={{ base: 6, md: 8 }} textAlign="center">
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase" color="teal.500" mb={2}>
            Follow Us
          </Text>
          <Heading fontSize={{ base: "lg", md: "xl" }} fontWeight="700" letterSpacing="-0.02em" color="gray.900" mb={5}>
            Stay connected
          </Heading>
          <HStack justify="center" spacing={2}>
            {SOCIAL_LINKS.map(({ Icon, label, href, color }) => (
              <IconButton
                key={label}
                as="a"
                href={href}
                aria-label={label}
                icon={<Icon size={16} />}
                size="md"
                variant="ghost"
                color="gray.400"
                borderRadius="full"
                _hover={{ color, bg: "gray.50", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              />
            ))}
          </HStack>
        </Box>
      </Box>

    </Box>
  );
};

export default About;