import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Flex, Heading, Button, Input, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td, Image, Badge, IconButton, HStack,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Select, Textarea, Spinner, Text, useToast, VStack
} from '@chakra-ui/react';
import { FiFolderPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';

const ProjectsTab = ({ projects, onAddProject, onDeleteProject, onEditProject }) => {
  const toast = useToast();
  const cancelRef = useRef();

  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Add project states
  const [isAddProjOpen, setIsAddProjOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    type: 'Web Development',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    imageUrl: ''
  });
  const [isCreatingProj, setIsCreatingProj] = useState(false);
  const [uploadingProjImage, setUploadingProjImage] = useState(false);

  // Edit project states
  const [isProjEditOpen, setIsProjEditOpen] = useState(false);
  const [editedProject, setEditedProject] = useState({});
  const [isProjUpdating, setIsProjUpdating] = useState(false);

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(projectSearchQuery.toLowerCase()) || 
    p.type?.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
    p.techStack?.some(t => t.toLowerCase().includes(projectSearchQuery.toLowerCase()))
  );

  const handleProjImageUpload = async (e, isEdit) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingProjImage(true);
    try {
      const imgBbKey = import.meta.env.VITE_IMGBB_API_KEY;
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgBbKey}`, {
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
    } catch {
      toast({ title: 'Image upload failed.', status: 'error', duration: 3000 });
    } finally {
      setUploadingProjImage(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.description) {
      toast({ title: 'Missing fields', description: 'Title and description are required.', status: 'warning', duration: 2000 });
      return;
    }
    setIsCreatingProj(true);
    try {
      // Parse techStack string to array
      const stackArray = newProject.techStack
        ? newProject.techStack.split(',').map(item => item.trim()).filter(item => item !== '')
        : [];
      
      await onAddProject({
        ...newProject,
        techStack: stackArray
      });

      // Reset form
      setNewProject({
        title: '',
        type: 'Web Development',
        description: '',
        techStack: '',
        githubUrl: '',
        liveUrl: '',
        imageUrl: ''
      });
      setIsAddProjOpen(false);
    } catch {
      // Handled in parent
    } finally {
      setIsCreatingProj(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!editedProject.title || !editedProject.description) {
      toast({ title: 'Missing fields', description: 'Title and description are required.', status: 'warning', duration: 2000 });
      return;
    }
    setIsProjUpdating(true);
    try {
      // Parse techStack if it is a string
      const stackArray = typeof editedProject.techStack === 'string'
        ? editedProject.techStack.split(',').map(item => item.trim()).filter(item => item !== '')
        : editedProject.techStack;

      await onEditProject(editedProject.id, {
        ...editedProject,
        techStack: stackArray
      });
      setIsProjEditOpen(false);
    } catch {
      // Handled in parent
    } finally {
      setIsProjUpdating(false);
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    } catch {
      // Handled in parent
    }
  };

  return (
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
        <Box overflowX="auto">
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
        </Box>
      )}

      {/* Delete Confirmation Project */}
      <AlertDialog isOpen={!!projectToDelete} leastDestructiveRef={cancelRef} onClose={() => setProjectToDelete(null)} isCentered>
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="xl" border="1px solid" borderColor="gray.100">
            <AlertDialogHeader fontSize="md" fontWeight="700" pb={2}>Delete Project</AlertDialogHeader>
            <AlertDialogBody fontSize="sm" color="gray.600">
              Are you sure you want to delete <strong>&quot;{projectToDelete?.title}&quot;</strong>? This cannot be undone.
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

ProjectsTab.propTypes = {
  projects: PropTypes.array.isRequired,
  onAddProject: PropTypes.func.isRequired,
  onDeleteProject: PropTypes.func.isRequired,
  onEditProject: PropTypes.func.isRequired,
};

export default ProjectsTab;
