import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  MenuItem, 
  Card, 
  CardMedia, 
  CardContent, 
  Alert, 
  CircularProgress,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  Fade,
  Chip,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useTheme } from "../context/ThemeContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import MovieIcon from "@mui/icons-material/Movie";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

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

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
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
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 60px rgba(0, 255, 255, 0.5), 0 0 0 2px rgba(0, 255, 255, 0.3)'
      : '0 20px 60px rgba(0, 170, 255, 0.3), 0 0 0 2px rgba(0, 170, 255, 0.2)',
  },
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

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    fontFamily: "'Courier New', monospace",
    background: theme.palette.mode === 'dark'
      ? 'rgba(10, 10, 26, 0.6)'
      : 'rgba(255, 255, 255, 0.8)',
    border: theme.palette.mode === 'dark'
      ? '2px solid rgba(0, 255, 255, 0.4)'
      : '2px solid rgba(0, 170, 255, 0.3)',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 255, 255, 0.7)' : 'rgba(0, 170, 255, 0.5)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 0 20px rgba(0, 255, 255, 0.3)'
        : '0 0 15px rgba(0, 170, 255, 0.2)',
    },
    '&.Mui-focused': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 255, 255, 0.9)' : 'rgba(0, 170, 255, 0.7)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 0 30px rgba(0, 255, 255, 0.5)'
        : '0 0 25px rgba(0, 170, 255, 0.4)',
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Courier New', monospace",
    color: theme.palette.mode === 'dark' ? 'rgba(0, 255, 255, 0.8)' : 'rgba(0, 170, 255, 0.7)',
    fontWeight: 600,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.mode === 'dark' ? '#00ffff' : '#0066cc',
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  fontFamily: "'Courier New', monospace",
  background: theme.palette.mode === 'dark'
    ? 'rgba(10, 10, 26, 0.6)'
    : 'rgba(255, 255, 255, 0.8)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.4)'
    : '2px solid rgba(0, 170, 255, 0.3)',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 255, 255, 0.7)' : 'rgba(0, 170, 255, 0.5)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 0 20px rgba(0, 255, 255, 0.3)'
      : '0 0 15px rgba(0, 170, 255, 0.2)',
  },
  '&.Mui-focused': {
    borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 255, 255, 0.9)' : 'rgba(0, 170, 255, 0.7)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 0 30px rgba(0, 255, 255, 0.5)'
      : '0 0 25px rgba(0, 170, 255, 0.4)',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const SearchButton = styled(Button)(({ theme }) => ({
  padding: '14px 32px',
  borderRadius: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  fontFamily: "'Courier New', monospace",
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(255, 0, 128, 0.3) 100%)'
    : 'linear-gradient(135deg, rgba(0, 170, 255, 0.3) 0%, rgba(204, 0, 102, 0.3) 100%)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.6)'
    : '2px solid rgba(0, 170, 255, 0.5)',
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#ffffff',
  '&:hover': {
    transform: 'translateY(-4px)',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.5) 0%, rgba(255, 0, 128, 0.5) 100%)'
      : 'linear-gradient(135deg, rgba(0, 170, 255, 0.5) 0%, rgba(204, 0, 102, 0.5) 100%)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 10px 30px rgba(0, 255, 255, 0.6), 0 0 0 3px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.4)'
      : '0 10px 30px rgba(0, 170, 255, 0.4), 0 0 0 3px rgba(0, 170, 255, 0.2), 0 0 40px rgba(0, 170, 255, 0.3)',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 255, 255, 0.9)' : 'rgba(0, 170, 255, 0.7)',
  },
  '&:disabled': {
    opacity: 0.6,
  },
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, rgba(0, 255, 255, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(0, 170, 255, 0.2) 0%, rgba(0, 170, 255, 0.15) 100%)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(0, 255, 255, 0.5)'
    : '2px solid rgba(0, 170, 255, 0.4)',
  color: theme.palette.mode === 'dark' ? '#00ffff' : '#0066cc',
  borderRadius: '12px',
  padding: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(-4px)',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(0, 255, 255, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(0, 170, 255, 0.35) 0%, rgba(0, 170, 255, 0.25) 100%)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 20px rgba(0, 255, 255, 0.4)'
      : '0 8px 20px rgba(0, 170, 255, 0.3)',
  },
}));

const categories = [
  { value: "movie", label: "Movies", icon: <MovieIcon /> },
  { value: "music", label: "Music", icon: <MusicNoteIcon /> },
  { value: "book", label: "Books", icon: <MenuBookIcon /> },
];

