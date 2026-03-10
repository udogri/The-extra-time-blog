import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Button, VStack, useToast, Spinner,
  Image, HStack, Badge,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import NetworkError from '../components/NetworkError';

const categories = [
  'Latest News', 'Trending News', 'Sports News',
  'Business News', 'Local News', 'International News',
];

const CATEGORY_COLORS = {
  'Latest News': 'blue',
  'Trending News': 'orange',
  'Sports News': 'green',
  'Business News': 'purple',
  'Local News': 'cyan',
  'International News': 'red',
  'Top News': 'red',
};

const HomePage = () => {
  const [articles, setArticles] = useState({});
  const [sortedCategories, setSortedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadedCounts, setLoadedCounts] = useState({});
  const [networkError, setNetworkError] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setNetworkError(false);
      try {
        const fetchedArticles = {};
        const categoriesWithArticles = [];

        for (const category of categories) {
          const categoryKey = category.toLowerCase().replace(/ /g, '');
          const q = query(collection(db, 'articles'), where('category', '==', category));
          const querySnapshot = await getDocs(q);
          const categoryArticles = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          if (categoryArticles.length > 0) {
            fetchedArticles[categoryKey] = categoryArticles;
            categoriesWithArticles.push(category);
          }
        }

        const topNewsQuery = query(collection(db, 'articles'), where('category', '==', 'Top News'));
        const topNewsSnapshot = await getDocs(topNewsQuery);
        fetchedArticles.topNews = topNewsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setArticles(fetchedArticles);
        setSortedCategories(categoriesWithArticles);
        setLoadedCounts(
          categoriesWithArticles.reduce((acc, key) => {
            acc[key.toLowerCase().replace(/ /g, '')] = 4;
            return acc;
          }, {})
        );
      } catch (error) {
        setNetworkError(true);
        toast({ title: 'Error fetching articles.', description: error.message, status: 'error', duration: 3000, isClosable: true, position: 'top' });
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [toast]);

  const loadMore = (categoryKey) => {
    setLoadedCounts((prev) => ({ ...prev, [categoryKey]: prev[categoryKey] + 4 }));
  };

  const renderCategorySection = (category, categoryKey) => {
    const articlesForCategory = articles[categoryKey] || [];
    const loadedCount = loadedCounts[categoryKey] || 0;
    const visible = [...articlesForCategory].reverse().slice(0, loadedCount);
    const color = CATEGORY_COLORS[category] || 'teal';

    return (
      <Box key={categoryKey} w="100%" mt={12}>
        {/* Section Header */}
        <Flex align="center" justify="space-between" mb={5} px={1}>
          <HStack spacing={3} align="center">
            <Box w="3px" h="22px" bg={`${color}.500`} borderRadius="full" />
            <Heading size="md" fontWeight="700" letterSpacing="-0.02em" color="gray.900">
              {category}
            </Heading>
            <Badge colorScheme={color} variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="full">
              {articlesForCategory.length}
            </Badge>
          </HStack>
          {articlesForCategory.length > loadedCount && (
            <Button
              size="xs"
              variant="ghost"
              color={`${color}.600`}
              fontSize="xs"
              letterSpacing="0.04em"
              fontWeight="600"
              rightIcon={<Box as="span" fontSize="10px">→</Box>}
              onClick={() => loadMore(categoryKey)}
              _hover={{ bg: `${color}.50` }}
            >
              View More
            </Button>
          )}
        </Flex>

        {/* Cards Row */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap={5}
        >
          {visible.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              color={color}
              onClick={() => navigate(`/articledetails/${article.id}`)}
            />
          ))}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box minH="100vh" w="100vw" display="flex" justifyContent="center" alignItems="center" bg="gray.50">
        <VStack spacing={3}>
          <Spinner size="lg" color="teal.500" thickness="3px" />
          <Text fontSize="sm" color="gray.500" letterSpacing="0.04em">Loading stories…</Text>
        </VStack>
      </Box>
    );
  }

  if (networkError) return <NetworkError onRetry={() => window.location.reload()} />;

  return (
    <Box minH="100vh" w="100vw" bg="gray.50" pt="80px" pb={16}>
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>

        {/* Hero — Top News */}
        {articles.topNews?.length > 0 && (
          <Box mt={6}>
            <Box
              display="grid"
              gridTemplateColumns={{ base: '1fr', lg: '7fr 3fr' }}
              gap={5}
              alignItems="stretch"
            >
              {/* Main Feature */}
              <Box
                position="relative"
                borderRadius="xl"
                overflow="hidden"
                minH={{ base: '320px', md: '480px' }}
                backgroundImage={`url(${articles.topNews[0]?.imageUrl || 'https://via.placeholder.com/800x480'})`}
                backgroundSize="cover"
                backgroundPosition="center"
                cursor="pointer"
                onClick={() => navigate(`/articledetails/${articles.topNews[0]?.id}`)}
                sx={{
                  '&:hover .overlay': { bg: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.35))' },
                  '&:hover .content-title': { color: 'teal.300' },
                }}
                transition="all 0.3s"
              >
                <Box
                  className="overlay"
                  position="absolute" inset="0"
                  bg="linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.25))"
                  transition="all 0.3s"
                />
                <Box position="absolute" bottom="0" left="0" right="0" p={{ base: 5, md: 8 }} zIndex={2}>
                  <Badge colorScheme="red" mb={3} px={3} py={1} borderRadius="full" fontSize="xs" letterSpacing="0.06em">
                    TOP STORY
                  </Badge>
                  <Heading
                    className="content-title"
                    fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                    color="white"
                    fontWeight="700"
                    letterSpacing="-0.02em"
                    lineHeight="1.25"
                    mb={3}
                    transition="color 0.2s"
                    noOfLines={3}
                  >
                    {articles.topNews[0]?.title}
                  </Heading>
                  <Text fontSize="sm" color="whiteAlpha.700">
                    {articles.topNews[0]?.author} · {new Date(articles.topNews[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </Box>
              </Box>

              {/* Side Stories */}
              <VStack spacing={3} align="stretch">
                {articles.topNews.slice(1, 4).map((item) => (
                  <Box
                    key={item.id}
                    bg="white"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.100"
                    p={4}
                    cursor="pointer"
                    onClick={() => navigate(`/articledetails/${item.id}`)}
                    _hover={{ borderColor: 'teal.300', transform: 'translateX(3px)' }}
                    transition="all 0.2s"
                    display="flex"
                    gap={3}
                    alignItems="flex-start"
                    flex="1"
                  >
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        borderRadius="md"
                        boxSize="64px"
                        objectFit="cover"
                        flexShrink={0}
                      />
                    )}
                    <Box>
                      <Badge colorScheme="red" fontSize="9px" mb={1} px={2} borderRadius="full" letterSpacing="0.05em">
                        TOP NEWS
                      </Badge>
                      <Text fontWeight="600" fontSize="sm" noOfLines={2} lineHeight="1.4" color="gray.800">
                        {item.title}
                      </Text>
                      <Text fontSize="xs" color="gray.400" mt={1}>
                        {item.author} · {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </VStack>
            </Box>
          </Box>
        )}

        {/* Category Sections */}
        {sortedCategories.map((category) =>
          renderCategorySection(category, category.toLowerCase().replace(/ /g, ''))
        )}
      </Box>
    </Box>
  );
};

// Extracted reusable card
const ArticleCard = ({ article, color = 'teal', onClick }) => (
  <Box
    bg="white"
    borderRadius="lg"
    border="1px solid"
    borderColor="gray.100"
    overflow="hidden"
    cursor="pointer"
    onClick={onClick}
    _hover={{ boxShadow: 'md', transform: 'translateY(-3px)', borderColor: `${color}.200` }}
    transition="all 0.22s ease"
  >
    <Box position="relative" h="160px" overflow="hidden">
      <Image
        src={article.imageUrl || 'https://via.placeholder.com/300x160'}
        alt={article.title}
        w="100%"
        h="100%"
        objectFit="cover"
        transition="transform 0.4s ease"
        sx={{ '.card:hover &': { transform: 'scale(1.04)' } }}
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
    <Box p={4}>
      <Text fontWeight="700" fontSize="sm" noOfLines={2} lineHeight="1.45" color="gray.800" mb={2}>
        {article.title}
      </Text>
      <Text fontSize="xs" color="gray.500" noOfLines={2} mb={3} lineHeight="1.5">
        {article.description || article.content}
      </Text>
      <HStack justify="space-between" align="center">
        <Text fontSize="xs" color="gray.400" noOfLines={1}>
          {article.author} · {new Date(article.date).toLocaleDateString()}
        </Text>
      </HStack>
    </Box>
  </Box>
);

// Need Flex import
import { Flex } from '@chakra-ui/react';

export default HomePage;