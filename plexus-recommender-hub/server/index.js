require('dotenv').config();
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first'); // Force IPv4 to prevent ETIMEDOUT on IPv6 addresses
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key now
);

// 🔐 Spotify token caching
let spotifyToken = null;
let spotifyTokenExpiry = 0;

// 🧩 Spotify token helper
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

// 🌐 Health check
app.get('/', (req, res) => res.json({ status: 'Plexus server running' }));

// 🧠 Gemini insight generator
async function getGeminiInsight(promptText) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent';

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

// 🎯 MAIN ROUTE
app.post('/api/recommend', async (req, res) => {
  try {
    const { category, query } = req.body;
    const userId = req.headers['x-user-id'];
    if (!category || !query)
      return res.status(400).json({ error: 'category & query required' });

    // 🎬 MOVIES
    if (category === 'movie') {
      const TMDB_KEY = process.env.TMDB_API_KEY;
      const SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;

      const searchRes = await axios.get(SEARCH_URL);
      if (!searchRes.data.results?.length)
        return res.json({ category, query, recommendations: [], aiInsight: 'No movies found.' });

      const movieId = searchRes.data.results[0].id;
      const RECS_URL = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${TMDB_KEY}`;

      const recsRes = await axios.get(RECS_URL);
      const recs = recsRes.data.results.slice(0, 8).map(m => ({
        title: m.title,
        image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        meta: `⭐ ${m.vote_average != null ? m.vote_average.toFixed(1) : 'N/A'} | 📅 ${m.release_date || 'Unknown'}`,
      }));

      const aiInsight = await getGeminiInsight(
        `Write a 60-word engaging movie insight for "${query}". Mention its storytelling, tone, and what makes it special. Avoid spoilers.`
      );
      console.log("🧠 Movie save attempt:", { userId, aiInsight });
      try {
        if (userId) {
          await supabase.from("search_history").insert({
            user_id: userId,
            category,
            query,
            ai_insight: aiInsight
          });
        }
      } catch (err) {
        console.error("🔥 Supabase movie insert error:", err.message);
      }
      return res.json({ category, query, recommendations: recs, aiInsight });
    }

    // 🎵 MUSIC
    if (category === 'music') {
      try {
        const token = await getSpotifyToken();
        let recs = [];
        let aiInsight = "No AI insight available.";

        console.log("🎵 Searching Spotify for:", query);

        // 1️⃣ Try searching for artists
        const artistSearch = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const artists = artistSearch.data?.artists?.items || [];
        if (artists.length > 0) {
          console.log("🎤 Found artist:", artists[0].name);

          const artistId = artists[0].id;
          let relatedRes = null;
          let relatedArtists = [];
          let relatedFailed = false;

          try {
            relatedRes = await axios.get(
              `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            relatedArtists = relatedRes.data?.artists || [];
            if (relatedArtists.length === 0) {
              console.warn("⚠️ No related artists found for artist:", artists[0].name);
              relatedFailed = true;
            }
          } catch (relErr) {
            const msg = relErr.response?.status === 404 ? "(404)" : "";
            console.warn(`⚠️ Spotify related-artists fetch failed for ${artists[0].name} ${msg}:`, relErr.response?.data || relErr.message);
            relatedFailed = true;
          }

          if (!relatedFailed) {
            recs = relatedArtists.slice(0, 8).map(a => ({
              title: a.name,
              image: a.images?.[0]?.url || null,
              meta: `${a.followers.total.toLocaleString()} followers | Popularity ${a.popularity}/100`,
            }));

            aiInsight = await getGeminiInsight(
              `Write a 50-word music insight for artist "${artists[0].name}". Mention their genre, tone, and why listeners enjoy them.`
            );
            console.log("✅ Returned related artists for:", artists[0].name);
            if (userId) {
              await supabase.from('search_history').insert({
                user_id: userId,
                category,
                query,
                ai_insight: aiInsight
              });
            }
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
                // FIX: AI insight should be about ARTIST, not the first track
                aiInsight = await getGeminiInsight(
                  `Write a 50-word music insight for artist "${artists[0].name}". Mention their genre, tone, and why listeners enjoy them.`
                );
                console.log("✅ Fallback to top tracks for:", artists[0].name);
                if (userId) {
                  await supabase.from('search_history').insert({
                    user_id: userId,
                    category,
                    query,
                    ai_insight: aiInsight
                  });
                }
                return res.json({ category, query, recommendations: recs, aiInsight });
              } else {
                console.warn("⚠️ No top tracks found for fallback for:", artists[0].name);
              }
            } catch (fallbackErr) {
              console.error("❌ Spotify fallback top-tracks error:", fallbackErr.response?.data || fallbackErr.message);
            }
          }
          // If everything fails...
          console.warn("⚠️ Both related-artists and top-tracks failed for:", artists[0].name);
          if (userId) {
            await supabase.from('search_history').insert({
              user_id: userId,
              category,
              query,
              ai_insight: `No related artists or tracks found for artist ${artists[0].name}.`
            });
          }
          return res.json({
            category,
            query,
            recommendations: [],
            aiInsight: `No related artists or tracks found for artist ${artists[0].name}.`
          });
        }

        // 2️⃣ If no artist found → try track search
        const trackSearch = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const tracks = trackSearch.data?.tracks?.items || [];
        if (tracks.length > 0) {
          console.log(`🎶 Found ${tracks.length} tracks for ${query}`);

          recs = tracks.map(t => ({
            title: t.name,
            image: t.album.images?.[0]?.url || null,
            meta: `${t.artists.map(a => a.name).join(', ')} | ${t.album.name}`,
          }));

          aiInsight = await getGeminiInsight(
            `Write a short (50-75 words) review for the track "${tracks[0].name}" by ${tracks[0].artists.map(a => a.name).join(', ')}. Focus on its mood, sound, and why it appeals to listeners.`
          );

          if (userId) {
            await supabase.from('search_history').insert({
              user_id: userId,
              category,
              query,
              ai_insight: aiInsight
            });
          }
          return res.json({ category, query, recommendations: recs, aiInsight });
        }

        console.log("⚠️ No artist or track results for:", query);
        if (userId) {
          await supabase.from('search_history').insert({
            user_id: userId,
            category,
            query,
            ai_insight: 'No songs or artists found for "' + query + '". Try another name.'
          });
        }
        return res.json({
          category,
          query,
          recommendations: [],
          aiInsight: `No songs or artists found for "${query}". Try another name.`,
        });
      } catch (musicErr) {
        console.error("🎧 Spotify API error:", musicErr.response?.data || musicErr.message);
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
      const BOOKS_URL = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`;
      const searchRes = await axios.get(BOOKS_URL);

      if (!searchRes.data.items?.length) {
        if (userId) {
          await supabase.from('search_history').insert({
            user_id: userId,
            category,
            query,
            ai_insight: 'No books found.'
          });
        }
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
      if (userId) {
        await supabase.from('search_history').insert({
          user_id: userId,
          category,
          query,
          ai_insight: aiInsight
        });
      }
      return res.json({ category, query, recommendations: recs, aiInsight });
    }

    // FALLBACK
    if (userId) {
      await supabase.from('search_history').insert({
        user_id: userId,
        category,
        query,
        ai_insight: `Recommendation logic for ${category} coming soon.`
      });
    }
    return res.json({
      category,
      query,
      recommendations: [],
      aiInsight: `Recommendation logic for ${category} coming soon.`,
    });
  } catch (err) {
    console.error('🔥 FULL ERROR DETAILS:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'server error', details: err.response?.data || err.message });
  }
});

// 🚀 Server setup
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
