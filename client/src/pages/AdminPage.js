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
import { styled } from '@mui/material/styles';

const AdminCard = styled(Card)(({ theme }) => ({
  borderRadius: '24px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
  backdropFilter: 'blur(20px)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 20px 60px rgba(0, 0, 0, 0.5)'
    : '0 20px 60px rgba(0, 0, 0, 0.1)',
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

const StatBox = styled(Box)(({ theme }) => ({
  padding: '24px',
  borderRadius: '20px',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: theme.palette.mode === 'dark'
    ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
    : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`
      : `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const UserListItem = styled(ListItem)(({ theme, isAdmin }) => ({
  borderRadius: '16px',
  marginBottom: '8px',
  background: theme.palette.mode === 'dark'
    ? isAdmin
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`
      : 'rgba(30, 41, 59, 0.5)'
    : isAdmin
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.03)})`
      : 'rgba(255, 255, 255, 0.5)',
  border: theme.palette.mode === 'dark'
    ? `1px solid ${alpha(theme.palette.primary.main, isAdmin ? 0.2 : 0.1)}`
    : `1px solid ${alpha(theme.palette.primary.main, isAdmin ? 0.15 : 0.08)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
      : `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const UserAvatar = styled(Avatar)(({ theme, isAdmin }) => ({
  width: 56,
  height: 56,
  background: isAdmin
    ? theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)'
      : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)'
    : theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #475569 0%, #64748b 100%)'
      : 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
  fontSize: '24px',
  fontWeight: 600,
  boxShadow: isAdmin
    ? theme.palette.mode === 'dark'
      ? '0 4px 16px rgba(99, 102, 241, 0.4)'
      : '0 4px 16px rgba(79, 70, 229, 0.3)'
    : 'none',
}));

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const theme = useMUITheme();

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
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)'
                : 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '17px' }}>
            Manage and monitor all registered users in the system
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <StatBox>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {users.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatBox>
              <AdminPanelSettingsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {adminCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administrators
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatBox>
              <PersonIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {userCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
              }}
            >
              <PeopleIcon sx={{ fontSize: 28 }} />
              All Users
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
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {user.name}
                            </Typography>
                            <Chip
                              label={user.role.toUpperCase()}
                              size="small"
                              color={isAdmin ? 'primary' : 'default'}
                              sx={{
                                fontWeight: 600,
                                height: 24,
                                fontSize: '11px',
                                background: isAdmin
                                  ? theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))'
                                    : 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.2))'
                                  : undefined,
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: 'block', mb: 0.5 }}
                            >
                              {user.email}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
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
                          opacity: theme.palette.mode === 'dark' ? 0.1 : 0.2,
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
