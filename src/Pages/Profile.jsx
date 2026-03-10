import { useState, useEffect, useRef } from 'react';
import {
  Box, Heading, Text, Button, VStack, Spinner, Image, Badge,
  HStack, Menu, MenuButton, MenuList, MenuItem,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, FormControl, FormLabel, Input, Textarea,
  SimpleGrid, Avatar, Divider, IconButton,
} from '@chakra-ui/react';
import { HiDotsVertical } from 'react-icons/hi';
import { MdAdd } from 'react-icons/md';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedArticle, setEditedArticle] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const cancelRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchUserArticles(currentUser.uid);
      else setLoading(false);
    });
    return () => unsub();
  }, []);

  const fetchUserArticles = async (uid) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'articles'), where('userId', '==', uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setArticles(data);
    } catch (error) {
      console.error('Error loading profile articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'articles', postToDelete.id));
      setArticles((prev) => prev.filter((item) => item.id !== postToDelete.id));
    } catch (error) {
      console.error('Error deleting article:', error);
    } finally {
      setPostToDelete(null);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const articleRef = doc(db, 'articles', editedArticle.id);
      await updateDoc(articleRef, {
        title: editedArticle.title,
        description: editedArticle.description,
        imageUrl: editedArticle.imageUrl || '',
      });
      setArticles((prev) => prev.map((a) => (a.id === editedArticle.id ? editedArticle : a)));
      setIsEditOpen(false);
    } catch (error) {
      console.error('Error updating article:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditedArticle({ ...editedArticle, imageUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditedArticle({ ...editedArticle, imageUrl: reader.result });
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <Box minH="100vh"  display="flex" justifyContent="center" alignItems="center">
        <Spinner size="lg" color="teal.500" thickness="3px" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box minH="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" textAlign="center" px={6} bg="gray.50">
        <Box w="80px" h="80px" borderRadius="full" bg="gray.100" display="flex" alignItems="center" justifyContent="center" mb={6}>
          <Text fontSize="2xl">👤</Text>
        </Box>
        <Heading size="md" mb={2} fontWeight="700" letterSpacing="-0.02em">You're not signed in</Heading>
        <Text fontSize="sm" color="gray.500" maxW="280px" mb={6} lineHeight="1.6">
          Sign in to manage your articles and access your profile.
        </Text>
        <Button colorScheme="teal" size="md" px={8} borderRadius="full" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </Box>
    );
  }

  const initials = user.email ? user.email.slice(0, 2).toUpperCase() : '??';

  return (
    <Box minH="100vh" bg="gray.50" pb={16}>
      <Box  mx="auto" px={{ base: 4, md: 8 }} pt={8}>

        {/* Profile Header */}
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={6} mb={8} display="flex" alignItems="center" gap={5} flexWrap="wrap">
          <Avatar name={user.email} size="lg" bg="teal.500" color="white" />
          <Box flex="1">
            <Heading size="sm" fontWeight="700" letterSpacing="-0.01em" color="gray.900">{user.displayName || 'Your Profile'}</Heading>
            <Text fontSize="sm" color="gray.500" mt={0.5}>{user.email}</Text>
            <HStack mt={2} spacing={3}>
              <Badge colorScheme="teal" variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="full">
                {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
              </Badge>
            </HStack>
          </Box>
          <Button
            leftIcon={<MdAdd size={16} />}
            colorScheme="teal"
            size="sm"
            borderRadius="full"
            px={5}
            fontWeight="600"
            fontSize="sm"
            onClick={() => navigate('/add-article')}
          >
            New Article
          </Button>
        </Box>

        {/* Divider label */}
        <HStack mb={5} spacing={3}>
          <Heading size="sm" fontWeight="700" letterSpacing="-0.01em" color="gray.700">My Articles</Heading>
          <Divider />
        </HStack>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={12} textAlign="center">
            <Text fontSize="2xl" mb={3}>✍️</Text>
            <Text fontWeight="600" color="gray.700" mb={1}>No articles yet</Text>
            <Text fontSize="sm" color="gray.400" mb={5}>Share your first story with the world.</Text>
            <Button colorScheme="teal" size="sm" borderRadius="full" onClick={() => navigate('/add-article')}>
              Write Something
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {articles.map((article) => (
              <Box
                key={article.id}
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
                position="relative"
                _hover={{ boxShadow: 'md', borderColor: 'gray.200' }}
                transition="all 0.2s"
              >
                {/* 3-dot menu */}
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<HiDotsVertical size={15} />}
                    variant="ghost"
                    size="xs"
                    position="absolute"
                    top={3}
                    right={3}
                    zIndex={2}
                    color="white"
                    bg="blackAlpha.300"
                    _hover={{ bg: 'blackAlpha.500' }}
                    aria-label="Options"
                  />
                  <MenuList fontSize="sm" shadow="lg" borderColor="gray.100">
                    <MenuItem icon={<FiEdit2 size={13} />} onClick={() => { setEditedArticle(article); setIsEditOpen(true); }}>
                      Edit Article
                    </MenuItem>
                    <MenuItem icon={<FiTrash2 size={13} />} color="red.500" onClick={() => setPostToDelete(article)}>
                      Delete Article
                    </MenuItem>
                  </MenuList>
                </Menu>

                <Image
                  src={article.imageUrl || 'https://picsum.photos/400/200'}
                  alt={article.title}
                  w="100%"
                  h="180px"
                  objectFit="cover"
                />

                <Box p={4}>
                  <Badge colorScheme="teal" variant="subtle" fontSize="9px" px={2} py={0.5} borderRadius="full" mb={2} letterSpacing="0.05em">
                    {article.category}
                  </Badge>
                  <Heading size="sm" noOfLines={2} fontWeight="700" letterSpacing="-0.01em" color="gray.800" mb={2}>
                    {article.title}
                  </Heading>
                  <Text fontSize="xs" color="gray.500" noOfLines={2} lineHeight="1.5" mb={4}>
                    {article.description || article.content}
                  </Text>
                  <HStack justify="space-between" align="center">
                    <Text fontSize="xs" color="gray.400">
                      {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="teal"
                      fontWeight="600"
                      fontSize="xs"
                      onClick={() => navigate(`/articledetails/${article.id}`)}
                    >
                      Read →
                    </Button>
                  </HStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Delete Confirmation */}
      <AlertDialog isOpen={!!postToDelete} leastDestructiveRef={cancelRef} onClose={() => setPostToDelete(null)} isCentered>
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="xl" border="1px solid" borderColor="gray.100">
            <AlertDialogHeader fontSize="md" fontWeight="700" pb={2}>Delete Article</AlertDialogHeader>
            <AlertDialogBody fontSize="sm" color="gray.600">
              Are you sure you want to delete <strong>"{postToDelete?.title}"</strong>? This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={cancelRef} onClick={() => setPostToDelete(null)} size="sm" variant="ghost">
                Cancel
              </Button>
              <Button colorScheme="red" size="sm" onClick={confirmDelete} borderRadius="full">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="md" fontWeight="700" pb={1}>Edit Article</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.05em" color="gray.500" textTransform="uppercase">Title</FormLabel>
                <Input
                  value={editedArticle.title || ''}
                  onChange={(e) => setEditedArticle({ ...editedArticle, title: e.target.value })}
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="teal.400"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.05em" color="gray.500" textTransform="uppercase">Description</FormLabel>
                <Textarea
                  value={editedArticle.description || ''}
                  onChange={(e) => setEditedArticle({ ...editedArticle, description: e.target.value })}
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="teal.400"
                  rows={4}
                  resize="none"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.05em" color="gray.500" textTransform="uppercase">Cover Image</FormLabel>
                <Box
                  p={5}
                  border="2px dashed"
                  borderColor="gray.200"
                  borderRadius="lg"
                  textAlign="center"
                  cursor="pointer"
                  bg="gray.50"
                  _hover={{ borderColor: 'teal.300', bg: 'teal.50' }}
                  onClick={() => document.getElementById('editFileInput').click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  transition="all 0.2s"
                >
                  {editedArticle.imageUrl ? (
                    <Image src={editedArticle.imageUrl} alt="Preview" borderRadius="md" maxH="160px" mx="auto" objectFit="cover" />
                  ) : (
                    <VStack spacing={1}>
                      <Text fontSize="sm" color="gray.400">Drop image here or <Text as="span" color="teal.500" fontWeight="600">browse</Text></Text>
                      <Text fontSize="xs" color="gray.300">PNG, JPG up to 5MB</Text>
                    </VStack>
                  )}
                </Box>
                <Input id="editFileInput" type="file" accept="image/*" display="none" onChange={handleImageUpload} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button onClick={() => setIsEditOpen(false)} variant="ghost" size="sm">Cancel</Button>
            <Button colorScheme="teal" size="sm" onClick={handleUpdate} isLoading={isUpdating} borderRadius="full" px={6}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;