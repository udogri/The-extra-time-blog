import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  VStack,
  InputGroup,
  InputRightElement,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Import Firebase Auth


const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const toast = useToast();
  const navigate = useNavigate();

  

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !confirmPassword)) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      toast({
        title: `Successfully ${isLogin ? 'logged in' : 'signed up'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/');
    } catch (error) {
      toast({
        title: 'Authentication error',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
      px={4}
      w="100vw"
    >
      <Box
        bg="white"
        p={6}
        boxShadow="md"
        borderRadius="md"
        maxWidth="400px"
        w="100%"
      >
        <Heading size="lg" mb={6} textAlign="center">
        <Text>Extra Time Blog</Text>

        </Heading>
        <Heading size="lg" mb={6} textAlign="center">
          {isLogin ? 'Login' : 'Sign Up'}
        </Heading>
        <VStack spacing={4}>
          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement>
                <Button
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {!isLogin && (
            <FormControl id="confirmPassword" isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <InputRightElement>
                  <Button
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          )}

          <Button colorScheme="blue" width="100%" onClick={handleSubmit}>
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </VStack>

        <Text mt={4} textAlign="center">
          {isLogin ? 'New here?' : 'Already have an account?'}{' '}
          <Button
            variant="link"
            colorScheme="blue"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </Button>
        </Text>
      </Box>
    </Box>
  );
};

export default LoginSignup;
