'use client'

import { useState, useEffect, useRef } from "react";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
const TMDB_BASE    = "https://api.themoviedb.org/3";
const TMDB_IMG     = "https://image.tmdb.org/t/p";

const STORAGE_KEY = "cineverse_movies";

function loadFromStorage(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToStorage(data: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function searchTMDB(query: string) {
  if (!TMDB_API_KEY) return [];
  const res = await fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`);
  const data = await res.json();
  return (data.results || []).filter((r: any) => r.media_type === "movie" || r.media_type === "tv");
}

async function fetchTrendingTMDB() {
  if (!TMDB_API_KEY) return [];
  const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  return data.results || [];
}

function tmdbToMovie(item: any) {
  const isTV = item.media_type === "tv" || item.first_air_date;
  return {
    id: `tmdb_${item.id}`,
    tmdbId: item.id,
    title: item.title || item.name,
    year: parseInt((item.release_date || item.first_air_date || "0").split("-")[0]),
    rating: parseFloat(item.vote_average?.toFixed(1) || "0"),
    type: isTV ? "TV" : "Movie",
    genre: [] as string[],
    quality: "HD",
    poster: item.poster_path ? `${TMDB_IMG}/w500${item.poster_path}` : "",
    backdrop: item.backdrop_path ? `${TMDB_IMG}/w1280${item.backdrop_path}` : "",
    desc: item.overview || "",
    watchUrl: "",
    source: "tmdb",
  };
}

const SEED_MOVIES = [
  { id: 1, title: "Dhurandhar: The Revenge", year: 2026, rating: 8.6, type: "Movie", genre: ["Action","Bollywood"], quality: "HD", poster: "https://image.tmdb.org/t/p/w500/z1dGYCdc8imuQ6LFkd9moc0zaBe.jpg", backdrop: "https://image.tmdb.org/t/p/w1280/z1dGYCdc8imuQ6LFkd9moc0zaBe.jpg", desc: "A gripping tale of revenge set in modern India.", watchUrl: "", source: "manual" },
  { id: 2, title: "Mortal Kombat 2", year: 2026, rating: 7.9, type: "Movie", genre: ["Action","Hollywood"], quality: "HDTS", poster: "https://image.tmdb.org/t/p/w500/lIsMeDbwntNXSUVHmWMMRXEZOVc.jpg", backdrop: "https://image.tmdb.org/t/p/w1280/lIsMeDbwntNXSUVHmWMMRXEZOVc.jpg", desc: "The warriors return for an even deadlier tournament.", watchUrl: "", source: "manual" },
  { id: 3, title: "Avatar: Fire and Ash", year: 2025, rating: 8.6, type: "Movie", genre: ["Action","Sci-Fi"], quality: "HD", poster: "https://image.tmdb.org/t/p/w500/bRBeSHfGHwkEpImlhxPmOcUsaeg.jpg", backdrop: "https://image.tmdb.org/t/p/w1280/bRBeSHfGHwkEpImlhxPmOcUsaeg.jpg", desc: "Jake and Neytiri face a new threat.", watchUrl: "", source: "manual" },
  { id: 4, title: "Bhooth Bangla", year: 2026, rating: 7.8, type: "Movie", genre: ["Horror","Bollywood"], quality: "HD", poster: "https://image.tmdb.org/t/p/w500/79RBp8afL4u4z3nVGR78z6eIvBB.jpg", backdrop: "https://image.tmdb.org/t/p/w1280/79RBp8afL4u4z3nVGR78z6eIvBB.jpg", desc: "A haunted mansion holds dark secrets.", watchUrl: "", source: "manual" },
  { id: 5, title: "The Boys", year: 2019, rating: 9.2, type: "TV", genre: ["Action","Thriller"], quality: "HD", poster: "https://image.tmdb.org/t/p/w500/in1R2dDc421JxsoRWaIIAqVI2KE.jpg", backdrop: "https://image.tmdb.org/t/p/w1280/in1R2dDc421JxsoRWaIIAqVI2KE.jpg", desc: "Superheroes are corrupt, and a vigilante group fights back.", watchUrl: "", source: "manual" },
  { id: 6, title: "FROM", year: 2022, rating: 9.4, type: "TV", genre: ["Horror","Mystery"], quality: "HD", poster: "https://image.tmdb.org/t/p/w500/pRtJagIxpfODzzb0T0NAvZSzErC.jpg", backdrop: "https://image.tmdb.org/t/p/w1280/pRtJagIxpfODzzb0T0NAvZSzErC.jpg", desc: "A town traps its residents and monsters lurk.", watchUrl: "", source: "manual" },
  { id: 7, title: "Jujutsu Kaisen", year: 2020, rating: 9.3, type: "TV", genre: ["Anime","Action"], quality: "HD", poster: "https://image.tmdb.org/t/p/w500/aIyREVCO5FqS2vPpk35ofW32YPx.jpg", backdrop: "https://image.tmdb.org/t/p/w1280/aIyREVCO5FqS2vPpk35ofW32YPx.jpg", desc: "A boy becomes host to a powerful curse.", watchUrl: "", source: "manual" },
  { id: 8, title: "Stranger Things", year: 2016, rating: 9.4, type: "TV", genre: ["Sci-Fi","Horror"], quality: "HD", poster: "https://image.tmdb.org/t/p/w500/cVxVGwHce6xnW8UaVUggaPXbmoE.jpg", backdrop: "https://image.tmdb.org/t/p/w1280/cVxVGwHce6xnW8UaVUggaPXbmoE.jpg", desc: "Kids uncover supernatural secrets in their small town.", watchUrl: "", source: "manual" },
];

const GENRES = ["Action","Adventure","Animation","Anime","Bollywood","Comedy","Crime","Documentary","Drama","Fantasy","Hollywood","Horror","Mystery","Romance","Sci-Fi","South Indian","Thriller","Western"];
const QUALITIES = ["HD","HDTS","4K","CAM","ENG SUB","HQ"];
const NAV_DROPDOWNS = [
  { label: "Genre", items: ["Action","Adventure","Animation","Comedy","Crime","Drama","Fantasy","Horror","Mystery","Romance","Sci-Fi","Thriller"] },
  { label: "Category", items: ["Bollywood Movies","Hollywood","South Indian","Punjabi","Top Rated"] },
  { label: "OTT", items: ["Amazon Prime","Netflix","Jio Hotstar","Sony Liv","Zee 5"] },
  { label: "Collection", items: ["Marvel","DC Universe","Harry Potter","Fast & Furious","James Bond","Star Wars"] },
];

function StarRating({ rating }: { rating: number }) {
  return <span style={{ color: "#f5c518", fontSize: 12, fontWeight: 700 }}>★ {rating}</span>;
}

function QualityBadge({ quality }: { quality: string }) {
  const colors: Record<string, string> = { HD: "#1a7f37", HDTS: "#9a6700", "4K": "#8250df", "ENG SUB": "#0969da", CAM: "#666", HQ: "#1a7f37" };
  return <span style={{ background: colors[quality] || "#444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 3 }}>{quality}</span>;
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 99999, background: "#1a7f37", color: "#fff", padding: "12px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
      ✓ {msg}
    </div>
  );
}

function MovieCard({ movie, onClick, onDelete, adminMode }: { movie: any; onClick: (m: any) => void; onDelete?: (id: any) => void; adminMode: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", borderRadius: 8, overflow: "hidden", background: "#1a1a1a", transition: "transform 0.2s, box-shadow 0.2s", transform: hovered ? "scale(1.04)" : "scale(1)", boxShadow: hovered ? "0 8px 32px rgba(229,9,20,0.3)" : "0 2px 8px rgba(0,0,0,0.5)", position: "relative" }}>
      <div onClick={() => onClick(movie)} style={{ position: "relative", aspectRatio: "2/3", overflow: "hidden" }}>
        <img src={movie.poster} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e: any) => { e.target.src = `https://via.placeholder.com/200x300/1a1a1a/555?text=${encodeURIComponent(movie.title.slice(0,10))}`; }} />
        <div style={{ position: "absolute", inset: 0, background: hovered ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {hovered && <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(229,9,20,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg></div>}
        </div>
        <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 3 }}><QualityBadge quality={movie.quality} /></div>
        <div style={{ position: "absolute", top: 6, right: 6 }}>
          <span style={{ background: movie.type === "TV" ? "#1a3a6b" : "#2a1a3a", color: movie.type === "TV" ? "#60a5fa" : "#c084fc", fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 3 }}>{movie.type === "TV" ? "TV" : "MOVIE"}</span>
        </div>
      </div>
      <div style={{ padding: "8px 10px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#e5e5e5", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{movie.title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#888" }}>{movie.year}</span>
          <StarRating rating={movie.rating} />
        </div>
      </div>
      {adminMode && onDelete && (
        <button onClick={e => { e.stopPropagation(); onDelete(movie.id); }}
          style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(229,9,20,0.85)", border: "none", color: "#fff", width: 22, height: 22, borderRadius: "50%", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      )}
    </div>
  );
}

const EMPTY_FORM = { title: "", year: new Date().getFullYear(), rating: 7.0, type: "Movie", genre: [] as string[], quality: "HD", poster: "", backdrop: "", desc: "", watchUrl: "" };

function AdminPanel({ allMovies, onAdd, onDelete, onClose, onImportTMDB }: any) {
  const [tab, setTab] = useState("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbTrending, setTmdbTrending] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    if (tab === "tmdb") fetchTrendingTMDB().then(res => setTmdbTrending(res.map(tmdbToMovie)));
  }, [tab]);

  const validate = () => {
    const e: any = {};
    if (!form.title.trim()) e.title = "Title required";
    if (!form.poster.trim()) e.poster = "Poster URL required";
    if (form.rating < 0 || form.rating > 10) e.rating = "0–10 range";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onAdd({ ...form, id: Date.now(), source: "manual" });
    setForm(EMPTY_FORM);
    setTab("list");
  };

  const handleTMDBSearch = async () => {
    if (!tmdbQuery.trim()) return;
    setTmdbLoading(true);
    const res = await searchTMDB(tmdbQuery);
    setTmdbResults(res.map(tmdbToMovie));
    setTmdbLoading(false);
  };

  const displayed = filterType === "All" ? allMovies : allMovies.filter((m: any) => m.type === filterType);
  const INPUT: any = { background: "#111", border: "1px solid #333", color: "#fff", padding: "9px 12px", borderRadius: 7, fontSize: 13, width: "100%", outline: "none", boxSizing: "border-box" };
  const LABEL: any = { fontSize: 12, color: "#aaa", fontWeight: 600, display: "block", marginBottom: 5 };
  const TAB = (active: boolean) => ({ background: active ? "#e50914" : "#1a1a1a", color: active ? "#fff" : "#aaa", border: "none", padding: "10px 22px", cursor: "pointer", fontSize: 13, fontWeight: 700, borderRadius: "8px 8px 0 0" });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "stretch" }}>
      <div style={{ width: "100%", maxWidth: 1100, margin: "auto", background: "#0d0d0d", borderRadius: 16, overflow: "hidden", border: "1px solid #222", display: "flex", flexDirection: "column", maxHeight: "92vh" }}>
        <div style={{ background: "#111", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #222" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 900, background: "linear-gradient(135deg,#e50914,#ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Cine</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Verse</span>
            <span style={{ background: "#e50914", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>ADMIN</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: 13 }}>Total: <b style={{ color: "#fff" }}>{allMovies.length}</b></span>
            <button onClick={onClose} style={{ background: "#222", border: "1px solid #444", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 6 }}>
          {[["list","📋 All Titles"],["add","➕ Manual Add"],["tmdb","🎬 TMDB Import"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={TAB(tab === id)}>{label}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

          {tab === "list" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {["All","Movie","TV"].map(t => (
                  <button key={t} onClick={() => setFilterType(t)} style={{ background: filterType === t ? "#e50914" : "#222", color: "#fff", border: "none", padding: "7px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                    {t} ({t === "All" ? allMovies.length : allMovies.filter((m: any) => m.type === t).length})
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
                {displayed.map((m: any) => <MovieCard key={m.id} movie={m} onClick={() => {}} onDelete={onDelete} adminMode />)}
              </div>
              {!displayed.length && <div style={{ textAlign: "center", padding: 60, color: "#555" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div><p>Koi title nahi</p></div>}
            </div>
          )}

          {tab === "add" && (
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <h3 style={{ color: "#fff", fontSize: 17, marginBottom: 24, fontWeight: 700 }}>Manually Movie/Series Add Karo</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={LABEL}>Title *</label>
                  <input style={{ ...INPUT, borderColor: errors.title ? "#e50914" : "#333" }} placeholder="e.g. Pushpa 2: The Rule" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  {errors.title && <span style={{ color: "#e50914", fontSize: 11 }}>{errors.title}</span>}
                </div>
                <div>
                  <label style={LABEL}>Year</label>
                  <input style={INPUT} type="number" min="1900" max="2030" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))} />
                </div>
                <div>
                  <label style={LABEL}>Rating (0–10)</label>
                  <input style={INPUT} type="number" min="0" max="10" step="0.1" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: parseFloat(e.target.value) }))} />
                </div>
                <div>
                  <label style={LABEL}>Type</label>
                  <select style={INPUT} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option>Movie</option><option>TV</option></select>
                </div>
                <div>
                  <label style={LABEL}>Quality</label>
                  <select style={INPUT} value={form.quality} onChange={e => setForm(f => ({ ...f, quality: e.target.value }))}>{QUALITIES.map(q => <option key={q}>{q}</option>)}</select>
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={LABEL}>Genres</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {GENRES.map(g => {
                      const selected = form.genre.includes(g);
                      return <button key={g} onClick={() => setForm(f => ({ ...f, genre: selected ? f.genre.filter(x => x !== g) : [...f.genre, g] }))} style={{ background: selected ? "#e50914" : "#222", color: selected ? "#fff" : "#aaa", border: `1px solid ${selected ? "#e50914" : "#444"}`, padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{g}</button>;
                    })}
                  </div>
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={LABEL}>Poster URL *</label>
                  <input style={{ ...INPUT, borderColor: errors.poster ? "#e50914" : "#333" }} placeholder="https://image.tmdb.org/t/p/w500/..." value={form.poster} onChange={e => setForm(f => ({ ...f, poster: e.target.value }))} />
                  {form.poster && <img src={form.poster} alt="preview" style={{ marginTop: 8, height: 80, borderRadius: 6, objectFit: "cover" }} onError={(e: any) => e.target.style.display = "none"} />}
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={LABEL}>Backdrop URL (optional)</label>
                  <input style={INPUT} placeholder="https://image.tmdb.org/t/p/w1280/..." value={form.backdrop} onChange={e => setForm(f => ({ ...f, backdrop: e.target.value }))} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={LABEL}>Watch / Stream URL</label>
                  <input style={INPUT} placeholder="https://your-streaming-link.com/..." value={form.watchUrl} onChange={e => setForm(f => ({ ...f, watchUrl: e.target.value }))} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={LABEL}>Description</label>
                  <textarea style={{ ...INPUT, resize: "vertical", minHeight: 90 }} placeholder="Movie ka description..." value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button onClick={handleSubmit} style={{ background: "#e50914", color: "#fff", border: "none", padding: "13px 32px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>✓ Add to CineVerse</button>
                <button onClick={() => setForm(EMPTY_FORM)} style={{ background: "#222", color: "#aaa", border: "1px solid #444", padding: "13px 24px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Reset</button>
              </div>
            </div>
          )}

          {tab === "tmdb" && (
            <div>
              {!TMDB_API_KEY && (
                <div style={{ background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.4)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
                  <p style={{ color: "#f87171", fontSize: 13, margin: 0, lineHeight: 1.7 }}>
                    ⚠️ <b>TMDB API Key nahi hai!</b><br/>
                    Free key lo: <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>themoviedb.org/settings/api</a><br/>
                    Vercel mein add karo: <code style={{ background: "#222", padding: "1px 6px", borderRadius: 3 }}>NEXT_PUBLIC_TMDB_API_KEY</code>
                  </p>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                <input style={{ ...INPUT, flex: 1 }} placeholder="Movie ya series naam search karo..." value={tmdbQuery} onChange={e => setTmdbQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleTMDBSearch()} />
                <button onClick={handleTMDBSearch} style={{ background: "#e50914", color: "#fff", border: "none", padding: "0 24px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>{tmdbLoading ? "..." : "Search"}</button>
              </div>
              {tmdbResults.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h4 style={{ color: "#aaa", fontSize: 13, marginBottom: 14 }}>Search Results — click karke add karo</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
                    {tmdbResults.map((m: any) => {
                      const added = allMovies.some((x: any) => x.tmdbId === m.tmdbId);
                      return (
                        <div key={m.id} style={{ position: "relative" }}>
                          <MovieCard movie={m} onClick={() => !added && onImportTMDB(m)} adminMode={false} />
                          {added
                            ? <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#1a7f37", fontWeight: 700, fontSize: 12 }}>✓ Added</span></div>
                            : <button onClick={() => onImportTMDB(m)} style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", background: "#e50914", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>+ Add</button>
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {tmdbTrending.length > 0 && (
                <div>
                  <h4 style={{ color: "#aaa", fontSize: 13, marginBottom: 14 }}>🔥 Trending This Week</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
                    {tmdbTrending.map((m: any) => {
                      const added = allMovies.some((x: any) => x.tmdbId === m.tmdbId);
                      return (
                        <div key={m.id} style={{ position: "relative" }}>
                          <MovieCard movie={m} onClick={() => !added && onImportTMDB(m)} adminMode={false} />
                          {added
                            ? <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#1a7f37", fontWeight: 700, fontSize: 12 }}>✓ Added</span></div>
                            : <button onClick={() => onImportTMDB(m)} style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", background: "#e50914", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>+ Add</button>
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroSlider({ featured, onMovieClick }: { featured: any[]; onMovieClick: (m: any) => void }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<any>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % featured.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [featured.length]);
  if (!featured.length) return null;
  const movie = featured[current];
  return (
    <div style={{ position: "relative", width: "100%", height: 460, overflow: "hidden", borderRadius: 12, marginBottom: 36 }}>
      <img key={movie.id} src={movie.backdrop || movie.poster} alt={movie.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={(e: any) => { e.target.src = movie.poster; }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.45) 60%, transparent 100%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160, background: "linear-gradient(to top, #0a0a0a, transparent)" }} />
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: 32, maxWidth: 460 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {movie.genre?.slice(0, 2).map((g: string) => <span key={g} style={{ background: "rgba(229,9,20,0.2)", border: "1px solid rgba(229,9,20,0.5)", color: "#e50914", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{g}</span>)}
          <QualityBadge quality={movie.quality} />
        </div>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.2 }}>{movie.title}</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <StarRating rating={movie.rating} />
          <span style={{ color: "#aaa", fontSize: 13 }}>{movie.year}</span>
          <span style={{ color: "#aaa", fontSize: 13 }}>{movie.type}</span>
        </div>
        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{movie.desc?.slice(0, 140)}{(movie.desc?.length || 0) > 140 ? "..." : ""}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onMovieClick(movie)} style={{ background: "#e50914", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg> Watch Now
          </button>
          <button style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", padding: "12px 22px", borderRadius: 6, fontSize: 14, cursor: "pointer" }}>+ Watchlist</button>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
        {featured.map((_, i) => <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer", background: i === current ? "#e50914" : "rgba(255,255,255,0.3)", transition: "all 0.3s", padding: 0 }} />)}
      </div>
      <button onClick={() => setCurrent(c => (c - 1 + featured.length) % featured.length)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", fontSize: 20 }}>‹</button>
      <button onClick={() => setCurrent(c => (c + 1) % featured.length)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", fontSize: 20 }}>›</button>
    </div>
  );
}

function MovieModal({ movie, onClose }: { movie: any; onClose: () => void }) {
  if (!movie) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111", borderRadius: 16, overflow: "hidden", maxWidth: 800, width: "100%", maxHeight: "90vh", overflowY: "auto", border: "1px solid #333" }}>
        <div style={{ position: "relative", height: 280 }}>
          <img src={movie.backdrop || movie.poster} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e: any) => { e.target.src = movie.poster; }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #111 0%, rgba(0,0,0,0.2) 100%)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.7)", border: "1px solid #444", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
          <div style={{ position: "absolute", bottom: 0, left: 24, right: 24, paddingBottom: 18, display: "flex", gap: 18, alignItems: "flex-end" }}>
            <img src={movie.poster} alt={movie.title} style={{ width: 90, height: 135, objectFit: "cover", borderRadius: 8, border: "3px solid #333", flexShrink: 0 }} onError={(e: any) => { e.target.src = "https://via.placeholder.com/90x135/1a1a1a/666"; }} />
            <div>
              <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>{movie.title}</h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <StarRating rating={movie.rating} />
                <span style={{ color: "#aaa", fontSize: 13 }}>{movie.year}</span>
                <span style={{ color: "#aaa", fontSize: 13 }}>{movie.type}</span>
                <QualityBadge quality={movie.quality} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "20px 24px 28px" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {movie.genre?.map((g: string) => <span key={g} style={{ background: "rgba(229,9,20,0.12)", border: "1px solid rgba(229,9,20,0.3)", color: "#e50914", fontSize: 12, padding: "4px 12px", borderRadius: 20 }}>{g}</span>)}
          </div>
          <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.7, marginBottom: 22 }}>{movie.desc || "Description available soon."}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {movie.watchUrl
              ? <a href={movie.watchUrl} target="_blank" rel="noreferrer" style={{ background: "#e50914", color: "#fff", textDecoration: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>Watch Now</a>
              : <button style={{ background: "#e50914", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>▶ Watch Now</button>
            }
            <button style={{ background: "#222", color: "#fff", border: "1px solid #444", padding: "12px 22px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>+ Watchlist</button>
            <button style={{ background: "#222", color: "#fff", border: "1px solid #444", padding: "12px 22px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>⬇ Download</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, items, onMovieClick }: { title: string; items: any[]; onMovieClick: (m: any) => void }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 22, background: "#e50914", borderRadius: 2 }} />
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
          <span style={{ color: "#555", fontSize: 13 }}>{items.length}</span>
        </div>
        <button style={{ background: "none", border: "1px solid #333", color: "#888", padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer" }}>See All →</button>
      </div>
      {!items.length
        ? <div style={{ color: "#555", textAlign: "center", padding: "32px 0" }}>Admin Panel se movies add karo!</div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>{items.map(m => <MovieCard key={m.id} movie={m} onClick={onMovieClick} adminMode={false} />)}</div>
      }
    </section>
  );
}

function Navbar({ onSearch, searchQuery, activePage, setActivePage, onAdminOpen }: any) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 1000, background: "rgba(10,10,10,0.97)", borderBottom: "1px solid #1a1a1a", backdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", height: 58, gap: 8 }}>
        <div onClick={() => setActivePage("home")} style={{ cursor: "pointer", marginRight: 20, flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg,#e50914,#ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Cine</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>Verse</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {[["home","Home"],["movies","Movies"],["series","Series"]].map(([pg, label]) => (
            <button key={pg} onClick={() => setActivePage(pg)} style={{ background: "none", border: "none", color: activePage === pg ? "#e50914" : "#ccc", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "8px 12px", borderBottom: activePage === pg ? "2px solid #e50914" : "2px solid transparent" }}>{label}</button>
          ))}
          {NAV_DROPDOWNS.map(nav => (
            <div key={nav.label} style={{ position: "relative" }} onMouseEnter={() => setOpenMenu(nav.label)} onMouseLeave={() => setOpenMenu(null)}>
              <button style={{ background: "none", border: "none", color: "#ccc", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "8px 12px", display: "flex", alignItems: "center", gap: 4 }}>
                {nav.label} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6,9 12,15 18,9"/></svg>
              </button>
              {openMenu === nav.label && (
                <div style={{ position: "absolute", top: "100%", left: 0, background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "8px 0", minWidth: 170, boxShadow: "0 16px 40px rgba(0,0,0,0.8)", zIndex: 999 }}>
                  {nav.items.map((item: string) => (
                    <button key={item} style={{ display: "block", width: "100%", background: "none", border: "none", color: "#ccc", fontSize: 13, cursor: "pointer", padding: "7px 16px", textAlign: "left" }}
                      onMouseEnter={e => { (e.target as any).style.background = "rgba(229,9,20,0.1)"; (e.target as any).style.color = "#e50914"; }}
                      onMouseLeave={e => { (e.target as any).style.background = "none"; (e.target as any).style.color = "#ccc"; }}>{item}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <input placeholder="Search..." value={searchQuery} onChange={e => onSearch(e.target.value)}
            style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff", padding: "8px 12px 8px 34px", borderRadius: 20, fontSize: 13, outline: "none", width: 200 }}
            onFocus={e => (e.target as any).style.borderColor = "#e50914"}
            onBlur={e => (e.target as any).style.borderColor = "#333"} />
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <button onClick={onAdminOpen} style={{ background: "#1a1a1a", border: "1px solid #333", color: "#ccc", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>⚙ Admin</button>
        <button style={{ background: "#e50914", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Login</button>
      </div>
    </nav>
  );
}

function Sidebar({ allMovies }: { allMovies: any[] }) {
  const topMovies = [...allMovies].filter(m => m.type === "Movie").sort((a, b) => b.rating - a.rating).slice(0, 8);
  const topTV = [...allMovies].filter(m => m.type === "TV").sort((a, b) => b.rating - a.rating).slice(0, 8);
  const Box = ({ title, children }: any) => (
    <div style={{ background: "#111", borderRadius: 10, padding: 16, marginBottom: 18, border: "1px solid #1e1e1e" }}>
      <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: "0 0 14px", borderLeft: "3px solid #e50914", paddingLeft: 10 }}>{title}</h3>
      {children}
    </div>
  );
  const Item = ({ m, rank }: any) => (
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
      <span style={{ fontSize: 16, fontWeight: 900, color: rank < 3 ? "#e50914" : "#333", minWidth: 20, textAlign: "center" }}>{rank + 1}</span>
      <img src={m.poster} alt={m.title} style={{ width: 34, height: 50, objectFit: "cover", borderRadius: 4 }} onError={(e: any) => { e.target.src = "https://via.placeholder.com/34x50/1a1a1a/555"; }} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ fontSize: 12, color: "#ddd", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
        <StarRating rating={m.rating} />
      </div>
    </div>
  );
  return (
    <aside style={{ width: 260, flexShrink: 0 }}>
      <Box title="Top Movies">{topMovies.length ? topMovies.map((m, i) => <Item key={m.id} m={m} rank={i} />) : <p style={{ color: "#555", fontSize: 12 }}>Movies add karo</p>}</Box>
      <Box title="Top TV Shows">{topTV.length ? topTV.map((m, i) => <Item key={m.id} m={m} rank={i} />) : <p style={{ color: "#555", fontSize: 12 }}>Series add karo</p>}</Box>
      <Box title="Release Year">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[2026,2025,2024,2023,2022,2021,2020,2019].map(y => (
            <button key={y} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", fontSize: 12, padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}
              onMouseEnter={e => { (e.target as any).style.background = "#e50914"; (e.target as any).style.color = "#fff"; }}
              onMouseLeave={e => { (e.target as any).style.background = "#1a1a1a"; (e.target as any).style.color = "#888"; }}>{y}</button>
          ))}
        </div>
      </Box>
    </aside>
  );
}

export default function CineVerse() {
  const [movies, setMovies] = useState<any[]>([]);
  const [activePage, setActivePage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadFromStorage();
    setMovies(stored.length ? stored : SEED_MOVIES);
    if (!stored.length) saveToStorage(SEED_MOVIES);
  }, []);

  const addMovie = (movie: any) => {
    const updated = [movie, ...movies];
    setMovies(updated);
    saveToStorage(updated);
    setToast(`"${movie.title}" add ho gaya!`);
  };

  const deleteMovie = (id: any) => {
    const updated = movies.filter(m => m.id !== id);
    setMovies(updated);
    saveToStorage(updated);
    setToast("Title delete ho gaya");
  };

  const importTMDB = (movie: any) => {
    if (movies.some(m => m.tmdbId === movie.tmdbId)) { setToast("Pehle se add hai!"); return; }
    addMovie(movie);
  };

  const allMovies = movies.filter(m => m.type === "Movie");
  const allSeries = movies.filter(m => m.type === "TV");
  const featured  = movies.slice(0, 6);
  const filtered  = searchQuery.trim() ? movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())) : null;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} activePage={activePage} setActivePage={setActivePage} onAdminOpen={() => setAdminOpen(true)} />
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px" }}>
        {filtered ? (
          <div>
            <h2 style={{ color: "#fff", marginBottom: 20, fontSize: 18 }}>"<span style={{ color: "#e50914" }}>{searchQuery}</span>" — {filtered.length} results</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
              {filtered.map(m => <MovieCard key={m.id} movie={m} onClick={setSelectedMovie} adminMode={false} />)}
            </div>
            {!filtered.length && <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}><div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div><p>Koi result nahi mila</p></div>}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 26 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {activePage === "home" && (<><HeroSlider featured={featured} onMovieClick={setSelectedMovie} /><Section title="Latest Movies" items={allMovies} onMovieClick={setSelectedMovie} /><Section title="Web Series" items={allSeries} onMovieClick={setSelectedMovie} /></>)}
              {activePage === "movies" && <Section title="All Movies" items={allMovies} onMovieClick={setSelectedMovie} />}
              {activePage === "series" && <Section title="All Series" items={allSeries} onMovieClick={setSelectedMovie} />}
            </div>
            <Sidebar allMovies={movies} />
          </div>
        )}
      </div>
      <footer style={{ borderTop: "1px solid #1a1a1a", marginTop: 48, padding: "32px 20px 20px", textAlign: "center" }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 900, background: "linear-gradient(135deg,#e50914,#ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Cine</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Verse</span>
        </div>
        <p style={{ color: "#444", fontSize: 12 }}>© 2024 CineVerse — We do not host any files.</p>
      </footer>
      {adminOpen && <AdminPanel allMovies={movies} onAdd={addMovie} onDelete={deleteMovie} onClose={() => setAdminOpen(false)} onImportTMDB={importTMDB} />}
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
