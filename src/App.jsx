import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box, Spinner } from '@chakra-ui/react';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { ADMIN_EMAIL } from './adminConfig';
import ProtectedRoute from './components/ProtectedRoute';

const HomePage = lazy(() => import('./Pages/Home'));
const AddArticle = lazy(() => import('./Pages/AddArticle'));
const About = lazy(() => import('./Pages/About'));
const ArticleDetails = lazy(() => import('./components/ArticleDetails'));
const ContactUs = lazy(() => import('./Pages/ContactUs'));
const LoginSignup = lazy(() => import('./Pages/LoginSignup'));
const Profile = lazy(() => import('./Pages/Profile'));
const Blog = lazy(() => import('./Pages/Blog'));


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState({
    title: "Pixels & Code",
    subtitle: "Frontend Web Developer | Crafting responsive interfaces, graphics design, and stories.",
    description: "A personal space focused on Frontend engineering, UI/UX, graphic design, and lifestyle logs.",
    bioName: "Creative Developer",
    bioText: "I am a frontend developer who loves turning ideas into interactive digital experiences. I specialize in React, UI design, and visual assets, and I write about web dev, design concepts, and lifestyle.",
    avatarUrl: "",
    contactEmail: "hello@creativedev.com",
    socials: {
      twitter: "#",
      linkedin: "#",
      github: "#",
      facebook: "#",
      instagram: "#"
    }
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setIsAdmin(currentUser && currentUser.email === ADMIN_EMAIL);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'siteConfig');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSiteSettings(docSnap.data());
        } else if (auth.currentUser && auth.currentUser.email === ADMIN_EMAIL) {
          // Only attempt to initialize the defaults in Firestore if the logged-in user is the Admin
          try {
            await setDoc(docRef, {
              title: "Pixels & Code",
              subtitle: "Frontend Web Developer | Crafting responsive interfaces, graphics design, and stories.",
              description: "A personal space focused on Frontend engineering, UI/UX, graphic design, and lifestyle logs.",
              bioName: "Creative Developer",
              bioText: "I am a frontend developer who loves turning ideas into interactive digital experiences. I specialize in React, UI design, and visual assets, and I write about web dev, design concepts, and lifestyle.",
              avatarUrl: "",
              contactEmail: "hello@creativedev.com",
              socials: {
                twitter: "#",
                linkedin: "#",
                github: "#",
                facebook: "#",
                instagram: "#"
              }
            });
          } catch (writeError) {
            console.error("Error initializing siteConfig document:", writeError);
          }
        }
      } catch (error) {
        console.warn("Could not read site settings from Firestore (check rules). Using local defaults. Error:", error);
      }
    };
    fetchSettings();
  }, [user]);

  // Track unique session visits for traffic analytics
  useEffect(() => {
    const trackVisit = async () => {
      if (sessionStorage.getItem('site_session_tracked')) return;
      
      const today = new Date().toISOString().split('T')[0];
      const trafficRef = doc(db, 'analytics', 'traffic');
      try {
        await setDoc(trafficRef, {
          totalVisits: increment(1),
          [`dailyTraffic.${today}`]: increment(1)
        }, { merge: true });
        
        sessionStorage.setItem('site_session_tracked', 'true');
      } catch (error) {
        console.warn("Analytics tracking skipped (permissions or initialization):", error);
      }
    };

    // A short 1-second delay lets Firebase Auth resolve the user session
    // so that if the logged-in admin is visiting, the request carries their credentials.
    const timeoutId = setTimeout(trackVisit, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <ChakraProvider toastOptions={{ defaultOptions: { position: 'top', isClosable: true } }}>
      <Router>
        <ScrollToTop />
        <Suspense fallback={
          <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" bg="gray.50">
            <Spinner size="lg" color="teal.500" thickness="3px" />
          </Box>
        }>
          <Routes>
            <Route element={<Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} siteSettings={siteSettings} setSiteSettings={setSiteSettings} user={user} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/about" element={<About />} />
              <Route path="/articledetails/:articleId" element={<ArticleDetails />} />
              <Route path="/blog" element={<Blog />} />
              
              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={authLoading} />}>
                <Route path="/add-article" element={<AddArticle />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
            <Route path="/login" element={<LoginSignup />} />
          </Routes>
        </Suspense>
      </Router>
    </ChakraProvider>
  );
};

export default App;
