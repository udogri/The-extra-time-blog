import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Textarea,
  Select,
  useToast,
  Spinner,
  VStack,
  Image,
  Text,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const categories = [
  "Top News",
  "Latest News",
  "Trending News",
  "Sports News",
  "Business News",
  "Local News",
  "International News",
];

const AddArticle = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const bg = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.700", "gray.100");

  // Check authentication
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        toast({
          title: "Login required",
          description: "Please sign in to create a post.",
          status: "warning",
          position: "top",
        });
        navigate("/login");
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [navigate, toast]);

  const handleImageUpload = async () => {
    if (!image) return null;
    const formData = new FormData();
    formData.append("image", image);
    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=bc6aa3a9cee7036d9b191018c92c893a`,
      formData
    );
    return res.data.data.url;
  };

  const handleSubmit = async () => {
    if (!title || !content || !category) {
      toast({
        title: "Missing fields",
        description: "Please complete all fields before publishing.",
        status: "warning",
        position: "top",
      });
      return;
    }

    setIsLoading(true);
    try {
      const imageUrl = await handleImageUpload();
      const articleId = uuidv4();
      await setDoc(doc(db, "articles", articleId), {
        title,
        author,
        description: content,
        category,
        imageUrl,
        date: new Date().toISOString(),
        articleId,
        userId,
        likes: 0,
        dislikes: 0,
      });

      toast({
        title: "Post published",
        description: "Your story has been shared successfully.",
        status: "success",
        position: "top",
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Something went wrong while publishing.",
        status: "error",
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={bg}
      display="flex"
      justifyContent="center"
      py={{ base: 6, md: 10 }}
      px={{ base: 3, md: 6 }}
    >
      <Box
        w="100%"
        maxW="900px"
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="md"
        overflow="hidden"
      >
        {/* Cover Image Section */}
        <Box
          position="relative"
          h={{ base: "200px", md: "320px" }}
          bg="gray.100"
          cursor="pointer"
          onClick={() => fileInputRef.current.click()}
          _hover={{ opacity: 0.9 }}
          transition="all 0.2s ease"
        >
          {image ? (
            <Image
              src={URL.createObjectURL(image)}
              alt="cover"
              w="100%"
              h="100%"
              objectFit="cover"
            />
          ) : (
            <Box
              h="100%"
              display="flex"
              flexDir="column"
              alignItems="center"
              justifyContent="center"
              color="gray.500"
              fontWeight="medium"
            >
              <Text fontSize="lg">Click to upload a cover image</Text>
              <Text fontSize="sm">PNG, JPG, or JPEG (max 5MB)</Text>
            </Box>
          )}
          <Input
            type="file"
            accept="image/*"
            display="none"
            ref={fileInputRef}
            onChange={(e) => setImage(e.target.files[0])}
          />
        </Box>

        {/* Editor Section */}
        <Box p={{ base: 5, md: 10 }}>
          <VStack align="stretch" spacing={6}>
            {/* Category + Author */}
            <HStack
              spacing={4}
              flexWrap="wrap"
              justifyContent={{ base: "center", md: "space-between" }}
            >
              <Select
                placeholder="Select category"
                w={{ base: "100%", sm: "48%", md: "200px" }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </Select>

              <Input
                placeholder="Author name"
                w={{ base: "100%", sm: "48%", md: "200px" }}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </HStack>

            {/* Title Field */}
            <Input
              placeholder="Enter your post title..."
              variant="unstyled"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              color={textColor}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Body Editor */}
            <Textarea
              placeholder="Start writing your story..."
              variant="unstyled"
              minH="300px"
              resize="vertical"
              fontSize="lg"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              _placeholder={{ color: "gray.400" }}
            />

            {/* Publish Button */}
            <Box textAlign={{ base: "center", md: "right" }}>
              <Button
                colorScheme="teal"
                size="lg"
                px={8}
                isLoading={isLoading}
                onClick={handleSubmit}
              >
                Publish
              </Button>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default AddArticle;
