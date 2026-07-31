import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Heading, SimpleGrid, VStack, FormControl, FormLabel, Input, Textarea, Avatar, Button, Divider, Text, useToast
} from '@chakra-ui/react';
import { FiSave } from 'react-icons/fi';

const SettingsTab = ({ siteSettings, onSaveSettings, isSavingSettings }) => {
  const toast = useToast();
  const [localSettings, setLocalSettings] = useState(siteSettings);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    setLocalSettings(siteSettings);
  }, [siteSettings]);

  const handleSettingChange = (field, value) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialSettingChange = (platform, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      socials: {
        ...prev.socials,
        [platform]: value
      }
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setIsUploadingAvatar(true);
    try {
      const imgBbKey = import.meta.env.VITE_IMGBB_API_KEY;
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgBbKey}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setLocalSettings((prev) => ({ ...prev, avatarUrl: data.data.url }));
        toast({ title: 'Avatar uploaded.', status: 'success', duration: 2000 });
      } else {
        throw new Error('Upload failed');
      }
    } catch {
      toast({ title: 'Avatar upload failed.', status: 'error', duration: 3000 });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
  };

  return (
    <Box bg="cardBg" p={6} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="2xl">
      <Heading size="md" mb={6} color="text" fontWeight="700">Site Settings</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        {/* Left Column: Branding details */}
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase">Blog Title</FormLabel>
            <Input 
              value={localSettings?.title || ''} 
              onChange={(e) => handleSettingChange('title', e.target.value)}
              size="sm" borderRadius="lg" focusBorderColor="teal.400"
              bg="inputBg" color="text" borderColor="border" _hover={{ borderColor: 'mutedText' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase">Subtitle / Tagline</FormLabel>
            <Input 
              value={localSettings?.subtitle || ''} 
              onChange={(e) => handleSettingChange('subtitle', e.target.value)}
              size="sm" borderRadius="lg" focusBorderColor="teal.400"
              bg="inputBg" color="text" borderColor="border" _hover={{ borderColor: 'mutedText' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase">Description</FormLabel>
            <Textarea 
              value={localSettings?.description || ''} 
              onChange={(e) => handleSettingChange('description', e.target.value)}
              size="sm" borderRadius="lg" focusBorderColor="teal.400" rows={3} resize="none"
              bg="inputBg" color="text" borderColor="border" _hover={{ borderColor: 'mutedText' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase">Contact Email</FormLabel>
            <Input 
              type="email"
              value={localSettings?.contactEmail || ''} 
              onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
              size="sm" borderRadius="lg" focusBorderColor="teal.400"
              bg="inputBg" color="text" borderColor="border" _hover={{ borderColor: 'mutedText' }}
            />
          </FormControl>
        </VStack>

        {/* Right Column: Author Biography & Social Links */}
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase">Author Name</FormLabel>
            <Input 
              value={localSettings?.bioName || ''} 
              onChange={(e) => handleSettingChange('bioName', e.target.value)}
              size="sm" borderRadius="lg" focusBorderColor="teal.400"
              bg="inputBg" color="text" borderColor="border" _hover={{ borderColor: 'mutedText' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase">Author Biography</FormLabel>
            <Textarea 
              value={localSettings?.bioText || ''} 
              onChange={(e) => handleSettingChange('bioText', e.target.value)}
              size="sm" borderRadius="lg" focusBorderColor="teal.400" rows={4} resize="none"
              bg="inputBg" color="text" borderColor="border" _hover={{ borderColor: 'mutedText' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="mutedText" textTransform="uppercase">Avatar Image</FormLabel>
            <Box display="flex" gap={4} alignItems="center">
              <Avatar src={localSettings?.avatarUrl || ''} size="md" name={localSettings?.bioName || 'Admin'} />
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
                <Text fontSize="10px" color="mutedText" mt={1}>Max file size: 5MB</Text>
              </Box>
            </Box>
          </FormControl>
        </VStack>
      </SimpleGrid>

      <Divider mb={6} borderColor="border" />

      {/* Social media URLs section */}
      <Heading size="xs" mb={4} color="text" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">Social Links</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
        <FormControl>
          <FormLabel fontSize="xs" color="mutedText">Twitter URL</FormLabel>
          <Input 
            placeholder="https://twitter.com/..."
            value={localSettings?.socials?.twitter || ''} 
            onChange={(e) => handleSocialSettingChange('twitter', e.target.value)}
            size="sm" borderRadius="lg" focusBorderColor="teal.400"
            bg="inputBg" color="text" borderColor="border" _hover={{ borderColor: 'mutedText' }}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="xs" color="mutedText">LinkedIn URL</FormLabel>
          <Input 
            placeholder="https://linkedin.com/in/..."
            value={localSettings?.socials?.linkedin || ''} 
            onChange={(e) => handleSocialSettingChange('linkedin', e.target.value)}
            size="sm" borderRadius="lg" focusBorderColor="teal.400"
            bg="inputBg" color="text" borderColor="border" _hover={{ borderColor: 'mutedText' }}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="xs" color="mutedText">GitHub URL</FormLabel>
          <Input 
            placeholder="https://github.com/..."
            value={localSettings?.socials?.github || ''} 
            onChange={(e) => handleSocialSettingChange('github', e.target.value)}
            size="sm" borderRadius="lg" focusBorderColor="teal.400"
            bg="inputBg" color="text" borderColor="border" _hover={{ borderColor: 'mutedText' }}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="xs" color="mutedText">Facebook URL</FormLabel>
          <Input 
            placeholder="https://facebook.com/..."
            value={localSettings?.socials?.facebook || ''} 
            onChange={(e) => handleSocialSettingChange('facebook', e.target.value)}
            size="sm" borderRadius="lg" focusBorderColor="teal.400"
            bg="inputBg" color="text" borderColor="border" _hover={{ borderColor: 'mutedText' }}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="xs" color="mutedText">Instagram URL</FormLabel>
          <Input 
            placeholder="https://instagram.com/..."
            value={localSettings?.socials?.instagram || ''} 
            onChange={(e) => handleSocialSettingChange('instagram', e.target.value)}
            size="sm" borderRadius="lg" focusBorderColor="teal.400"
            bg="inputBg" color="text" borderColor="border" _hover={{ borderColor: 'mutedText' }}
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
        onClick={handleSave}
      >
        Save Settings
      </Button>
    </Box>
  );
};

SettingsTab.propTypes = {
  siteSettings: PropTypes.object.isRequired,
  onSaveSettings: PropTypes.func.isRequired,
  isSavingSettings: PropTypes.bool.isRequired,
};

export default SettingsTab;
