import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  VStack, SimpleGrid, Box, Flex, Heading, Text, HStack, Alert, AlertIcon, AlertTitle, AlertDescription, Button, useToast, useColorModeValue, Select
} from '@chakra-ui/react';
import { FiActivity, FiBookOpen, FiMail, FiInbox } from 'react-icons/fi';

const AnalyticsTab = ({ articles, subscribers, messages, trafficData, trafficError }) => {
  const toast = useToast();
  const [filterPeriod, setFilterPeriod] = useState('total');
  
  // Analytics calculations
  const getFilteredStats = () => {
    let siteVisits = 0;
    let articleViews = 0;
    let subscribersCount = 0;
    let messagesCount = 0;
    const dailyTraffic = trafficData.dailyTraffic || {};
    
    if (filterPeriod === 'total') {
      siteVisits = trafficData.totalVisits || 0;
      articleViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
      subscribersCount = subscribers.length;
      messagesCount = messages.length;
    } else {
      let daysToLookBack = 0;
      if (filterPeriod === 'today') daysToLookBack = 0;
      if (filterPeriod === '7days') daysToLookBack = 6;
      if (filterPeriod === '1month') daysToLookBack = 29;

      const cutoffDate = new Date();
      cutoffDate.setHours(0, 0, 0, 0);
      cutoffDate.setDate(cutoffDate.getDate() - daysToLookBack);
      
      subscribersCount = subscribers.filter(s => new Date(s.date) >= cutoffDate).length;
      messagesCount = messages.filter(m => new Date(m.date) >= cutoffDate).length;

      for (let i = 0; i <= daysToLookBack; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        siteVisits += (dailyTraffic[dateStr] || 0);
        
        articles.forEach(art => {
          if (art.dailyViews && art.dailyViews[dateStr]) {
            articleViews += art.dailyViews[dateStr];
          }
        });
      }
    }
    
    return { siteVisits, articleViews, subscribersCount, messagesCount };
  };

  const { siteVisits, articleViews, subscribersCount, messagesCount } = getFilteredStats();
  
  const popularArticles = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const getTrafficChartData = () => {
    const dailyTraffic = trafficData.dailyTraffic || {};
    const chartList = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      chartList.push({
        date: dateStr,
        label,
        count: dailyTraffic[dateStr] || 0
      });
    }
    return chartList;
  };

  const chartData = getTrafficChartData();
  const maxTrafficCount = Math.max(...chartData.map(c => c.count), 5);

  return (
    <VStack spacing={6} align="stretch">
      {trafficError === 'permission-denied' && (
        <Alert
          status="warning"
          variant="subtle"
          flexDirection="column"
          alignItems="flex-start"
          borderRadius="xl"
          p={5}
          border="1px solid"
          borderColor="orange.200"
        >
          <HStack align="center" spacing={2} mb={2}>
            <AlertIcon />
            <AlertTitle fontSize="md" fontWeight="bold">Firestore Security Rules Missing for Analytics</AlertTitle>
          </HStack>
          <AlertDescription fontSize="sm" color="gray.700" mb={4}>
            The application failed to retrieve site visits analytics because of a <strong>Missing or Insufficient Permissions</strong> error. This means the Firestore rules in your Firebase Console are blocking access to the <code>analytics</code> collection.
          </AlertDescription>
          <Box w="full" bg="gray.900" color="green.300" p={4} borderRadius="lg" fontFamily="monospace" fontSize="xs" position="relative" overflowX="auto">
            <Text color="gray.400" mb={2}>{"// Add the following match block to your Firestore Security Rules:"}</Text>
            <pre>{`match /analytics/traffic {
  allow read: if request.auth != null && request.auth.token.email == '${import.meta.env.VITE_ADMIN_EMAIL || 'oudogri@gmail.com'}';
  allow write: if true; // Allows tracking anonymous page visits
}`}</pre>
            <Button
              size="xs"
              colorScheme="teal"
              position="absolute"
              top={3}
              right={3}
              onClick={() => {
                navigator.clipboard.writeText(`match /analytics/traffic {\n  allow read: if request.auth != null && request.auth.token.email == '${import.meta.env.VITE_ADMIN_EMAIL || 'oudogri@gmail.com'}';\n  allow write: if true; // Allows tracking anonymous page visits\n}`);
                toast({ title: 'Rules copied to clipboard!', status: 'success', duration: 2000 });
              }}
            >
              Copy
            </Button>
          </Box>
        </Alert>
      )}
      
      {/* 1. Core Analytics Cards */}
      <Box>
        <Flex justify="flex-end" align="center" mb={4}>
          <HStack spacing={3}>
            <Text fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase">Filter:</Text>
            <Select 
              value={filterPeriod} 
              onChange={(e) => setFilterPeriod(e.target.value)} 
              w="140px" 
              size="sm" 
              borderRadius="lg" 
              bg="cardBg" 
              borderColor="border"
              color="text"
              fontWeight="600"
              cursor="pointer"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="1month">1 Month</option>
              <option value="total">Total Views</option>
            </Select>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5}>
          {/* Card 1: Site Visits */}
          <Box bg="cardBg" p={5} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl">
            <Flex justify="space-between" align="center">
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase" letterSpacing="0.05em">Site Visits</Text>
                <Heading size="md" color="text" fontWeight="800">
                  {siteVisits}
                </Heading>
              </VStack>
              <Box bg={useColorModeValue('teal.50', 'rgba(49, 151, 149, 0.15)')} color="teal.500" p={3} borderRadius="lg">
                <FiActivity size={20} />
              </Box>
            </Flex>
          </Box>

          {/* Card 2: Article Reads */}
          <Box bg="cardBg" p={5} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl">
            <Flex justify="space-between" align="center">
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase" letterSpacing="0.05em">Article Views</Text>
                <Heading size="md" color="text" fontWeight="800">
                  {articleViews}
                </Heading>
              </VStack>
              <Box bg={useColorModeValue('blue.50', 'rgba(49, 130, 206, 0.15)')} color="blue.500" p={3} borderRadius="lg">
                <FiBookOpen size={20} />
              </Box>
            </Flex>
          </Box>

          {/* Card 3: Newsletter Subscribers */}
          <Box bg="cardBg" p={5} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl">
            <Flex justify="space-between" align="center">
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase" letterSpacing="0.05em">Subscribers</Text>
                <Heading size="md" color="text" fontWeight="800">
                  {subscribersCount}
                </Heading>
              </VStack>
              <Box bg={useColorModeValue('purple.50', 'rgba(128, 90, 213, 0.15)')} color="purple.500" p={3} borderRadius="lg">
                <FiMail size={20} />
              </Box>
            </Flex>
          </Box>

          {/* Card 4: Feedback Inbox */}
          <Box bg="cardBg" p={5} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl">
            <Flex justify="space-between" align="center">
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase" letterSpacing="0.05em">Feedback Inbox</Text>
                <Heading size="md" color="text" fontWeight="800">
                  {messagesCount}
                </Heading>
              </VStack>
              <Box bg={useColorModeValue('orange.50', 'rgba(221, 107, 32, 0.15)')} color="orange.500" p={3} borderRadius="lg">
                <FiInbox size={20} />
              </Box>
            </Flex>
          </Box>
        </SimpleGrid>
      </Box>

      {/* 2. Visual Traffic Trend Chart */}
      <Box bg="cardBg" p={6} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl">
        <VStack align="flex-start" spacing={5} w="100%">
          <Box>
            <Heading size="xs" fontWeight="800" color="text" letterSpacing="-0.01em">
              📈 Traffic Trend (Last 7 Days)
            </Heading>
            <Text fontSize="xs" color="mutedText" mt={0.5}>
              Unique daily page loads recorded in this calendar week.
            </Text>
          </Box>

          {/* Chart Core Bar Graph */}
          <Flex h="200px" w="100%" align="flex-end" justify="space-between" pt={4} px={2} borderBottom="1px solid" borderColor="border">
            {chartData.map((day) => {
              const heightPercent = `${(day.count / maxTrafficCount) * 100}%`;
              return (
                <VStack key={day.date} flex="1" spacing={2.5} h="100%" justify="flex-end">
                  <Text fontSize="10px" fontWeight="700" color="teal.500">
                    {day.count}
                  </Text>
                  <Box
                    w={{ base: "14px", sm: "24px", md: "34px" }}
                    h={day.count > 0 ? heightPercent : "4px"}
                    bgGradient="linear(to-t, teal.400, teal.300)"
                    borderRadius="t-md"
                    transition="all 0.4s ease"
                    _hover={{ bgGradient: "linear(to-t, teal.500, teal.400)" }}
                  />
                  <Text fontSize="10px" fontWeight="600" color="mutedText" whiteSpace="nowrap">
                    {day.label}
                  </Text>
                </VStack>
              );
            })}
          </Flex>
        </VStack>
      </Box>

      {/* 3. Bottom Row: Category Stats + Popular Articles */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Popular Articles */}
        <Box bg="cardBg" p={6} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl">
          <Heading size="xs" fontWeight="800" color="text" mb={4}>
            🔥 Top Performing Articles
          </Heading>
          {popularArticles.length === 0 ? (
            <Text fontSize="xs" color="mutedText" py={4}>No views recorded yet.</Text>
          ) : (
            <VStack align="stretch" spacing={3}>
              {popularArticles.map((art, idx) => (
                <Flex key={art.id} justify="space-between" align="center" p={2.5} borderRadius="lg" _hover={{ bg: "hoverBg" }}>
                  <HStack spacing={3}>
                    <Text fontSize="xs" fontWeight="800" color="mutedText" w="15px">#{idx + 1}</Text>
                    <Box>
                      <Text fontSize="xs" fontWeight="700" color="text" noOfLines={1} maxW="280px">{art.title}</Text>
                      <Text fontSize="10px" color="mutedText">{art.category}</Text>
                    </Box>
                  </HStack>
                  <HStack spacing={4}>
                    <VStack align="flex-end" spacing={0}>
                      <Text fontSize="xs" fontWeight="800" color="teal.500">{art.views || 0}</Text>
                      <Text fontSize="9px" color="mutedText">views</Text>
                    </VStack>
                  </HStack>
                </Flex>
              ))}
            </VStack>
          )}
        </Box>

        {/* Category Breakdown */}
        <Box bg="cardBg" p={6} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl">
          <Heading size="xs" fontWeight="800" color="text" mb={4}>
            🗂️ Category Distribution
          </Heading>
          <VStack align="stretch" spacing={3.5}>
            {['Web Development', 'Graphic Design', 'Life & Hobbies', 'Tutorials'].map((cat) => {
              const catArticles = articles.filter(a => a.category === cat);
              const catViews = catArticles.reduce((acc, curr) => acc + (curr.views || 0), 0);
              const percentage = articles.length > 0 ? (catArticles.length / articles.length) * 100 : 0;
              
              return (
                <Box key={cat}>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="xs" fontWeight="700" color="text">{cat}</Text>
                    <HStack spacing={2}>
                      <Text fontSize="10px" color="mutedText">{catArticles.length} posts</Text>
                      <Text fontSize="10px" fontWeight="700" color="teal.500">{catViews} views</Text>
                    </HStack>
                  </Flex>
                  <Box h="6px" w="100%" bg="border" borderRadius="full" overflow="hidden">
                    <Box h="100%" w={`${percentage}%`} bg="teal.400" borderRadius="full" />
                  </Box>
                </Box>
              );
            })}
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
};

AnalyticsTab.propTypes = {
  articles: PropTypes.array.isRequired,
  subscribers: PropTypes.array.isRequired,
  messages: PropTypes.array.isRequired,
  trafficData: PropTypes.object.isRequired,
  trafficError: PropTypes.string,
};

export default AnalyticsTab;
