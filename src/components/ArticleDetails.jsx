import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Button, useToast, Spinner, IconButton,
  Image, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Input, VStack, Textarea, FormControl,
  FormLabel, useDisclosure, HStack, Divider, Badge, Flex,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, app } from '../firebaseConfig';
import { FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin } from 'react-icons/fa';
import { FiThumbsUp, FiThumbsDown, FiArrowLeft } from 'react-icons/fi';

const ArticleDetails = () => {
  const [article, setArticle]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [isDeleting, setIsDeleting]         = useState(false);
  const [isUpdating, setIsUpdating]         = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editedArticle, setEditedArticle]   = useState({ title: '', description: '', imageUrl: '' });
  const [likes, setLikes]                   = useState(0);
  const [dislikes, setDislikes]             = useState(0);
  const [userReaction, setUserReaction]     = useState(null);
  const [currentUser, setCurrentUser]       = useState(null);

  const toast    = useToast();
  const navigate = useNavigate();
  const { articleId } = useParams();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isEditOpen,   onOpen: onEditOpen,   onClose: onEditClose   } = useDisclosure();
  const auth = getAuth(app);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user || null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!articleId) return;
    const fetchArticle = async () => {
      try {
        const snap = await getDoc(doc(db, 'articles', articleId));
        if (snap.exists()) {
          const data = snap.data();
          setArticle(data);
          setLikes(data.likes || 0);
          setDislikes(data.dislikes || 0);
          setEditedArticle({ title: data.title, description: data.description, imageUrl: data.imageUrl });
        } else {
          toast({ title: 'Article not found.', status: 'error', duration: 3000, isClosable: true, position: 'top' });
        }
      } catch (err) {
        toast({ title: 'Error fetching article.', description: err.message, status: 'error', duration: 3000, isClosable: true, position: 'top' });
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  const handleReaction = async (type) => {
    if (!articleId) return;
    const ref    = doc(db, 'articles', articleId);
    const update = {};
    if (type === 'like') {
      if (userReaction === 'liked') {
        update.likes = increment(-1); setLikes((p) => p - 1); setUserReaction(null);
      } else {
        update.likes = increment(1);
        if (userReaction === 'disliked') { update.dislikes = increment(-1); setDislikes((p) => p - 1); }
        setLikes((p) => p + 1); setUserReaction('liked');
      }
    } else {
      if (userReaction === 'disliked') {
        update.dislikes = increment(-1); setDislikes((p) => p - 1); setUserReaction(null);
      } else {
        update.dislikes = increment(1);
        if (userReaction === 'liked') { update.likes = increment(-1); setLikes((p) => p - 1); }
        setDislikes((p) => p + 1); setUserReaction('disliked');
      }
    }
    try { await updateDoc(ref, update); } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!currentUser || currentUser.uid !== article?.userId) {
      toast({ title: 'Unauthorized.', status: 'error', duration: 3000, isClosable: true, position: 'top' });
      return;
    }
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'articles', articleId));
      toast({ title: 'Article deleted.', status: 'success', duration: 3000, isClosable: true, position: 'top' });
      navigate('/');
    } catch (err) {
      toast({ title: 'Error deleting.', description: err.message, status: 'error', duration: 3000, isClosable: true, position: 'top' });
    } finally {
      setIsDeleting(false);
      onDeleteClose();
    }
  };

  const handleUpdate = async () => {
    if (!auth.currentUser) {
      toast({ title: 'Not signed in.', status: 'error', duration: 3000, isClosable: true, position: 'top' });
      return;
    }
    try {
      setIsUpdating(true);
      await updateDoc(doc(db, 'articles', articleId), { ...editedArticle });
      setArticle(editedArticle);
      toast({ title: 'Updated successfully.', status: 'success', duration: 3000, isClosable: true, position: 'top' });
      onEditClose();
    } catch (err) {
      toast({ title: 'Update failed.', description: err.message, status: 'error', duration: 3000, isClosable: true, position: 'top' });
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
      const res  = await fetch('https://api.imgbb.com/1/upload?key=bc6aa3a9cee7036d9b191018c92c893a', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) setEditedArticle((prev) => ({ ...prev, imageUrl: data.data.url }));
      else throw new Error('Upload failed');
    } catch (err) {
      toast({ title: 'Image upload failed.', status: 'error', duration: 3000, isClosable: true, position: 'top' });
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" minW="1400px" w="100%" display="flex" justifyContent="center" alignItems="center" bg="gray.50">
        <VStack spacing={3}>
          <Spinner size="lg" color="teal.500" thickness="3px" />
          <Text fontSize="sm" color="gray.400" letterSpacing="0.04em">Loading article…</Text>
        </VStack>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box minH="100vh" minW="1400px" w="100%" display="flex" flexDir="column" alignItems="center" justifyContent="center" bg="gray.50">
        <Text fontSize="3xl" mb={4}>📭</Text>
        <Heading size="md" mb={3} fontWeight="700">Article not found</Heading>
        <Button size="sm" variant="ghost" color="gray.500" leftIcon={<FiArrowLeft size={13} />} onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Box>
    );
  }

  const shareUrl = window.location.href;
  const isOwner  = currentUser && article.userId === currentUser.uid;
  const readTime = article.description ? Math.ceil(article.description.split(' ').length / 200) : 1;

  return (
    <Box minH="100vh" bg="gray.50"  w="100%" overflowX="hidden" pb={24}>
      <Box   px={{ base: 4, md: 8 }} pt={8}>

        {/* Back */}
        <Button
          variant="ghost" size="sm" leftIcon={<FiArrowLeft size={13} />}
          color="gray.400" fontSize="xs" mb={7}
          onClick={() => navigate('/')}
          _hover={{ color: 'gray.800' }}
        >
          Back to Home
        </Button>

        {/* Category + read-time */}
        <HStack spacing={3} mb={4} flexWrap="wrap">
          {article.category && (
            <Badge colorScheme="teal" variant="subtle" fontSize="xs" px={3} py={1} borderRadius="full" letterSpacing="0.04em">
              {article.category}
            </Badge>
          )}
          <Text fontSize="xs" color="gray.400">{readTime} min read</Text>
        </HStack>

        {/* Title */}
        <Heading
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="700"
          letterSpacing="-0.03em"
          lineHeight="1.25"
          color="gray.900"
          mb={5}
        >
          {article.title}
        </Heading>

        {/* Author row */}
        <Flex mb={7} justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <HStack spacing={3}>
            <Box
              w="38px" h="38px" borderRadius="full" bg="teal.500" flexShrink={0}
              display="flex" alignItems="center" justifyContent="center"
            >
              <Text fontSize="sm" fontWeight="700" color="white">
                {article.author?.slice(0, 1).toUpperCase() || 'A'}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="600" color="gray.800" lineHeight="1.2">
                {article.author || 'Anonymous'}
              </Text>
              <Text fontSize="xs" color="gray.400">
                {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </Box>
          </HStack>

          {isOwner && (
            <HStack spacing={2}>
              <Button size="xs" variant="outline" colorScheme="blue" borderRadius="full" fontSize="xs" px={4} onClick={onEditOpen}>
                Edit
              </Button>
              <Button size="xs" variant="outline" colorScheme="red" borderRadius="full" fontSize="xs" px={4} onClick={onDeleteOpen}>
                Delete
              </Button>
            </HStack>
          )}
        </Flex>

        {/* Cover image */}
        {article.imageUrl && (
          <Image
            src={article.imageUrl}
            alt={article.title}
            borderRadius="xl"
            w="100%"
            maxH="420px"
            objectFit="cover"
            mb={8}
          />
        )}

        {/* Body */}
        <Text
          fontSize={{ base: 'sm', md: 'md' }}
          lineHeight="1.9"
          color="gray.700"
          mb={10}
          whiteSpace="pre-wrap"
        >
          {article.description}
        </Text>

        <Divider mb={7} borderColor="gray.200" />

        {/* ── Reactions + Share ── */}
        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="xl"
          px={5}
          py={4}
          mb={6}
        >
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>

            {/* Like / Dislike */}
            <HStack spacing={3}>
              <Button
                leftIcon={<FiThumbsUp size={14} />}
                size="sm"
                borderRadius="full"
                px={5}
                fontWeight="600"
                fontSize="xs"
                variant={userReaction === 'liked' ? 'solid' : 'outline'}
                colorScheme={userReaction === 'liked' ? 'teal' : 'gray'}
                onClick={() => handleReaction('like')}
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'sm' }}
                transition="all 0.15s"
              >
                {likes} {likes === 1 ? 'Like' : 'Likes'}
              </Button>

              <Button
                leftIcon={<FiThumbsDown size={14} />}
                size="sm"
                borderRadius="full"
                px={5}
                fontWeight="600"
                fontSize="xs"
                variant={userReaction === 'disliked' ? 'solid' : 'outline'}
                colorScheme={userReaction === 'disliked' ? 'red' : 'gray'}
                onClick={() => handleReaction('dislike')}
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'sm' }}
                transition="all 0.15s"
              >
                {dislikes} {dislikes === 1 ? 'Dislike' : 'Dislikes'}
              </Button>
            </HStack>

            {/* Share icons */}
            <HStack spacing={1} align="center">
              <Text fontSize="xs" color="gray.400" fontWeight="600" letterSpacing="0.05em" textTransform="uppercase" mr={2}>
                Share
              </Text>
              {[
                { Icon: FaTwitter,  href: `https://twitter.com/intent/tweet?url=${shareUrl}`,                label: 'Twitter',  hoverColor: '#1DA1F2' },
                { Icon: FaFacebook, href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,        label: 'Facebook', hoverColor: '#1877F2' },
                { Icon: FaWhatsapp, href: `https://api.whatsapp.com/send?text=${shareUrl}`,                  label: 'WhatsApp', hoverColor: '#25D366' },
                { Icon: FaLinkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, label: 'LinkedIn', hoverColor: '#0A66C2' },
              ].map(({ Icon, href, label, hoverColor }) => (
                <IconButton
                  key={label}
                  as="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<Icon size={14} />}
                  aria-label={label}
                  size="sm"
                  variant="ghost"
                  color="gray.400"
                  borderRadius="full"
                  _hover={{ color: hoverColor, bg: 'gray.100', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                />
              ))}
            </HStack>
          </Flex>
        </Box>

      </Box>

      {/* ── Delete Confirmation ── */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.400" />
        <ModalContent borderRadius="xl" border="1px solid" borderColor="gray.100">
          <ModalHeader fontSize="md" fontWeight="700" pb={1}>Delete Article</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="gray.600" lineHeight="1.7">
              Are you sure you want to permanently delete this article? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" size="sm" onClick={onDeleteClose}>Cancel</Button>
            <Button colorScheme="red" size="sm" borderRadius="full" px={5} onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.400" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="md" fontWeight="700" pb={1}>Edit Article</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="gray.500" textTransform="uppercase">
                  Title
                </FormLabel>
                <Input
                  value={editedArticle.title}
                  onChange={(e) => setEditedArticle({ ...editedArticle, title: e.target.value })}
                  size="sm" borderRadius="lg" focusBorderColor="teal.400"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="gray.500" textTransform="uppercase">
                  Content
                </FormLabel>
                <Textarea
                  value={editedArticle.description}
                  onChange={(e) => setEditedArticle({ ...editedArticle, description: e.target.value })}
                  size="sm" borderRadius="lg" focusBorderColor="teal.400" rows={6} resize="none"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="gray.500" textTransform="uppercase">
                  Cover Image
                </FormLabel>
                <Box
                  p={5} border="2px dashed" borderColor="gray.200" borderRadius="lg"
                  textAlign="center" cursor="pointer" bg="gray.50"
                  _hover={{ borderColor: 'teal.300', bg: 'teal.50' }}
                  onClick={() => document.getElementById('adEditFileInput').click()}
                  onDragOver={(e) => e.preventDefault()}
                  transition="all 0.2s"
                >
                  {editedArticle.imageUrl
                    ? <Image src={editedArticle.imageUrl} alt="Preview" borderRadius="md" maxH="150px"  objectFit="cover" />
                    : <Text fontSize="sm" color="gray.400">Drop image or <Text as="span" color="teal.500" fontWeight="600">browse</Text></Text>
                  }
                </Box>
                <Input id="adEditFileInput" type="file" accept="image/*" display="none" onChange={handleImageUpload} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" size="sm" onClick={onEditClose}>Cancel</Button>
            <Button colorScheme="teal" size="sm" borderRadius="full" px={6} onClick={handleUpdate} isLoading={isUpdating}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ArticleDetails;