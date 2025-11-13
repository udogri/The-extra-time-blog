import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    Button,
    VStack,
    useToast,
    Spinner,
    Image,
    HStack,
    Badge,
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
                // Keep all top news articles as an array
                fetchedArticles.topNews = topNewsArticles;


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
                    position: 'top',
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
                    {[...articlesForCategory].reverse().slice(0, loadedCount).map((article) => (
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

    // if (
    //     !loading &&
    //     !networkError &&
    //     sortedCategories.length === 0 &&
    //     !articles.topNews
    // ) {
    //     return <NoNewsAvailable />;
    // }

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
                    display={{ base: "grid", md: "flex" }}
                    gap={6}
                    w="100%"
                    alignItems="stretch"
                >
                    {/* LEFT SIDE — Main Top News */}
                    <Box
                        position="relative"
                        borderRadius="md"
                        overflow="hidden"
                        flex="2"
                        height={{ base: "300px", md: "450px" }}
                        backgroundImage={`url(${articles.topNews[0]?.imageUrl || "https://via.placeholder.com/150"})`}
                        backgroundSize="cover"
                        backgroundPosition="center"
                        display="flex"
                        alignItems="flex-end"
                        justifyContent="flex-start"
                        p={6}
                    >
                        {/* Overlay gradient */}
                        <Box
                            position="absolute"
                            top="0"
                            left="0"
                            w="100%"
                            h="100%"
                            bg="linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3))"
                        />

                        {/* Main Content */}
                        <Box position="relative" zIndex={2} color="white" maxW="80%">
                            <Badge colorScheme="red" mb={3} px={2} py={1}>
                                {articles.topNews[0]?.category || "Top News"}
                            </Badge>

                            <Heading
                                fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                                fontWeight="bold"
                                mb={3}
                                lineHeight="1.3"
                            >
                                {articles.topNews[0]?.title}
                            </Heading>

                            <Text fontSize="sm" color="gray.200" mb={4}>
                                {articles.topNews[0]?.author} |{" "}
                                {new Date(articles.topNews[0]?.date).toLocaleDateString()}
                            </Text>

                            <Button
                                size="sm"
                                colorScheme="teal"
                                onClick={() => navigate(`/articledetails/${articles.topNews[0]?.id}`)}
                            >
                                Read Article
                            </Button>
                        </Box>
                    </Box>

                    {/* RIGHT SIDE — 3 smaller Top News cards */}
                    <VStack flex="1" spacing={4}>
                        {articles.topNews.slice(1, 4).map((item) => (
                            <Box
                                key={item.id}
                                bg="white"
                                boxShadow="sm"
                                p={4}
                                borderRadius="md"
                                cursor="pointer"
                                _hover={{ boxShadow: "md", transform: "scale(1.01)" }}
                                transition="all 0.2s ease"
                                onClick={() => navigate(`/articledetails/${item.id}`)}
                            >
                                <Badge colorScheme="red" mb={2}>
                                    {item.category || "Top News"}
                                </Badge>

                                <Text fontWeight="bold" noOfLines={2} mb={2}>
                                    {item.title}
                                </Text>

                                <Text fontSize="sm" color="gray.600">
                                    {item.author} | {new Date(item.date).toLocaleDateString()}
                                </Text>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            )}


            {sortedCategories.map((category) =>
                renderCategorySection(category, category.toLowerCase().replace(' ', ''))
            )}
        </Box>
    );
};

export default HomePage;