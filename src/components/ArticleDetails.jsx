import { useState, useEffect, useRef } from 'react';
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
import { FiThumbsUp, FiThumbsDown, FiArrowLeft, FiImage } from 'react-icons/fi';

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

  // Edit inline image refs and state
  const editContentRef = useRef(null);
  const editBodyImageInputRef = useRef(null);
  const [isUploadingEditBodyImage, setIsUploadingEditBodyImage] = useState(false);

  const insertAtEditCursor = (textToInsert) => {
    const textarea = editContentRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    const newDescription = before + textToInsert + after;
    setEditedArticle(prev => ({ ...prev, description: newDescription }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    }, 0);
  };

  const handleEditBodyImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingEditBodyImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const imgBbKey = import.meta.env.VITE_IMGBB_API_KEY;
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgBbKey}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        insertAtEditCursor(`\n![Image Description](${data.data.url})\n`);
        toast({ title: 'Image inserted!', status: 'success', position: 'top', duration: 2000 });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Image upload failed.', status: 'error', duration: 3000, isClosable: true, position: 'top' });
    } finally {
      setIsUploadingEditBodyImage(false);
      e.target.value = '';
    }
  };

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
            const dateStr = new Date().toISOString().split('T')[0];
            try {
              await updateDoc(doc(db, 'articles', articleId), {
                views: increment(1),
                [`dailyViews.${dateStr}`]: increment(1)
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
      <Box minH="100vh" w="100%" display="flex" justifyContent="center" alignItems="center" bg="bg">
        <VStack spacing={3}>
          <Spinner size="lg" color="teal.400" thickness="3px" />
          <Text fontSize="sm" color="mutedText" letterSpacing="0.04em">Loading article…</Text>
        </VStack>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box minH="100vh" w="100%" display="flex" flexDir="column" alignItems="center" justifyContent="center" bg="bg">
        <Text fontSize="3xl" mb={4}>📭</Text>
        <Heading size="md" mb={3} fontWeight="700" color="text">Article not found</Heading>
        <Button size="sm" variant="ghost" color="mutedText" leftIcon={<FiArrowLeft size={13} />} onClick={() => navigate('/')} _hover={{ bg: 'hoverBg', color: 'text' }}>
          Back to Home
        </Button>
      </Box>
    );
  }

  const shareUrl = window.location.href;
  const isOwner  = currentUser && article.userId === currentUser.uid;
  const readTime = article.description ? Math.ceil(article.description.split(' ').length / 200) : 1;

  return (
    <Box minH="100vh" bg="bg" w="100%" overflowX="hidden" pb={24}>
      <Box px={{ base: 4, md: 8 }} pt={8}>

        {/* Back */}
        <Button
          variant="ghost" size="sm" leftIcon={<FiArrowLeft size={13} />}
          color="mutedText" fontSize="xs" mb={7}
          onClick={() => navigate('/')}
          _hover={{ color: 'text', bg: 'hoverBg' }}
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
          <Text fontSize="xs" color="mutedText">{readTime} min read</Text>
        </HStack>

        {/* Title */}
        <Heading
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="700"
          letterSpacing="-0.03em"
          lineHeight="1.25"
          color="text"
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
              <Text fontSize="sm" fontWeight="600" color="text" lineHeight="1.2">
                {article.author || 'Anonymous'}
              </Text>
              <Text fontSize="xs" color="mutedText">
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

        {/* Render article body with support for inline images */}
        <Box mb={10} width="100%">
          {(() => {
            if (!article.description) return null;
            const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
            const elements = [];
            let lastIndex = 0;
            let match;
            
            while ((match = imgRegex.exec(article.description)) !== null) {
              const textBefore = article.description.substring(lastIndex, match.index);
              if (textBefore) {
                elements.push(
                  <Text key={`text-${lastIndex}`} fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.9" color="text" whiteSpace="pre-wrap">
                    {textBefore}
                  </Text>
                );
              }
              
              const alt = match[1];
              const url = match[2];
              elements.push(
                <Box key={`img-${match.index}`} my={6} overflow="hidden" borderRadius="xl" border="1px solid" borderColor="border" bg="bg">
                  <Image 
                    src={url} 
                    alt={alt || "Article Image"} 
                    maxH="600px" 
                    w="auto" 
                    maxW="100%"
                    mx="auto"
                    display="block"
                    fallbackSrc="https://via.placeholder.com/800x400?text=Loading+Image..."
                  />
                  {alt && (
                    <Text fontSize="xs" color="mutedText" textAlign="center" py={2} bg="cardBg" borderTop="1px solid" borderColor="border">
                      {alt}
                    </Text>
                  )}
                </Box>
              );
              
              lastIndex = imgRegex.lastIndex;
            }
            
            const textAfter = article.description.substring(lastIndex);
            if (textAfter) {
              elements.push(
                <Text key={`text-${lastIndex}`} fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.9" color="text" whiteSpace="pre-wrap">
                  {textAfter}
                </Text>
              );
            }
            
            return <VStack align="stretch" spacing={4}>{elements}</VStack>;
          })()}
        </Box>

        <Divider mb={7} borderColor="border" />

        {/* ── Reactions + Share ── */}
        <Box
          bg="cardBg"
          border="1px solid"
          borderColor="border"
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
                colorScheme={userReaction === 'liked' ? 'teal' : 'gray'}
                color={userReaction === 'liked' ? 'white' : 'text'}
                borderColor={userReaction === 'liked' ? 'teal.500' : 'border'}
                onClick={() => handleReaction('like')}
                _hover={{ transform: 'translateY(-1px)', bg: userReaction === 'liked' ? 'teal.600' : 'hoverBg' }}
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
                color={userReaction === 'disliked' ? 'white' : 'text'}
                borderColor={userReaction === 'disliked' ? 'red.500' : 'border'}
                onClick={() => handleReaction('dislike')}
                _hover={{ transform: 'translateY(-1px)', bg: userReaction === 'disliked' ? 'red.600' : 'hoverBg' }}
                transition="all 0.15s"
              >
                {dislikes} {dislikes === 1 ? 'Dislike' : 'Dislikes'}
              </Button>
            </HStack>

            {/* Share icons */}
            <HStack spacing={1} align="center">
              <Text fontSize="xs" color="mutedText" fontWeight="600" letterSpacing="0.05em" textTransform="uppercase" mr={2}>
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
                  color="mutedText"
                  borderRadius="full"
                  _hover={{ color: hoverColor, bg: 'hoverBg', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                />
              ))}
            </HStack>
          </Flex>
        </Box>

        {/* ── Comments Section ── */}
        <Box mt={10}>
          <Heading size="md" mb={6} color="text" fontWeight="700">
            Comments ({comments.length})
          </Heading>

          {/* Comment Form */}
          <Box bg="cardBg" p={6} borderRadius="xl" border="1px solid" borderColor="border" mb={8} boxShadow="2xl">
            <form onSubmit={handleAddComment}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="mutedText" textTransform="uppercase">Your Name</FormLabel>
                  <Input 
                    placeholder="Enter your name (optional)" 
                    value={commentName} 
                    onChange={(e) => setCommentName(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    bg="inputBg"
                    color="text"
                    border="1px solid"
                    borderColor="border"
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'mutedText' }}
                    _placeholder={{ color: 'gray.550' }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="600" color="mutedText" textTransform="uppercase">Comment</FormLabel>
                  <Textarea 
                    placeholder="Write your comment here..." 
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    bg="inputBg"
                    color="text"
                    border="1px solid"
                    borderColor="border"
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'mutedText' }}
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
            <Text fontSize="sm" color="mutedText" textAlign="center" py={6}>
              No comments yet. Be the first to share your thoughts!
            </Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {comments.map((comment) => (
                <Box key={comment.id} bg="cardBg" p={5} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl">
                  <Flex justify="space-between" align="flex-start">
                    <HStack spacing={3}>
                      <Box w="32px" h="32px" borderRadius="full" bg="teal.950" display="flex" alignItems="center" justifyContent="center">
                        <Text fontSize="xs" fontWeight="700" color="teal.300">
                          {comment.name?.slice(0, 1).toUpperCase() || 'R'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="600" color="text">
                          {comment.name || 'Anonymous Reader'}
                        </Text>
                        <Text fontSize="10px" color="mutedText">
                          {comment.date ? new Date(comment.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </Text>
                      </Box>
                    </HStack>
                    {isAdmin && (
                      <Button size="xs" variant="ghost" colorScheme="red" color="red.400" _hover={{ bg: 'hoverBg' }} borderRadius="full" onClick={() => handleDeleteComment(comment.id)}>
                        Delete
                      </Button>
                    )}
                  </Flex>
                  <Text fontSize="sm" color="text" mt={3} pl={11} lineHeight="1.6" whiteSpace="pre-wrap">
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
        <ModalContent bg="cardBg" color="text" borderRadius="xl" border="1px solid" borderColor="border">
          <ModalHeader fontSize="md" fontWeight="700" pb={1} color="text">Delete Article</ModalHeader>
          <ModalCloseButton color="mutedText" _hover={{ color: 'text' }} />
          <ModalBody>
            <Text fontSize="sm" color="mutedText" lineHeight="1.7">
              Are you sure you want to permanently delete this article? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" color="mutedText" _hover={{ bg: 'hoverBg', color: 'text' }} size="sm" onClick={onDeleteClose}>Cancel</Button>
            <Button colorScheme="red" size="sm" borderRadius="full" px={5} onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
 
      {/* ── Edit Modal ── */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.700" />
        <ModalContent bg="cardBg" color="text" borderRadius="xl" border="1px solid" borderColor="border">
          <ModalHeader fontSize="md" fontWeight="700" pb={1} color="text">Edit Article</ModalHeader>
          <ModalCloseButton color="mutedText" _hover={{ color: 'text' }} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="mutedText" textTransform="uppercase">
                  Title
                </FormLabel>
                <Input
                  value={editedArticle.title}
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
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="mutedText" textTransform="uppercase">
                  Content
                </FormLabel>

                {/* Edit Modal body image upload toolbar */}
                <HStack spacing={3} py={1} borderBottom="1px solid" borderColor="border" pb={2} mb={2} flexWrap="wrap" gap={2}>
                  <Button
                    leftIcon={<FiImage />}
                    size="xs"
                    variant="outline"
                    borderColor="border"
                    color="mutedText"
                    _hover={{ bg: 'hoverBg', color: 'text', borderColor: 'teal.400' }}
                    borderRadius="md"
                    onClick={() => editBodyImageInputRef.current.click()}
                    isLoading={isUploadingEditBodyImage}
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
                    ref={editBodyImageInputRef}
                    style={{ display: 'none' }}
                    onChange={handleEditBodyImageUpload}
                  />
                </HStack>

                <Textarea
                  ref={editContentRef}
                  value={editedArticle.description}
                  onChange={(e) => setEditedArticle({ ...editedArticle, description: e.target.value })}
                  size="sm"
                  borderRadius="lg"
                  bg="inputBg"
                  color="text"
                  borderColor="border"
                  focusBorderColor="teal.400"
                  _hover={{ borderColor: 'mutedText' }}
                  rows={6}
                  resize="none"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" letterSpacing="0.06em" color="mutedText" textTransform="uppercase">
                  Cover Image
                </FormLabel>
                <Box
                  p={5}
                  border="2px dashed"
                  borderColor="border"
                  borderRadius="lg"
                  textAlign="center"
                  cursor="pointer"
                  bg="bg"
                  _hover={{ borderColor: 'teal.300', bg: 'hoverBg' }}
                  onClick={() => document.getElementById('adEditFileInput').click()}
                  onDragOver={(e) => e.preventDefault()}
                  transition="all 0.2s"
                >
                  {editedArticle.imageUrl
                    ? <Image src={editedArticle.imageUrl} alt="Preview" borderRadius="md" maxH="150px" objectFit="cover" mx="auto" />
                    : <Text fontSize="sm" color="mutedText">Drop image or <Text as="span" color="teal.400" fontWeight="600">browse</Text></Text>
                  }
                </Box>
                <Input id="adEditFileInput" type="file" accept="image/*" display="none" onChange={handleImageUpload} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" color="mutedText" _hover={{ bg: 'hoverBg', color: 'text' }} size="sm" onClick={onEditClose}>Cancel</Button>
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