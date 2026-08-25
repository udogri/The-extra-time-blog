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
  'Web Development', 'Graphic Design', 'Life & Hobbies', 'Tutorials'
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
  const textareaRef = useRef(null);
  const bodyImageInputRef = useRef();
  const [isUploadingBodyImage, setIsUploadingBodyImage] = useState(false);

  const insertAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    const newContent = before + textToInsert + after;
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    }, 0);
  };

  const handleBodyImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingBodyImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const imgBbKey = import.meta.env.VITE_IMGBB_API_KEY;
      const res = await axios.post(`https://api.imgbb.com/1/upload?key=${imgBbKey}`, formData);
      const url = res.data.data.url;
      if (url) {
        insertAtCursor(`\n![Image Description](${url})\n`);
        toast({ title: 'Image inserted!', status: 'success', position: 'top', duration: 2000 });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Upload failed', description: 'Could not upload image.', status: 'error', position: 'top' });
    } finally {
      setIsUploadingBodyImage(false);
      e.target.value = '';
    }
  };

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
    const imgBbKey = import.meta.env.VITE_IMGBB_API_KEY;
    const res = await axios.post(`https://api.imgbb.com/1/upload?key=${imgBbKey}`, formData);
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
      <Box h="100vh" w="100%" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="lg" color="teal.500" thickness="3px" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg" w="100%" pt="80px" pb={16}>
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
              bg="cardBg"
              border="1px solid"
              borderColor="border"
              color="text"
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
            <Text fontSize="xs" color="mutedText">{wordCount} words</Text>
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
          bg="bg"
          cursor="pointer"
          onClick={() => fileInputRef.current.click()}
          position="relative"
          border="2px dashed"
          borderColor={image ? 'transparent' : 'border'}
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
            <VStack h="100%" justify="center" spacing={2} color="mutedText">
              <FiImage size={28} />
              <Text fontSize="sm" fontWeight="500">Add a cover image</Text>
              <Text fontSize="xs" color="mutedText">Click to browse · PNG, JPG, JPEG</Text>
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
        <Box bg="cardBg" borderRadius="xl" border="1px solid" borderColor="border" p={{ base: 5, md: 8 }}>
          <VStack align="stretch" spacing={5}>
            {/* Author */}
            <Input
              placeholder="Author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              variant="unstyled"
              fontSize="sm"
              color="mutedText"
              fontWeight="500"
              _placeholder={{ color: 'gray.400' }}
            />

            {/* Divider */}
            <Box h="1px" bg="border" />

            {/* Title */}
            <Textarea
              placeholder="Your headline…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="unstyled"
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="700"
              color="text"
              lineHeight="1.25"
              letterSpacing="-0.02em"
              rows={2}
              resize="none"
              _placeholder={{ color: 'gray.400' }}
            />

            {/* Toolbar */}
            <HStack spacing={3} py={1} borderBottom="1px solid" borderColor="border" pb={2} flexWrap="wrap" gap={2}>
              <Button
                leftIcon={<FiImage />}
                size="xs"
                variant="outline"
                borderColor="border"
                color="mutedText"
                _hover={{ bg: 'hoverBg', color: 'text', borderColor: 'teal.400' }}
                borderRadius="md"
                onClick={() => bodyImageInputRef.current.click()}
                isLoading={isUploadingBodyImage}
                loadingText="Uploading image..."
              >
                Insert Image in Body
              </Button>
              <Text fontSize="xs" color="mutedText">
                Place cursor in the editor and click to insert dynamic inline images anywhere.
              </Text>
              <input
                type="file"
                accept="image/*"
                ref={bodyImageInputRef}
                style={{ display: 'none' }}
                onChange={handleBodyImageUpload}
              />
            </HStack>

            {/* Body */}
            <Textarea
              ref={textareaRef}
              placeholder="Tell your story…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="unstyled"
              minH="280px"
              resize="none"
              fontSize="md"
              lineHeight="1.8"
              color="text"
              _placeholder={{ color: 'gray.400' }}
            />
          </VStack>
        </Box>

        {/* Bottom CTA */}
        <HStack justify="flex-end" mt={5}>
          <Button variant="ghost" size="sm" color="mutedText" onClick={() => navigate('/')}>
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