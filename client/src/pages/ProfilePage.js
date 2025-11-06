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
import { styled } from '@mui/material/styles';

const StatCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  padding: '24px',
  borderRadius: '20px',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: theme.palette.mode === 'dark'
    ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
    : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`
      : `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  borderRadius: '24px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
  backdropFilter: 'blur(20px)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.8)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)'
      : 'linear-gradient(90deg, #4f46e5, #7c3aed, #db2777)',
  },
}));

const GradientAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)'
    : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
  fontSize: '48px',
  fontWeight: 700,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(99, 102, 241, 0.4)'
    : '0 8px 32px rgba(79, 70, 229, 0.3)',
  border: `4px solid ${theme.palette.background.paper}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: '12px 24px',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const ProfilePage = () => {
  const { user, setUser, setCsrfToken, csrfToken, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const theme = useMUITheme();

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
                          background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)'
                            : 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
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
                        <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body1" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<ShieldIcon />}
                        label={user.role.toUpperCase()}
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        sx={{
                          fontWeight: 600,
                          px: 1,
                          background: user.role === 'admin'
                            ? theme.palette.mode === 'dark'
                              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))'
                              : 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.2))'
                            : undefined,
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {user.role === 'admin' && (
                      <ActionButton
                        variant="contained"
                        startIcon={<AdminPanelSettingsIcon />}
                        component={RouterLink}
                        to="/admin"
                        sx={{
                          background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                            : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                          color: '#ffffff',
                        }}
                      >
                        Admin Dashboard
                      </ActionButton>
                    )}

                    <ActionButton
                      variant="outlined"
                      color="error"
                      startIcon={<LogoutIcon />}
                      onClick={handleLogout}
                      sx={{
                        borderColor: theme.palette.error.main,
                        '&:hover': {
                          borderColor: theme.palette.error.dark,
                          background: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      Sign Out
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
                        borderRadius: '16px',
                        background: theme.palette.mode === 'dark'
                          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.secondary.main, 0.2)})`
                          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Active
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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
                        borderRadius: '16px',
                        background: theme.palette.mode === 'dark'
                          ? `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.3)}, ${alpha(theme.palette.primary.main, 0.2)})`
                          : `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShieldIcon sx={{ fontSize: 28, color: 'secondary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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

  return <Typography>Please log in.</Typography>;
};

export default ProfilePage;
