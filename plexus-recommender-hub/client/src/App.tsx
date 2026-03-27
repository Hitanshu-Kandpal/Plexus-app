import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "./supabaseClient";

interface Recommendation {
  title: string;
  image: string | null;
  meta: string;
}

interface ApiResponse {
  category: string;
  query: string;
  recommendations: Recommendation[];
  aiInsight: string;
  error?: string;
}

function App() {
  const [category, setCategory] = useState("movie");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    getSession();

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      let headers: any = {};
      if (user?.id) {
        headers['x-user-id'] = user.id;
      }
      const res = await axios.post(
        `${API_BASE}/api/recommend`,
        { category, query },
        { headers }
      );
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      setResult({ category, query, recommendations: [], aiInsight: "", error: err.message });
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user)
    return (
      <div style={{ textAlign: "center", marginTop: "10%" }}>
        <h1>Welcome to Plexus 🎬🎧📚</h1>
        <p>Sign in to explore your personalized recommendations.</p>
        <button
          onClick={handleLogin}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            cursor: "pointer",
            background: "#4285F4",
            color: "white",
            border: "none",
          }}
        >
          Sign in with Google
        </button>
      </div>
    );

  return (
    <div style={{ padding: 20, fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Plexus Recommender Hub</h1>
        <div>
          <img
            src={user.user_metadata?.avatar_url}
            alt="user"
            width={40}
            height={40}
            style={{ borderRadius: "50%", marginRight: 10 }}
          />
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="movie">Movies</option>
          <option value="music">Music</option>
          <option value="book">Books</option>
        </select>

        <input
          placeholder="Type a movie / artist / book name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginLeft: 8, padding: 6, width: 300 }}
        />

        <button type="submit" style={{ marginLeft: 8, padding: "6px 12px" }}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <pre
        style={{
          background: "#111",
          color: "#dcdcdc",
          padding: 12,
          borderRadius: 8,
        }}
      >
        {result ? JSON.stringify(result, null, 2) : "No results yet"}
      </pre>
    </div>
  );
}

export default App;
