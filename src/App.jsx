import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Layout from './components/Layout';
import HomePage from './Pages/Home';
import AddArticle from './Pages/AddArticle';
import About from './Pages/About';
import ArticleDetails from './components/ArticleDetails';
import ContactUs from './Pages/ContactUs';
import LoginSignup from './Pages/LoginSignup';
import ScrollToTop from './components/ScrollToTop';
import Profile from './Pages/Profile';
import Blog from './Pages/Blog';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { ADMIN_EMAIL } from './adminConfig';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
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
      sessionStorage.setItem('site_session_tracked', 'true');
      
      const today = new Date().toISOString().split('T')[0]; // "2026-07-11"
      const trafficRef = doc(db, 'analytics', 'traffic');
      try {
        const snap = await getDoc(trafficRef);
        if (snap.exists()) {
          const data = snap.data();
          const currentDaily = data.dailyTraffic || {};
          const todayCount = (currentDaily[today] || 0) + 1;
          
          await updateDoc(trafficRef, {
            totalVisits: increment(1),
            [`dailyTraffic.${today}`]: todayCount
          });
        } else {
          await setDoc(trafficRef, {
            totalVisits: 1,
            dailyTraffic: {
              [today]: 1
            }
          });
        }
      } catch (error) {
        console.warn("Analytics tracking skipped (permissions or initialization):", error);
      }
    };
    trackVisit();
  }, []);

  return (
    <ChakraProvider toastOptions={{ defaultOptions: { position: 'top', isClosable: true } }}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} siteSettings={siteSettings} setSiteSettings={setSiteSettings} user={user} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/add-article" element={<AddArticle />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<About />} />
            <Route path="/articledetails/:articleId" element={<ArticleDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/blog" element={<Blog />} />
          </Route>
          <Route path="/login" element={<LoginSignup />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
};

export default App;
