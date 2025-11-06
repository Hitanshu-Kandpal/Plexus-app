import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useTheme } from '../context/ThemeContext';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme as useMUITheme,
  alpha,
  Fade,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
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

const AdminCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(26, 26, 42, 0.9) 0%, rgba(10, 10, 26, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.98) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.5)'
    : '2px solid rgba(0, 170, 255, 0.4)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 255, 255, 0.2), inset 0 0 60px rgba(0, 255, 255, 0.05)'
    : '0 20px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 170, 255, 0.15), inset 0 0 60px rgba(0, 170, 255, 0.03)',
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

const StatBox = styled(Box)(({ theme }) => ({
  padding: '24px',
  borderRadius: '16px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(26, 26, 42, 0.9) 0%, rgba(10, 10, 26, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.98) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.5)'
    : '2px solid rgba(0, 170, 255, 0.4)',
  textAlign: 'center',
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

const UserListItem = styled(ListItem)(({ theme, isAdmin }) => ({
  borderRadius: '12px',
  marginBottom: '8px',
  background: isAdmin
    ? theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(26, 26, 42, 0.8) 0%, rgba(10, 10, 26, 0.9) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.95) 100%)'
    : theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(26, 26, 42, 0.6) 0%, rgba(10, 10, 26, 0.7) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(245, 247, 250, 0.9) 100%)',
  border: isAdmin
    ? theme.palette.mode === 'dark'
      ? '2px solid rgba(0, 255, 255, 0.4)'
      : '2px solid rgba(0, 170, 255, 0.3)'
    : theme.palette.mode === 'dark'
      ? '2px solid rgba(0, 255, 255, 0.2)'
      : '2px solid rgba(0, 170, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 24px rgba(0, 255, 255, 0.3)'
      : '0 8px 24px rgba(0, 170, 255, 0.2)',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 255, 255, 0.6)' : 'rgba(0, 170, 255, 0.5)',
  },
}));

const UserAvatar = styled(Avatar)(({ theme, isAdmin }) => ({
  width: 56,
  height: 56,
  background: isAdmin
    ? theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #00ffff 0%, #ff0080 100%)'
      : 'linear-gradient(135deg, #0066cc 0%, #cc0066 100%)'
    : theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(0, 255, 255, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(0, 170, 255, 0.25) 0%, rgba(0, 170, 255, 0.2) 100%)',
  fontSize: '24px',
  fontWeight: 600,
  color: '#ffffff',
  fontFamily: "'Courier New', monospace",
  border: isAdmin
    ? theme.palette.mode === 'dark'
      ? '2px solid rgba(0, 255, 255, 0.6)'
      : '2px solid rgba(0, 170, 255, 0.5)'
    : theme.palette.mode === 'dark'
      ? '2px solid rgba(0, 255, 255, 0.3)'
      : '2px solid rgba(0, 170, 255, 0.25)',
  boxShadow: isAdmin
    ? theme.palette.mode === 'dark'
      ? '0 4px 16px rgba(0, 255, 255, 0.5)'
      : '0 4px 16px rgba(0, 170, 255, 0.4)'
    : theme.palette.mode === 'dark'
      ? '0 4px 16px rgba(0, 255, 255, 0.2)'
      : '0 4px 16px rgba(0, 170, 255, 0.15)',
}));

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const theme = useMUITheme();
  const { mode } = useTheme();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axiosPrivate.get('/api/admin/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [axiosPrivate]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

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
            Loading users...
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
          maxWidth: 800,
          margin: 'auto',
          mt: 4,
          borderRadius: 3,
        }}
      >
        Access Denied: {error}
      </Alert>
    );
  }

  return (
    <Fade in timeout={600}>
      <Box sx={{ maxWidth: 1400, margin: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: '32px', sm: '48px' },
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a2a',
              textShadow: theme.palette.mode === 'dark'
                ? '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)'
                : '0 0 15px rgba(0, 170, 255, 0.6), 0 0 30px rgba(0, 170, 255, 0.3)',
              fontFamily: "'Courier New', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            ADMIN DASHBOARD
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '17px',
              color: theme.palette.mode === 'dark' ? '#00ffff' : '#0066cc',
              fontFamily: "'Courier New', monospace",
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            MANAGE AND MONITOR ALL REGISTERED USERS IN THE SYSTEM
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
              <StatBox>
                <PeopleIcon sx={{ fontSize: 40, color: mode === 'dark' ? '#00ffff' : '#0066cc', mb: 1 }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {users.length}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: mode === 'dark' ? '#00ffff' : '#0066cc',
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 600,
                  }}
                >
                  Total Users
                </Typography>
              </StatBox>
          </Grid>
          <Grid item xs={12} sm={4}>
              <StatBox>
                <AdminPanelSettingsIcon sx={{ fontSize: 40, color: mode === 'dark' ? '#00ffff' : '#0066cc', mb: 1 }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {adminCount}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: mode === 'dark' ? '#00ffff' : '#0066cc',
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 600,
                  }}
                >
                  Administrators
                </Typography>
              </StatBox>
          </Grid>
          <Grid item xs={12} sm={4}>
              <StatBox>
                <PersonIcon sx={{ fontSize: 40, color: mode === 'dark' ? '#ff0080' : '#cc0066', mb: 1 }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {userCount}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: mode === 'dark' ? '#ff0080' : '#cc0066',
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 600,
                  }}
                >
                  Regular Users
                </Typography>
              </StatBox>
          </Grid>
        </Grid>

        {/* Users List */}
        <AdminCard className="fade-in">
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '24px',
                color: mode === 'dark' ? '#00ffff' : '#0066cc',
                textShadow: mode === 'dark' ? '0 0 15px rgba(0, 255, 255, 0.8)' : 'none',
                fontFamily: "'Courier New', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}
            >
              <PeopleIcon sx={{ fontSize: 28, mr: 1 }} />
              ALL USERS
            </Typography>

            <List sx={{ p: 0 }}>
              {users.map((user, index) => {
                const isAdmin = user.role === 'admin';
                return (
                  <React.Fragment key={user._id}>
                    <UserListItem isAdmin={isAdmin}>
                      <ListItemAvatar>
                        <UserAvatar isAdmin={isAdmin}>
                          {isAdmin ? (
                            <AdminPanelSettingsIcon />
                          ) : (
                            getInitials(user.name)
                          )}
                        </UserAvatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700,
                                color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                                fontFamily: "'Courier New', monospace",
                                textTransform: 'uppercase',
                              }}
                            >
                              {user.name}
                            </Typography>
                            <Chip
                              label={user.role.toUpperCase()}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                height: 24,
                                fontSize: '11px',
                                fontFamily: "'Courier New', monospace",
                                letterSpacing: '0.1em',
                                background: isAdmin
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
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ 
                                display: 'block', 
                                mb: 0.5,
                                color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                                fontFamily: "'Courier New', monospace",
                                fontWeight: 500,
                              }}
                            >
                              {user.email}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{
                                color: mode === 'dark' ? '#00ffff' : '#0066cc',
                                fontFamily: "'Courier New', monospace",
                                fontWeight: 600,
                              }}
                            >
                              Joined: {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </Typography>
                          </>
                        }
                      />
                    </UserListItem>
                      {index < users.length - 1 && (
                      <Divider
                        sx={{
                          my: 1,
                          borderColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 170, 255, 0.2)',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          </CardContent>
        </AdminCard>
      </Box>
    </Fade>
  );
};

export default AdminPage;
