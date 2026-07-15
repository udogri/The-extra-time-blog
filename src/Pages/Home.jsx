import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Button, VStack, useToast, Spinner,
  Image, HStack, Badge, Flex, SimpleGrid, Avatar, IconButton,
  Divider, Center
} from '@chakra-ui/react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import NetworkError from '../components/NetworkError';
import { FiExternalLink, FiGithub, FiMail, FiBookOpen, FiArrowRight } from 'react-icons/fi';
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaFacebook } from 'react-icons/fa';

const CATEGORY_COLORS = {
  'Web Development': 'blue',
  'Graphic Design': 'green',
  'Life & Hobbies': 'purple',
  'Tutorials': 'orange',
};

const MOCK_PROJECTS = [
  {
    id: 'mock-1',
    title: 'Pixels & Code agency site',
    description: 'A fully interactive agency landing page showcasing advanced React transitions, responsive layouts, and rich CSS graphic animations.',
    type: 'Web Development',
    techStack: ['React', 'Framer Motion', 'Chakra UI'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://google.com',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mock-2',
    title: 'Visual Identity & Branding Concept',
    description: 'A comprehensive branding design mockup package including custom vector logo symbols, typographic hierarchy guidelines, and digital asset templates.',
    type: 'Graphic Design',
    techStack: ['Illustrator', 'Figma', 'Photoshop'],
    githubUrl: '',
    liveUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mock-3',
    title: 'Minimalist Content Management dashboard',
    description: 'A lightweight CMS platform constructed for writing post logs and viewing contacts in real-time, backed by ImgBB and serverless database endpoints.',
    type: 'Web Development',
    techStack: ['JavaScript', 'Firestore', 'ImgBB API'],
    githubUrl: 'https://github.com',
    liveUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
  }
];

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
        const snap = await getDocs(collection(db, 'articles'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLatestArticles(list.slice(0, 3)); // Extract top 3 articles
      } catch (error) {
        setNetworkError(true);
        toast({ title: 'Error loading page content.', description: error.message, status: 'error', duration: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [toast]);

  const projectsToDisplay = projects.length > 0 ? projects : MOCK_PROJECTS;
  const filteredProjects = activeProjectFilter === 'All'
    ? projectsToDisplay
    : projectsToDisplay.filter(p => p.type === activeProjectFilter);

  const dynamicSocials = [
    { Icon: FaTwitter,   label: "Twitter",   href: siteSettings?.socials?.twitter || "#", color: "#1DA1F2" },
    { Icon: FaLinkedin,  label: "LinkedIn",  href: siteSettings?.socials?.linkedin || "#", color: "#0A66C2" },
    { Icon: FaGithub,    label: "GitHub",    href: siteSettings?.socials?.github || "#", color: "#24292e" },
    { Icon: FaFacebook,  label: "Facebook",  href: siteSettings?.socials?.facebook || "#", color: "#1877F2" },
    { Icon: FaInstagram, label: "Instagram", href: siteSettings?.socials?.instagram || "#", color: "#E1306C" },
  ].filter(s => s.href && s.href !== '#');

  if (loading) {
    return (
      <Box minH="100vh" w="100vw" display="flex" justifyContent="center" alignItems="center" bg="gray.50">
        <VStack spacing={3}>
          <Spinner size="lg" color="teal.500" thickness="3px" />
          <Text fontSize="sm" color="gray.500">Loading creative log…</Text>
        </VStack>
      </Box>
    );
  }

  if (networkError) return <NetworkError onRetry={() => window.location.reload()} />;

  return (
    <Box minH="100vh" w="100vw" bg="gray.50" pt="80px" pb={16}>
      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 8 }}>

        {/* ── 1. PERSONAL HERO HEADER CARD ── */}
        <Box 
          bg="white" 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="gray.100" 
          p={{ base: 6, md: 8 }} 
          mb={12} 
          mt={4}
          boxShadow="sm"
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
                  <Heading size="lg" fontWeight="600" color="gray.900" letterSpacing="-0.03em">
                    Hi, I'm {siteSettings?.bioName || 'Creative Dev'}
                  </Heading>
                  <Badge bg="#0b0f19" variant="solid" fontSize="10px" borderRadius="full" px={2} py={0.5}>
                    Programmer & Designer
                  </Badge>
                </HStack>
                <Text fontSize="md" color="gray.600" lineHeight="1.6">
                  {siteSettings?.bioText || 'I am a frontend developer who loves building digital interfaces and visual designs.'}
                </Text>
              </Box>

              {/* Skills Tags */}
              {/* <Box w="100%">
                <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                  Core Tech & Design Tools
                </Text>
                <Flex gap={1.5} flexWrap="wrap">
                  <Badge colorScheme="blue" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="11px">React</Badge>
                  <Badge colorScheme="blue" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="11px">JavaScript</Badge>
                  <Badge colorScheme="blue" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="11px">Chakra UI</Badge>
                  <Badge colorScheme="blue" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="11px">Framer Motion</Badge>
                  <Badge colorScheme="green" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="11px">Figma</Badge>
                  <Badge colorScheme="green" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="11px">Branding</Badge>
                  <Badge colorScheme="green" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="11px">Vector Graphics</Badge>
                </Flex>
              </Box> */}

              {/* Action Buttons & Socials */}
              <Flex w="100%" justify="space-between" align="center" flexWrap="wrap" gap={4} pt={2}>
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    bg="#0b0f19"
                    color="white"
                    _hover={{ bg: 'gray.100', color: 'gray.900' }}
                    borderRadius="full"
                    leftIcon={<FiBookOpen />}
                    onClick={() => navigate('/blog')}
                  >
                    Read Blog
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="gray"
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
                      _hover={{ color, bg: 'gray.50' }}
                    />
                  ))}
                </HStack>
              </Flex>
            </VStack>
          </Flex>
        </Box>

        {/* ── 3. LATEST ARTICLES SECTION ── */}
        <Box mb={6}>
          <Heading size="md" fontWeight="600" color="gray.900" letterSpacing="-0.02em" mb={6}>
            Latest Articles
          </Heading>

          {latestArticles.length === 0 ? (
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={12} textAlign="center">
              <Text fontSize="2xl" mb={3}>✍️</Text>
              <Text fontWeight="650" color="gray.700">No posts published yet</Text>
              <Text fontSize="sm" color="gray.400" mt={1}>Check back later for tutorials and visual layouts!</Text>
            </Box>
          ) : (
            <VStack spacing={8} align="stretch">
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                {latestArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    color={CATEGORY_COLORS[article.category] || 'teal'}
                    onClick={() => navigate(`/articledetails/${article.id}`)}
                  />
                ))}
              </SimpleGrid>
              
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
                  _hover={{ bg: 'teal.50' }}
                >
                  View All Blog Posts
                </Button>
              </Center>
            </VStack>
          )}
        </Box>

        <Box mb={16}>
          <Flex direction={{ base: 'column', sm: 'row' }} align={{ base: 'flex-start', sm: 'center' }} justify="space-between" mb={6} gap={4}>
            <Heading size="md" fontWeight="600" color="gray.900" letterSpacing="-0.02em">
              Projects
            </Heading>
            <HStack spacing={2} bg="gray.100" p={1} borderRadius="full">
              {['All', 'Web Development', 'Graphic Design'].map((filter) => (
                <Button
                  key={filter}
                  size="xs"
                  borderRadius="full"
                  variant={activeProjectFilter === filter ? 'solid' : 'ghost'}
                  colorScheme={activeProjectFilter === filter ? 'purple' : 'gray'}
                  onClick={() => setActiveProjectFilter(filter)}
                  px={3}
                >
                  {filter}
                </Button>
              ))}
            </HStack>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {filteredProjects.map((proj) => (
              <Box
                key={proj.id}
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
                boxShadow="sm"
                _hover={{ transform: 'translateY(-3px)', boxShadow: 'md' }}
                transition="all 0.2s"
                display="flex"
                flexDirection="column"
              >
                <Image 
                  src={proj.imageUrl || 'https://via.placeholder.com/400x220'} 
                  alt={proj.title}
                  h="160px"
                  w="100%"
                  objectFit="cover"
                />
                <Box p={5} flex="1" display="flex" flexDirection="column" justify="space-between">
                  <VStack align="flex-start" spacing={3}>
                    <Badge colorScheme={proj.type === 'Web Development' ? 'blue' : 'green'} variant="subtle" fontSize="9px" px={2} borderRadius="full">
                      {proj.type}
                    </Badge>
                    <Heading size="xs" color="gray.800" fontWeight="700">
                      {proj.title}
                    </Heading>
                    <Text fontSize="xs" color="gray.500" noOfLines={3} lineHeight="1.5">
                      {proj.description}
                    </Text>
                  </VStack>
                  
                  <Box mt={4}>
                    <Flex gap={1} flexWrap="wrap" mb={4}>
                      {proj.techStack?.map((tool) => (
                        <Badge key={tool} colorScheme="gray" variant="solid" fontSize="9px" px={1.5} py={0.2} borderRadius="md">
                          {tool}
                        </Badge>
                      ))}
                    </Flex>
                    
                    <Divider mb={3} />
                    
                    <HStack justify="space-between">
                      {proj.githubUrl ? (
                        <Button 
                          as="a" href={proj.githubUrl} target="_blank" rel="noopener noreferrer"
                          leftIcon={<FiGithub size={12} />} size="xs" variant="ghost" colorScheme="gray" fontSize="10px"
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
        </Box>

      </Box>
    </Box>
  );
};

const ArticleCard = ({ article, color = 'teal', onClick }) => (
  <Box
    bg="white"
    borderRadius="xl"
    border="1px solid"
    borderColor="gray.100"
    overflow="hidden"
    cursor="pointer"
    onClick={onClick}
    boxShadow="sm"
    _hover={{ boxShadow: 'md', transform: 'translateY(-3px)', borderColor: `${color}.200` }}
    transition="all 0.2s"
    display="flex"
    flexDirection="column"
    h="100%"
  >
    <Box position="relative" h="140px" overflow="hidden">
      <Image
        src={article.imageUrl || 'https://via.placeholder.com/300x160'}
        alt={article.title}
        w="100%"
        h="100%"
        objectFit="cover"
      />
      <Badge
        position="absolute"
        top={3}
        left={3}
        colorScheme={color}
        fontSize="9px"
        px={2}
        py={0.5}
        borderRadius="full"
        letterSpacing="0.05em"
      >
        {article.category}
      </Badge>
    </Box>
    <Box p={4} flex="1" display="flex" flexDirection="column" justify="space-between">
      <VStack align="flex-start" spacing={1.5} mb={3}>
        <Text fontWeight="700" fontSize="sm" noOfLines={2} lineHeight="1.4" color="gray.850">
          {article.title}
        </Text>
        <Text fontSize="xs" color="gray.500" noOfLines={2} lineHeight="1.5">
          {article.description || article.content}
        </Text>
      </VStack>
      <Text fontSize="10px" color="gray.400">
        {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </Text>
    </Box>
  </Box>
);

export default HomePage;