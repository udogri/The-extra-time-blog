import { useState, useEffect, useRef } from 'react';
import {
  Box, Heading, Text, Button, VStack, Spinner, Image, Badge,
  HStack, Menu, MenuButton, MenuList, MenuItem,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, FormControl, FormLabel, Input, Textarea,
  SimpleGrid, Avatar, Divider, IconButton, useToast,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Table, Thead, Tbody, Tr, Th, Td, Flex, Select
} from '@chakra-ui/react';
import { HiDotsVertical } from 'react-icons/hi';
import { MdAdd, MdOutlineMarkEmailRead, MdOutlineMarkEmailUnread } from 'react-icons/md';
import { FiEdit2, FiInbox, FiTrash2, FiSearch, FiSave, FiFolderPlus, FiExternalLink, FiGithub, FiActivity, FiTrendingUp, FiBookOpen, FiMail } from 'react-icons/fi';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Profile = () => {
  const { isAdmin, siteSettings, setSiteSettings } = useOutletContext();
  const [articles, setArticles] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [trafficData, setTrafficData] = useState({ totalVisits: 0, dailyTraffic: {} });
  const [loading, setLoading] = useState(true);
  
  // Articles control
  const [postToDelete, setPostToDelete] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedArticle, setEditedArticle] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [articleSearchQuery, setArticleSearchQuery] = useState('');

  // Settings control
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Projects control
  const [isAddProjOpen, setIsAddProjOpen] = useState(false);
  const [isProjEditOpen, setIsProjEditOpen] = useState(false);
  const [editedProject, setEditedProject] = useState({});
  const [isProjUpdating, setIsProjUpdating] = useState(false);
  const [uploadingProjImage, setUploadingProjImage] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    type: 'Web Development', // 'Web Development' or 'Graphic Design'
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    imageUrl: '',
  });
  const [isCreatingProj, setIsCreatingProj] = useState(false);

  const cancelRef = useRef();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchArticles(),
          fetchSubscribers(),
          fetchMessages(),
          fetchProjects(),
          fetchTrafficData()
        ]);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAdmin]);

  const fetchTrafficData = async () => {
    try {
      const snap = await getDoc(doc(db, 'analytics', 'traffic'));
      if (snap.exists()) {
        setTrafficData(snap.data());
      }
    } catch (error) {
      console.error('Error fetching traffic data:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const q = collection(db, 'articles');
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const snap = await getDocs(collection(db, 'subscribers'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSubscribers(list);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const snap = await getDocs(collection(db, 'messages'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setMessages(list);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const snap = await getDocs(collection(db, 'projects'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setProjects(list);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'articles', postToDelete.id));
      setArticles((prev) => prev.filter((item) => item.id !== postToDelete.id));
      toast({ title: 'Article deleted successfully.', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: 'Error deleting article.', description: error.message, status: 'error', duration: 3000 });
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
      toast({ title: 'Article updated successfully.', status: 'success', duration: 3000 });
      setIsEditOpen(false);
    } catch (error) {
      toast({ title: 'Error updating article.', description: error.message, status: 'error', duration: 3000 });
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
      const res = await fetch('https://api.imgbb.com/1/upload?key=bc6aa3a9cee7036d9b191018c92c893a', {
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
    } catch (err) {
      toast({ title: 'Image upload failed.', status: 'error', duration: 3000 });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateDoc(doc(db, 'settings', 'siteConfig'), siteSettings);
      toast({ title: 'Site settings saved successfully!', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: 'Error saving settings.', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setIsUploadingAvatar(true);
    try {
      const res = await fetch('https://api.imgbb.com/1/upload?key=bc6aa3a9cee7036d9b191018c92c893a', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSiteSettings((prev) => ({ ...prev, avatarUrl: data.data.url }));
        toast({ title: 'Avatar uploaded.', status: 'success', duration: 2000 });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      toast({ title: 'Avatar upload failed.', status: 'error', duration: 3000 });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteSubscriber = async (id) => {
    try {
      await deleteDoc(doc(db, 'subscribers', id));
      setSubscribers(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Subscriber removed.', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Error deleting subscriber.', description: error.message, status: 'error', duration: 3000 });
    }
  };

  const toggleMessageRead = async (msg) => {
    try {
      await updateDoc(doc(db, 'messages', msg.id), { read: !msg.read });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: !m.read } : m));
    } catch (error) {
      toast({ title: 'Error updating message status.', status: 'error', duration: 2000 });
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
      setMessages(prev => prev.filter(m => m.id !== id));
      toast({ title: 'Message deleted.', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Error deleting message.', description: error.message, status: 'error', duration: 3000 });
    }
  };

  // Projects logic
  const handleProjImageUpload = async (e, isEdit) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingProjImage(true);
    try {
      const res = await fetch('https://api.imgbb.com/1/upload?key=bc6aa3a9cee7036d9b191018c92c893a', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        if (isEdit) {
          setEditedProject((prev) => ({ ...prev, imageUrl: data.data.url }));
        } else {
          setNewProject((prev) => ({ ...prev, imageUrl: data.data.url }));
        }
        toast({ title: 'Project image uploaded.', status: 'success', duration: 2000 });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      toast({ title: 'Image upload failed.', status: 'error', duration: 3000 });
    } finally {
      setUploadingProjImage(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.description) {
      toast({ title: 'Missing fields.', description: 'Title and description are required.', status: 'warning', duration: 2000 });
      return;
    }
    setIsCreatingProj(true);
    try {
      const projId = uuidv4();
      const projRef = doc(db, 'projects', projId);
      
      const techStackArray = typeof newProject.techStack === 'string'
        ? newProject.techStack.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        id: projId,
        title: newProject.title,
        description: newProject.description,
        type: newProject.type,
        techStack: techStackArray,
        githubUrl: newProject.githubUrl || '',
        liveUrl: newProject.liveUrl || '',
        imageUrl: newProject.imageUrl || '',
        date: new Date().toISOString()
      };

      await setDoc(projRef, payload);
      setProjects((prev) => [payload, ...prev]);
      setIsAddProjOpen(false);
      setNewProject({
        title: '',
        description: '',
        type: 'Web Development',
        techStack: '',
        githubUrl: '',
        liveUrl: '',
        imageUrl: '',
      });
      toast({ title: 'Project added successfully!', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: 'Error adding project.', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsCreatingProj(false);
    }
  };

  const handleUpdateProject = async () => {
    setIsProjUpdating(true);
    try {
      const projRef = doc(db, 'projects', editedProject.id);
      
      const techStackArray = typeof editedProject.techStack === 'string'
        ? editedProject.techStack.split(',').map(s => s.trim()).filter(Boolean)
        : editedProject.techStack;

      const payload = {
        title: editedProject.title,
        description: editedProject.description,
        type: editedProject.type,
        techStack: techStackArray,
        githubUrl: editedProject.githubUrl || '',
        liveUrl: editedProject.liveUrl || '',
        imageUrl: editedProject.imageUrl || '',
      };

      await updateDoc(projRef, payload);
      setProjects((prev) => prev.map((p) => (p.id === editedProject.id ? { ...p, ...payload } : p)));
      toast({ title: 'Project updated successfully!', status: 'success', duration: 3000 });
      setIsProjEditOpen(false);
    } catch (error) {
      toast({ title: 'Error updating project.', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsProjUpdating(false);
    }
  };

  const confirmDeleteProject = async () => {
    try {
      await deleteDoc(doc(db, 'projects', projectToDelete.id));
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      toast({ title: 'Project deleted successfully.', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: 'Error deleting project.', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setProjectToDelete(null);
    }
  };

  const handleSettingChange = (field, value) => {
    setSiteSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialSettingChange = (field, value) => {
    setSiteSettings(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="lg" color="teal.500" thickness="3px" />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box minH="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" bg="gray.50" px={6}>
        <Box w="80px" h="80px" borderRadius="full" bg="gray.100" display="flex" alignItems="center" justifyContent="center" mb={6}>
          <Text fontSize="2xl">🔒</Text>
        </Box>
        <Heading size="md" mb={2} fontWeight="700" letterSpacing="-0.02em">Access Denied</Heading>
        <Text fontSize="sm" color="gray.500" maxW="280px" mb={6} textAlign="center" lineHeight="1.6">
          Only the administrator can access the Dashboard Console.
        </Text>
        <Button colorScheme="teal" size="sm" px={8} borderRadius="full" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Box>
    );
  }

  const filteredArticles = articles.filter(a => 
    a.title?.toLowerCase().includes(articleSearchQuery.toLowerCase()) || 
    a.category?.toLowerCase().includes(articleSearchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(projectSearchQuery.toLowerCase()) || 
    p.type?.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
    p.techStack?.some(t => t.toLowerCase().includes(projectSearchQuery.toLowerCase()))
  );

  // Analytics calculations
  const totalArticleViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  
  const popularArticles = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const getTrafficChartData = () => {
    const dailyTraffic = trafficData.dailyTraffic || {};
    const chartList = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      chartList.push({
        date: dateStr,
        label,
        count: dailyTraffic[dateStr] || 0
      });
    }
    return chartList;
  };

  const chartData = getTrafficChartData();
  const maxTrafficCount = Math.max(...chartData.map(c => c.count), 5);

  return (
    <Box minH="100vh" bg="gray.50" pb={16}>
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} pt={8}>

        {/* Dashboard Console Header */}
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={6} mb={8} display="flex" alignItems="center" gap={5} flexWrap="wrap">
          <Avatar src={siteSettings?.avatarUrl || ''} name={siteSettings?.bioName || 'Admin'} size="lg" bg="teal.500" color="white" />
          <Box flex="1">
            <Heading size="sm" fontWeight="700" letterSpacing="-0.01em" color="gray.900">{siteSettings?.bioName || 'Admin Console'}</Heading>
            <Text fontSize="sm" color="gray.500" mt={0.5}>Creative Dev & Designer</Text>
            <HStack mt={2} spacing={3} flexWrap="wrap">
              <Badge colorScheme="teal" variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="full">
                {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
              </Badge>
              <Badge colorScheme="purple" variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="full">
                {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              </Badge>
              <Badge colorScheme="blue" variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="full">
                {subscribers.length} {subscribers.length === 1 ? 'Subscriber' : 'Subscribers'}
              </Badge>
              <Badge colorScheme="orange" variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="full">
                {messages.filter(m => !m.read).length} Unread Inbox
              </Badge>
            </HStack>
          </Box>
          <HStack spacing={2}>
            <Button
              leftIcon={<FiFolderPlus size={16} />}
              colorScheme="purple"
              variant="outline"
              size="sm"
              borderRadius="full"
              px={5}
              fontWeight="600"
              fontSize="sm"
              onClick={() => setIsAddProjOpen(true)}
            >
              Add Project
            </Button>
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
              New Post
            </Button>
          </HStack>
        </Box>

        {/* Tab-driven layout console */}
        <Tabs variant="soft-rounded" colorScheme="teal">
          <TabList bg="white" p={1.5} borderRadius="xl" border="1px solid" borderColor="gray.100" gap={1} overflowX="auto">
            <Tab fontSize="sm" fontWeight="600" borderRadius="lg">Analytics</Tab>
            <Tab fontSize="sm" fontWeight="600" borderRadius="lg">Articles</Tab>
            <Tab fontSize="sm" fontWeight="600" borderRadius="lg">Site Settings</Tab>
            <Tab fontSize="sm" fontWeight="600" borderRadius="lg">Projects</Tab>
            <Tab fontSize="sm" fontWeight="600" borderRadius="lg">Subscribers</Tab>
            <Tab fontSize="sm" fontWeight="600" borderRadius="lg">Inbox</Tab>
          </TabList>

          <TabPanels mt={6}>

            {/* TABS PANEL 1: ANALYTICS & TRAFFIC */}
            <TabPanel p={0}>
              <VStack spacing={6} align="stretch">
                
                {/* 1. Core Analytics Cards */}
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5}>
                  {/* Card 1: Site Visits */}
                  <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
                    <Flex justify="space-between" align="center">
                      <VStack align="flex-start" spacing={1}>
                        <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">Total Site Visits</Text>
                        <Heading size="md" color="gray.850" fontWeight="800">
                          {trafficData.totalVisits || 0}
                        </Heading>
                      </VStack>
                      <Box bg="teal.50" color="teal.500" p={3} borderRadius="lg">
                        <FiActivity size={20} />
                      </Box>
                    </Flex>
                  </Box>

                  {/* Card 2: Article Reads */}
                  <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
                    <Flex justify="space-between" align="center">
                      <VStack align="flex-start" spacing={1}>
                        <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">Article Views</Text>
                        <Heading size="md" color="gray.850" fontWeight="800">
                          {totalArticleViews}
                        </Heading>
                      </VStack>
                      <Box bg="blue.50" color="blue.500" p={3} borderRadius="lg">
                        <FiBookOpen size={20} />
                      </Box>
                    </Flex>
                  </Box>

                  {/* Card 3: Newsletter Subscribers */}
                  <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
                    <Flex justify="space-between" align="center">
                      <VStack align="flex-start" spacing={1}>
                        <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">Subscribers</Text>
                        <Heading size="md" color="gray.850" fontWeight="800">
                          {subscribers.length}
                        </Heading>
                      </VStack>
                      <Box bg="purple.50" color="purple.500" p={3} borderRadius="lg">
                        <FiMail size={20} />
                      </Box>
                    </Flex>
                  </Box>

                  {/* Card 4: Feedback Inbox */}
                  <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
                    <Flex justify="space-between" align="center">
                      <VStack align="flex-start" spacing={1}>
                        <Text fontSize="xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">Feedback Inbox</Text>
                        <Heading size="md" color="gray.850" fontWeight="800">
                          {messages.length}
                        </Heading>
                      </VStack>
                      <Box bg="orange.50" color="orange.500" p={3} borderRadius="lg">
                        <FiInbox size={20} />
                      </Box>
                    </Flex>
                  </Box>
                </SimpleGrid>

                {/* 2. Visual Traffic Trend Chart */}
                <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
                  <VStack align="flex-start" spacing={5} w="100%">
                    <Box>
                      <Heading size="xs" fontWeight="800" color="gray.700" letterSpacing="-0.01em">
                        📈 Traffic Trend (Last 7 Days)
                      </Heading>
                      <Text fontSize="xs" color="gray.400" mt={0.5}>
                        Unique daily page loads recorded in this calendar week.
                      </Text>
                    </Box>

                    {/* Chart Core Bar Graph */}
                    <Flex h="200px" w="100%" align="flex-end" justify="space-between" pt={4} px={2} borderBottom="1px solid" borderColor="gray.150">
                      {chartData.map((day) => {
                        const heightPercent = `${(day.count / maxTrafficCount) * 100}%`;
                        return (
                          <VStack key={day.date} flex="1" spacing={2.5} h="100%" justify="flex-end">
                            <Text fontSize="10px" fontWeight="700" color="teal.500">
                              {day.count}
                            </Text>
                            <Box
                              w={{ base: "14px", sm: "24px", md: "34px" }}
                              h={day.count > 0 ? heightPercent : "4px"}
                              bgGradient="linear(to-t, teal.400, teal.300)"
                              borderRadius="t-md"
                              transition="all 0.4s ease"
                              _hover={{ bgGradient: "linear(to-t, teal.500, teal.400)" }}
                            />
                            <Text fontSize="10px" fontWeight="600" color="gray.400" whiteSpace="nowrap">
                              {day.label}
                            </Text>
                          </VStack>
                        );
                      })}
                    </Flex>
                  </VStack>
                </Box>

                {/* 3. Bottom Row: Category Stats + Popular Articles */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  
                  {/* Popular Articles */}
                  <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
                    <Heading size="xs" fontWeight="800" color="gray.700" mb={4}>
                      🔥 Top Performing Articles
                    </Heading>
                    {popularArticles.length === 0 ? (
                      <Text fontSize="xs" color="gray.400" py={4}>No views recorded yet.</Text>
                    ) : (
                      <VStack align="stretch" spacing={3}>
                        {popularArticles.map((art, idx) => (
                          <Flex key={art.id} justify="space-between" align="center" p={2.5} borderRadius="lg" _hover={{ bg: "gray.50" }}>
                            <HStack spacing={3}>
                              <Text fontSize="xs" fontWeight="800" color="gray.400" w="15px">#{idx + 1}</Text>
                              <Box>
                                <Text fontSize="xs" fontWeight="700" color="gray.700" noOfLines={1} maxW="280px">{art.title}</Text>
                                <Text fontSize="10px" color="gray.400">{art.category}</Text>
                              </Box>
                            </HStack>
                            <HStack spacing={4}>
                              <VStack align="flex-end" spacing={0}>
                                <Text fontSize="xs" fontWeight="800" color="teal.500">{art.views || 0}</Text>
                                <Text fontSize="9px" color="gray.400">views</Text>
                              </VStack>
                            </HStack>
                          </Flex>
                        ))}
                      </VStack>
                    )}
                  </Box>

                  {/* Category Breakdown */}
                  <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
                    <Heading size="xs" fontWeight="800" color="gray.700" mb={4}>
                      🗂️ Category Distribution
                    </Heading>
                    <VStack align="stretch" spacing={3.5}>
                      {['Web Development', 'Graphic Design', 'Life & Hobbies', 'Tutorials'].map((cat) => {
                        const catArticles = articles.filter(a => a.category === cat);
                        const catViews = catArticles.reduce((acc, curr) => acc + (curr.views || 0), 0);
                        const percentage = articles.length > 0 ? (catArticles.length / articles.length) * 100 : 0;
                        
                        return (
                          <Box key={cat}>
                            <Flex justify="space-between" align="center" mb={1}>
                              <Text fontSize="xs" fontWeight="700" color="gray.700">{cat}</Text>
                              <HStack spacing={2}>
                                <Text fontSize="10px" color="gray.400">{catArticles.length} posts</Text>
                                <Text fontSize="10px" fontWeight="700" color="teal.500">{catViews} views</Text>
                              </HStack>
                            </Flex>
                            <Box h="6px" w="100%" bg="gray.100" borderRadius="full" overflow="hidden">
                              <Box h="100%" w={`${percentage}%`} bg="teal.400" borderRadius="full" />
                            </Box>
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>

                </SimpleGrid>

              </VStack>
            </TabPanel>

            {/* TABS PANEL 2: ARTICLES LIST */}
            <TabPanel p={0}>
              <Box mb={5} display="flex" gap={4} alignItems="center">
                <Box position="relative" flex="1">
                  <Input 
                    placeholder="Search articles by title or category..." 
                    value={articleSearchQuery}
                    onChange={(e) => setArticleSearchQuery(e.target.value)}
                    size="sm"
                    bg="white"
                    borderRadius="lg"
                    pl={8}
                    borderColor="gray.200"
                    focusBorderColor="teal.400"
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">
                    <FiSearch size={14} />
                  </Box>
                </Box>
              </Box>

              {filteredArticles.length === 0 ? (
                <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={12} textAlign="center">
                  <Text fontSize="2xl" mb={3}>✍️</Text>
                  <Text fontWeight="600" color="gray.700" mb={1}>No articles found</Text>
                  <Text fontSize="sm" color="gray.400">Create a new post to get started.</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  {filteredArticles.map((article) => (
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
                          bg="blackAlpha.400"
                          _hover={{ bg: 'blackAlpha.600' }}
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
            </TabPanel>

            {/* TABS PANEL 2: SITE SETTINGS */}
            <TabPanel p={0}>
              <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100">
                <Heading size="md" mb={6} color="gray.900" fontWeight="700">Site Settings</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
                  {/* Left Column: Branding details */}
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">Blog Title</FormLabel>
                      <Input 
                        value={siteSettings?.title || ''} 
                        onChange={(e) => handleSettingChange('title', e.target.value)}
                        size="sm" borderRadius="lg" focusBorderColor="teal.400"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">Subtitle / Tagline</FormLabel>
                      <Input 
                        value={siteSettings?.subtitle || ''} 
                        onChange={(e) => handleSettingChange('subtitle', e.target.value)}
                        size="sm" borderRadius="lg" focusBorderColor="teal.400"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">Description</FormLabel>
                      <Textarea 
                        value={siteSettings?.description || ''} 
                        onChange={(e) => handleSettingChange('description', e.target.value)}
                        size="sm" borderRadius="lg" focusBorderColor="teal.400" rows={3} resize="none"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">Contact Email</FormLabel>
                      <Input 
                        type="email"
                        value={siteSettings?.contactEmail || ''} 
                        onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                        size="sm" borderRadius="lg" focusBorderColor="teal.400"
                      />
                    </FormControl>
                  </VStack>

                  {/* Right Column: Author Biography & Social Links */}
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">Author Name</FormLabel>
                      <Input 
                        value={siteSettings?.bioName || ''} 
                        onChange={(e) => handleSettingChange('bioName', e.target.value)}
                        size="sm" borderRadius="lg" focusBorderColor="teal.400"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">Author Biography</FormLabel>
                      <Textarea 
                        value={siteSettings?.bioText || ''} 
                        onChange={(e) => handleSettingChange('bioText', e.target.value)}
                        size="sm" borderRadius="lg" focusBorderColor="teal.400" rows={4} resize="none"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">Avatar Image</FormLabel>
                      <Box display="flex" gap={4} align="center">
                        <Avatar src={siteSettings?.avatarUrl || ''} size="md" name={siteSettings?.bioName || 'Admin'} />
                        <Box flex="1">
                          <Button 
                            size="xs" 
                            colorScheme="teal" 
                            variant="outline" 
                            borderRadius="full"
                            isLoading={isUploadingAvatar}
                            loadingText="Uploading..."
                            onClick={() => document.getElementById('settingsAvatarFile').click()}
                          >
                            Upload Profile Picture
                          </Button>
                          <Input id="settingsAvatarFile" type="file" accept="image/*" display="none" onChange={handleAvatarUpload} />
                          <Text fontSize="10px" color="gray.400" mt={1}>Max file size: 5MB</Text>
                        </Box>
                      </Box>
                    </FormControl>
                  </VStack>
                </SimpleGrid>

                <Divider mb={6} />

                {/* Social media URLs section */}
                <Heading size="xs" mb={4} color="gray.900" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">Social Links</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.500">Twitter URL</FormLabel>
                    <Input 
                      placeholder="https://twitter.com/..."
                      value={siteSettings?.socials?.twitter || ''} 
                      onChange={(e) => handleSocialSettingChange('twitter', e.target.value)}
                      size="sm" borderRadius="lg" focusBorderColor="teal.400"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.500">LinkedIn URL</FormLabel>
                    <Input 
                      placeholder="https://linkedin.com/in/..."
                      value={siteSettings?.socials?.linkedin || ''} 
                      onChange={(e) => handleSocialSettingChange('linkedin', e.target.value)}
                      size="sm" borderRadius="lg" focusBorderColor="teal.400"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.500">GitHub URL</FormLabel>
                    <Input 
                      placeholder="https://github.com/..."
                      value={siteSettings?.socials?.github || ''} 
                      onChange={(e) => handleSocialSettingChange('github', e.target.value)}
                      size="sm" borderRadius="lg" focusBorderColor="teal.400"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.500">Facebook URL</FormLabel>
                    <Input 
                      placeholder="https://facebook.com/..."
                      value={siteSettings?.socials?.facebook || ''} 
                      onChange={(e) => handleSocialSettingChange('facebook', e.target.value)}
                      size="sm" borderRadius="lg" focusBorderColor="teal.400"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.500">Instagram URL</FormLabel>
                    <Input 
                      placeholder="https://instagram.com/..."
                      value={siteSettings?.socials?.instagram || ''} 
                      onChange={(e) => handleSocialSettingChange('instagram', e.target.value)}
                      size="sm" borderRadius="lg" focusBorderColor="teal.400"
                    />
                  </FormControl>
                </SimpleGrid>

                <Button 
                  leftIcon={<FiSave size={14} />} 
                  colorScheme="teal" 
                  size="md" 
                  borderRadius="full" 
                  px={8}
                  isLoading={isSavingSettings}
                  onClick={handleSaveSettings}
                >
                  Save Settings
                </Button>
              </Box>
            </TabPanel>

            {/* TABS PANEL 3: PROJECTS MANAGER */}
            <TabPanel p={0}>
              <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100">
                <Flex align="center" justify="space-between" mb={6}>
                  <Heading size="md" color="gray.900" fontWeight="700">Manage Projects</Heading>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    borderRadius="full"
                    leftIcon={<FiFolderPlus />}
                    onClick={() => setIsAddProjOpen(true)}
                  >
                    Add New Project
                  </Button>
                </Flex>

                <Box mb={5} position="relative">
                  <Input 
                    placeholder="Search projects by title, stack or type..." 
                    value={projectSearchQuery}
                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                    size="sm"
                    bg="white"
                    borderRadius="lg"
                    pl={8}
                    borderColor="gray.200"
                    focusBorderColor="purple.400"
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">
                    <FiSearch size={14} />
                  </Box>
                </Box>

                {filteredProjects.length === 0 ? (
                  <Text fontSize="sm" color="gray.400" textAlign="center" py={8}>
                    No projects found. Add your portfolio pieces above!
                  </Text>
                ) : (
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th color="gray.500">Image</Th>
                        <Th color="gray.500">Title</Th>
                        <Th color="gray.500">Type</Th>
                        <Th color="gray.500">Tools / Stack</Th>
                        <Th color="gray.500" textAlign="right">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredProjects.map((proj) => (
                        <Tr key={proj.id}>
                          <Td>
                            <Image 
                              src={proj.imageUrl || 'https://via.placeholder.com/80x50'} 
                              w="60px" h="40px" objectFit="cover" borderRadius="md" 
                            />
                          </Td>
                          <Td fontWeight="600" color="gray.800">{proj.title}</Td>
                          <Td>
                            <Badge colorScheme={proj.type === 'Web Development' ? 'blue' : 'green'} variant="subtle">
                              {proj.type}
                            </Badge>
                          </Td>
                          <Td color="gray.600">
                            {proj.techStack?.join(', ') || ''}
                          </Td>
                          <Td textAlign="right">
                            <HStack justify="flex-end" spacing={1}>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                colorScheme="purple"
                                icon={<FiEdit2 size={13} />}
                                onClick={() => { setEditedProject(proj); setIsProjEditOpen(true); }}
                                aria-label="Edit project"
                              />
                              <IconButton
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                icon={<FiTrash2 size={13} />}
                                onClick={() => setProjectToDelete(proj)}
                                aria-label="Delete project"
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </TabPanel>

            {/* TABS PANEL 4: NEWSLETTER SUBSCRIBERS */}
            <TabPanel p={0}>
              <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100" overflowX="auto">
                <Heading size="md" mb={6} color="gray.900" fontWeight="700">Subscribers ({subscribers.length})</Heading>

                {subscribers.length === 0 ? (
                  <Text fontSize="sm" color="gray.400" textAlign="center" py={8}>
                    No email subscribers found.
                  </Text>
                ) : (
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th color="gray.500">Email Address</Th>
                        <Th color="gray.500">Subscribed Date</Th>
                        <Th color="gray.500" textAlign="right">Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {subscribers.map((sub) => (
                        <Tr key={sub.id}>
                          <Td fontWeight="600" color="gray.800">{sub.email}</Td>
                          <Td color="gray.500">
                            {sub.date ? new Date(sub.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          </Td>
                          <Td textAlign="right">
                            <Button 
                              size="xs" 
                              variant="ghost" 
                              colorScheme="red" 
                              onClick={() => handleDeleteSubscriber(sub.id)}
                            >
                              Remove
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </TabPanel>

            {/* TABS PANEL 5: MESSAGES INBOX */}
            <TabPanel p={0}>
              <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100" overflowX="auto">
                <Heading size="md" mb={6} color="gray.900" fontWeight="700">Inbox Messages ({messages.length})</Heading>

                {messages.length === 0 ? (
                  <Text fontSize="sm" color="gray.400" textAlign="center" py={8}>
                    No messages received.
                  </Text>
                ) : (
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th color="gray.500">Status</Th>
                        <Th color="gray.500">From</Th>
                        <Th color="gray.500">Message</Th>
                        <Th color="gray.500">Date</Th>
                        <Th color="gray.500" textAlign="right">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {messages.map((msg) => (
                        <Tr key={msg.id} bg={!msg.read ? "teal.50" : "transparent"}>
                          <Td>
                            <IconButton
                              size="xs"
                              variant="ghost"
                              colorScheme={msg.read ? "gray" : "teal"}
                              icon={msg.read ? <MdOutlineMarkEmailRead size={18} /> : <MdOutlineMarkEmailUnread size={18} />}
                              onClick={() => toggleMessageRead(msg)}
                              title={msg.read ? "Mark as Unread" : "Mark as Read"}
                            />
                          </Td>
                          <Td>
                            <Text fontWeight="600" color="gray.850">{msg.name}</Text>
                            <Text fontSize="10px" color="gray.400">{msg.email}</Text>
                          </Td>
                          <Td maxW="300px">
                            <Text fontSize="sm" color="gray.700" noOfLines={3} whiteSpace="pre-wrap">{msg.message}</Text>
                          </Td>
                          <Td color="gray.500">
                            {msg.date ? new Date(msg.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          </Td>
                          <Td textAlign="right">
                            <Button 
                              size="xs" 
                              variant="ghost" 
                              colorScheme="red" 
                              onClick={() => handleDeleteMessage(msg.id)}
                            >
                              Delete
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </TabPanel>

          </TabPanels>
        </Tabs>
      </Box>

      {/* Delete Confirmation Article */}
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

      {/* Delete Confirmation Project */}
      <AlertDialog isOpen={!!projectToDelete} leastDestructiveRef={cancelRef} onClose={() => setProjectToDelete(null)} isCentered>
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="xl" border="1px solid" borderColor="gray.100">
            <AlertDialogHeader fontSize="md" fontWeight="700" pb={2}>Delete Project</AlertDialogHeader>
            <AlertDialogBody fontSize="sm" color="gray.600">
              Are you sure you want to delete <strong>"{projectToDelete?.title}"</strong>? This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={cancelRef} onClick={() => setProjectToDelete(null)} size="sm" variant="ghost">
                Cancel
              </Button>
              <Button colorScheme="red" size="sm" onClick={confirmDeleteProject} borderRadius="full">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Modal Article */}
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
                {uploadingImage && <Spinner size="xs" color="teal.500" mt={2} />}
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

      {/* Add Project Modal */}
      <Modal isOpen={isAddProjOpen} onClose={() => setIsAddProjOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="md" fontWeight="700" pb={1}>Add Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500">PROJECT TITLE</FormLabel>
                <Input
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Portfolio Website"
                  size="sm" borderRadius="lg" focusBorderColor="purple.400"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500">TYPE</FormLabel>
                <Select
                  value={newProject.type}
                  onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                  size="sm" borderRadius="lg" focusBorderColor="purple.400"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Graphic Design">Graphic Design</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500">DESCRIPTION</FormLabel>
                <Textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Tell the story of the project..."
                  size="sm" borderRadius="lg" focusBorderColor="purple.400" rows={3} resize="none"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500">TOOLS & TECH STACK (COMMA SEPARATED)</FormLabel>
                <Input
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  placeholder="React, Chakra UI, Firebase"
                  size="sm" borderRadius="lg" focusBorderColor="purple.400"
                />
              </FormControl>
              <SimpleGrid columns={2} spacing={3} w="100%">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.500">GITHUB URL</FormLabel>
                  <Input
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    size="sm" borderRadius="lg" focusBorderColor="purple.400"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.500">LIVE DEMO URL</FormLabel>
                  <Input
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                    placeholder="https://..."
                    size="sm" borderRadius="lg" focusBorderColor="purple.400"
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500">PROJECT COVER IMAGE</FormLabel>
                <Box
                  p={4} border="2px dashed" borderColor="gray.200" borderRadius="lg" textAlign="center" cursor="pointer" bg="gray.50"
                  _hover={{ borderColor: 'purple.300', bg: 'purple.50' }}
                  onClick={() => document.getElementById('addProjFileInput').click()}
                  transition="all 0.2s"
                >
                  {newProject.imageUrl ? (
                    <Image src={newProject.imageUrl} alt="Project Preview" borderRadius="md" maxH="120px" mx="auto" objectFit="cover" />
                  ) : (
                    <VStack spacing={1}>
                      <Text fontSize="xs" color="gray.400">Click to upload cover</Text>
                      <Text fontSize="10px" color="gray.300">PNG, JPG up to 5MB</Text>
                    </VStack>
                  )}
                </Box>
                <Input id="addProjFileInput" type="file" accept="image/*" display="none" onChange={(e) => handleProjImageUpload(e, false)} />
                {uploadingProjImage && <Spinner size="xs" color="purple.500" mt={2} />}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button onClick={() => setIsAddProjOpen(false)} variant="ghost" size="sm">Cancel</Button>
            <Button colorScheme="purple" size="sm" onClick={handleCreateProject} isLoading={isCreatingProj} borderRadius="full" px={6}>
              Add Project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={isProjEditOpen} onClose={() => setIsProjEditOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="md" fontWeight="700" pb={1}>Edit Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500">PROJECT TITLE</FormLabel>
                <Input
                  value={editedProject.title || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                  size="sm" borderRadius="lg" focusBorderColor="purple.400"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500">TYPE</FormLabel>
                <Select
                  value={editedProject.type || 'Web Development'}
                  onChange={(e) => setEditedProject({ ...editedProject, type: e.target.value })}
                  size="sm" borderRadius="lg" focusBorderColor="purple.400"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Graphic Design">Graphic Design</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500">DESCRIPTION</FormLabel>
                <Textarea
                  value={editedProject.description || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                  size="sm" borderRadius="lg" focusBorderColor="purple.400" rows={3} resize="none"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500">TOOLS & TECH STACK (COMMA SEPARATED)</FormLabel>
                <Input
                  value={Array.isArray(editedProject.techStack) ? editedProject.techStack.join(', ') : editedProject.techStack || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, techStack: e.target.value })}
                  placeholder="React, Chakra UI, Firebase"
                  size="sm" borderRadius="lg" focusBorderColor="purple.400"
                />
              </FormControl>
              <SimpleGrid columns={2} spacing={3} w="100%">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.500">GITHUB URL</FormLabel>
                  <Input
                    value={editedProject.githubUrl || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, githubUrl: e.target.value })}
                    size="sm" borderRadius="lg" focusBorderColor="purple.400"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.500">LIVE DEMO URL</FormLabel>
                  <Input
                    value={editedProject.liveUrl || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, liveUrl: e.target.value })}
                    size="sm" borderRadius="lg" focusBorderColor="purple.400"
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500">PROJECT COVER IMAGE</FormLabel>
                <Box
                  p={4} border="2px dashed" borderColor="gray.200" borderRadius="lg" textAlign="center" cursor="pointer" bg="gray.50"
                  _hover={{ borderColor: 'purple.300', bg: 'purple.50' }}
                  onClick={() => document.getElementById('editProjFileInput').click()}
                  transition="all 0.2s"
                >
                  {editedProject.imageUrl ? (
                    <Image src={editedProject.imageUrl} alt="Project Preview" borderRadius="md" maxH="120px" mx="auto" objectFit="cover" />
                  ) : (
                    <VStack spacing={1}>
                      <Text fontSize="xs" color="gray.400">Click to upload cover</Text>
                      <Text fontSize="10px" color="gray.300">PNG, JPG up to 5MB</Text>
                    </VStack>
                  )}
                </Box>
                <Input id="editProjFileInput" type="file" accept="image/*" display="none" onChange={(e) => handleProjImageUpload(e, true)} />
                {uploadingProjImage && <Spinner size="xs" color="purple.500" mt={2} />}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button onClick={() => setIsProjEditOpen(false)} variant="ghost" size="sm">Cancel</Button>
            <Button colorScheme="purple" size="sm" onClick={handleUpdateProject} isLoading={isProjUpdating} borderRadius="full" px={6}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;