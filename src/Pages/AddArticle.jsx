import React, { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Heading,
  VStack,
  Select,
  useToast,
  Spinner,
  Text,
  Image,
} from '@chakra-ui/react';
import { v4 as uuidv4 } from 'uuid';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth


const categories = [
  'Top News',
  'Latest News',
  'Trending News',
  'Sports News',
  'Business News',
  'Local News',
  'International News',
];

const AddArticle = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [userId, setUserId] = useState(null); // Store user ID
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate(); 
  const [authChecked, setAuthChecked] = useState(false);


  // Get the authenticated user's ID
  useEffect(() => {
    const auth = getAuth();
    console.log('Checking auth...');
const unsubscribe = onAuthStateChanged(auth, (user) => {
  console.log('USER:', user);

      if (user) {
        setUserId(user.uid);
      } else {
        // Don't navigate immediately, let UI update first
        setTimeout(() => {
          toast({
            title: 'Authentication Required',
            description: 'Please log in to access this page.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'top',
          });
          navigate('/login');
        }, 0);
      }
      setAuthChecked(true); // Auth state has been determined
    });
  
    return () => unsubscribe();
  }, [navigate, toast]);
  
  
  

  const handleImageUpload = async () => {
    if (!image) return null;

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=bc6aa3a9cee7036d9b191018c92c893a`,
        formData
      );
      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading image to ImgBB:', error);
      toast({
        title: 'Image Upload Failed',
        description: 'Could not upload the image. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!title || !author || !description || !category) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all fields before submitting.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (!userId) {
      toast({
        title: 'Unauthorized',
        description: 'User authentication failed. Please log in again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setIsLoading(true);

    try {
      const imageUrl = await handleImageUpload();
      const articleId = uuidv4(); 

      const articleData = {
        title,
        author,
        description,
        category,
        imageUrl,
        date: new Date().toISOString(),
        articleId,
        userId, // ✅ Include the userId in the article data
        likes: 0,
        dislikes: 0,
      };

      await setDoc(doc(db, 'articles', articleId), articleData);

      toast({
        title: 'Article Added',
        description: 'Your article has been successfully added.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form fields
      setTitle('');
      setAuthor('');
      setDescription('');
      setCategory('');
      setImage(null);
    } catch (error) {
      console.error('Error adding article:', error);
      toast({
        title: 'Submission Failed',
        description: 'An error occurred while adding the article.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Do something with the file, like uploading or preview
      console.log('Dropped file:', file);
    }
  };
  

  if (!authChecked) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }
  

  return (
    <Box
      width="100vw"
      minH="100vh"
      display="flex"
      justifyContent="center"
      p={4}
      alignItems="center"
      bg="gray.100"
    >
      <Box
        maxW="600px"
        w="100%"
        p={6}
        bg="white"
        borderRadius="md"
        boxShadow="lg"
        m="20px"
      >
        <Heading mb={6} textAlign="center">
          Add Article
        </Heading>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              placeholder="Enter article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Author</FormLabel>
            <Input
              placeholder="Enter author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Enter article description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            <Select
              placeholder="Select category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
          <FormLabel fontWeight="bold" fontSize="lg" color="gray.700">
  Upload Image
</FormLabel>

<Box
  p={6}
  border="2px dashed"
  borderColor="gray.300"
  borderRadius="md"
  textAlign="center"
  cursor="pointer"
  bg="gray.50"
  _hover={{ bg: 'gray.100' }}
  onClick={() => document.getElementById('fileInput').click()}
  onDragOver={(e) => e.preventDefault()}
  onDrop={handleFileDrop}
>
  {image ? (
    <Box>
      <Text fontSize="sm" color="gray.600" mb={2}>
        {image.name}
      </Text>
      <Image
        src={URL.createObjectURL(image)}
        alt="Preview"
        borderRadius="lg"
        boxSize={{ base: "200px", md: "250px" }}
        objectFit="cover"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
        mx="auto"
      />
    </Box>
  ) : (
    <Box>
      <Text fontSize="md" color="gray.500">
        Drag & drop an image here, or <strong>click to select</strong>
      </Text>
    </Box>
  )}
</Box>

<Input
  id="fileInput"
  type="file"
  accept="image/*"
  display="none"
  onChange={(e) => setImage(e.target.files[0])}
/>

</FormControl>

          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={isLoading}
            w="full"
          >
            Submit Article
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};



export default AddArticle;
