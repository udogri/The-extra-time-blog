import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  semanticTokens: {
    colors: {
      bg: {
        default: 'gray.50',
        _dark: '#0b0f19',
      },
      cardBg: {
        default: 'white',
        _dark: '#161e2e',
      },
      text: {
        default: 'gray.800',
        _dark: 'white',
      },
      mutedText: {
        default: 'gray.500',
        _dark: 'gray.400',
      },
      border: {
        default: 'gray.200',
        _dark: 'whiteAlpha.100',
      },
      borderMuted: {
        default: 'gray.100',
        _dark: 'whiteAlpha.50',
      },
      inputBg: {
        default: 'white',
        _dark: '#0b0f19',
      },
      footerBg: {
        default: '#0b0f19',
        _dark: '#0b0f19',
      },
      footerAccentBg: {
        default: '#070a12',
        _dark: '#070a12',
      },
      footerText: {
        default: 'white',
        _dark: 'white',
      },
      footerMutedText: {
        default: 'whiteAlpha.600',
        _dark: 'whiteAlpha.600',
      },
      navBg: {
        default: 'rgba(11, 15, 25, 0.92)',
        _dark: 'rgba(11, 15, 25, 0.92)',
      },
      navBgMobile: {
        default: 'rgba(11, 15, 25, 0.97)',
        _dark: 'rgba(11, 15, 25, 0.97)',
      },
      navText: {
        default: 'white',
        _dark: 'white',
      },
      navTextMuted: {
        default: 'whiteAlpha.600',
        _dark: 'whiteAlpha.600',
      },
      navBorder: {
        default: 'whiteAlpha.100',
        _dark: 'whiteAlpha.100',
      },
      commentBg: {
        default: 'gray.50',
        _dark: '#161e2e',
      },
      hoverBg: {
        default: 'blackAlpha.50',
        _dark: 'whiteAlpha.100',
      },
    },
  },
});

export default theme;
