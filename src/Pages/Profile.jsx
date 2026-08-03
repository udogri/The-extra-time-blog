import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Button, Spinner, Badge,
  HStack, Avatar, useToast, Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { collection, getDocs, deleteDoc, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Dashboard modular components
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import ArticlesTab from '../components/dashboard/ArticlesTab';
import SettingsTab from '../components/dashboard/SettingsTab';
import ProjectsTab from '../components/dashboard/ProjectsTab';
import SubscribersTab from '../components/dashboard/SubscribersTab';
import InboxTab from '../components/dashboard/InboxTab';

const Profile = () => {
  const { isAdmin, siteSettings, setSiteSettings } = useOutletContext();
  const [articles, setArticles] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [trafficData, setTrafficData] = useState({ totalVisits: 0, dailyTraffic: {} });
  const [trafficError, setTrafficError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

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
        const data = snap.data();
        const dailyTraffic = { ...(data.dailyTraffic || {}) };
        Object.keys(data).forEach((key) => {
          if (key.startsWith('dailyTraffic.')) {
            const dateStr = key.substring('dailyTraffic.'.length);
            dailyTraffic[dateStr] = (dailyTraffic[dateStr] || 0) + (data[key] || 0);
          }
        });
        setTrafficData({
          totalVisits: data.totalVisits || 0,
          dailyTraffic: dailyTraffic
        });
      }
      setTrafficError(null);
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      if (error.code === 'permission-denied') {
        setTrafficError('permission-denied');
      } else {
        setTrafficError(error.message || 'Unknown error');
      }
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

  // Article Actions
  const onDeletePost = async (id) => {
    try {
      await deleteDoc(doc(db, 'articles', id));
      setArticles((prev) => prev.filter((item) => item.id !== id));
      toast({ title: 'Article deleted successfully.', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: 'Error deleting article.', description: error.message, status: 'error', duration: 3000 });
      throw error;
    }
  };

  const onEditPost = async (id, updatedFields) => {
    try {
      const articleRef = doc(db, 'articles', id);
      await updateDoc(articleRef, {
        title: updatedFields.title,
        description: updatedFields.description,
        imageUrl: updatedFields.imageUrl || '',
      });
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a)));
      toast({ title: 'Article updated successfully.', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: 'Error updating article.', description: error.message, status: 'error', duration: 3000 });
      throw error;
    }
  };

  // Settings Actions
  const onSaveSettings = async (updatedSettings) => {
    setIsSavingSettings(true);
    try {
      await updateDoc(doc(db, 'settings', 'siteConfig'), updatedSettings);
      setSiteSettings(updatedSettings);
      toast({ title: 'Site settings saved successfully!', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: 'Error saving settings.', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Subscriber Actions
  const onDeleteSubscriber = async (id) => {
    try {
      await deleteDoc(doc(db, 'subscribers', id));
      setSubscribers(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Subscriber removed.', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Error deleting subscriber.', description: error.message, status: 'error', duration: 3000 });
    }
  };

  // Message Actions
  const onToggleRead = async (msg) => {
    try {
      await updateDoc(doc(db, 'messages', msg.id), { read: !msg.read });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: !m.read } : m));
    } catch {
      toast({ title: 'Error updating message status.', status: 'error', duration: 2000 });
    }
  };

  const onDeleteMessage = async (id) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
      setMessages(prev => prev.filter(m => m.id !== id));
      toast({ title: 'Message deleted.', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Error deleting message.', description: error.message, status: 'error', duration: 3000 });
    }
  };

  // Project Actions
  const onAddProject = async (newProj) => {
    try {
      const projId = uuidv4();
      const projRef = doc(db, 'projects', projId);
      const payload = {
        id: projId,
        ...newProj,
        date: new Date().toISOString()
      };
      await setDoc(projRef, payload);
      setProjects((prev) => [payload, ...prev]);
      toast({ title: 'Project added successfully!', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: 'Error adding project.', description: error.message, status: 'error', duration: 3000 });
      throw error;
    }
  };

  const onEditProject = async (id, updatedFields) => {
    try {
      const projRef = doc(db, 'projects', id);
      const payload = {
        title: updatedFields.title,
        description: updatedFields.description,
        type: updatedFields.type,
        techStack: updatedFields.techStack,
        githubUrl: updatedFields.githubUrl || '',
        liveUrl: updatedFields.liveUrl || '',
        imageUrl: updatedFields.imageUrl || '',
      };
      await updateDoc(projRef, payload);
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...payload } : p)));
      toast({ title: 'Project updated successfully!', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: 'Error updating project.', description: error.message, status: 'error', duration: 3000 });
      throw error;
    }
  };

  const onDeleteProject = async (id) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast({ title: 'Project deleted successfully.', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: 'Error deleting project.', description: error.message, status: 'error', duration: 3000 });
      throw error;
    }
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
      <Box minH="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" bg="bg" px={6}>
        <Box w="80px" h="80px" borderRadius="full" bg="cardBg" border="1px solid" borderColor="border" display="flex" alignItems="center" justifyContent="center" mb={6}>
          <Text fontSize="2xl">🔒</Text>
        </Box>
        <Heading size="md" mb={2} fontWeight="700" letterSpacing="-0.02em" color="text">Access Denied</Heading>
        <Text fontSize="sm" color="mutedText" maxW="280px" mb={6} textAlign="center" lineHeight="1.6">
          Only the administrator can access the Dashboard Console.
        </Text>
        <Button colorScheme="teal" size="sm" px={8} borderRadius="full" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg" pb={16}>
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} pt={8}>

        {/* Dashboard Console Header */}
        <Box bg="cardBg" borderRadius="xl" border="1px solid" borderColor="border" p={6} mb={8} display="flex" alignItems="center" gap={5} flexWrap="wrap" boxShadow="2xl">
          <Avatar src={siteSettings?.avatarUrl || ''} name={siteSettings?.bioName || 'Admin'} size="lg" bg="teal.500" color="white" />
          <Box flex="1">
            <Heading size="sm" fontWeight="700" letterSpacing="-0.01em" color="text">{siteSettings?.bioName || 'Admin Console'}</Heading>
            <Text fontSize="sm" color="mutedText" mt={0.5}>Developer</Text>
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
          <TabList bg="cardBg" p={1.5} borderRadius="xl" border="1px solid" borderColor="border" gap={1} overflowX="auto" boxShadow="md">
            {['Analytics', 'Articles', 'Site Settings', 'Projects', 'Subscribers', 'Inbox'].map((tabName) => (
              <Tab
                key={tabName}
                fontSize="sm"
                fontWeight="600"
                borderRadius="lg"
                color="mutedText"
                _hover={{ bg: 'hoverBg', color: 'text' }}
                _selected={{ color: 'white', bg: 'teal.500' }}
              >
                {tabName}
              </Tab>
            ))}
          </TabList>

          <TabPanels mt={6}>
            <TabPanel p={0}>
              <AnalyticsTab 
                articles={articles} 
                subscribers={subscribers} 
                messages={messages} 
                trafficData={trafficData} 
                trafficError={trafficError} 
              />
            </TabPanel>

            <TabPanel p={0}>
              <ArticlesTab 
                articles={articles} 
                onDeletePost={onDeletePost} 
                onEditPost={onEditPost} 
              />
            </TabPanel>

            <TabPanel p={0}>
              <SettingsTab 
                siteSettings={siteSettings} 
                onSaveSettings={onSaveSettings} 
                isSavingSettings={isSavingSettings} 
              />
            </TabPanel>

            <TabPanel p={0}>
              <ProjectsTab 
                projects={projects} 
                onAddProject={onAddProject} 
                onDeleteProject={onDeleteProject} 
                onEditProject={onEditProject} 
              />
            </TabPanel>

            <TabPanel p={0}>
              <SubscribersTab 
                subscribers={subscribers} 
                onDeleteSubscriber={onDeleteSubscriber} 
              />
            </TabPanel>

            <TabPanel p={0}>
              <InboxTab 
                messages={messages} 
                onToggleRead={onToggleRead} 
                onDeleteMessage={onDeleteMessage} 
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default Profile;