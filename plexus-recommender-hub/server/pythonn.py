import requests

# ---- YOUR API KEYS HERE ----
TMDB_API_KEY = "a981816246b42ae9ecfee2c3cf147f7b"
GEMINI_API_KEY = "AIzaSyAmfCstn0x6X-wm7QEpQQE-d7siCh-1Atk"

movie_name = "Inception"

# ✅ TMDB Search
search_url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={movie_name}&include_adult=false"
search_res = requests.get(search_url)

print("\n🔍 TMDB Search Response:")
print("Status:", search_res.status_code)
print(search_res.json())

if search_res.status_code != 200 or not search_res.json().get("results"):
    print("\n❌ TMDB search failed — movie not found or API error")
    exit()

movie_id = search_res.json()["results"][0]["id"]

# ✅ TMDB Recommendations
rec_url = f"https://api.themoviedb.org/3/movie/{movie_id}/recommendations?api_key={TMDB_API_KEY}"
rec_res = requests.get(rec_url)

print("\n🎬 TMDB Recommendations Response:")
print("Status:", rec_res.status_code)
print(rec_res.json())

# ✅ Gemini Insight
gemini_url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

payload = {
    "contents": [{
        "parts": [{
            "text": f"Give a short 50-word movie insight for {movie_name}. No spoilers."
        }]
    }]
}

gem_res = requests.post(gemini_url, json=payload)
print("\n🤖 Gemini Response:")
print("Status:", gem_res.status_code)
print(gem_res.json())

