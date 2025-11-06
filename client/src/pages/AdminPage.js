import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

// --- 1. Import MUI Components ---
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
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

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

  // --- 2. Render Logic with MUI ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Access Denied: {error}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 700, margin: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        This page lists all registered users in the database.
      </Typography>
      
      {/* 3. Use a Paper component as the list container */}
      <Paper elevation={2} sx={{ mt: 3 }}>
        <List>
          {users.map((user, index) => (
            <React.Fragment key={user._id}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    {/* Show a different icon for admins */}
                    {user.role === 'admin' ? <AdminPanelSettingsIcon color="primary" /> : <PersonIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {user.email}
                      </Typography>
                      {` — Joined: ${new Date(user.createdAt).toLocaleDateString()}`}
                    </>
                  }
                />
                <Typography variant="caption" sx={{ ml: 2, p: 1, borderRadius: 1, bgcolor: user.role === 'admin' ? 'primary.light' : 'grey.200' }}>
                  {user.role}
                </Typography>
              </ListItem>
              
              {/* Add a divider between items, but not after the last one */}
              {index < users.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AdminPage;