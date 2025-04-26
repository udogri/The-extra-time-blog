import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  VStack,
  useToast,
  Spinner,
  Image,
  Flex,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import NoNewsAvailable from '../components/NoNewsAvailable';
import NetworkError from '../components/NetworkError';
import { FaArrowRightLong } from "react-icons/fa6";

const categories = [
  'Latest News',
  'Trending News',
  'Sports News',
  'Business News',
  'Local News',
  'International News',
];

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
          const categoryKey = category.toLowerCase().replace(' ', '');
          const q = query(
            collection(db, 'articles'),
            where('category', '==', category)
          );
          const querySnapshot = await getDocs(q);
          const categoryArticles = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          if (categoryArticles.length > 0) {
            fetchedArticles[categoryKey] = categoryArticles;
            categoriesWithArticles.push(category);
          }
        }

        // Fetch "Top News" separately
const topNewsQuery = query(
  collection(db, 'articles'),
  where('category', '==', 'Top News')
);
const topNewsSnapshot = await getDocs(topNewsQuery);
const topNewsArticles = topNewsSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

// Randomize Top News if multiple articles exist
const randomTopNews =
  topNewsArticles.length > 1
    ? topNewsArticles[Math.floor(Math.random() * topNewsArticles.length)]
    : topNewsArticles[0] || null;

fetchedArticles.topNews = randomTopNews;


        // Update sorted categories (only ones with articles)
        setArticles(fetchedArticles);
        setSortedCategories(categoriesWithArticles);
        setLoadedCounts(
          categoriesWithArticles.reduce((acc, key) => {
            acc[key.toLowerCase().replace(' ', '')] = 3;
            return acc;
          }, {})
        );
      } catch (error) {
        setNetworkError(true);
        toast({
          title: 'Error fetching articles.',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [toast]);

  const loadMore = (categoryKey) => {
    setLoadedCounts((prevCounts) => ({
      ...prevCounts,
      [categoryKey]: prevCounts[categoryKey] + 3,
    }));
  };

  const renderCategorySection = (category, categoryKey) => {
    const articlesForCategory = articles[categoryKey] || [];
    const loadedCount = loadedCounts[categoryKey] || 0;

    return (
      <VStack align="start" maxW="100%" spacing={4} mt={8} key={categoryKey}>
        <HStack w="100%" justify="space-between" p={4} rounded="md">
          <Heading size="md">{category}</Heading>
          {articlesForCategory.length > loadedCount && (
            <Button
              size="sm"
              color="teal"
              bg="transparent"
              gap={2}
              onClick={() => loadMore(categoryKey)}
            >
              View More
              <FaArrowRightLong color="teal" />
            </Button>
          )}
        </HStack>

        <Box
          display="flex"
          gap={4}
          overflowX="auto"
          w="100%"
          className="scroll-container"
          p={4}
        >
          {articlesForCategory.slice(0, loadedCount).map((article) => (
            <Box
              key={article.id}
              p={4}
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
              minWidth="300px"
              maxWidth="350px"
              mx="auto"
            >
              <Image
                src={article.imageUrl || 'https://via.placeholder.com/150'}
                alt={article.title}
                borderRadius="md"
                mb={4}
                objectFit="cover"
                boxSize="200px"
                w="100%"
              />
              <Text fontWeight="bold" noOfLines={1}>
                {article.title}
              </Text>
              <Text fontSize="sm" noOfLines={2}>
                {article.description || article.content}
              </Text>
              <Text fontSize="sm" color="red.700">
                {article.author} | {new Date(article.date).toLocaleDateString()}
              </Text>
              <Button
                size="sm"
                colorScheme="teal"
                mt={2}
                onClick={() => navigate(`/articledetails/${article.id}`)}
              >
                Read Article
              </Button>
            </Box>
          ))}
        </Box>
      </VStack>
    );
  };

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        width="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg="gray.50"
      >
        <Spinner size="xl" color="teal.500" />
      </Box>
    );
  }

  if (networkError) {
    return <NetworkError onRetry={() => window.location.reload()} />;
  }

  if (
    !loading &&
    !networkError &&
    sortedCategories.length === 0 &&
    !articles.topNews
  ) {
    return <NoNewsAvailable />;
  }

  return (
    <Box
      minHeight="100vh"
      width="100vw"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
      p={8}
    >
      {articles.topNews && (
        <Box
          mb={8}
          p={4}
          bg="gray.100"
          border="1px solid"
          borderColor="gray.300"
          rounded="md"
          w="100%"
          textAlign="center"

        >
          <Image
            src={articles.topNews.imageUrl || 'https://via.placeholder.com/150'}
            alt={articles.topNews.title}
            borderRadius="md"
            mb={4}
            objectFit="cover"
            w="100%"
          />
          <Heading size="xl" mb={4}>
            {articles.topNews.title}
          </Heading>
          <Text mb={4}>
            {articles.topNews.description || articles.topNews.content}
          </Text>
          <Button
            size="md"
            colorScheme="teal"
            onClick={() => navigate(`/articledetails/${articles.topNews.id}`)}
          >
            Read Article
          </Button>
        </Box>
      )}

      {sortedCategories.map((category) =>
        renderCategorySection(category, category.toLowerCase().replace(' ', ''))
      )}
    </Box>
  );
};

export default HomePage;
