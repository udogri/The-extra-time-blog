import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Button, useToast, Spinner, IconButton,
  Image, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Input, VStack, Textarea, FormControl,
  FormLabel, useDisclosure, HStack, Divider, Badge, Flex,
} from '@chakra-ui/react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { doc, getDoc, deleteDoc, updateDoc, increment, addDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, app } from '../firebaseConfig';
import { FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin } from 'react-icons/fa';
import { FiThumbsUp, FiThumbsDown, FiArrowLeft } from 'react-icons/fi';

const ArticleDetails = () => {
  const { isAdmin, user: currentUser } = useOutletContext();
  const [article, setArticle]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [isDeleting, setIsDeleting]         = useState(false);
  const [isUpdating, setIsUpdating]         = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editedArticle, setEditedArticle]   = useState({ title: '', description: '', imageUrl: '' });
  const [likes, setLikes]                   = useState(0);
  const [dislikes, setDislikes]             = useState(0);
  const [userReaction, setUserReaction]     = useState(null);

  // Comments state
  const [comments, setComments]             = useState([]);
  const [commentName, setCommentName]       = useState('');
  const [commentText, setCommentText]       = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const toast    = useToast();
  const navigate = useNavigate();
  const { articleId } = useParams();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isEditOpen,   onOpen: onEditOpen,   onClose: onEditClose   } = useDisclosure();
  const auth = getAuth(app);

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

          // Track article views in this session
          const hasViewed = sessionStorage.getItem(`viewed_art_${articleId}`);
          if (!hasViewed) {
            sessionStorage.setItem(`viewed_art_${articleId}`, 'true');
            try {
              await updateDoc(doc(db, 'articles', articleId), {
                views: increment(1)
              });
            } catch (viewErr) {
              console.warn("Could not update article view count:", viewErr);
            }
          }
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

    const fetchComments = async () => {
      try {
        const q = query(collection(db, 'articles', articleId, 'comments'), orderBy('date', 'desc'));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(list);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();

    // Load reaction from localStorage
    const saved = localStorage.getItem(`reaction_${articleId}`);
    if (saved) {
      setUserReaction(saved);
    }
  }, [articleId]);

  const handleReaction = async (type) => {
    if (!articleId) return;
    const ref    = doc(db, 'articles', articleId);
    const update = {};
    let newReaction = null;

    if (type === 'like') {
      if (userReaction === 'liked') {
        update.likes = increment(-1);
        setLikes((p) => p - 1);
        newReaction = null;
      } else {
        update.likes = increment(1);
        if (userReaction === 'disliked') {
          update.dislikes = increment(-1);
          setDislikes((p) => p - 1);
        }
        setLikes((p) => p + 1);
        newReaction = 'liked';
      }
    } else {
      if (userReaction === 'disliked') {
        update.dislikes = increment(-1);
        setDislikes((p) => p - 1);
        newReaction = null;
      } else {
        update.dislikes = increment(1);
        if (userReaction === 'liked') {
          update.likes = increment(-1);
          setLikes((p) => p - 1);
        }
        setDislikes((p) => p + 1);
        newReaction = 'disliked';
      }
    }

    try {
      await updateDoc(ref, update);
      setUserReaction(newReaction);
      if (newReaction) {
        localStorage.setItem(`reaction_${articleId}`, newReaction);
      } else {
        localStorage.removeItem(`reaction_${articleId}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      const docRef = await addDoc(collection(db, 'articles', articleId, 'comments'), {
        name: commentName.trim() || 'Anonymous Reader',
        text: commentText.trim(),
        date: new Date().toISOString()
      });
      const newComment = {
        id: docRef.id,
        name: commentName.trim() || 'Anonymous Reader',
        text: commentText.trim(),
        date: new Date().toISOString()
      };
      setComments((prev) => [newComment, ...prev]);
      setCommentName('');
      setCommentText('');
      toast({ title: 'Comment posted!', status: 'success', duration: 2000, isClosable: true });
    } catch (err) {
      toast({ title: 'Error posting comment.', description: err.message, status: 'error', duration: 3000 });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, 'articles', articleId, 'comments', commentId));
      setComments((prev) => prev.filter(c => c.id !== commentId));
      toast({ title: 'Comment deleted.', status: 'success', duration: 2000 });
    } catch (err) {
      toast({ title: 'Error deleting comment.', description: err.message, status: 'error', duration: 3000 });
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) {
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
    if (!isAdmin) {
      toast({ title: 'Unauthorized.', status: 'error', duration: 3000, isClosable: true, position: 'top' });
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
      const imgBbKey = import.meta.env.VITE_IMGBB_API_KEY;
      const res  = await fetch(`https://api.imgbb.com/1/upload?key=${imgBbKey}`, { method: 'POST', body: formData });
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
      <Box minH="100vh" w="100%" display="flex" justifyContent="center" alignItems="center" bg="#0b0f19">
        <VStack spacing={3}>
          <Spinner size="lg" color="teal.400" thickness="3px" />
          <Text fontSize="sm" color="gray.400" letterSpacing="0.04em">Loading article…</Text>
        </VStack>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box minH="100vh" w="100%" display="flex" flexDir="column" alignItems="center" justifyContent="center" bg="#0b0f19">
        <Text fontSize="3xl" mb={4}>📭</Text>
        <Heading size="md" mb={3} fontWeight="700" color="white">Article not found</Heading>
        <Button size="sm" variant="ghost" color="gray.400" leftIcon={<FiArrowLeft size={13} />} onClick={() => navigate('/')} _hover={{ bg: 'whiteAlpha.100', color: 'white' }}>
          Back to Home
        </Button>
      </Box>
    );
  }

  const shareUrl = window.location.href;
  const isOwner  = currentUser && article.userId === currentUser.uid;
  const readTime = article.description ? Math.ceil(article.description.split(' ').length / 200) : 1;

  return (
    <Box minH="100vh" bg="#0b0f19" w="100%" overflowX="hidden" pb={24}>
      <Box px={{ base: 4, md: 8 }} pt={8}>

        {/* Back */}
        <Button
          variant="ghost" size="sm" leftIcon={<FiArrowLeft size={13} />}
          color="gray.400" fontSize="xs" mb={7}
          onClick={() => navigate('/')}
          _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
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
          <Text fontSize="xs" color="gray.500">{readTime} min read</Text>
        </HStack>

        {/* Title */}
        <Heading
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="700"
          letterSpacing="-0.03em"
          lineHeight="1.25"
          color="white"
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
              <Text fontSize="sm" fontWeight="600" color="white" lineHeight="1.2">
                {article.author || 'Anonymous'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </Box>
          </HStack>

          {isAdmin && (
            <HStack spacing={2}>
              <Button size="xs" variant="outline" colorScheme="purple" borderRadius="full" fontSize="xs" px={4} onClick={onEditOpen}>
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
          color="gray.300"
          mb={10}
          whiteSpace="pre-wrap"
        >
          {article.description}
        </Text>

        <Divider mb={7} borderColor="whiteAlpha.100" />

        {/* ── Reactions + Share ── */}
        <Box
          bg="#161e2e"
          border="1px solid"
          borderColor="whiteAlpha.100"
          borderRadius="xl"
          px={5}
          py={4}
          mb={6}
          boxShadow="2xl"
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
                colorScheme={userReaction === 'liked' ? 'teal' : 'whiteAlpha'}
                color={userReaction === 'liked' ? 'white' : 'gray.300'}
                borderColor={userReaction === 'liked' ? 'teal.500' : 'whiteAlpha.200'}
                onClick={() => handleReaction('like')}
                _hover={{ transform: 'translateY(-1px)', bg: userReaction === 'liked' ? 'teal.600' : 'whiteAlpha.100' }}
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
                colorScheme={userReaction === 'disliked' ? 'red' : 'whiteAlpha'}
                color={userReaction === 'disliked' ? 'white' : 'gray.300'}
                borderColor={userReaction === 'disliked' ? 'red.500' : 'whiteAlpha.200'}
                onClick={() => handleReaction('dislike')}
                _hover={{ transform: 'translateY(-1px)', bg: userReaction === 'disliked' ? 'red.600' : 'whiteAlpha.100' }}
                transition="all 0.15s"
              >
                {dislikes} {dislikes === 1 ? 'Dislike' : 'Dislikes'}
              </Button>
            </HStack>

            {/* Share icons */}
            <HStack spacing={1} align="center">
              <Text fontSize="xs" color="gray.500" fontWeight="600" letterSpacing="0.05em" textTransform="uppercase" mr={2}>
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
                  _hover={{ color: hoverColor, bg: 'whiteAlpha.100', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                />
              ))}
            </HStack>
          </Flex>
        </Box>

        {/* ── Comments Section ── */}
        <Box mt={10}>
          <Heading size="md" mb={6} color="white" fontWeight="700">
            Comments ({comments.length})
          </Heading>

          {/* Comment Form */}
          <Box bg="#161e2e" p={6} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" mb={8} boxShadow="2xl">
            <form onSubmit={handleAddComment}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.400" textTransform="uppercase">Your Name</FormLabel>
                  <Input 
                    placeholder="Enter your name (optional)" 
                    value={commentName} 
                    onChange={(e) => setCommentName(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    bg="#0b0f19"
                    color="white"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'whiteAlpha.300' }}
                    _placeholder={{ color: 'gray.550' }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.400" textTransform="uppercase">Comment</FormLabel>
                  <Textarea 
                    placeholder="Write your comment here..." 
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    bg="#0b0f19"
                    color="white"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'whiteAlpha.300' }}
                    _placeholder={{ color: 'gray.550' }}
                    rows={4}
                    resize="none"
                  />
                </FormControl>
                <Button 
                  type="submit" 
                  colorScheme="teal" 
                  size="sm" 
                  borderRadius="full" 
                  alignSelf="flex-start" 
                  px={6}
                  isLoading={isSubmittingComment}
                >
                  Post Comment
                </Button>
              </VStack>
            </form>
          </Box>

          {/* Comments List */}
          {comments.length === 0 ? (
            <Text fontSize="sm" color="gray.500" textAlign="center" py={6}>
              No comments yet. Be the first to share your thoughts!
            </Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {comments.map((comment) => (
                <Box key={comment.id} bg="#161e2e" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" boxShadow="2xl">
                  <Flex justify="space-between" align="flex-start">
                    <HStack spacing={3}>
                      <Box w="32px" h="32px" borderRadius="full" bg="teal.950" display="flex" alignItems="center" justifyContent="center">
                        <Text fontSize="xs" fontWeight="700" color="teal.300">
                          {comment.name?.slice(0, 1).toUpperCase() || 'R'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="600" color="white">
                          {comment.name || 'Anonymous Reader'}
                        </Text>
                        <Text fontSize="10px" color="gray.500">
                          {comment.date ? new Date(comment.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </Text>
                      </Box>
                    </HStack>
                    {isAdmin && (
                      <Button size="xs" variant="ghost" colorScheme="red" color="red.400" _hover={{ bg: 'whiteAlpha.100' }} borderRadius="full" onClick={() => handleDeleteComment(comment.id)}>
                        Delete
                      </Button>
                    )}
                  </Flex>
                  <Text fontSize="sm" color="gray.300" mt={3} pl={11} lineHeight="1.6" whiteSpace="pre-wrap">
                    {comment.text}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

      </Box>

      {/* ── Delete Confirmation ── */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.700" />
        <ModalContent bg="#161e2e" color="white" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <ModalHeader fontSize="md" fontWeight="700" pb={1} color="white">Delete Article</ModalHeader>
          <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />
          <ModalBody>
            <Text fontSize="sm" color="gray.400" lineHeight="1.7">
              Are you sure you want to permanently delete this article? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" color="gray.400" _hover={{ bg: 'whiteAlpha.100', color: 'white' }} size="sm" onClick={onDeleteClose}>Cancel</Button>
            <Button colorScheme="red" size="sm" borderRadius="full" px={5} onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.700" />
        <ModalContent bg="#161e2e" color="white" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
          <ModalHeader fontSize="md" fontWeight="700" pb={1} color="white">Edit Article</ModalHeader>
          <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="gray.400" textTransform="uppercase">
                  Title
                </FormLabel>
                <Input
                  value={editedArticle.title}
                  onChange={(e) => setEditedArticle({ ...editedArticle, title: e.target.value })}
                  size="sm"
                  borderRadius="lg"
                  bg="#0b0f19"
                  color="white"
                  borderColor="whiteAlpha.100"
                  focusBorderColor="teal.400"
                  _hover={{ borderColor: 'whiteAlpha.300' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="gray.400" textTransform="uppercase">
                  Content
                </FormLabel>
                <Textarea
                  value={editedArticle.description}
                  onChange={(e) => setEditedArticle({ ...editedArticle, description: e.target.value })}
                  size="sm"
                  borderRadius="lg"
                  bg="#0b0f19"
                  color="white"
                  borderColor="whiteAlpha.100"
                  focusBorderColor="teal.400"
                  _hover={{ borderColor: 'whiteAlpha.300' }}
                  rows={6}
                  resize="none"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="gray.400" textTransform="uppercase">
                  Cover Image
                </FormLabel>
                <Box
                  p={5}
                  border="2px dashed"
                  borderColor="whiteAlpha.200"
                  borderRadius="lg"
                  textAlign="center"
                  cursor="pointer"
                  bg="#0b0f19"
                  _hover={{ borderColor: 'teal.300', bg: 'whiteAlpha.50' }}
                  onClick={() => document.getElementById('adEditFileInput').click()}
                  onDragOver={(e) => e.preventDefault()}
                  transition="all 0.2s"
                >
                  {editedArticle.imageUrl
                    ? <Image src={editedArticle.imageUrl} alt="Preview" borderRadius="md" maxH="150px" objectFit="cover" mx="auto" />
                    : <Text fontSize="sm" color="gray.500">Drop image or <Text as="span" color="teal.400" fontWeight="600">browse</Text></Text>
                  }
                </Box>
                <Input id="adEditFileInput" type="file" accept="image/*" display="none" onChange={handleImageUpload} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" color="gray.400" _hover={{ bg: 'whiteAlpha.100', color: 'white' }} size="sm" onClick={onEditClose}>Cancel</Button>
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