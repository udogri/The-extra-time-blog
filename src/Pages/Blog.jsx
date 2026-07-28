import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Heading, Text, VStack, Spinner, useToast,
  Input, Flex, Badge, Image, HStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import NetworkError from '../components/NetworkError';
import { FiSearch } from 'react-icons/fi';

const categories = [
  'Web Development', 'Graphic Design', 'Life & Hobbies', 'Tutorials'
];

const CATEGORY_COLORS = {
  'Web Development': 'teal',
  'Graphic Design': 'purple',
  'Life & Hobbies': 'purple',
  'Tutorials': 'teal',
};

const Blog = () => {
  const [articles, setArticles] = useState({});
  const [sortedCategories, setSortedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setNetworkError(false);
      try {
        const fetchedArticles = {};
        const categoriesWithArticles = [];

        const snap = await getDocs(collection(db, 'articles'));
        const allArticles = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        for (const category of categories) {
          const categoryKey = category.toLowerCase().replace(/ /g, '');
          const list = allArticles.filter(item => item.category === category);
            
          if (list.length > 0) {
            fetchedArticles[categoryKey] = list;
            categoriesWithArticles.push(category);
          }
        }

        setArticles(fetchedArticles);
        setSortedCategories(categoriesWithArticles);
      } catch (error) {
        setNetworkError(true);
        toast({ title: 'Error loading articles.', description: error.message, status: 'error', duration: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [toast]);

  // Unique list of articles for search queries
  const allArticles = Object.values(articles).flat();
  const uniqueArticles = Array.from(new Map(allArticles.map(item => [item.id, item])).values());
  const filteredArticles = uniqueArticles.filter(article => 
    article.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box minH="100vh" w="100vw" display="flex" justifyContent="center" alignItems="center" bg="#0b0f19">
        <VStack spacing={3}>
          <Spinner size="lg" color="teal.400" thickness="3px" />
          <Text fontSize="sm" color="gray.400">Loading blog feed…</Text>
        </VStack>
      </Box>
    );
  }

  if (networkError) return <NetworkError onRetry={() => window.location.reload()} />;

  return (
    <Box minH="100vh" w="100vw" bg="#0b0f19" pt="100px" pb={20}>
      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 8 }}>
        
        {/* Page Title & Search Header */}
        <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'flex-start', md: 'center' }} justify="space-between" mb={12} gap={6}>
          <Box>
            <Heading size="lg" fontWeight="800" color="white" letterSpacing="-0.03em" mb={2}>
              ✍️ The Writing Log
            </Heading>
            <Text fontSize="sm" color="gray.400">
              Articles and logs covering web engineering, vector graphics, and lifestyle updates.
            </Text>
          </Box>

          <Box maxW="360px" w="100%" position="relative">
            <Input
              placeholder="Search articles by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="md"
              bg="#161e2e"
              color="white"
              borderRadius="full"
              border="1px solid"
              borderColor="whiteAlpha.100"
              focusBorderColor="teal.400"
              _hover={{ borderColor: 'whiteAlpha.300' }}
              fontSize="sm"
              pl={10}
            />
            <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" color="gray.450">
              <FiSearch size={14} />
            </Box>
          </Box>
        </Flex>

        {/* Articles layout loop */}
        {searchQuery ? (
          <Box>
            <Heading size="sm" fontWeight="700" mb={6} color="gray.400">
              Filtered Search Results ({filteredArticles.length})
            </Heading>
            {filteredArticles.length === 0 ? (
              <Box bg="#161e2e" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" p={16} textAlign="center">
                <Text fontSize="3xl" mb={4}>🔍</Text>
                <Text fontWeight="700" color="white">No matching articles found</Text>
                <Text fontSize="sm" color="gray.400" mt={1}>Try checking another search term or keyphrase.</Text>
              </Box>
            ) : (
              <VStack spacing={6} align="stretch">
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    color={CATEGORY_COLORS[article.category] || 'teal'}
                    onClick={() => navigate(`/articledetails/${article.id}`)}
                  />
                ))}
              </VStack>
            )}
          </Box>
        ) : (
          <VStack spacing={12} align="stretch">
            {sortedCategories.map((category) => {
              const categoryKey = category.toLowerCase().replace(/ /g, '');
              const categoryArticles = articles[categoryKey] || [];
              const color = CATEGORY_COLORS[category] || 'teal';

              return (
                <Box key={categoryKey}>
                  {/* Section Title */}
                  <HStack spacing={2.5} mb={5} align="center">
                    <Box w="4px" h="20px" bg={`${color}.400`} borderRadius="full" />
                    <Heading size="sm" fontWeight="800" color="white" letterSpacing="-0.01em">
                      {category}
                    </Heading>
                    <Badge colorScheme={color} variant="subtle" fontSize="10px" px={2.5} py={0.5} borderRadius="full">
                      {categoryArticles.length}
                    </Badge>
                  </HStack>

                  {/* Articles List */}
                  <VStack spacing={6} align="stretch">
                    {[...categoryArticles].reverse().map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        color={color}
                        onClick={() => navigate(`/articledetails/${article.id}`)}
                      />
                    ))}
                  </VStack>
                </Box>
              );
            })}
          </VStack>
        )}

      </Box>
    </Box>
  );
};

// Sub-component presentation card
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

export default Blog;
