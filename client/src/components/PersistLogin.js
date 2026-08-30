import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { axiosPublic } from '../api/axios';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

const PersistLogin = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { accessToken, setAccessToken } = useAuth();
    const theme = useTheme();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                const response = await axiosPublic.get('/api/auth/refresh');
                if (isMounted) {
                    setAccessToken(response.data.accessToken, response.data.csrfToken);
                }
            }
            catch (err) {
                console.log('No valid session found during initialization.');
            }
            finally {
                if (isMounted) setIsLoading(false);
            }
        }

        !accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => isMounted = false;
    }, [accessToken, setAccessToken]);

    return (
        <>
            {isLoading
                ? <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: theme.palette.mode === 'dark' ? '#0a0a1a' : '#f5f7fa' }}>
                    <CircularProgress color="primary" />
                    <Typography sx={{ mt: 2, color: 'text.secondary', fontFamily: "'Courier New', monospace" }}>Authenticating...</Typography>
                  </Box>
                : children
            }
        </>
    )
}

export default PersistLogin;
