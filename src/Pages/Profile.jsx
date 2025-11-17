import { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Spinner,
  Image,
  Badge,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
} from "@chakra-ui/react";
import { HiDotsVertical } from "react-icons/hi";
import { MdCreate } from "react-icons/md";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Questions from "../assets/Questions-amico.svg";

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
      const q = query(collection(db, "articles"), where("userId", "==", uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setArticles(data);
    } catch (error) {
      console.error("Error loading profile articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (post) => setPostToDelete(post);
  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "articles", postToDelete.id));
      setArticles((prev) => prev.filter((item) => item.id !== postToDelete.id));
    } catch (error) {
      console.error("Error deleting article:", error);
    } finally {
      setPostToDelete(null);
    }
  };

  const openEditModal = (article) => {
    setEditedArticle(article);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const articleRef = doc(db, "articles", editedArticle.id);
      await updateDoc(articleRef, {
        title: editedArticle.title,
        description: editedArticle.description,
        imageUrl: editedArticle.imageUrl || "",
      });

      setArticles((prev) =>
        prev.map((a) => (a.id === editedArticle.id ? editedArticle : a))
      );

      setIsEditOpen(false);
    } catch (error) {
      console.error("Error updating article:", error);
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

  if (loading)
    return (
      <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );

    if (!user)
      return (
        <Box
          minH="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          px={6}
        >
          <Image
            src={Questions}
            alt="Sign in illustration"
            maxW="300px"
            mb={6}
            opacity={0.9}
          />
    
          <Heading size="lg" mb={2}>
            You’re not signed in
          </Heading>
    
          <Text fontSize="md" color="gray.600" maxW="320px" mb={5}>
            Sign in to access your profile, manage your articles, and continue your journey.
          </Text>
    
          <Button
            colorScheme="teal"
            size="md"
            px={8}
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </Box>
      );
    

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      {/* User Info + Add Article Button */}
      <VStack spacing={3} mb={6} textAlign="center">
        <Heading size="lg">My Profile</Heading>
        <Text fontSize="md" color="gray.600">
          Email: <strong>{user.email}</strong>
        </Text>
        <Badge colorScheme="teal">{articles.length} Articles Posted</Badge>

        <Button
          mt={2}
          colorScheme="teal"
          leftIcon={<MdCreate />}
          onClick={() => navigate("/add-article")}
        >
          Add New Article
        </Button>
      </VStack>

      {/* Articles Grid */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
  {articles.length === 0 ? (
    <Text textAlign="center" fontSize="lg" gridColumn="1 / -1">
      You haven't posted any articles yet.
    </Text>
  ) : (
    articles.map((article) => (
      <Box
        key={article.id}
        p={4}
        border="1px solid"
        borderColor="gray.300"
        rounded="md"
        bg="white"
        position="relative"
      >
        {/* Menu */}
        <Menu>
  <MenuButton
    as={Box} // Use Box so no default button styles
    position="absolute"
    top="25px"
    right="20px"
    cursor="pointer"
    _hover={{ color: "gray.400" }} // slight color change on hover
  >
    <HiDotsVertical color="white" size={20} />
  </MenuButton>
  <MenuList>
    <MenuItem onClick={() => openEditModal(article)}>Edit Article</MenuItem>
    <MenuItem onClick={() => openDeleteModal(article)} color="red">
      Delete Article
    </MenuItem>
  </MenuList>
</Menu>


        <Image
          src={article.imageUrl || "https://picsum.photos/400"}
          alt={article.title}
          borderRadius="md"
          mb={4}
          objectFit="cover"
          w="100%"
          maxH="250px"
        />

        <Heading size="md" noOfLines={2}>
          {article.title}
        </Heading>

        <Text fontSize="sm" color="gray.600" noOfLines={2} mt={2}>
          {article.description || article.content}
        </Text>

        <HStack justifyContent="space-between" mt={3}>
          <Text fontSize="sm" color="red.700">
            {article.author} • {new Date(article.date).toLocaleDateString()}
          </Text>

          {/* Read Article Button */}
          <Button size="sm" colorScheme="teal" onClick={() => navigate(`/articledetails/${article.id}`)}>
            Read Article
          </Button>
        </HStack>
      </Box>
    ))
  )}
</SimpleGrid>


      {/* Delete Confirmation Modal */}
      <AlertDialog isOpen={!!postToDelete} leastDestructiveRef={cancelRef} onClose={() => setPostToDelete(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Article
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "<strong>{postToDelete?.title}</strong>"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setPostToDelete(null)}>
                Cancel
              </Button>
              <Button colorScheme="red" ml={3} onClick={confirmDelete}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Article Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Article</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={editedArticle.title || ""}
                  onChange={(e) => setEditedArticle({ ...editedArticle, title: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={editedArticle.description || ""}
                  onChange={(e) => setEditedArticle({ ...editedArticle, description: e.target.value })}
                />
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
                  _hover={{ bg: "gray.100" }}
                  onClick={() => document.getElementById("fileInput").click()}
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
            <Button onClick={() => setIsEditOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUpdate} isLoading={isUpdating}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;
