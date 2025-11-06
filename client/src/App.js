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
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
    : '0 4px 20px rgba(0, 0, 0, 0.05)',
  borderBottom: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(0, 0, 0, 0.05)',
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

  // Don't show navbar on login page or Facebook unavailable page
  if ((location.pathname === '/' || location.pathname === '/facebook-unavailable') && !accessToken) {
    return null;
  }

  return (
    <Slide direction="down" in timeout={600}>
      <StyledAppBar position="sticky" elevation={0}>
        <Toolbar sx={{ py: 1 }}>
          <LogoLink to={accessToken ? '/profile' : '/'}>
            <DashboardIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)'
                  : 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Plexus
            </Typography>
          </LogoLink>

          <Box sx={{ flexGrow: 1 }} />

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

          <ThemeToggle onClick={toggleTheme} sx={{ ml: 1 }}>
            {mode === 'dark' ? (
              <LightModeIcon sx={{ color: 'text.primary' }} />
            ) : (
              <DarkModeIcon sx={{ color: 'text.primary' }} />
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
              ? 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.1) 0%, transparent 50%), #0f172a'
              : 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.05) 0%, transparent 50%), #f8fafc',
        }}
      >
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
