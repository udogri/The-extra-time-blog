import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Box, Input, SimpleGrid, Menu, MenuButton, MenuList, MenuItem, IconButton, Image, Badge, Heading, Text, HStack, Button,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Textarea, Spinner, useToast, VStack
} from '@chakra-ui/react';
import { FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { HiDotsVertical } from 'react-icons/hi';

const ArticlesTab = ({ articles, onDeletePost, onEditPost }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const cancelRef = useRef();

  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [postToDelete, setPostToDelete] = useState(null);
  
  // Editing state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedArticle, setEditedArticle] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredArticles = articles.filter(a => 
    a.title?.toLowerCase().includes(articleSearchQuery.toLowerCase()) || 
    a.category?.toLowerCase().includes(articleSearchQuery.toLowerCase())
  );

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    try {
      const imgBbKey = import.meta.env.VITE_IMGBB_API_KEY;
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgBbKey}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setEditedArticle((prev) => ({ ...prev, imageUrl: data.data.url }));
        toast({ title: 'Image uploaded.', status: 'success', duration: 2000 });
      } else {
        throw new Error('Upload failed');
      }
    } catch {
      toast({ title: 'Image upload failed.', status: 'error', duration: 3000 });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onEditPost(editedArticle.id, editedArticle);
      setIsEditOpen(false);
    } catch {
      // Toast handles error or the parent function handles it
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await onDeletePost(postToDelete.id);
      setPostToDelete(null);
    } catch {
      // Error is handled
    }
  };

  return (
    <Box>
      <Box mb={5} display="flex" gap={4} alignItems="center">
        <Box position="relative" flex="1">
          <Input 
            placeholder="Search articles by title or category..." 
            value={articleSearchQuery}
            onChange={(e) => setArticleSearchQuery(e.target.value)}
            size="sm"
            bg="inputBg"
            borderRadius="lg"
            pl={8}
            borderColor="border"
            color="text"
            focusBorderColor="teal.400"
            _hover={{ borderColor: 'mutedText' }}
          />
          <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="mutedText">
            <FiSearch size={14} />
          </Box>
        </Box>
      </Box>

      {filteredArticles.length === 0 ? (
        <Box bg="cardBg" borderRadius="xl" border="1px solid" borderColor="border" p={12} textAlign="center" boxShadow="2xl">
          <Text fontSize="2xl" mb={3}>✍️</Text>
          <Text fontWeight="600" color="text" mb={1}>No articles found</Text>
          <Text fontSize="sm" color="mutedText">Create a new post to get started.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          {filteredArticles.map((article) => (
            <Box
              key={article.id}
              bg="cardBg"
              borderRadius="xl"
              border="1px solid"
              borderColor="border"
              overflow="hidden"
              position="relative"
              _hover={{ boxShadow: '2xl', borderColor: 'mutedText' }}
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
                  bg="blackAlpha.400"
                  _hover={{ bg: 'blackAlpha.600' }}
                  aria-label="Options"
                />
                <MenuList fontSize="sm" bg="cardBg" border="1px solid" borderColor="border" color="text" shadow="lg">
                  <MenuItem bg="cardBg" _hover={{ bg: 'hoverBg' }} icon={<FiEdit2 size={13} />} onClick={() => { setEditedArticle(article); setIsEditOpen(true); }}>
                    Edit Article
                  </MenuItem>
                  <MenuItem bg="cardBg" _hover={{ bg: 'hoverBg' }} icon={<FiTrash2 size={13} />} color="red.500" onClick={() => setPostToDelete(article)}>
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
                <Heading size="sm" noOfLines={2} fontWeight="700" letterSpacing="-0.01em" color="text" mb={2}>
                  {article.title}
                </Heading>
                <Text fontSize="xs" color="mutedText" noOfLines={2} lineHeight="1.5" mb={4}>
                  {article.description || article.content}
                </Text>
                <HStack justify="space-between" align="center">
                  <Text fontSize="xs" color="mutedText">
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

      {/* Delete Confirmation Article */}
      <AlertDialog isOpen={!!postToDelete} leastDestructiveRef={cancelRef} onClose={() => setPostToDelete(null)} isCentered>
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent bg="cardBg" color="text" borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl">
            <AlertDialogHeader fontSize="md" fontWeight="700" pb={2} color="text">Delete Article</AlertDialogHeader>
            <AlertDialogBody fontSize="sm" color="mutedText">
              Are you sure you want to delete <strong>&quot;{postToDelete?.title}&quot;</strong>? This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={cancelRef} onClick={() => setPostToDelete(null)} size="sm" variant="ghost" color="mutedText" _hover={{ bg: 'hoverBg', color: 'text' }}>
                Cancel
              </Button>
              <Button colorScheme="red" size="sm" onClick={confirmDelete} borderRadius="full">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Modal Article */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="cardBg" color="text" borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl">
          <ModalHeader fontSize="md" fontWeight="700" pb={1} color="text">Edit Article</ModalHeader>
          <ModalCloseButton color="mutedText" _hover={{ color: 'text' }} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.05em" color="mutedText" textTransform="uppercase">Title</FormLabel>
                <Input
                  value={editedArticle.title || ''}
                  onChange={(e) => setEditedArticle({ ...editedArticle, title: e.target.value })}
                  size="sm"
                  borderRadius="lg"
                  bg="inputBg"
                  color="text"
                  borderColor="border"
                  focusBorderColor="teal.400"
                  _hover={{ borderColor: 'mutedText' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.05em" color="mutedText" textTransform="uppercase">Description</FormLabel>
                <Textarea
                  value={editedArticle.description || ''}
                  onChange={(e) => setEditedArticle({ ...editedArticle, description: e.target.value })}
                  size="sm"
                  borderRadius="lg"
                  bg="inputBg"
                  color="text"
                  borderColor="border"
                  focusBorderColor="teal.400"
                  _hover={{ borderColor: 'mutedText' }}
                  rows={4}
                  resize="none"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.05em" color="mutedText" textTransform="uppercase">Cover Image</FormLabel>
                <Box
                  p={5}
                  border="2px dashed"
                  borderColor="border"
                  borderRadius="lg"
                  textAlign="center"
                  cursor="pointer"
                  bg="bg"
                  _hover={{ borderColor: 'teal.300', bg: 'hoverBg' }}
                  onClick={() => document.getElementById('editFileInput').click()}
                  onDragOver={(e) => e.preventDefault()}
                  transition="all 0.2s"
                >
                  {editedArticle.imageUrl ? (
                    <Image src={editedArticle.imageUrl} alt="Preview" borderRadius="md" maxH="160px" mx="auto" objectFit="cover" />
                  ) : (
                    <VStack spacing={1}>
                      <Text fontSize="sm" color="mutedText">Drop image here or <Text as="span" color="teal.500" fontWeight="600">browse</Text></Text>
                      <Text fontSize="xs" color="mutedText">PNG, JPG up to 5MB</Text>
                    </VStack>
                  )}
                </Box>
                <Input id="editFileInput" type="file" accept="image/*" display="none" onChange={handleImageUpload} />
                {uploadingImage && <Spinner size="xs" color="teal.500" mt={2} />}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button onClick={() => setIsEditOpen(false)} variant="ghost" size="sm" color="mutedText" _hover={{ bg: 'hoverBg', color: 'text' }}>Cancel</Button>
            <Button colorScheme="teal" size="sm" onClick={handleUpdate} isLoading={isUpdating} borderRadius="full" px={6}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

ArticlesTab.propTypes = {
  articles: PropTypes.array.isRequired,
  onDeletePost: PropTypes.func.isRequired,
  onEditPost: PropTypes.func.isRequired,
};

export default ArticlesTab;
