import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './theme';

createRoot(document.getElementById('root')).render(
  <ChakraProvider theme={theme}>
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </StrictMode>
  </ChakraProvider>
)
