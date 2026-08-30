const express = require('express');
const axios = require('axios');
const SearchHistory = require('../models/SearchHistory');

const router = express.Router();

// 🔐 Spotify token caching
let spotifyToken = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken() {
  const now = Date.now();

  if (spotifyToken && now < spotifyTokenExpiry) {
    return spotifyToken;
  }

  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const res = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  spotifyToken = res.data.access_token;
  spotifyTokenExpiry = now + (res.data.expires_in - 60) * 1000;

  console.log('🔑 Refreshed Spotify token — expires in', res.data.expires_in, 'seconds');
  return spotifyToken;
}

// 🧠 Gemini insight generator
async function getGeminiInsight(promptText) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash-lite:generateContent';

  const prompt = {
    contents: [{ parts: [{ text: promptText }] }],
  };

  try {
    const aiRes = await axios.post(`${GEMINI_URL}?key=${GEMINI_KEY}`, prompt, {
      headers: { 'Content-Type': 'application/json' },
    });
    return aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No AI insight available.';
  } catch (e) {
    console.error('Gemini API error:', e.response?.data || e.message);
    return 'AI insight unavailable.';
  }
}

// 🎯 MAIN ROUTE (Replaces Supabase with MongoDB)
router.post('/', async (req, res) => {
  try {
    const { category, query } = req.body;
    // req.user is set by the `protect` middleware in index.js
    const userId = req.user?.id; 

    if (!category || !query)
      return res.status(400).json({ error: 'category & query required' });

    // Helper to save search history to MongoDB
    const saveHistory = async (insight) => {
      if (userId) {
        try {
          await SearchHistory.create({
            user_id: userId,
            category,
            query,
            ai_insight: insight
          });
        } catch (err) {
          console.error("🔥 MongoDB insert error:", err.message);
        }
      }
    };

    // 🎬 MOVIES
    if (category === 'movie') {
      const TMDB_KEY = process.env.TMDB_API_KEY;
      const SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;

      let recs = [];
      let aiInsight = '';

      try {
        // Add a strict 4-second timeout so we don't hang if TMDB is blocked
        const searchRes = await axios.get(SEARCH_URL, { timeout: 4000 });
        
        if (!searchRes.data.results?.length) {
          await saveHistory('No movies found.');
          return res.json({ category, query, recommendations: [], aiInsight: 'No movies found.' });
        }

        const movieId = searchRes.data.results[0].id;
        const RECS_URL = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${TMDB_KEY}`;
        const recsRes = await axios.get(RECS_URL, { timeout: 4000 });
        
        recs = recsRes.data.results.slice(0, 8).map(m => ({
          title: m.title,
          image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          meta: `⭐ ${m.vote_average != null ? m.vote_average.toFixed(1) : 'N/A'} | 📅 ${m.release_date || 'Unknown'}`,
        }));
      } catch (tmdbError) {
        console.warn("⚠️ TMDB request failed/blocked. Falling back to Gemini AI for recommendations.");
        
        // --- GEMINI FALLBACK ---
        try {
          const fallbackPrompt = `Provide 8 movie recommendations related to "${query}". Return ONLY a raw JSON array of objects, with no markdown formatting. Each object must have keys "title" (string) and "meta" (string, e.g. "⭐ 8.5 | 📅 2010").`;
          const fallbackRes = await getGeminiInsight(fallbackPrompt);
          
          // Clean the response of any potential markdown block wrappers
          const cleanJsonStr = fallbackRes.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsedRecs = JSON.parse(cleanJsonStr);
          
          recs = parsedRecs.map(m => ({ title: m.title, image: null, meta: m.meta }));
        } catch (geminiError) {
          console.error("Gemini fallback also failed:", geminiError);
          await saveHistory('No movies found.');
          return res.json({ category, query, recommendations: [], aiInsight: 'Error fetching movies.' });
        }
      }

      // Generate the insight using the existing logic (works regardless of TMDB success/failure)
      aiInsight = await getGeminiInsight(
        `Write a 60-word engaging movie insight for "${query}". Mention its storytelling, tone, and what makes it special. Avoid spoilers.`
      );
      
      await saveHistory(aiInsight);
      return res.json({ category, query, recommendations: recs, aiInsight });
    }

    // 🎵 MUSIC
    if (category === 'music') {
      try {
        const token = await getSpotifyToken();
        let recs = [];
        let aiInsight = "No AI insight available.";

        // 1️⃣ Try searching for artists
        const artistSearch = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const artists = artistSearch.data?.artists?.items || [];
        if (artists.length > 0) {
          const artistId = artists[0].id;
          let relatedArtists = [];

          try {
            const relatedRes = await axios.get(
              `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            relatedArtists = relatedRes.data?.artists || [];
          } catch (relErr) {
            console.warn(`⚠️ Spotify related-artists fetch failed for ${artists[0].name}`);
          }

          if (relatedArtists.length > 0) {
            recs = relatedArtists.slice(0, 8).map(a => ({
              title: a.name,
              image: a.images?.[0]?.url || null,
              meta: `${a.followers.total.toLocaleString()} followers | Popularity ${a.popularity}/100`,
            }));

            aiInsight = await getGeminiInsight(
              `Write a 50-word music insight for artist "${artists[0].name}". Mention their genre, tone, and why listeners enjoy them.`
            );
            
            await saveHistory(aiInsight);
            return res.json({ category, query, recommendations: recs, aiInsight });
          } else {
            // Fallback: get top tracks
            try {
              const topTracksRes = await axios.get(
                `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const tracks = topTracksRes.data?.tracks || [];
              if (tracks.length > 0) {
                recs = tracks.slice(0, 8).map(t => ({
                  title: t.name,
                  image: t.album.images?.[0]?.url || null,
                  meta: `${t.artists?.map(a => a.name).join(', ') || ''} | ${t.album?.name || ''}`,
                }));
                
                aiInsight = await getGeminiInsight(
                  `Write a 50-word music insight for artist "${artists[0].name}". Mention their genre, tone, and why listeners enjoy them.`
                );
                
                await saveHistory(aiInsight);
                return res.json({ category, query, recommendations: recs, aiInsight });
              }
            } catch (fallbackErr) {
              console.error("❌ Spotify fallback top-tracks error:", fallbackErr.response?.data || fallbackErr.message);
            }
          }
          
          const fallbackInsight = `No related artists or tracks found for artist ${artists[0].name}.`;
          await saveHistory(fallbackInsight);
          return res.json({
            category,
            query,
            recommendations: [],
            aiInsight: fallbackInsight
          });
        }

        // 2️⃣ If no artist found → try track search
        const trackSearch = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const tracks = trackSearch.data?.tracks?.items || [];
        if (tracks.length > 0) {
          recs = tracks.map(t => ({
            title: t.name,
            image: t.album.images?.[0]?.url || null,
            meta: `${t.artists.map(a => a.name).join(', ')} | ${t.album.name}`,
          }));

          aiInsight = await getGeminiInsight(
            `Write a short (50-75 words) review for the track "${tracks[0].name}" by ${tracks[0].artists.map(a => a.name).join(', ')}. Focus on its mood, sound, and why it appeals to listeners.`
          );

          await saveHistory(aiInsight);
          return res.json({ category, query, recommendations: recs, aiInsight });
        }

        const notFoundMsg = `No songs or artists found for "${query}". Try another name.`;
        await saveHistory(notFoundMsg);
        return res.json({
          category,
          query,
          recommendations: [],
          aiInsight: notFoundMsg,
        });
      } catch (musicErr) {
        return res.status(500).json({
          category,
          query,
          recommendations: [],
          aiInsight: '',
          error: musicErr.response?.data || musicErr.message,
        });
      }
    }

    // 📚 BOOKS
    if (category === 'book') {
      const BOOKS_URL = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_BOOKS_API_KEY}&maxResults=8`;
      const searchRes = await axios.get(BOOKS_URL);

      if (!searchRes.data.items?.length) {
        await saveHistory('No books found.');
        return res.json({ category, query, recommendations: [], aiInsight: 'No books found.' });
      }

      const recs = searchRes.data.items.slice(0, 8).map(b => ({
        title: b.volumeInfo.title,
        image: b.volumeInfo.imageLinks?.thumbnail || null,
        meta: `${b.volumeInfo.authors?.join(', ') || 'Unknown Author'} | ${b.volumeInfo.publishedDate || 'Unknown Year'}`,
      }));

      const aiInsight = await getGeminiInsight(
        `Write a 60-word literary insight for the book "${query}". Describe its themes, tone, and what makes it a must-read (avoid spoilers).`
      );
      
      await saveHistory(aiInsight);
      return res.json({ category, query, recommendations: recs, aiInsight });
    }

    // FALLBACK
    const fallbackMsg = `Recommendation logic for ${category} coming soon.`;
    await saveHistory(fallbackMsg);
    return res.json({
      category,
      query,
      recommendations: [],
      aiInsight: fallbackMsg,
    });
    
  } catch (err) {
    res.status(500).json({ error: 'server error', details: err.response?.data || err.message });
  }
});

module.exports = router;
