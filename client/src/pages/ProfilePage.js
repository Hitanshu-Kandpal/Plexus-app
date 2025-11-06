import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useTheme } from '../context/ThemeContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  useTheme as useMUITheme,
  alpha,
  Fade,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import ShieldIcon from '@mui/icons-material/Shield';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import MovieIcon from '@mui/icons-material/Movie';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const neonGlow = keyframes`
  0%, 100% {
    box-shadow: 
      0 0 10px rgba(0, 255, 255, 0.5),
      0 0 20px rgba(0, 255, 255, 0.3),
      inset 0 0 10px rgba(0, 255, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 0 20px rgba(0, 255, 255, 0.8),
      0 0 40px rgba(255, 0, 128, 0.5),
      inset 0 0 20px rgba(0, 255, 255, 0.2);
  }
`;

const neonGlowLight = keyframes`
  0%, 100% {
    box-shadow: 
      0 0 10px rgba(0, 170, 255, 0.3),
      0 0 20px rgba(0, 170, 255, 0.2),
      inset 0 0 10px rgba(0, 170, 255, 0.05);
  }
  50% {
    box-shadow: 
      0 0 20px rgba(0, 170, 255, 0.5),
      0 0 40px rgba(204, 0, 102, 0.3),
      inset 0 0 20px rgba(0, 170, 255, 0.1);
  }
`;

const StatCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  padding: '24px',
  borderRadius: '16px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(26, 26, 42, 0.9) 0%, rgba(10, 10, 26, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.98) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.5)'
    : '2px solid rgba(0, 170, 255, 0.4)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: theme.palette.mode === 'dark'
    ? `${neonGlow} 3s ease-in-out infinite`
    : `${neonGlowLight} 3s ease-in-out infinite`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 60px rgba(0, 255, 255, 0.5), 0 0 0 2px rgba(0, 255, 255, 0.3)'
      : '0 20px 60px rgba(0, 170, 255, 0.3), 0 0 0 2px rgba(0, 170, 255, 0.2)',
  },
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  borderRadius: '16px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(26, 26, 42, 0.9) 0%, rgba(10, 10, 26, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.98) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.5)'
    : '2px solid rgba(0, 170, 255, 0.4)',
  overflow: 'hidden',
  animation: theme.palette.mode === 'dark'
    ? `${neonGlow} 3s ease-in-out infinite`
    : `${neonGlowLight} 3s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), rgba(255, 0, 128, 0.8), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(0, 170, 255, 0.6), rgba(204, 0, 102, 0.6), transparent)',
  },
}));

const avatarPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.9), 0 0 60px rgba(255, 0, 128, 0.6);
  }
`;

const GradientAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  background: 'linear-gradient(135deg, #00ffff 0%, #ff0080 100%)',
  fontSize: '48px',
  fontWeight: 700,
  fontFamily: "'Courier New', monospace",
  color: '#ffffff',
  animation: `${avatarPulse} 2s ease-in-out infinite`,
  border: '4px solid rgba(0, 255, 255, 0.6)',
  boxShadow: '0 8px 32px rgba(0, 255, 255, 0.6), inset 0 0 20px rgba(0, 255, 255, 0.2)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: '14px 28px',
  borderRadius: '8px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  fontFamily: "'Courier New', monospace",
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, rgba(0, 255, 255, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(0, 170, 255, 0.2) 0%, rgba(0, 170, 255, 0.15) 100%)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.6)'
    : '2px solid rgba(0, 170, 255, 0.5)',
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#0066cc',
  '&:hover': {
    transform: 'translateY(-4px)',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(0, 255, 255, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(0, 170, 255, 0.35) 0%, rgba(0, 170, 255, 0.25) 100%)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 10px 30px rgba(0, 255, 255, 0.6), 0 0 0 3px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.4)'
      : '0 10px 30px rgba(0, 170, 255, 0.4), 0 0 0 3px rgba(0, 170, 255, 0.2), 0 0 40px rgba(0, 170, 255, 0.3)',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 255, 255, 0.9)' : 'rgba(0, 170, 255, 0.7)',
  },
}));

