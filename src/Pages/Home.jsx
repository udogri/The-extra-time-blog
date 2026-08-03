import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Heading, Text, Button, VStack, useToast, Spinner,
  Image, HStack, Badge, Flex, SimpleGrid, Avatar, IconButton,
  Divider, Center, Icon
} from '@chakra-ui/react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import NetworkError from '../components/NetworkError';
import { FiExternalLink, FiGithub, FiMail, FiArrowRight } from 'react-icons/fi';
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaFacebook } from 'react-icons/fa';

const CATEGORY_COLORS = {
  'Web Development': 'teal',
  'Graphic Design': 'purple',
  'Life & Hobbies': 'purple',
  'Tutorials': 'teal',
};

const HomePage = () => {
  const { siteSettings } = useOutletContext();
  const [latestArticles, setLatestArticles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [activeProjectFilter, setActiveProjectFilter] = useState('All');
  
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      setNetworkError(false);
      try {
        // Fetch Projects
        const projSnap = await getDocs(collection(db, 'projects'));
        const projList = projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(projList);

        // Fetch Articles and sort by latest date
        const articlesQuery = query(collection(db, 'articles'), orderBy('date', 'desc'), limit(3));
        const snap = await getDocs(articlesQuery);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLatestArticles(list); // Extract top 3 articles
      } catch (error) {
        setNetworkError(true);
        toast({ title: 'Error loading page content.', description: error.message, status: 'error', duration: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [toast]);

  const filteredProjects = activeProjectFilter === 'All'
    ? projects
    : projects.filter(p => p.type === activeProjectFilter);

  const dynamicSocials = [
    { Icon: FaTwitter,   label: "Twitter",   href: siteSettings?.socials?.twitter || "#", color: "#1DA1F2" },
    { Icon: FaLinkedin,  label: "LinkedIn",  href: siteSettings?.socials?.linkedin || "#", color: "#0A66C2" },
    { Icon: FaGithub,    label: "GitHub",    href: siteSettings?.socials?.github || "#", color: "#24292e" },
    { Icon: FaFacebook,  label: "Facebook",  href: siteSettings?.socials?.facebook || "#", color: "#1877F2" },
    { Icon: FaInstagram, label: "Instagram", href: siteSettings?.socials?.instagram || "#", color: "#E1306C" },
  ].filter(s => s.href && s.href !== '#');

  if (loading) {
    return (
      <Box minH="100vh" w="100vw" display="flex" justifyContent="center" alignItems="center" bg="bg">
        <VStack spacing={3}>
          <Spinner size="lg" color="teal.400" thickness="3px" />
          <Text fontSize="sm" color="mutedText">Loading creative log…</Text>
        </VStack>
      </Box>
    );
  }

  if (networkError) return <NetworkError onRetry={() => window.location.reload()} />;

  return (
    <Box minH="100vh" w="100vw" bg="bg" pt="80px" pb={16}>
      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 8 }}>

        {/* ── 1. PERSONAL HERO HEADER (MINIMALIST) ── */}
        <Box 
          py={{ base: 8, md: 12 }} 
          mb={12} 
          mt={4}
        >
          <Flex direction={{ base: 'column', md: 'row' }} gap={8} align="center">
            <Box position="relative">
              <Box 
                position="absolute"
                inset="-4px"
                borderRadius="full"
                bgGradient="linear(to-tr, teal.400, purple.400)"
                opacity="0.8"
                filter="blur(1px)"
              />
              <Avatar 
                src={siteSettings?.avatarUrl || ''} 
                name={siteSettings?.bioName || 'Admin'} 
                size="2xl" 
                bg="teal.500" 
                color="white" 
                border="4px solid"
                borderColor="bg"
                position="relative"
                zIndex="1"
              />
            </Box>
            <VStack align="flex-start" spacing={4} flex="1">
              <Box>
                <Heading size="xl" fontWeight="800" color="text" letterSpacing="-0.04em" mb={2}>
                  {"Hi, I'm"} {siteSettings?.bioName || 'Creative Dev'}
                </Heading>
                <Text fontSize="lg" color="mutedText" lineHeight="1.6" maxW="2xl">
                  {siteSettings?.bioText || 'I am a frontend developer who loves building digital interfaces and visual designs.'}
                </Text>
              </Box>

              {/* Action Buttons & Socials */}
              <Flex w="100%" justify="space-between" align="center" flexWrap="wrap" gap={4} pt={2}>
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="border"
                    color="text"
                    _hover={{ bg: 'whiteAlpha.100', borderColor: 'teal.400', color: 'teal.400' }}
                    borderRadius="full"
                    leftIcon={<FiMail />}
                    onClick={() => navigate('/contact')}
                  >
                    Get in Touch
                  </Button>
                </HStack>

                {/* Social links */}
                <HStack spacing={1}>
                  {dynamicSocials.map(({ Icon, label, href, color }) => (
                    <IconButton
                      key={label}
                      as="a"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      icon={<Icon size={16} />}
                      size="sm"
                      variant="ghost"
                      color="mutedText"
                      borderRadius="full"
                      _hover={{ color, bg: 'whiteAlpha.100' }}
                    />
                  ))}
                </HStack>
              </Flex>
            </VStack>
          </Flex>
        </Box>

        {/* ── 3. LATEST ARTICLES SECTION ── */}
        <Box mb={14}>
          <Heading size="md" fontWeight="800" color="text" letterSpacing="-0.03em" mb={8}>
            Latest Articles
          </Heading>

          {latestArticles.length === 0 ? (
            <Box bg="cardBg" borderRadius="xl" border="1px solid" borderColor="border" p={12} textAlign="center">
              <Text fontSize="2xl" mb={3}>✍️</Text>
              <Text fontWeight="650" color="text">No posts published yet</Text>
              <Text fontSize="sm" color="mutedText" mt={1}>Check back later for tutorials and visual layouts!</Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
              {/* Featured article (First one) */}
              <FeaturedArticle
                article={latestArticles[0]}
                color={CATEGORY_COLORS[latestArticles[0].category] || 'teal'}
                onClick={() => navigate(`/articledetails/${latestArticles[0].id}`)}
              />
              
              {/* Divider if we have more articles */}
              {latestArticles.length > 1 && (
                <Divider borderColor="border" mb={4} />
              )}
              
              {/* Other articles */}
              {latestArticles.slice(1).map((article) => (
                <SimpleArticleRow
                  key={article.id}
                  article={article}
                  color={CATEGORY_COLORS[article.category] || 'teal'}
                  onClick={() => navigate(`/articledetails/${article.id}`)}
                />
              ))}
              
              <Center pt={8}>
                <Button
                  rightIcon={<FiArrowRight />}
                  colorScheme="teal"
                  variant="outline"
                  borderRadius="full"
                  px={8}
                  size="sm"
                  fontWeight="600"
                  onClick={() => navigate('/blog')}
                  _hover={{ bg: 'whiteAlpha.100' }}
                >
                  View All Blog Posts
                </Button>
              </Center>
            </VStack>
          )}
        </Box>

        <Box mb={16}>
          <Flex direction={{ base: 'column', sm: 'row' }} align={{ base: 'flex-start', sm: 'center' }} justify="space-between" mb={6} gap={4}>
            <Heading size="md" fontWeight="600" color="text" letterSpacing="-0.02em">
              Projects
            </Heading>
            <HStack spacing={2} bg="hoverBg" p={1} borderRadius="full">
              {['All', 'Web Development', 'Graphic Design'].map((filter) => (
                <Button
                  key={filter}
                  size="xs"
                  borderRadius="full"
                  variant={activeProjectFilter === filter ? 'solid' : 'ghost'}
                  bg={activeProjectFilter === filter ? 'text' : 'transparent'}
                  color={activeProjectFilter === filter ? 'bg' : 'mutedText'}
                  _hover={{ bg: activeProjectFilter === filter ? 'text' : 'hoverBg' }}
                  onClick={() => setActiveProjectFilter(filter)}
                  px={3}
                >
                  {filter}
                </Button>
              ))}
            </HStack>
          </Flex>

          {filteredProjects.length === 0 ? (
            <Box bg="cardBg" borderRadius="xl" border="1px solid" borderColor="border" p={12} textAlign="center" w="100%">
              <Text fontSize="2xl" mb={3}>🚀</Text>
              <Text fontWeight="650" color="text">No projects published yet</Text>
              <Text fontSize="sm" color="mutedText" mt={1}>Check back later for creative builds!</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {filteredProjects.map((proj) => (
                <Box
                  key={proj.id}
                  bg="cardBg"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="borderMuted"
                  overflow="hidden"
                  boxShadow="sm"
                  _hover={{ 
                    transform: 'translateY(-4px)', 
                    borderColor: 'teal.500', 
                    boxShadow: '0 12px 24px -10px rgba(49, 151, 149, 0.15)' 
                  }}
                  transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                  display="flex"
                  flexDirection="column"
                >
                  {proj.imageUrl && (
                    <Box overflow="hidden">
                      <Image 
                        src={proj.imageUrl} 
                        alt={proj.title}
                        h="160px"
                        w="100%"
                        objectFit="cover"
                        transition="transform 0.5s ease"
                        _hover={{ transform: 'scale(1.05)' }}
                      />
                    </Box>
                  )}
                  <Box p={5} flex="1" display="flex" flexDirection="column" justify="space-between">
                    <VStack align="flex-start" spacing={3}>
                      <Badge colorScheme={proj.type === 'Web Development' ? 'teal' : 'blue'} variant="subtle" fontSize="9px" px={2.5} py={0.5} borderRadius="full">
                        {proj.type}
                      </Badge>
                      <Heading size="xs" color="text" fontWeight="800" letterSpacing="-0.01em">
                        {proj.title}
                      </Heading>
                      <Text fontSize="xs" color="mutedText" noOfLines={3} lineHeight="1.6">
                        {proj.description}
                      </Text>
                    </VStack>
                    
                    <Box mt={4}>
                      {proj.techStack && proj.techStack.length > 0 && (
                        <Flex gap={1.5} flexWrap="wrap" mb={4}>
                          {proj.techStack.map((tool) => (
                            <Badge key={tool} variant="subtle" colorScheme="gray" fontSize="9px" px={2} py={0.2} borderRadius="md">
                              {tool}
                            </Badge>
                          ))}
                        </Flex>
                      )}
                      
                      <Divider borderColor="border" mb={3} />
                      
                      <HStack justify="space-between">
                        {proj.githubUrl ? (
                          <Button 
                            as="a" href={proj.githubUrl} target="_blank" rel="noopener noreferrer"
                            leftIcon={<FiGithub size={12} />} size="xs" variant="ghost" color="mutedText" _hover={{ color: 'text', bg: 'hoverBg' }} fontSize="10px"
                          >
                            Source Code
                          </Button>
                        ) : <Box />}

                        {proj.liveUrl ? (
                          <Button 
                            as="a" href={proj.liveUrl} target="_blank" rel="noopener noreferrer"
                            rightIcon={<FiExternalLink size={12} />} size="xs" variant="solid" colorScheme="teal" fontSize="10px" borderRadius="full" px={3}
                          >
                            Live Demo
                          </Button>
                        ) : <Box />}
                      </HStack>
                    </Box>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>

      </Box>
    </Box>
  );
};

const FeaturedArticle = ({ article, color = 'teal', onClick }) => {
  const [imageError, setImageError] = useState(false);
  const showImage = article.imageUrl && !imageError;

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: 4, md: 8 }}
      cursor="pointer"
      onClick={onClick}
      role="group"
      mb={10}
      align="center"
      w="100%"
    >
      {showImage && (
        <Box 
          overflow="hidden" 
          borderRadius="2xl" 
          w={{ base: '100%', md: '55%' }}
          h={{ base: '220px', md: '340px' }}
          bg="cardBg"
          boxShadow="2xl"
          transition="transform 0.3s ease"
          _groupHover={{ transform: 'scale(1.015)' }}
        >
          <Image
            src={article.imageUrl}
            alt={article.title}
            w="100%"
            h="100%"
            objectFit="cover"
            onError={() => setImageError(true)}
          />
        </Box>
      )}
      <VStack 
        align="flex-start" 
        spacing={4} 
        flex="1" 
        py={2}
        w="100%"
      >
        <Badge
          colorScheme={color}
          fontSize="10px"
          px={3}
          py={1}
          borderRadius="full"
          letterSpacing="0.05em"
          textTransform="uppercase"
        >
          {article.category}
        </Badge>
        <Heading 
          size="md" 
          fontWeight="800" 
          color="text" 
          letterSpacing="-0.03em"
          lineHeight="1.3"
          _groupHover={{ color: 'teal.400' }}
          transition="color 0.2s"
        >
          {article.title}
        </Heading>
        <Text fontSize="sm" color="mutedText" lineHeight="1.6" noOfLines={3}>
          {article.description || article.content}
        </Text>
        <Text fontSize="xs" fontWeight="600" color="mutedText">
          {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
      </VStack>
    </Flex>
  );
};

FeaturedArticle.propTypes = {
  article: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    content: PropTypes.string,
    imageUrl: PropTypes.string,
    category: PropTypes.string,
    date: PropTypes.string,
  }).isRequired,
  color: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

const SimpleArticleRow = ({ article, color = 'teal', onClick }) => {
  return (
    <Flex
      cursor="pointer"
      onClick={onClick}
      p={4}
      mx={-4}
      borderRadius="xl"
      align="center"
      justify="space-between"
      _hover={{ bg: 'hoverBg' }}
      transition="background-color 0.2s ease, transform 0.2s ease"
      gap={4}
      role="group"
      w="100%"
    >
      <VStack align="flex-start" spacing={1.5} flex="1">
        <HStack spacing={3}>
          <Text fontSize="11px" fontWeight="600" color="mutedText">
            {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <Badge
            colorScheme={color}
            fontSize="9px"
            px={2}
            borderRadius="full"
            letterSpacing="0.05em"
          >
            {article.category}
          </Badge>
        </HStack>
        <Heading 
          size="xs" 
          fontWeight="750" 
          color="text" 
          letterSpacing="-0.01em"
          _groupHover={{ color: 'teal.400' }}
          transition="color 0.2s"
        >
          {article.title}
        </Heading>
        <Text fontSize="xs" color="mutedText" noOfLines={1} maxW="xl">
          {article.description || article.content}
        </Text>
      </VStack>
      <Icon as={FiArrowRight} opacity={0} _groupHover={{ opacity: 1, transform: 'translateX(4px)' }} transition="all 0.2s" color="teal.400" w={4} h={4} />
    </Flex>
  );
};

SimpleArticleRow.propTypes = {
  article: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    content: PropTypes.string,
    imageUrl: PropTypes.string,
    category: PropTypes.string,
    date: PropTypes.string,
  }).isRequired,
  color: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default HomePage;