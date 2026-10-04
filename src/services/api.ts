import { supabase } from './supabase';

const TMDB_API_KEY = '372574501f2196723577821c44adb688';
const BASE_URL = 'https://api.themoviedb.org/3';

export const TMDB_GENRES: Record<string, number> = {
  'Todos': 0,
  'Animación': 16,
  'Action & Adventure': 10759,
  'Sci-Fi & Fantasy': 10765,
  'Comedia': 35,
  'Drama': 18,
  'Misterio': 9648
};

export interface MappedAnime {
  id: string | number;
  title: string;
  image: string;
  score: string | number;
  totalEpisodes: number | null;
  episodes?: number | null;
  type: string;
  description: string;
  genres: string[];
  status: string;
  isCustom: boolean;
  banner?: string;
  contentType?: 'todos' | 'animes' | 'peliculas' | 'series';
}

export interface MappedServer {
  id?: string | number;
  name: string;
  description: string;
  url: string;
  color: string;
  icon: string;
  lang: string;
  skip_start?: number | null;
  skip_end?: number | null;
  outro_start?: number | null;
}

export interface MappedEpisode {
  id: number;
  episode_number: number;
  title: string;
  name?: string;
  season_number: number;
}

// Persistent and In-Memory Cache for ultra-fast instant loading (0ms)
const animeCache = new Map<string, MappedAnime>();

const initCacheFromStorage = () => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('animezona_global_anime_cache') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: MappedAnime) => {
          if (item && item.id && item.title && !item.title.startsWith('Anime #')) {
            animeCache.set(String(item.id), item);
          }
        });
      }
    }
  } catch {}
};

if (typeof window !== 'undefined') {
  initCacheFromStorage();
}

let syncCacheTimer: any = null;
const saveCacheToStorage = () => {
  if (typeof window === 'undefined') return;
  if (syncCacheTimer) clearTimeout(syncCacheTimer);
  syncCacheTimer = setTimeout(() => {
    try {
      const values = Array.from(animeCache.values()).slice(-250);
      localStorage.setItem('animezona_global_anime_cache', JSON.stringify(values));
    } catch {}
  }, 1000);
};

export const cacheAnime = (anime: MappedAnime) => {
  if (!anime || !anime.id || !anime.title || anime.title.startsWith('Anime #')) return;
  const idStr = String(anime.id).trim();
  if (idStr && idStr !== '[object Object]') {
    animeCache.set(idStr, anime);
    saveCacheToStorage();
  }
};

export const getCachedAnime = (id: string | number): MappedAnime | undefined => {
  const idStr = String(id).trim();
  return animeCache.get(idStr);
};

// Fast non-blocking fetcher with error resilience
const fetchWithDelay = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
};

const mapAnimeData = (item: any): MappedAnime => {
  const isMovie = Boolean(item.title && !item.name);
  const mapped: MappedAnime = {
    id: item.id,
    title: item.name || item.original_name || item.title || item.original_title || 'Sin Título',
    image: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
    banner: item.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
      : item.poster_path
      ? `https://image.tmdb.org/t/p/w1280${item.poster_path}`
      : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80',
    score: item.vote_average ? Number(item.vote_average).toFixed(1) : '9.0',
    totalEpisodes: item.number_of_episodes || (isMovie ? 1 : 12),
    episodes: item.number_of_episodes || (isMovie ? 1 : 12),
    type: isMovie ? 'Película' : (item.number_of_episodes ? 'TV' : 'Anime'),
    contentType: isMovie ? 'peliculas' : (item.original_language === 'ja' ? 'animes' : 'series'),
    description: item.overview || 'Sinopsis no disponible en este momento.',
    genres: item.genres
      ? item.genres.map((g: any) => (typeof g === 'object' && g.name ? g.name : String(g)))
      : ['Anime', 'Acción'],
    status: item.status === 'Ended' ? 'Finalizado' : (isMovie ? 'Finalizado' : 'En emisión'),
    isCustom: false
  };
  cacheAnime(mapped);
  return mapped;
};