const RecommendationsPage = () => {
  const [category, setCategory] = useState("movie");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { mode } = useTheme();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const resp = await axiosPrivate.post("/api/recommendations", {
        category,
        query: query.trim(),
      });
      setResult(resp.data);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        "Failed to fetch recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === category);

  return (
    <Fade in timeout={600}>
      <Box sx={{ maxWidth: 1400, mx: "auto", mt: 2, px: { xs: 2, sm: 3 }, pb: 4 }}>
        {/* Header with Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <BackButton onClick={() => navigate('/profile')}>
            <ArrowBackIcon />
          </BackButton>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontFamily: "'Courier New', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, #00ffff 0%, #ff0080 100%)'
                  : 'linear-gradient(135deg, #0066cc 0%, #cc0066 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: mode === 'dark'
                  ? '0 0 20px rgba(0, 255, 255, 0.8)'
                  : '0 0 15px rgba(0, 102, 204, 0.6)',
              }}
            >
              Recommendations
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 42, 0.7)',
                fontFamily: "'Courier New', monospace",
              }}
            >
              Discover personalized content powered by AI
            </Typography>
          </Box>
        </Box>

        {/* Search Form */}
        <StyledCard sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth>
                  <InputLabel 
                    id="category-label"
                    sx={{
                      fontFamily: "'Courier New', monospace",
                      color: mode === 'dark' ? 'rgba(0, 255, 255, 0.8)' : 'rgba(0, 170, 255, 0.7)',
                      fontWeight: 600,
                      '&.Mui-focused': {
                        color: mode === 'dark' ? '#00ffff' : '#0066cc',
                      },
                    }}
                  >
                    Category
                  </InputLabel>
                  <StyledSelect
                    labelId="category-label"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Category"
                  >
                    {categories.map((opt) => (
                      <MenuItem 
                        key={opt.value} 
                        value={opt.value}
                        sx={{
                          fontFamily: "'Courier New', monospace",
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {opt.icon}
                        {opt.label}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={7}>
                <StyledTextField
                  fullWidth
                  label="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Enter ${selectedCategory?.label.toLowerCase()} name...`}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: mode === 'dark' ? 'rgba(0, 255, 255, 0.6)' : 'rgba(0, 170, 255, 0.5)' }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2} md={2}>
                <SearchButton
                  type="submit"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <SearchIcon />}
                >
                  {loading ? "Searching..." : "Search"}
                </SearchButton>
              </Grid>
            </Grid>
          </form>
        </StyledCard>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              maxWidth: 800, 
              mx: "auto",
              borderRadius: 2,
              fontFamily: "'Courier New', monospace",
              background: mode === 'dark' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)',
              border: mode === 'dark' ? '1px solid rgba(220, 38, 38, 0.5)' : '1px solid rgba(220, 38, 38, 0.3)',
            }}
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", my: 8 }}>
            <CircularProgress 
              size={60} 
              sx={{ 
                color: mode === 'dark' ? '#00ffff' : '#0066cc',
                mb: 2,
              }} 
            />
            <Typography
              variant="body1"
              sx={{
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 42, 0.7)',
                fontFamily: "'Courier New', monospace",
              }}
            >
              Searching for recommendations...
            </Typography>
          </Box>
        )}

        {/* Results */}
        {result && result.recommendations && result.recommendations.length > 0 && (
          <Fade in timeout={800}>
            <Box>
              {/* AI Insight */}
              {result.aiInsight && (
                <StyledCard sx={{ p: 3, mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 28, color: mode === 'dark' ? '#00ffff' : '#0066cc' }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: mode === 'dark' ? '#00ffff' : '#0066cc',
                        fontFamily: "'Courier New', monospace",
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        textShadow: mode === 'dark' ? '0 0 15px rgba(0, 255, 255, 0.8)' : 'none',
                      }}
                    >
                      AI Insight
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : '#1a1a2a',
                      lineHeight: 1.8,
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    {result.aiInsight}
                  </Typography>
                </StyledCard>
              )}

              {/* Recommendations Grid */}
              <Grid container spacing={3}>
                {result.recommendations.map((rec, idx) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                    <StyledCard>
                      {rec.image && (
                        <CardMedia
                          component="img"
                          image={rec.image}
                          alt={rec.title}
                          sx={{
                            height: 280,
                            objectFit: "cover",
                            borderBottom: mode === 'dark' ? '2px solid rgba(0, 255, 255, 0.3)' : '2px solid rgba(0, 170, 255, 0.2)',
                          }}
                        />
                      )}
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 1.5,
                            fontWeight: 700,
                            color: mode === 'dark' ? '#ffffff' : '#1a1a2a',
                            fontFamily: "'Courier New', monospace",
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: '16px',
                            lineHeight: 1.3,
                            minHeight: '2.6em',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {rec.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 42, 0.7)',
                            fontFamily: "'Courier New', monospace",
                            fontSize: '13px',
                            lineHeight: 1.6,
                          }}
                        >
                          {rec.meta}
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        )}

        {/* No Results */}
        {result && result.recommendations && result.recommendations.length === 0 && !loading && (
          <Alert
            severity="info"
            sx={{
              maxWidth: 600,
              mx: "auto",
              borderRadius: 2,
              fontFamily: "'Courier New', monospace",
              background: mode === 'dark' ? 'rgba(0, 170, 255, 0.2)' : 'rgba(0, 170, 255, 0.1)',
              border: mode === 'dark' ? '1px solid rgba(0, 170, 255, 0.5)' : '1px solid rgba(0, 170, 255, 0.3)',
            }}
          >
            No recommendations found. Try a different search term.
          </Alert>
        )}
      </Box>
    </Fade>
  );
};

export default RecommendationsPage;
