import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Input, Textarea, Select, useToast, Spinner,
  VStack, Image, Text, HStack, useColorModeValue, Badge,
} from '@chakra-ui/react';
import { v4 as uuidv4 } from 'uuid';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FiImage, FiX } from 'react-icons/fi';

const categories = [
  'Top News', 'Latest News', 'Trending News',
  'Sports News', 'Business News', 'Local News', 'International News',
];

const AddArticle = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        if (!author) setAuthor(user.displayName || '');
      } else {
        toast({ title: 'Sign in required', description: 'Please sign in to publish.', status: 'warning', position: 'top' });
        navigate('/login');
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [navigate, toast]);

  const handleImageUpload = async () => {
    if (!image) return null;
    const formData = new FormData();
    formData.append('image', image);
    const res = await axios.post(`https://api.imgbb.com/1/upload?key=bc6aa3a9cee7036d9b191018c92c893a`, formData);
    return res.data.data.url;
  };

  const handleSubmit = async () => {
    if (!title || !content || !category) {
      toast({ title: 'Missing fields', description: 'Please fill in title, category, and content.', status: 'warning', position: 'top' });
      return;
    }
    setIsLoading(true);
    try {
      const imageUrl = await handleImageUpload();
      const articleId = uuidv4();
      await setDoc(doc(db, 'articles', articleId), {
        title, author, description: content, category,
        imageUrl, date: new Date().toISOString(),
        articleId, userId, likes: 0, dislikes: 0,
      });
      toast({ title: 'Published!', description: 'Your article is now live.', status: 'success', position: 'top' });
      navigate('/');
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Something went wrong.', status: 'error', position: 'top' });
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const isReady = title && content && category;

  if (!authChecked) {
    return (
      <Box h="100vh" w="100vw" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="lg" color="teal.500" thickness="3px" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" w="100vw" pt="80px" pb={16}>
      <Box maxW="780px" mx="auto" px={{ base: 4, md: 8 }}>

        {/* Header bar */}
        <HStack justify="space-between" align="center" mb={6} py={2}>
          <HStack spacing={3}>
            <Select
              placeholder="Category"
              w="160px"
              size="sm"
              borderRadius="full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              focusBorderColor="teal.400"
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              fontSize="xs"
              fontWeight="500"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </Select>
            {category && (
              <Badge colorScheme="teal" variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="full">
                {category}
              </Badge>
            )}
          </HStack>

          <HStack spacing={2}>
            <Text fontSize="xs" color="gray.400">{wordCount} words</Text>
            <Button
              size="sm"
              colorScheme="teal"
              borderRadius="full"
              px={5}
              fontWeight="600"
              fontSize="xs"
              isLoading={isLoading}
              loadingText="Publishing…"
              onClick={handleSubmit}
              opacity={isReady ? 1 : 0.6}
              _hover={isReady ? { transform: 'translateY(-1px)', boxShadow: 'md' } : {}}
              transition="all 0.2s"
            >
              Publish
            </Button>
          </HStack>
        </HStack>

        {/* Cover Image */}
        <Box
          borderRadius="xl"
          overflow="hidden"
          mb={6}
          h={{ base: '220px', md: '340px' }}
          bg="gray.100"
          cursor="pointer"
          onClick={() => fileInputRef.current.click()}
          position="relative"
          border="2px dashed"
          borderColor={image ? 'transparent' : 'gray.200'}
          _hover={{ borderColor: 'teal.300' }}
          transition="all 0.2s"
        >
          {image ? (
            <>
              <Image src={URL.createObjectURL(image)} alt="cover" w="100%" h="100%" objectFit="cover" />
              <Box
                position="absolute"
                inset="0"
                bg="blackAlpha.300"
                opacity="0"
                _hover={{ opacity: 1 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="opacity 0.2s"
              >
                <Text color="white" fontSize="sm" fontWeight="600">Click to change</Text>
              </Box>
              <Button
                position="absolute"
                top={3}
                right={3}
                size="xs"
                borderRadius="full"
                bg="blackAlpha.600"
                color="white"
                leftIcon={<FiX size={10} />}
                _hover={{ bg: 'blackAlpha.800' }}
                onClick={(e) => { e.stopPropagation(); setImage(null); }}
              >
                Remove
              </Button>
            </>
          ) : (
            <VStack h="100%" justify="center" spacing={2} color="gray.400">
              <FiImage size={28} />
              <Text fontSize="sm" fontWeight="500">Add a cover image</Text>
              <Text fontSize="xs" color="gray.300">Click to browse · PNG, JPG, JPEG</Text>
            </VStack>
          )}
          <Input
            type="file"
            accept="image/*"
            display="none"
            ref={fileInputRef}
            onChange={(e) => setImage(e.target.files[0])}
          />
        </Box>

        {/* Article Body */}
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={{ base: 5, md: 8 }}>
          <VStack align="stretch" spacing={5}>
            {/* Author */}
            <Input
              placeholder="Author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              variant="unstyled"
              fontSize="sm"
              color="gray.500"
              fontWeight="500"
              _placeholder={{ color: 'gray.300' }}
            />

            {/* Divider */}
            <Box h="1px" bg="gray.100" />

            {/* Title */}
            <Textarea
              placeholder="Your headline…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="unstyled"
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="700"
              color="gray.900"
              lineHeight="1.25"
              letterSpacing="-0.02em"
              rows={2}
              resize="none"
              _placeholder={{ color: 'gray.200' }}
            />

            {/* Body */}
            <Textarea
              placeholder="Tell your story…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="unstyled"
              minH="280px"
              resize="none"
              fontSize="md"
              lineHeight="1.8"
              color="gray.700"
              _placeholder={{ color: 'gray.300' }}
            />
          </VStack>
        </Box>

        {/* Bottom CTA */}
        <HStack justify="flex-end" mt={5}>
          <Button variant="ghost" size="sm" color="gray.400" onClick={() => navigate('/')}>
            Discard
          </Button>
          <Button
            colorScheme="teal"
            size="sm"
            borderRadius="full"
            px={6}
            fontWeight="600"
            fontSize="sm"
            isLoading={isLoading}
            onClick={handleSubmit}
            opacity={isReady ? 1 : 0.5}
          >
            Publish Article
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default AddArticle;