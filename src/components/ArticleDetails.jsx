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
import { FaFacebook, FaTwitter, FaWhatsapp, FaThumbsUp, FaThumbsDown, FaLinkedin } from "react-icons/fa";
import firebase from 'firebase/compat/app';

const ArticleDetails = () => {
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
  const [userReaction, setUserReaction] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const docRef = doc(db, 'articles', articleId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setArticle(data);
          setLikes(data.likes || 0);
          setDislikes(data.dislikes || 0);
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
    if (!currentUser || currentUser.uid !== article.authorId) {
      toast({
        title: 'Unauthorized action.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

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

  const handleUpdate = async () => {
    const user = auth.currentUser;
if (!user) {
  // Redirect to login or show an error message
  toast({
    title: 'Not Authenticated',
    description: 'You need to be logged in to update an article.',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
  return;
}


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

  const handleLike = async () => {
    if (!articleId) return;

    const articleRef = doc(db, "articles", articleId);

    try {
      const updateData = {};

      if (userReaction === "liked") {
        updateData.likes = increment(-1);
        setLikes((prev) => prev - 1);
        setUserReaction(null);
      } else {
        updateData.likes = increment(1);
        if (userReaction === "disliked") {
          updateData.dislikes = increment(-1);
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
        updateData.dislikes = increment(-1);
        setDislikes((prev) => prev - 1);
        setUserReaction(null);
      } else {
        updateData.dislikes = increment(1);
        if (userReaction === "liked") {
          updateData.likes = increment(-1);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);

    try {
      const response = await fetch(
        'https://api.imgbb.com/1/upload?key=bc6aa3a9cee7036d9b191018c92c893a',
        { method: 'POST', body: formData }
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

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Do something with the file, like uploading or preview
      console.log('Dropped file:', file);
    }
  };

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center" bg="gray.50">
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

  const shareUrl = window.location.href;

  return (
    <Box p={8} bg="gray.50" minHeight="100vh" display="flex" flexDirection="column" alignItems="center">
      <Box w="100%" maxW="800px" border="1px solid" borderColor="gray.200" p={8} borderRadius="md" bg="white">
        <Heading size="xl" mb={4}>{article.title}</Heading>
        <Image src={article.imageUrl || 'https://via.placeholder.com/150'} alt={article.title} borderRadius="md" mb={4} w="100%" />
        <HStack mb={4} justifyContent="space-between">
          <Text>by {article.author}</Text>
          <Text fontSize="sm" color="gray.500">{new Date(article.date).toLocaleDateString()}</Text>
        </HStack>
        <Divider my={4} />
        <Text fontSize="lg" mb={4}>{article.description}</Text>

        <HStack spacing={3} mt={4}>
          <IconButton as="a" href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" icon={<FaFacebook />} colorScheme="facebook" />
          <IconButton as="a" href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" icon={<FaTwitter />} colorScheme="twitter" />
          <IconButton as="a" href={`https://api.whatsapp.com/send?text=${shareUrl}`} target="_blank" icon={<FaWhatsapp />} colorScheme="whatsapp" />
          <IconButton as="a" href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" icon={<FaLinkedin />} colorScheme="linkedin" />
        </HStack>

        <Divider my={6} />

        <HStack spacing={4} mt={4}>
          <Button leftIcon={<FaThumbsUp />} colorScheme="green" onClick={handleLike}>{likes}</Button>
          <Button leftIcon={<FaThumbsDown />} colorScheme="red" onClick={handleDislike}>{dislikes}</Button>
        </HStack>

        {currentUser && article.userId === currentUser.uid && (
          <Box mt={6}>
            <HStack spacing={4}>
              <Button colorScheme="blue" onClick={onEditOpen}>Edit</Button>
              <Button colorScheme="red" onClick={onOpen}>Delete</Button>
            </HStack>
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to delete this article?</ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDeleteArticle} isLoading={isDeleting}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Article</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input value={editedArticle.title} onChange={(e) => setEditedArticle({ ...editedArticle, title: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea value={editedArticle.description} onChange={(e) => setEditedArticle({ ...editedArticle, description: e.target.value })} />
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
  {editedArticle.imageUrl ? (
    <Box>
      <Text fontSize="sm" color="gray.500" mb={2}>
        Image Preview
      </Text>
      <Image
        src={editedArticle.imageUrl}
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
  onChange={handleImageUpload}
/>

</FormControl>

            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onEditClose} variant="ghost">Cancel</Button>
            <Button colorScheme="blue" onClick={handleUpdate} isLoading={isUpdating}>Update</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ArticleDetails;