const mapCustomAnime = (item: any): MappedAnime => {
  const isMovieOrSaga = (Number(item.total_episodes) === 1) || 
    /colecci[oó]n|pel[ií]cula|saga|harry potter|piratas del caribe|arma mortal|animales fant[aá]sticos|deadpool/i.test(item.title);
  const isAnime = /berserk|mysteries|cube|anime/i.test(item.title) || 
    (Array.isArray(item.genres) && item.genres.includes('Animación') && !isMovieOrSaga);
  const isSeries = !isMovieOrSaga && !isAnime;

  const mapped: MappedAnime = {
    id: item.id,
    title: item.title,
    image: item.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
    banner: item.image || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80',
    score: item.score || '9.5',
    totalEpisodes: item.total_episodes || 12,
    episodes: item.total_episodes || 12,
    type: isMovieOrSaga ? 'Película / Saga' : (isSeries ? 'Serie' : 'Anime'),
    contentType: isMovieOrSaga ? 'peliculas' : (isAnime ? 'animes' : 'series'),
    description: item.description || 'Sinopsis agregada por la comunidad AnimeZona.',
    genres: item.genres || ['Anime'],
    status: item.status || 'En emisión',
    isCustom: true
  };
  cacheAnime(mapped);
  return mapped;
};

export const api = {
  // Get custom animes from Supabase
  getCustomAnimes: async (includeSecret: boolean = false): Promise<MappedAnime[]> => {
    try {
      let query = supabase.from('custom_animes').select('*').order('created_at', { ascending: false });
      if (!includeSecret) {
        query = query.or('is_secret.is.null,is_secret.eq.false');
      }
      const { data, error } = await query;
      if (error || !data) return [];
      const mapped = data.map(mapCustomAnime);
      mapped.forEach(cacheAnime);
      return mapped;
    } catch (e) {
      console.error('Error fetching custom animes from supabase:', e);
      return [];
    }
  },

  // Get secret animes specifically
  getSecretAnimes: async (): Promise<MappedAnime[]> => {
    try {
      const { data, error } = await supabase
        .from('custom_animes')
        .select('*')
        .eq('is_secret', true);
      if (error || !data) return [];
      const mapped = data.map(mapCustomAnime);
      mapped.forEach(cacheAnime);
      return mapped;
    } catch (e) {
      return [];
    }
  },

  // Trending Anime for Home (with offline caching)
  getTrendingAnime: async (): Promise<MappedAnime[]> => {
    try {
      const custom = await api.getCustomAnimes();
      const url1 = `${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=es-MX&with_original_language=ja&sort_by=popularity.desc&page=1`;
      const res = await fetchWithDelay(url1);
      const tmdbMapped = (res?.results || []).map(mapAnimeData);
      const combined = [...custom, ...tmdbMapped];
      if (combined.length > 0) {
        localStorage.setItem('animezona_cached_trending', JSON.stringify(combined));
      }
      return combined;
    } catch (e) {
      console.warn('Offline or network error fetching trending anime, loading cache:', e);
      try {
        const cached = localStorage.getItem('animezona_cached_trending');
        if (cached) return JSON.parse(cached);
      } catch {}
      return [];
    }
  },

  // Top Rated Anime (with offline caching)
  getTopAnime: async (): Promise<MappedAnime[]> => {
    try {
      const custom = await api.getCustomAnimes();
      const url = `${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=es-MX&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=300&page=1`;
      const res = await fetchWithDelay(url);
      const tmdbMapped = (res?.results || []).map(mapAnimeData);
      const combined = [...custom.slice(0, 4), ...tmdbMapped];
      if (combined.length > 0) {
        localStorage.setItem('animezona_cached_top', JSON.stringify(combined));
      }
      return combined;
    } catch (e) {
      try {
        const cached = localStorage.getItem('animezona_cached_top');
        if (cached) return JSON.parse(cached);
      } catch {}
      return [];
    }
  },

  // Discover / Catalog with Genres, Type Filters & Infinite Scroll
  getDiscoverAnime: async (
    genreName: string = 'Todos',
    query: string = '',
    page: number = 1,
    typeFilter: string = 'todos'
  ): Promise<MappedAnime[]> => {
    try {
      let customAnimes: MappedAnime[] = [];
      const cleanQuery = query.trim().toLowerCase();

      if (page === 1) {
        const custom = await api.getCustomAnimes();
        customAnimes = custom;
        if (typeFilter && typeFilter !== 'todos') {
          customAnimes = customAnimes.filter((c) => c.contentType === typeFilter);
        }
        if (genreName !== 'Todos') {
          customAnimes = customAnimes.filter((c) => c.genres && c.genres.includes(genreName));
        }
        if (cleanQuery) {
          customAnimes = customAnimes.filter((c) => c.title.toLowerCase().includes(cleanQuery));
        }
      }

      let tmdbList: MappedAnime[] = [];
      if (cleanQuery) {
        if (typeFilter === 'peliculas') {
          const searchUrl = `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=es-MX&query=${encodeURIComponent(query.trim())}&page=${page}&include_adult=false`;
          const searchRes = await fetchWithDelay(searchUrl);
          tmdbList = (searchRes?.results || []).map(mapAnimeData);
        } else {
          const searchUrl = `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=es-MX&query=${encodeURIComponent(query.trim())}&page=${page}&include_adult=false`;
          const searchRes = await fetchWithDelay(searchUrl);
          tmdbList = (searchRes?.results || []).map(mapAnimeData);
        }
      } else {
        let url = '';
        if (typeFilter === 'peliculas') {
          const movieGenreMap: Record<string, number> = {
            'Animación': 16,
            'Action & Adventure': 28,
            'Sci-Fi & Fantasy': 878,
            'Comedia': 35,
            'Drama': 18,
            'Misterio': 9648
          };
          url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=es-MX&sort_by=popularity.desc&page=${page}&include_adult=false`;
          if (genreName !== 'Todos' && movieGenreMap[genreName]) {
            url += `&with_genres=${movieGenreMap[genreName]}`;
          }
        } else if (typeFilter === 'series') {
          url = `${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=es-MX&without_original_language=ja&sort_by=popularity.desc&page=${page}&include_adult=false`;
          if (genreName !== 'Todos' && TMDB_GENRES[genreName]) {
            url += `&with_genres=${TMDB_GENRES[genreName]}`;
          }
        } else {
          // 'todos' o 'animes' (Anime japonés)
          url = `${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=es-MX&with_original_language=ja&sort_by=popularity.desc&page=${page}&include_adult=false`;
          if (genreName !== 'Todos' && TMDB_GENRES[genreName]) {
            url += `&with_genres=${TMDB_GENRES[genreName]}`;
          }
        }

        const res = await fetchWithDelay(url);
        tmdbList = (res?.results || []).map(mapAnimeData);
      }

      // Prioritize exact match and title prefix
      let combined = [...customAnimes, ...tmdbList];
      if (cleanQuery) {
        combined.sort((a, b) => {
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          const aExact = aTitle === cleanQuery ? 3 : aTitle.startsWith(cleanQuery) ? 2 : aTitle.includes(cleanQuery) ? 1 : 0;
          const bExact = bTitle === cleanQuery ? 3 : bTitle.startsWith(cleanQuery) ? 2 : bTitle.includes(cleanQuery) ? 1 : 0;
          return bExact - aExact;
        });
      }

      if (page === 1 && genreName === 'Todos' && typeFilter === 'todos' && !cleanQuery && combined.length > 0) {
        localStorage.setItem('animezona_cached_catalog', JSON.stringify(combined));
      }
      return combined;
    } catch (e) {
      if (page === 1 && !query.trim()) {
        try {
          const cached = localStorage.getItem('animezona_cached_catalog');
          if (cached) return JSON.parse(cached);
        } catch {}
      }
      return [];
    }
  },

  // Related / Recommended anime based on search or anime ID
  getRelatedRecommendations: async (animeId: string | number): Promise<MappedAnime[]> => {
    try {
      const idStr = String(animeId);
      if (/^\d+$/.test(idStr)) {
        const url = `${BASE_URL}/tv/${idStr}/recommendations?api_key=${TMDB_API_KEY}&language=es-MX&page=1`;
        const res = await fetchWithDelay(url);
        if (res?.results && res.results.length > 0) {
          const list = res.results.slice(0, 8).map(mapAnimeData);
          list.forEach(cacheAnime);
          return list;
        }
      }
      // If custom or recommendations empty, provide related custom animes
      const customs = await api.getCustomAnimes();
      const filtered = customs.filter((c) => String(c.id) !== idStr);
      if (filtered.length > 0) return filtered.slice(0, 8);
      return [];
    } catch {
      return [];
    }
  },

  // Anime Info / Details: Supports cache (0ms), TMDB TV & Movie by ID, and Supabase custom animes
  getAnimeInfo: async (id: string | number): Promise<MappedAnime> => {
    const idStr = String(id).trim();
    if (!idStr || idStr === '[object Object]') {
      return {
        id: '0',
        title: 'Anime',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
        score: '9.0',
        totalEpisodes: 12,
        type: 'TV',
        description: '',
        genres: ['Anime'],
        status: 'En emisión',
        isCustom: false
      };
    }

    // 1. FAST PATH: Check memory and local storage cache (0ms)
    const cached = animeCache.get(idStr);
    if (cached && cached.title && !cached.title.startsWith('Anime #')) {
      return cached;
    }

    const fallbackObj: MappedAnime = {
      id: idStr,
      title: idStr.startsWith('custom-') ? 'Anime Especial' : `Anime #${idStr}`,
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
      score: '9.0',
      totalEpisodes: 12,
      type: 'TV',
      description: 'Anime añadido a tu colección.',
      genres: ['Anime'],
      status: 'En emisión',
      isCustom: idStr.startsWith('custom-')
    };

    try {
      // 2. Custom Anime by ID in Supabase
      if (idStr.startsWith('custom-')) {
        const { data } = await supabase.from('custom_animes').select('*').eq('id', idStr).maybeSingle();
        if (data) {
          const mapped = mapCustomAnime(data);
          cacheAnime(mapped);
          return mapped;
        }
        return fallbackObj;
      }

      // 3. Purely Numeric ID: TMDB TV or Movie
      if (/^\d+$/.test(idStr)) {
        // Try TMDB TV endpoint
        try {
          const url = `${BASE_URL}/tv/${idStr}?api_key=${TMDB_API_KEY}&language=es-MX`;
          const data = await fetchWithDelay(url);
          if (data && (data.name || data.original_name || data.title)) {
            const mapped = mapAnimeData(data);
            cacheAnime(mapped);
            return mapped;
          }
        } catch {}

        // Try TMDB Movie endpoint (for anime movies)
        try {
          const movieUrl = `${BASE_URL}/movie/${idStr}?api_key=${TMDB_API_KEY}&language=es-MX`;
          const movieData = await fetchWithDelay(movieUrl);
          if (movieData && (movieData.title || movieData.original_title || movieData.name)) {
            const mapped = mapAnimeData(movieData);
            mapped.type = 'Película';
            cacheAnime(mapped);
            return mapped;
          }
        } catch {}
      } else {
        // Non-numeric string: check custom animes by title in Supabase
        const { data: byTitle } = await supabase
          .from('custom_animes')
          .select('*')
          .ilike('title', idStr)
          .maybeSingle();
        if (byTitle) {
          const mapped = mapCustomAnime(byTitle);
          cacheAnime(mapped);
          return mapped;
        }
      }

      // 4. Fallback search by title on TMDB
      try {
        const searchUrl = `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=es-MX&query=${encodeURIComponent(idStr)}&page=1`;
        const searchRes = await fetchWithDelay(searchUrl);
        if (searchRes?.results && searchRes.results.length > 0) {
          const mapped = mapAnimeData(searchRes.results[0]);
          cacheAnime(mapped);
          return mapped;
        }
      } catch {}

      return fallbackObj;
    } catch {
      return fallbackObj;
    }
  },

  // Get list of episodes
  getAnimeEpisodes: async (id: string | number, animeTitle: string): Promise<MappedEpisode[]> => {
    try {
      const clean = animeTitle.trim().toLowerCase();
      const shortTitle = clean.split(/[:\-\(]/)[0].trim();

      // First check Supabase scraped episodes for this anime
      let query = supabase
        .from('anime_episodes')
        .select('episode_number, season_number, episode_name')
        .order('episode_number', { ascending: true });

      if (shortTitle && shortTitle !== clean) {
        query = query.or(`search_title.ilike.%${clean}%,search_title.ilike.%${shortTitle}%`);
      } else {
        query = query.ilike('search_title', `%${clean}%`);
      }

      const { data: scrapedEps } = await query;

      if (scrapedEps && scrapedEps.length > 0) {
        const unique = new Map<number, MappedEpisode>();
        for (const ep of scrapedEps) {
          if (!unique.has(ep.episode_number)) {
            unique.set(ep.episode_number, {
              id: ep.episode_number,
              episode_number: ep.episode_number,
              season_number: ep.season_number || 1,
              title: ep.episode_name || `Episodio ${ep.episode_number}`
            });
          }
        }
        return Array.from(unique.values()).sort((a, b) => a.episode_number - b.episode_number);
      }

      // Default episode generator (1 to total episodes or 12)
      const count = 12;
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        episode_number: i + 1,
        season_number: 1,
        title: `Episodio ${i + 1}`
      }));
    } catch (e) {
      return [
        { id: 1, episode_number: 1, season_number: 1, title: 'Episodio 1' }
      ];
    }
  },

  // Get real streaming servers from Supabase
  getEpisodeServers: async (
    animeTitle: string,
    episodeNum: number,
    language: string = 'latino'
  ): Promise<MappedServer[]> => {
    try {
      const clean = animeTitle.trim().toLowerCase();
      const shortTitle = clean.split(/[:\-\(]/)[0].trim();

      let query = supabase
        .from('anime_episodes')
        .select('*')
        .eq('episode_number', episodeNum)
        .order('created_at', { ascending: false });

      if (shortTitle && shortTitle !== clean) {
        query = query.or(`search_title.ilike.%${clean}%,search_title.ilike.%${shortTitle}%`);
      } else {
        query = query.ilike('search_title', `%${clean}%`);
      }

      const { data, error } = await query;

      if (data && data.length > 0) {
        const servers: MappedServer[] = data.map((item: any) => ({
          id: item.id,
          name: item.server_name || 'Servidor Oficial',
          description: `Servidor (${(item.language || 'Sub').toUpperCase()})`,
          url: item.video_url,
          color: item.server_name?.includes('FILEMOON')
            ? '#3b82f6'
            : item.server_name?.includes('EARNVIDS')
            ? '#10b981'
            : item.server_name?.includes('STREAMWISH')
            ? '#8b5cf6'
            : '#e11d48',
          icon: 'S',
          lang: item.language || 'latino',
          skip_start: item.skip_start,
          skip_end: item.skip_end,
          outro_start: item.outro_start
        }));

        // Deduplicate URLs
        const seen = new Set<string>();
        return servers.filter((s) => {
          if (!s.url || seen.has(s.url)) return false;
          seen.add(s.url);
          return true;
        });
      }
      return [];
    } catch (e) {
      console.error('Error fetching servers:', e);
      return [];
    }
  },

  // Add Server directly into Supabase live database!
  addServerToSupabase: async (
    animeTitle: string,
    episodeNumber: number,
    serverName: string,
    videoUrl: string,
    language: string = 'latino',
    episodeName: string = ''
  ) => {
    const payload = {
      search_title: animeTitle.trim().toLowerCase(),
      episode_number: episodeNumber,
      server_name: serverName.trim().toUpperCase(),
      video_url: videoUrl.trim(),
      language: language.toLowerCase(),
      episode_name: episodeName.trim() || `Episodio ${episodeNumber}`,
      season_number: 1,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('anime_episodes').insert([payload]).select();
    if (error) throw error;
    return data;
  }
};
