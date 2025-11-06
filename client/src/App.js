import React from 'react';
import { BrowserRouter, Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  useTheme as useMUITheme,
  alpha,
  Slide,
  Fade,
} from '@mui/material';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import FacebookUnavailablePage from './pages/FacebookUnavailablePage';
import ProtectedRoute from './components/ProtectedRoute';
import NeonGrid from './components/NeonGrid';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(10, 10, 26, 0.8) 100%)'
    : 'linear-gradient(135deg, rgba(10, 10, 26, 0.6) 0%, rgba(26, 26, 42, 0.8) 100%)',
  backdropFilter: 'blur(30px) saturate(200%)',
  WebkitBackdropFilter: 'blur(30px) saturate(200%)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 255, 255, 0.1)'
    : '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 102, 204, 0.1)',
  borderBottom: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.2)'
    : '2px solid rgba(0, 102, 204, 0.2)',
}));

const LogoLink = styled(RouterLink)(({ theme }) => ({
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)'
    : 'inherit',
  '&:hover': {
    opacity: 0.8,
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '8px 20px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    background: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.2)
      : alpha(theme.palette.primary.main, 0.1),
  },
}));

const ThemeToggle = styled(IconButton)(({ theme }) => ({
  borderRadius: '12px',
  padding: '10px',
  transition: 'all 0.3s ease',
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.main, 0.1)
    : alpha(theme.palette.primary.main, 0.05),
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.2)
      : alpha(theme.palette.primary.main, 0.15),
    transform: 'rotate(180deg)',
  },
}));

const Navbar = () => {
  const { accessToken } = useAuth();
  const { toggleTheme, mode } = useTheme();
  const theme = useMUITheme();
  const location = useLocation();

  // Show minimal navbar on login page with just theme toggle
  const isLoginPage = (location.pathname === '/' || location.pathname === '/facebook-unavailable') && !accessToken;

  return (
    <Slide direction="down" in timeout={600}>
      <StyledAppBar position="sticky" elevation={0}>
        <Toolbar sx={{ py: 1 }}>
          {!isLoginPage && (
            <LogoLink to={accessToken ? '/profile' : '/'}>
              <DashboardIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #00ffff 0%, #ff0080 100%)'
                    : 'linear-gradient(135deg, #0066cc 0%, #cc0066 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: theme.palette.mode === 'dark'
                    ? 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.8))'
                    : 'drop-shadow(0 0 8px rgba(0, 102, 204, 0.6))',
                }}
              >
                PLEXUS
              </Typography>
            </LogoLink>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {!isLoginPage && (
            <>
              {accessToken ? (
                <Fade in timeout={400}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NavButton
                      color="inherit"
                      component={RouterLink}
                      to="/profile"
                      startIcon={<DashboardIcon />}
                    >
                      Profile
                    </NavButton>
                  </Box>
                </Fade>
              ) : (
                <NavButton color="inherit" component={RouterLink} to="/">
                  Login
                </NavButton>
              )}
            </>
          )}

          <ThemeToggle onClick={toggleTheme} sx={{ ml: isLoginPage ? 0 : 1 }}>
            {mode === 'dark' ? (
              <LightModeIcon sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a2a' }} />
            ) : (
              <DarkModeIcon sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a2a' }} />
            )}
          </ThemeToggle>
        </Toolbar>
      </StyledAppBar>
    </Slide>
  );
};

function App() {

  return (
    <BrowserRouter>
      <Box
        sx={{
          minHeight: '100vh',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? '#0a0a1a'
              : '#f5f7fa',
          position: 'relative',
        }}
      >
        <NeonGrid />
        <Navbar />
        <Container
          component="main"
          maxWidth={false}
          sx={{
            minHeight: 'calc(100vh - 64px)',
            pt: { xs: 2, sm: 3 },
            pb: 4,
          }}
        >
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/facebook-unavailable" element={<FacebookUnavailablePage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  );
}

export default App;
