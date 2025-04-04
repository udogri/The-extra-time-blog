import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  useToast,
  Spinner,
  IconButton,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  VStack,
  Textarea,
  FormControl,
  FormLabel,
  useDisclosure,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, app } from '../firebaseConfig';
import { FaRegTrashCan } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { FaThumbsUp, FaThumbsDown, FaLinkedin } from "react-icons/fa";
import PropTypes from 'prop-types';

const ArticleDetails = ({ isAuthenticated }) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedArticle, setEditedArticle] = useState({ title: '', description: '', imageUrl: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { articleId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [user, setUser] = useState(null);
  const [userReaction, setUserReaction] = useState(null); // "liked", "disliked", or null
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth(app);


  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const docRef = doc(db, 'articles', articleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setArticle(data);
          setLikes(docSnap.data().likes || 0);
          setDislikes(docSnap.data().disLikes || 0);
          setEditedArticle({
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl,
          });
        } else {
          toast({
            title: 'Article not found.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: 'Error fetching article.',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId, toast]);

  const handleDeleteArticle = async () => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'articles', articleId));
      toast({
        title: 'Article deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error deleting article.',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

 
const handleLike = async () => {
  if (!articleId) return;

  const articleRef = doc(db, "articles", articleId);

  try {
    const updateData = {};

    if (userReaction === "liked") {
      updateData.likes = increment(-1); // Remove like
      setLikes((prev) => prev - 1);
      setUserReaction(null);
    } else {
      updateData.likes = increment(1); // Add like
      if (userReaction === "disliked") {
        updateData.dislikes = increment(-1); // Remove dislike
        setDislikes((prev) => prev - 1);
      }
      setLikes((prev) => prev + 1);
      setUserReaction("liked");
    }

    await updateDoc(articleRef, updateData);
  } catch (error) {
    console.error("Error updating likes:", error);
  }
};

const handleDislike = async () => {
  if (!articleId) return;

  const articleRef = doc(db, "articles", articleId);

  try {
    const updateData = {};

    if (userReaction === "disliked") {
      updateData.dislikes = increment(-1); // Remove dislike
      setDislikes((prev) => prev - 1);
      setUserReaction(null);
    } else {
      updateData.dislikes = increment(1); // Add dislike
      if (userReaction === "liked") {
        updateData.likes = increment(-1); // Remove like
        setLikes((prev) => prev - 1);
      }
      setDislikes((prev) => prev + 1);
      setUserReaction("disliked");
    }

    await updateDoc(articleRef, updateData);
  } catch (error) {
    console.error("Error updating dislikes:", error);
  }
};

  
  


  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const docRef = doc(db, 'articles', articleId);
      await updateDoc(docRef, { ...editedArticle });
      setArticle(editedArticle);
      toast({
        title: 'Article updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onEditClose();
    } catch (error) {
      toast({
        title: 'Error updating article.',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const response = await fetch(
        'https://api.imgbb.com/1/upload?key=bc6aa3a9cee7036d9b191018c92c893a',
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      if (data.success) {
        const imageUrl = data.data.url;
        setEditedArticle((prev) => ({ ...prev, imageUrl }));
        toast({
          title: 'Image uploaded successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      toast({
        title: 'Error uploading image.',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  

  const shareUrl = window.location.href;

  useEffect(() => {
    // Get the currently authenticated user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg="gray.50"
      >
        <Spinner size="xl" color="teal.500" />
      </Box>
    );
  }

  if (!article) {
    return (
      <Box p={8} textAlign="center">
        <Heading size="lg">Article not found</Heading>
      </Box>
    );
  }


  return (
    <Box
    w='100vw'
      p={8}
      bg="gray.50"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
    <Box  alignItems="center" justifyContent="center" w="100%" maxW="800px" border="1px solid" borderColor="gray.200" p={8} borderRadius="md" bg="white">
      <Heading size="xl" mb={4}>
        {article.title}
      </Heading>
      <Image
        src={article.imageUrl || 'https://via.placeholder.com/150'}
        alt={article.title}
        borderRadius="md"
        mb={4}
        w="100%"
      />
      <HStack mb={4} justifyContent="space-between" w="100%">
      <Text>by {article.author}</Text>
        <Text fontSize="sm" color="gray.500">
          {new Date(article.date).toLocaleDateString()}
        </Text>
      </HStack>
      <Divider border="1px" color="black.700" my={4} />
      <Text fontSize="lg" mb={4}>
        {article.description}
      </Text>

      <HStack spacing={3} mt={4}>
          <IconButton as="a" href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" icon={<FaFacebook />} colorScheme="facebook" />
          <IconButton as="a" href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" icon={<FaTwitter />} colorScheme="twitter" />
          <IconButton as="a" href={`https://api.whatsapp.com/send?text=${shareUrl}`} target="_blank" icon={<FaWhatsapp />} colorScheme="whatsapp" />
          <IconButton as="a" href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" icon={<FaLinkedin />} colorScheme="linkedin" />
        </HStack>

        <Divider my={6} />

        <HStack spacing={4} mt={4}>
          <Button leftIcon={<FaThumbsUp />} colorScheme="green" onClick={handleLike}>
            {likes}
          </Button>
          <Button leftIcon={<FaThumbsDown />} colorScheme="red" onClick={handleDislike}>
            {dislikes}
          </Button>
        </HStack>


      {isAuthenticated && (
        <Box display="flex" mt="10px" justifyContent="space-between">
          <Button colorScheme="blue" onClick={onEditOpen}>
            Edit Article
          </Button>
          <Button colorScheme="red" onClick={onOpen}>
            Delete Article
          </Button>
        </Box>
      )}
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this article? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={handleDeleteArticle}>
              Delete
            </Button>
            <Button onClick={onClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Article</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Title</FormLabel>
              <Input
                value={editedArticle.title}
                onChange={(e) =>
                  setEditedArticle({ ...editedArticle, title: e.target.value })
                }
              />
              <FormLabel>Author</FormLabel>
              <Input
                value={editedArticle.author}
                onChange={(e) =>
                  setEditedArticle({ ...editedArticle, author: e.target.value })
                }
              />
              
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={editedArticle.description}
                onChange={(e) =>
                  setEditedArticle({ ...editedArticle, description: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Image</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {uploadingImage && <Spinner size="sm" mt={2} />}
            </FormControl>
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={editedArticle.imageUrl}
                readOnly
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              isLoading={isUpdating}
              onClick={handleUpdate}
            >
              Save Changes
            </Button>
            <Button onClick={onEditClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

ArticleDetails.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired, // Ensure it's a boolean and required
};

export default ArticleDetails;
