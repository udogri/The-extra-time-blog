import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Heading, Text, Button, VStack, useToast, Spinner,
  Image, HStack, Badge, Flex, SimpleGrid, Avatar, IconButton,
  Divider, Center
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
      <Box minH="100vh" w="100vw" display="flex" justifyContent="center" alignItems="center" bg="#0b0f19">
        <VStack spacing={3}>
          <Spinner size="lg" color="teal.400" thickness="3px" />
          <Text fontSize="sm" color="gray.400">Loading creative log…</Text>
        </VStack>
      </Box>
    );
  }

  if (networkError) return <NetworkError onRetry={() => window.location.reload()} />;

  return (
    <Box minH="100vh" w="100vw" bg="#0b0f19" pt="80px" pb={16}>
      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 8 }}>

        {/* ── 1. PERSONAL HERO HEADER CARD ── */}
        <Box 
          bg="#161e2e" 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="whiteAlpha.100" 
          p={{ base: 6, md: 8 }} 
          mb={12} 
          mt={4}
          boxShadow="2xl"
        >
          <Flex direction={{ base: 'column', md: 'row' }} gap={8} align="center">
            <Avatar 
              src={siteSettings?.avatarUrl || ''} 
              name={siteSettings?.bioName || 'Admin'} 
              size="2xl" 
              bg="teal.500" 
              color="white" 
              boxShadow="inner"
            />
            <VStack align="flex-start" spacing={4} flex="1">
              <Box>
                <HStack spacing={2} mb={1}>
                  <Heading size="lg" fontWeight="600" color="white" letterSpacing="-0.03em">
                    {"Hi, I'm"} {siteSettings?.bioName || 'Creative Dev'}
                  </Heading>
                </HStack>
                <Text fontSize="md" color="gray.400" lineHeight="1.6">
                  {siteSettings?.bioText || 'I am a frontend developer who loves building digital interfaces and visual designs.'}
                </Text>
              </Box>

              {/* Action Buttons & Socials */}
              <Flex w="100%" justify="space-between" align="center" flexWrap="wrap" gap={4} pt={2}>
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="whiteAlpha.300"
                    color="white"
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
                      color="gray.400"
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
        <Box mb={6}>
          <Heading size="md" fontWeight="600" color="white" letterSpacing="-0.02em" mb={6}>
            Latest Articles
          </Heading>

          {latestArticles.length === 0 ? (
            <Box bg="#161e2e" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" p={12} textAlign="center">
              <Text fontSize="2xl" mb={3}>✍️</Text>
              <Text fontWeight="650" color="white">No posts published yet</Text>
              <Text fontSize="sm" color="gray.400" mt={1}>Check back later for tutorials and visual layouts!</Text>
            </Box>
          ) : (
            <VStack spacing={6} align="stretch">
              {latestArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  color={CATEGORY_COLORS[article.category] || 'teal'}
                  onClick={() => navigate(`/articledetails/${article.id}`)}
                />
              ))}
              
              <Center pt={4}>
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
            <Heading size="md" fontWeight="600" color="white" letterSpacing="-0.02em">
              Projects
            </Heading>
            <HStack spacing={2} bg="whiteAlpha.100" p={1} borderRadius="full">
              {['All', 'Web Development', 'Graphic Design'].map((filter) => (
                <Button
                  key={filter}
                  size="xs"
                  borderRadius="full"
                  variant={activeProjectFilter === filter ? 'solid' : 'ghost'}
                  colorScheme={activeProjectFilter === filter ? 'purple' : 'whiteAlpha'}
                  color={activeProjectFilter === filter ? 'white' : 'whiteAlpha.700'}
                  onClick={() => setActiveProjectFilter(filter)}
                  px={3}
                >
                  {filter}
                </Button>
              ))}
            </HStack>
          </Flex>

          {filteredProjects.length === 0 ? (
            <Box bg="#161e2e" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" p={12} textAlign="center" w="100%">
              <Text fontSize="2xl" mb={3}>🚀</Text>
              <Text fontWeight="650" color="white">No projects published yet</Text>
              <Text fontSize="sm" color="gray.400" mt={1}>Check back later for creative builds!</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {filteredProjects.map((proj) => (
                <Box
                  key={proj.id}
                  bg="#161e2e"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  overflow="hidden"
                  boxShadow="2xl"
                  _hover={{ transform: 'translateY(-3px)', boxShadow: 'dark-lg' }}
                  transition="all 0.2s"
                  display="flex"
                  flexDirection="column"
                >
                  {proj.imageUrl && (
                    <Image 
                      src={proj.imageUrl} 
                      alt={proj.title}
                      h="160px"
                      w="100%"
                      objectFit="cover"
                    />
                  )}
                  <Box p={5} flex="1" display="flex" flexDirection="column" justify="space-between">
                    <VStack align="flex-start" spacing={3}>
                      <Badge colorScheme={proj.type === 'Web Development' ? 'teal' : 'purple'} variant="subtle" fontSize="9px" px={2} borderRadius="full">
                        {proj.type}
                      </Badge>
                      <Heading size="xs" color="white" fontWeight="700">
                        {proj.title}
                      </Heading>
                      <Text fontSize="xs" color="gray.400" noOfLines={3} lineHeight="1.5">
                        {proj.description}
                      </Text>
                    </VStack>
                    
                    <Box mt={4}>
                      {proj.techStack && proj.techStack.length > 0 && (
                        <Flex gap={1} flexWrap="wrap" mb={4}>
                          {proj.techStack.map((tool) => (
                            <Badge key={tool} colorScheme="whiteAlpha" variant="solid" fontSize="9px" px={1.5} py={0.2} borderRadius="md">
                              {tool}
                            </Badge>
                          ))}
                        </Flex>
                      )}
                      
                      <Divider borderColor="whiteAlpha.100" mb={3} />
                      
                      <HStack justify="space-between">
                        {proj.githubUrl ? (
                          <Button 
                            as="a" href={proj.githubUrl} target="_blank" rel="noopener noreferrer"
                            leftIcon={<FiGithub size={12} />} size="xs" variant="ghost" color="gray.400" _hover={{ color: 'white', bg: 'whiteAlpha.100' }} fontSize="10px"
                          >
                            Source Code
                          </Button>
                        ) : <Box />}

                        {proj.liveUrl ? (
                          <Button 
                            as="a" href={proj.liveUrl} target="_blank" rel="noopener noreferrer"
                            rightIcon={<FiExternalLink size={12} />} size="xs" variant="solid" colorScheme="purple" fontSize="10px" borderRadius="full"
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

const ArticleCard = ({ article, color = 'teal', onClick }) => {
  const [imageError, setImageError] = useState(false);
  const showImage = article.imageUrl && !imageError;

  return (
    <Flex
      bg="#161e2e"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      cursor="pointer"
      onClick={onClick}
      boxShadow="2xl"
      _hover={{ boxShadow: 'dark-lg', transform: 'translateY(-3px)', borderColor: `${color}.400` }}
      transition="all 0.2s"
      direction={{ base: 'column', md: 'row' }}
      w="100%"
    >
      {showImage && (
        <Box 
          position="relative" 
          w={{ base: '100%', md: '300px' }} 
          minW={{ base: '100%', md: '300px' }} 
          h={{ base: '200px', md: '200px' }} 
          overflow="hidden"
        >
          <Image
            src={article.imageUrl}
            alt={article.title}
            w="100%"
            h="100%"
            objectFit="cover"
            onError={() => setImageError(true)}
          />
          <Badge
            position="absolute"
            top={3}
            left={3}
            colorScheme={color}
            fontSize="9px"
            px={2.5}
            py={0.5}
            borderRadius="full"
            letterSpacing="0.05em"
          >
            {article.category}
          </Badge>
        </Box>
      )}
      <Box p={5} flex="1" display="flex" flexDirection="column" justify="space-between">
        <VStack align="flex-start" spacing={2} mb={4}>
          {!showImage && (
            <Badge
              colorScheme={color}
              fontSize="9px"
              px={2.5}
              py={0.5}
              borderRadius="full"
              letterSpacing="0.05em"
            >
              {article.category}
            </Badge>
          )}
          <Text fontWeight="700" fontSize="sm" noOfLines={2} lineHeight="1.4" color="white">
            {article.title}
          </Text>
          <Text fontSize="xs" color="gray.400" noOfLines={3} lineHeight="1.5">
            {article.description || article.content}
          </Text>
        </VStack>
        <Text fontSize="10px" color="gray.500">
          {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </Box>
    </Flex>
  );
};

ArticleCard.propTypes = {
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