const ProfilePage = () => {
  const { user, setUser, setCsrfToken, csrfToken, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlinkDialog, setUnlinkDialog] = useState({ open: false, provider: null });
  const [unlinking, setUnlinking] = useState(false);
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const theme = useMUITheme();
  const { mode } = useTheme();

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const res = await axiosPrivate.get('/api/user/me');
        if (isMounted) {
          setUser(res.data);
          setCsrfToken(res.data.csrfToken);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
        logout();
        navigate('/');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!user) {
      fetchUserData();
    } else {
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, [user, setUser, setCsrfToken, logout, navigate, axiosPrivate]);

  const handleLogout = async () => {
    try {
      await axiosPrivate.post('/auth/logout',
        {},
        { headers: { 'CSRF-Token': csrfToken } }
      );
      logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to log out.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUnlinkProvider = async () => {
    if (!unlinkDialog.provider) return;

    try {
      setUnlinking(true);
      const res = await axiosPrivate.post(
        '/api/user/unlink-provider',
        { provider: unlinkDialog.provider },
        { headers: { 'CSRF-Token': csrfToken } }
      );

      // Refresh user data
      const userRes = await axiosPrivate.get('/api/user/me');
      setUser(userRes.data);
      setCsrfToken(userRes.data.csrfToken);

      setUnlinkDialog({ open: false, provider: null });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to unlink provider.');
    } finally {
      setUnlinking(false);
    }
  };

  const hasGoogle = user?.providers?.googleId;
  const hasFacebook = user?.providers?.facebookId;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress
            size={60}
            sx={{
              color: theme.palette.primary.main,
              mb: 2,
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Loading your profile...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{
          maxWidth: 600,
          margin: 'auto',
          mt: 4,
          borderRadius: 3,
        }}
      >
        Error: {error}
      </Alert>
    );
  }

  if (user) {
    return (
      <Fade in timeout={600}>
        <Box sx={{ maxWidth: 1200, margin: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>
          <Grid container spacing={3}>
            {/* Main Profile Card */}
            <Grid item xs={12} md={8}>
              <ProfileCard className="fade-in">
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'center', sm: 'flex-start' },
                      gap: 3,
                      mb: 4,
                    }}
                  >
                    <GradientAvatar>
                      {getInitials(user.name)}
                    </GradientAvatar>
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          fontSize: { xs: '24px', sm: '32px' },
                          color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                          textShadow: mode === 'dark'
                            ? '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)'
                            : '0 0 15px rgba(0, 170, 255, 0.6), 0 0 30px rgba(0, 170, 255, 0.3)',
                          fontFamily: "'Courier New', monospace",
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {user.name}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <EmailIcon sx={{ fontSize: 18, color: mode === 'dark' ? '#00ffff' : '#0066cc' }} />
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                            fontFamily: "'Courier New', monospace",
                            fontWeight: 500,
                          }}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<ShieldIcon sx={{ color: mode === 'dark' ? '#00ffff' : '#0066cc' }} />}
                        label={user.role.toUpperCase()}
                        sx={{
                          fontWeight: 700,
                          px: 1.5,
                          py: 0.5,
                          fontSize: '12px',
                          fontFamily: "'Courier New', monospace",
                          letterSpacing: '0.1em',
                          background: user.role === 'admin'
                            ? mode === 'dark'
                              ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 128, 0.3))'
                              : 'linear-gradient(135deg, rgba(0, 170, 255, 0.25), rgba(204, 0, 102, 0.25))'
                            : mode === 'dark'
                              ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.1))'
                              : 'linear-gradient(135deg, rgba(0, 170, 255, 0.15), rgba(0, 170, 255, 0.1))',
                          color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                          border: mode === 'dark' ? '1px solid rgba(0, 255, 255, 0.5)' : '1px solid rgba(0, 170, 255, 0.4)',
                          textShadow: mode === 'dark' ? '0 0 10px rgba(0, 255, 255, 0.8)' : 'none',
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 170, 255, 0.2)' }} />

                  {/* Linked Providers Section */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        fontSize: '18px',
                        color: mode === 'dark' ? '#00ffff' : '#0066cc',
                        textShadow: mode === 'dark' ? '0 0 15px rgba(0, 255, 255, 0.8)' : 'none',
                        fontFamily: "'Courier New', monospace",
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                      }}
                    >
                      LINKED ACCOUNTS
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          borderRadius: 2,
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(26, 26, 42, 0.8) 0%, rgba(10, 10, 26, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.95) 100%)',
                          border: mode === 'dark' ? '2px solid rgba(0, 255, 255, 0.4)' : '2px solid rgba(0, 170, 255, 0.3)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <GoogleIcon sx={{ fontSize: 28, color: '#4285f4' }} />
                          <Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 700,
                                color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                                fontFamily: "'Courier New', monospace",
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                              }}
                            >
                              Google
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{
                                color: hasGoogle 
                                  ? (mode === 'dark' ? '#00ffff' : '#0066cc')
                                  : (mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(26, 26, 42, 0.6)'),
                                fontFamily: "'Courier New', monospace",
                                fontWeight: 600,
                              }}
                            >
                              {hasGoogle ? 'Connected' : 'Not connected'}
                            </Typography>
                          </Box>
                        </Box>
                        {hasGoogle && (
                          <IconButton
                            size="small"
                            onClick={() => setUnlinkDialog({ open: true, provider: 'google' })}
                            disabled={!hasFacebook} // Can't unlink if it's the only provider
                            sx={{
                              color: 'error.main',
                              '&:disabled': {
                                opacity: 0.5,
                              },
                            }}
                          >
                            <LinkOffIcon />
                          </IconButton>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          borderRadius: 2,
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(26, 26, 42, 0.8) 0%, rgba(10, 10, 26, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.95) 100%)',
                          border: mode === 'dark' ? '2px solid rgba(255, 0, 128, 0.4)' : '2px solid rgba(204, 0, 102, 0.3)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FacebookIcon sx={{ fontSize: 28, color: '#1877f2' }} />
                          <Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 700,
                                color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                                fontFamily: "'Courier New', monospace",
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                              }}
                            >
                              Facebook
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{
                                color: hasFacebook 
                                  ? (mode === 'dark' ? '#ff0080' : '#cc0066')
                                  : (mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(26, 26, 42, 0.6)'),
                                fontFamily: "'Courier New', monospace",
                                fontWeight: 600,
                              }}
                            >
                              {hasFacebook ? 'Connected' : 'Not connected'}
                            </Typography>
                          </Box>
                        </Box>
                        {hasFacebook && (
                          <IconButton
                            size="small"
                            onClick={() => setUnlinkDialog({ open: true, provider: 'facebook' })}
                            disabled={!hasGoogle} // Can't unlink if it's the only provider
                            sx={{
                              color: 'error.main',
                              '&:disabled': {
                                opacity: 0.5,
                              },
                            }}
                          >
                            <LinkOffIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 170, 255, 0.2)' }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {user.role === 'admin' && (
                      <ActionButton
                        variant="contained"
                        startIcon={<AdminPanelSettingsIcon />}
                        component={RouterLink}
                        to="/admin"
                        sx={{
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(255, 0, 128, 0.2) 100%)'
                            : 'linear-gradient(135deg, rgba(0, 170, 255, 0.3) 0%, rgba(204, 0, 102, 0.2) 100%)',
                          borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.6)' : 'rgba(0, 170, 255, 0.5)',
                          color: mode === 'dark' ? '#ffffff' : '#0066cc',
                        }}
                      >
                        ADMIN DASHBOARD
                      </ActionButton>
                    )}

                    <ActionButton
                      variant="outlined"
                      startIcon={<LogoutIcon />}
                      onClick={handleLogout}
                      sx={{
                        background: mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(255, 0, 0, 0.2) 0%, rgba(255, 0, 0, 0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)',
                        borderColor: mode === 'dark' ? 'rgba(255, 0, 0, 0.6)' : 'rgba(220, 38, 38, 0.5)',
                        color: mode === 'dark' ? '#ffffff' : '#dc2626',
                        '&:hover': {
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(255, 0, 0, 0.4) 0%, rgba(255, 0, 0, 0.3) 100%)'
                            : 'linear-gradient(135deg, rgba(220, 38, 38, 0.35) 0%, rgba(220, 38, 38, 0.25) 100%)',
                          boxShadow: mode === 'dark'
                            ? '0 10px 30px rgba(255, 0, 0, 0.6), 0 0 0 3px rgba(255, 0, 0, 0.3), 0 0 40px rgba(255, 0, 0, 0.4)'
                            : '0 10px 30px rgba(220, 38, 38, 0.4), 0 0 0 3px rgba(220, 38, 38, 0.2), 0 0 40px rgba(220, 38, 38, 0.3)',
                          borderColor: mode === 'dark' ? 'rgba(255, 0, 0, 0.9)' : 'rgba(220, 38, 38, 0.7)',
                        },
                      }}
                    >
                      SIGN OUT
                    </ActionButton>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 170, 255, 0.2)' }} />

                  {/* Secret App Section */}
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 128, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(0, 170, 255, 0.08) 0%, rgba(204, 0, 102, 0.08) 100%)',
                      border: mode === 'dark' ? '2px solid rgba(0, 255, 255, 0.4)' : '2px solid rgba(0, 170, 255, 0.3)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <AutoAwesomeIcon sx={{ fontSize: 32, color: mode === 'dark' ? '#00ffff' : '#0066cc' }} />
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: mode === 'dark' ? '#00ffff' : '#0066cc',
                          fontFamily: "'Courier New', monospace",
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          textShadow: mode === 'dark' ? '0 0 15px rgba(0, 255, 255, 0.8)' : 'none',
                        }}
                      >
                        Your Secret App
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : '#1a1a2a',
                        mb: 3,
                        lineHeight: 1.8,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      Discover personalized recommendations powered by AI. Search for movies, music, and books to get curated suggestions tailored just for you. Our intelligent system learns your preferences and delivers insights that match your taste.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MovieIcon sx={{ fontSize: 20, color: mode === 'dark' ? '#00ffff' : '#0066cc' }} />
                        <Typography variant="body2" sx={{ fontFamily: "'Courier New', monospace", color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#1a1a2a' }}>
                          Movies
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MusicNoteIcon sx={{ fontSize: 20, color: mode === 'dark' ? '#ff0080' : '#cc0066' }} />
                        <Typography variant="body2" sx={{ fontFamily: "'Courier New', monospace", color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#1a1a2a' }}>
                          Music
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MenuBookIcon sx={{ fontSize: 20, color: mode === 'dark' ? '#00ffff' : '#0066cc' }} />
                        <Typography variant="body2" sx={{ fontFamily: "'Courier New', monospace", color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#1a1a2a' }}>
                          Books
                        </Typography>
                      </Box>
                    </Box>
                    <ActionButton
                      variant="contained"
                      fullWidth
                      startIcon={<RocketLaunchIcon />}
                      component={RouterLink}
                      to="/recommendations"
                      sx={{
                        py: 2,
                        fontSize: '16px',
                        background: mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(255, 0, 128, 0.3) 100%)'
                          : 'linear-gradient(135deg, rgba(0, 170, 255, 0.3) 0%, rgba(204, 0, 102, 0.3) 100%)',
                        borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.8)' : 'rgba(0, 170, 255, 0.7)',
                        color: mode === 'dark' ? '#ffffff' : '#ffffff',
                        '&:hover': {
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.5) 0%, rgba(255, 0, 128, 0.5) 100%)'
                            : 'linear-gradient(135deg, rgba(0, 170, 255, 0.5) 0%, rgba(204, 0, 102, 0.5) 100%)',
                          transform: 'translateY(-4px) scale(1.02)',
                          boxShadow: mode === 'dark'
                            ? '0 15px 40px rgba(0, 255, 255, 0.6), 0 0 0 3px rgba(0, 255, 255, 0.4), 0 0 60px rgba(255, 0, 128, 0.5)'
                            : '0 15px 40px rgba(0, 170, 255, 0.5), 0 0 0 3px rgba(0, 170, 255, 0.3), 0 0 60px rgba(204, 0, 102, 0.4)',
                        },
                      }}
                    >
                      OPEN YOUR SECRET APP
                    </ActionButton>
                  </Box>
                </CardContent>
              </ProfileCard>
            </Grid>

            {/* Stats Cards */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <StatCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '12px',
                        background: mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.1))'
                          : 'linear-gradient(135deg, rgba(0, 170, 255, 0.15), rgba(0, 170, 255, 0.1))',
                        border: mode === 'dark' ? '2px solid rgba(0, 255, 255, 0.4)' : '2px solid rgba(0, 170, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 28, color: mode === 'dark' ? '#00ffff' : '#0066cc' }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700,
                          color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                          fontFamily: "'Courier New', monospace",
                          textTransform: 'uppercase',
                        }}
                      >
                        Active
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: mode === 'dark' ? '#00ffff' : '#0066cc',
                          fontFamily: "'Courier New', monospace",
                          fontWeight: 600,
                        }}
                      >
                        Account Status
                      </Typography>
                    </Box>
                  </Box>
                </StatCard>

                <StatCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '12px',
                        background: mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(255, 0, 128, 0.2), rgba(255, 0, 128, 0.1))'
                          : 'linear-gradient(135deg, rgba(204, 0, 102, 0.15), rgba(204, 0, 102, 0.1))',
                        border: mode === 'dark' ? '2px solid rgba(255, 0, 128, 0.4)' : '2px solid rgba(204, 0, 102, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShieldIcon sx={{ fontSize: 28, color: mode === 'dark' ? '#ff0080' : '#cc0066' }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700,
                          color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                          fontFamily: "'Courier New', monospace",
                          textTransform: 'uppercase',
                        }}
                      >
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: mode === 'dark' ? '#ff0080' : '#cc0066',
                          fontFamily: "'Courier New', monospace",
                          fontWeight: 600,
                        }}
                      >
                        Access Level
                      </Typography>
                    </Box>
                  </Box>
                </StatCard>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    );
  }

  return (
    <>
      <Typography>Please log in.</Typography>

      {/* Unlink Provider Confirmation Dialog */}
      <Dialog
        open={unlinkDialog.open}
        onClose={() => setUnlinkDialog({ open: false, provider: null })}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Unlink {unlinkDialog.provider === 'google' ? 'Google' : 'Facebook'} Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to unlink your {unlinkDialog.provider === 'google' ? 'Google' : 'Facebook'} account?
            You'll need to link it again if you want to use it for login in the future.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setUnlinkDialog({ open: false, provider: null })}
            disabled={unlinking}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnlinkProvider}
            variant="contained"
            color="error"
            disabled={unlinking}
            startIcon={unlinking ? <CircularProgress size={16} /> : <LinkOffIcon />}
          >
            {unlinking ? 'Unlinking...' : 'Unlink'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfilePage;
