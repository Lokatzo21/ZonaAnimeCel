import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Maximize,
  Volume2,
  VolumeX,
  Search,
  Bookmark,
  Flame,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Download,
  Tv,
  Star,
  Layers,
  ArrowLeft,
  Eye,
  EyeOff,
  Heart,
  Check,
  Lightbulb,
  Cast,
  History,
  List,
  Lock,
  User,
  LogOut,
  FolderPlus,
  Compass,
  Edit2,
  X,
  Share2,
  Clock,
  Undo2,
  Sparkles,
  Wifi,
  WifiOff,
  Minimize2
} from 'lucide-react';
import { api, MappedAnime, MappedServer, MappedEpisode, TMDB_GENRES, cacheAnime, getCachedAnime } from './services/api';
import { supabase } from './services/supabase';
import { syncService } from './services/userSync';
import { ORIGINAL_AVATARS, DEFAULT_AVATAR } from './config/avatars';
import { App as CapApp } from '@capacitor/app';
import {
  setAppOrientationPortrait,
  setAppOrientationLandscape,
  enterAppFullscreen,
  exitAppFullscreen
} from './services/orientation';
import {
  HeroCarouselSkeleton,
  AnimeCardSkeleton,
  AnimeGridSkeleton,
  AnimeRowSkeleton,
  EpisodeListSkeleton
} from './components/Skeleton';

// Helper to strictly sanitize IDs and prevent [object Object] or invalid values
const cleanIdList = (list: any[]): string[] => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (typeof item === 'object' && item !== null) {
        return String(item.id || item.animeId || item.anime_id || '').trim();
      }
      return String(item).trim();
    })
    .filter((id) => id && id !== '[object Object]' && id !== 'null' && id !== 'undefined');
};

export default function App() {
  // Current authenticated user id
  const [userId, setUserId] = useState<string | null>(null);

  // Navigation: 'home' | 'catalog' | 'favorites' | 'profile' | 'secret'
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'favorites' | 'profile' | 'secret'>('home');
  // Profile sub-tabs: 'historial' | 'continuar' | 'favoritos' | 'listas' | 'ocultos' | 'cuenta'
  const [profileSubTab, setProfileSubTab] = useState<'historial' | 'continuar' | 'favoritos' | 'listas' | 'ocultos' | 'cuenta'>('historial');
  // Secret Zone sub-tabs: 'historial' | 'favoritos' | 'catalogo'
  const [secretSubTab, setSecretSubTab] = useState<'historial' | 'favoritos' | 'catalogo'>('historial');

  // Fullscreen player state (Modo inmersivo horizontal solo en pantalla completa)
  const [isFullscreenPlayer, setIsFullscreenPlayer] = useState(false);
  const isFullscreenPlayerRef = useRef(false);
  useEffect(() => {
    isFullscreenPlayerRef.current = isFullscreenPlayer;
  }, [isFullscreenPlayer]);

  // Anime Data with instant cache loading for 0ms initial render
  const [trendingAnimes, setTrendingAnimes] = useState<MappedAnime[]>(() => {
    try {
      const s = localStorage.getItem('animezona_cached_trending');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [topAnimes, setTopAnimes] = useState<MappedAnime[]>(() => {
    try {
      const s = localStorage.getItem('animezona_cached_top');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [catalogAnimes, setCatalogAnimes] = useState<MappedAnime[]>(() => {
    try {
      const s = localStorage.getItem('animezona_cached_catalog');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem('animezona_cached_trending');
      return !s || JSON.parse(s).length === 0;
    } catch {
      return true;
    }
  });
  const [catalogPage, setCatalogPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreCatalog, setHasMoreCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todos');

  // Related / Recommended animes during search
  const [relatedAnimes, setRelatedAnimes] = useState<MappedAnime[]>([]);

  // Offline connection state
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // Home Hero Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Secret Zone Data
  const [secretAnimes, setSecretAnimes] = useState<MappedAnime[]>([]);
  const [secretFavorites, setSecretFavorites] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('animezona_secret_favs') || localStorage.getItem('secretLikes');
      if (!s) return [];
      return cleanIdList(JSON.parse(s));
    } catch {
      return [];
    }
  });

  // Cached full objects for secret favorites so they ALWAYS show real images and titles
  const [secretAnimesData, setSecretAnimesData] = useState<MappedAnime[]>(() => {
    try {
      const s = localStorage.getItem('animezona_secret_objects');
      if (!s) return [];
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed.filter((a) => a && a.id && a.title && !a.title.startsWith('Anime #')) : [];
    } catch {
      return [];
    }
  });

  // Selected Anime Details & Watch Player
  const [selectedAnime, setSelectedAnime] = useState<MappedAnime | null>(null);
  const [episodesList, setEpisodesList] = useState<MappedEpisode[]>([]);
  const [activeSeason, setActiveSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState<MappedEpisode | null>(null);
  const [servers, setServers] = useState<MappedServer[]>([]);
  const [activeServer, setActiveServer] = useState<MappedServer | null>(null);
  const [loadingServers, setLoadingServers] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'latino' | 'sub' | 'castellano'>('latino');
  const [showNativeControls, setShowNativeControls] = useState(true);
  const [cinemaLightOff, setCinemaLightOff] = useState(false);
  const [showContinueOverlay, setShowContinueOverlay] = useState(false);
  const [savedResumeTime, setSavedResumeTime] = useState<number | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Modals & Prompts
  const [showCastModal, setShowCastModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAuthRequiredModal, setShowAuthRequiredModal] = useState<string | null>(null);
  const [secretRestoreConfirmId, setSecretRestoreConfirmId] = useState<string | null>(null);
  const [secretRemoveAnimeTarget, setSecretRemoveAnimeTarget] = useState<MappedAnime | null>(null);

  // User Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('animezona_logged_in') === 'true';
  });
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('animezona_username') || 'Lokatzo21';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('animezona_email') || 'manuelminuttimoreno21@gmail.com';
  });
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem('animezona_avatar') || DEFAULT_AVATAR;
  });

  // Login / Register Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmailInput, setLoginEmailInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Edit Profile Temp State
  const [editTempUsername, setEditTempUsername] = useState(username);
  const [editTempAvatar, setEditTempAvatar] = useState(userAvatar);

  // Stores: Support both website keys (favoriteAnimes, customLists, etc.) and app keys
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('animezona_favs') || localStorage.getItem('favoriteAnimes');
      if (!s) return [];
      return cleanIdList(JSON.parse(s));
    } catch {
      return [];
    }
  });

  // Cached full objects for favorite animes so they ALWAYS display and never get stuck loading
  const [favoriteAnimesData, setFavoriteAnimesData] = useState<MappedAnime[]>(() => {
    try {
      const s = localStorage.getItem('animezona_fav_objects');
      const sAlt = localStorage.getItem('animezona_favs') || localStorage.getItem('favoriteAnimes');
      let arr: MappedAnime[] = [];
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) arr = parsed.filter((a) => a && a.id && a.title && !a.title.startsWith('Anime #'));
      }
      if (sAlt) {
        const parsedAlt = JSON.parse(sAlt);
        if (Array.isArray(parsedAlt)) {
          const objs = parsedAlt.filter((a) => a && typeof a === 'object' && a.id && a.title && !a.title.startsWith('Anime #'));
          arr = [...arr, ...objs];
        }
      }
      const map = new Map<string, MappedAnime>();
      arr.forEach((a) => {
        if (a && a.id) map.set(String(a.id), a);
      });
      return Array.from(map.values());
    } catch {
      return [];
    }
  });

  const [hiddenRecommendations, setHiddenRecommendations] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('animezona_hidden_recommendations') || localStorage.getItem('hiddenAnimes');
      if (!s) return [];
      return cleanIdList(JSON.parse(s));
    } catch {
      return [];
    }
  });

  // Saved anime titles & images for hidden recommendations so they never appear broken/stuck
  const [hiddenDataMap, setHiddenDataMap] = useState<Record<string, { title: string; image: string }>>(() => {
    try {
      const s = localStorage.getItem('animezona_hidden_map');
      if (!s) return {};
      const parsed = JSON.parse(s);
      const clean: Record<string, { title: string; image: string }> = {};
      Object.keys(parsed || {}).forEach((k) => {
        if (k && k !== '[object Object]' && parsed[k]?.title && !parsed[k].title.startsWith('Anime #')) {
          clean[k] = parsed[k];
        }
      });
      return clean;
    } catch {
      return {};
    }
  });

  // Universal lookup across all memory stores & api cache
  const findAnimeInCache = (id: string | number): MappedAnime | undefined => {
    const idStr = String(id).trim();
    if (!idStr || idStr === '[object Object]') return undefined;
    const fast = getCachedAnime(idStr);
    if (fast && fast.title && !fast.title.startsWith('Anime #')) return fast;

    return (
      favoriteAnimesData.find((a) => String(a.id) === idStr) ||
      secretAnimesData.find((a) => String(a.id) === idStr) ||
      trendingAnimes.find((a) => String(a.id) === idStr) ||
      topAnimes.find((a) => String(a.id) === idStr) ||
      catalogAnimes.find((a) => String(a.id) === idStr) ||
      secretAnimes.find((a) => String(a.id) === idStr) ||
      relatedAnimes.find((a) => String(a.id) === idStr)
    );
  };

  // Helper to persist full secret anime object in cache
  const saveSecretAnimeObject = (anime: MappedAnime) => {
    if (!anime || !anime.id || anime.title.startsWith('Anime #')) return;
    const idStr = String(anime.id).trim();
    if (idStr === '[object Object]') return;
    setSecretAnimesData((prev) => {
      const filtered = prev.filter((a) => String(a.id) !== idStr);
      const updated = [...filtered, anime];
      localStorage.setItem('animezona_secret_objects', JSON.stringify(updated));
      return updated;
    });
  };

  // Helper to normalize continue watching data and eliminate NaNm NaNs
  const normalizeContinueItem = (item: any) => {
    if (!item) return null;
    const animeId = item.animeId || item.id || item.anime_id || '';
    const title = item.title || item.anime_title || item.name || 'Anime';
    const image = item.image || item.poster || item.banner || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80';
    const seasonNum = Number(item.seasonNum || item.season || item.season_number || 1) || 1;
    const episodeNum = Number(item.episodeNum || item.episode || item.episode_number || item.epNum || 1) || 1;
    const episodeName = item.episodeName || item.episode_name || item.epTitle || `Episodio ${episodeNum}`;
    const rawTime = Number(item.time ?? item.current_time ?? item.currentTime ?? item.progress ?? item.timestamp ?? 0);
    const time = isNaN(rawTime) || rawTime < 0 ? 0 : rawTime;
    const rawDuration = Number(item.duration ?? item.totalDuration ?? item.total_time ?? 1440);
    const duration = isNaN(rawDuration) || rawDuration <= 0 ? 1440 : rawDuration;

    return {
      animeId,
      title,
      image,
      seasonNum,
      episodeNum,
      episodeName,
      time,
      duration
    };
  };

  // Continue Watching: DEDUPLICATED BY ANIME ID (1 Card per Anime)
  const [continueWatching, setContinueWatching] = useState<
    { animeId: string | number; title: string; image: string; seasonNum: number; episodeNum: number; episodeName: string; time: number; duration: number }[]
  >(() => {
    try {
      const s = localStorage.getItem('animezona_continue') || localStorage.getItem('continueWatching');
      if (!s) return [];
      const parsed = JSON.parse(s);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeContinueItem).filter(Boolean) as any[];
    } catch {
      return [];
    }
  });

  // Distinct watched animes for Historial count
  const [watchedAnimesList, setWatchedAnimesList] = useState<MappedAnime[]>(() => {
    try {
      const s = localStorage.getItem('animezona_watched_animes') || localStorage.getItem('watchedAnimes');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Custom User Lists
  const [customLists, setCustomLists] = useState<{ id: string; name: string; animeIds: (string | number)[] }[]>(() => {
    try {
      const s = localStorage.getItem('animezona_custom_lists') || localStorage.getItem('customLists');
      return s ? JSON.parse(s) : [
        { id: 'list-1', name: 'Por ver este mes', animeIds: [] },
        { id: 'list-2', name: 'Obras Maestras', animeIds: [] }
      ];
    } catch {
      return [{ id: 'list-1', name: 'Por ver este mes', animeIds: [] }];
    }
  });

  // List edit states
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');
  const [newListName, setNewListName] = useState('');
  const [showCreateListInline, setShowCreateListInline] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Secret Press Timer (5 seconds long-press for secret favorites)
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSecretLongPressRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top helper: called on every menu navigation
  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Fullscreen Handlers (Inmersivo Real con sensor horizontal en ambos lados y sin barra de notificaciones/hora/batería)
  const enterPlayerFullscreen = async () => {
    setIsFullscreenPlayer(true);
    await enterAppFullscreen();
    if (playerContainerRef.current) {
      try {
        if (!document.fullscreenElement && playerContainerRef.current.requestFullscreen) {
          await playerContainerRef.current.requestFullscreen();
        }
      } catch (e) {}
    }
  };

  const exitPlayerFullscreen = async () => {
    setIsFullscreenPlayer(false);
    await exitAppFullscreen();
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (e) {}
  };

  const handleContainerFullscreen = () => {
    if (isFullscreenPlayer) {
      exitPlayerFullscreen();
    } else {
      enterPlayerFullscreen();
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Data Load
  useEffect(() => {
    loadInitialData();
    refreshSecretCatalog();

    // Check existing Supabase session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setIsLoggedIn(true);
        if (session.user.email) setUserEmail(session.user.email);
        if (session.user.user_metadata?.username) setUsername(session.user.user_metadata.username);
        if (session.user.user_metadata?.avatar_url) setUserAvatar(session.user.user_metadata.avatar_url);

        // Sync with user_profiles table in Supabase
        syncService.syncUserProfile(session.user.id, session.user.email || '');

        // Load persisted cloud data from user_sync table
        const cloudData = await syncService.loadUserData(session.user.id);
        if (cloudData.favoriteAnimes && Array.isArray(cloudData.favoriteAnimes)) {
          const cleanFavs = cloudData.favoriteAnimes
            .map((item: any) => (typeof item === 'object' && item !== null ? String(item.id || item.animeId || '') : String(item)))
            .filter((id: string) => id && id !== '[object Object]');
          const objs = cloudData.favoriteAnimes.filter((item: any) => item && typeof item === 'object' && item.title);
          if (objs.length > 0) {
            setFavoriteAnimesData((prev) => {
              const map = new Map<string, MappedAnime>();
              [...prev, ...objs].forEach((a) => {
                if (a && a.id) map.set(String(a.id), a);
              });
              const arr = Array.from(map.values());
              localStorage.setItem('animezona_fav_objects', JSON.stringify(arr));
              return arr;
            });
          }
          setFavorites(cleanFavs);
          localStorage.setItem('favoriteAnimes', JSON.stringify(cleanFavs));
        }
        if (cloudData.continueWatching && Array.isArray(cloudData.continueWatching)) {
          const cleanCw = cloudData.continueWatching.map(normalizeContinueItem).filter(Boolean) as any[];
          setContinueWatching(cleanCw);
          localStorage.setItem('continueWatching', JSON.stringify(cleanCw));
        }
        if (cloudData.customLists && Array.isArray(cloudData.customLists)) {
          setCustomLists(cloudData.customLists);
          localStorage.setItem('customLists', JSON.stringify(cloudData.customLists));
        }
        if (cloudData.watchedAnimes && Array.isArray(cloudData.watchedAnimes)) {
          setWatchedAnimesList(cloudData.watchedAnimes);
          localStorage.setItem('watchedAnimes', JSON.stringify(cloudData.watchedAnimes));
        }
        if (cloudData.secretLikes && Array.isArray(cloudData.secretLikes)) {
          const cleanSecrets = cleanIdList(cloudData.secretLikes);
          setSecretFavorites(cleanSecrets);
          localStorage.setItem('secretLikes', JSON.stringify(cleanSecrets));
        }
        if (cloudData.hiddenAnimes && Array.isArray(cloudData.hiddenAnimes)) {
          const cleanHidden = cleanIdList(cloudData.hiddenAnimes);
          setHiddenRecommendations(cleanHidden);
          localStorage.setItem('hiddenAnimes', JSON.stringify(cleanHidden));
        }
      }
    });

    // Online/Offline Network Listeners
    const handleOnline = () => {
      setIsOnline(true);
      showToast('🟢 ¡Conexión restablecida! Actualizando...');
      loadInitialData();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('⚠️ Sin conexión Wi-Fi/datos. Modo offline activo.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carousel auto-advance timer
  useEffect(() => {
    if (trendingAnimes.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % Math.min(5, trendingAnimes.length));
    }, 7000);
    return () => clearInterval(interval);
  }, [trendingAnimes]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [trending, top, initialCatalog] = await Promise.all([
        api.getTrendingAnime(),
        api.getTopAnime(),
        api.getDiscoverAnime('Todos', '', 1)
      ]);
      setTrendingAnimes(trending);
      setTopAnimes(top);
      setCatalogAnimes(initialCatalog);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const refreshSecretCatalog = async () => {
    const secret = await api.getSecretAnimes();
    setSecretAnimes(secret);
  };

  // Unified Auto-sync and resolution of missing anime metadata for Favorites, Secret Favorites, and Hidden Animes
  useEffect(() => {
    const cleanFavs = cleanIdList(favorites);
    const cleanSecrets = cleanIdList(secretFavorites);
    const cleanHidden = cleanIdList(hiddenRecommendations);

    const missingFavIds = cleanFavs.filter((id) => !favoriteAnimesData.some((a) => String(a.id) === id));
    const missingSecretIds = cleanSecrets.filter((id) => !secretAnimesData.some((a) => String(a.id) === id));
    const missingHiddenIds = cleanHidden.filter((id) => !hiddenDataMap[id] || hiddenDataMap[id].title?.startsWith('Anime #'));

    const allMissing = Array.from(new Set([...missingFavIds, ...missingSecretIds, ...missingHiddenIds]));
    if (allMissing.length === 0) return;

    let isMounted = true;
    Promise.all(
      allMissing.map(async (id) => {
        const inMem = findAnimeInCache(id);
        if (inMem && inMem.title && !inMem.title.startsWith('Anime #')) return inMem;
        try {
          const fetched = await api.getAnimeInfo(id);
          if (fetched && fetched.title && !fetched.title.startsWith('Anime #')) return fetched;
        } catch {}
        return null;
      })
    ).then((resolved) => {
      if (!isMounted) return;
      const valid = resolved.filter(Boolean) as MappedAnime[];
      if (valid.length === 0) return;

      // 1. Update favorites objects
      const newFavObjects = valid.filter((v) => cleanFavs.includes(String(v.id)));
      if (newFavObjects.length > 0) {
        setFavoriteAnimesData((prev) => {
          const map = new Map<string, MappedAnime>();
          [...prev, ...newFavObjects].forEach((a) => {
            if (a && a.id) map.set(String(a.id), a);
          });
          const arr = Array.from(map.values());
          localStorage.setItem('animezona_fav_objects', JSON.stringify(arr));
          return arr;
        });
      }

      // 2. Update secret objects
      const newSecretObjects = valid.filter((v) => cleanSecrets.includes(String(v.id)));
      if (newSecretObjects.length > 0) {
        setSecretAnimesData((prev) => {
          const map = new Map<string, MappedAnime>();
          [...prev, ...newSecretObjects].forEach((a) => {
            if (a && a.id) map.set(String(a.id), a);
          });
          const arr = Array.from(map.values());
          localStorage.setItem('animezona_secret_objects', JSON.stringify(arr));
          return arr;
        });
      }

      // 3. Update hidden data map
      const newHiddenObjects = valid.filter((v) => cleanHidden.includes(String(v.id)));
      if (newHiddenObjects.length > 0) {
        setHiddenDataMap((prev) => {
          const updated = { ...prev };
          newHiddenObjects.forEach((v) => {
            updated[String(v.id)] = { title: v.title, image: v.image };
          });
          localStorage.setItem('animezona_hidden_map', JSON.stringify(updated));
          return updated;
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [favorites, secretFavorites, hiddenRecommendations]);

  // Always scroll to top when changing active tab or selecting an anime
  useEffect(() => {
    scrollToTop();
  }, [activeTab, selectedAnime]);

  // Secret Search Trigger: typing "Secreto" opens the full Secret Zone screen
  useEffect(() => {
    if (searchQuery.trim().toLowerCase() === 'secreto') {
      setActiveTab('secret');
      setSearchQuery('');
      showToast('🔓 Entraste a la Zona Secreta');
    }
  }, [searchQuery]);

  // REFS FOR NATIVE HARDWARE BACK BUTTON & ANDROID SWIPE NAVIGATION
  const cinemaLightOffRef = useRef(cinemaLightOff);
  const showEditProfileModalRef = useRef(showEditProfileModal);
  const showAddToListModalRef = useRef(showAddToListModal);
  const showCastModalRef = useRef(showCastModal);
  const showLogoutConfirmRef = useRef(showLogoutConfirm);
  const showAuthRequiredModalRef = useRef(showAuthRequiredModal);
  const secretRestoreConfirmIdRef = useRef(secretRestoreConfirmId);
  const secretRemoveAnimeTargetRef = useRef(secretRemoveAnimeTarget);
  const currentEpisodeRef = useRef(currentEpisode);
  const selectedAnimeRef = useRef(selectedAnime);
  const searchQueryRef = useRef(searchQuery);
  const activeTabRef = useRef(activeTab);

  useEffect(() => { cinemaLightOffRef.current = cinemaLightOff; }, [cinemaLightOff]);
  useEffect(() => { showEditProfileModalRef.current = showEditProfileModal; }, [showEditProfileModal]);
  useEffect(() => { showAddToListModalRef.current = showAddToListModal; }, [showAddToListModal]);
  useEffect(() => { showCastModalRef.current = showCastModal; }, [showCastModal]);
  useEffect(() => { showLogoutConfirmRef.current = showLogoutConfirm; }, [showLogoutConfirm]);
  useEffect(() => { showAuthRequiredModalRef.current = showAuthRequiredModal; }, [showAuthRequiredModal]);
  useEffect(() => { secretRestoreConfirmIdRef.current = secretRestoreConfirmId; }, [secretRestoreConfirmId]);
  useEffect(() => { secretRemoveAnimeTargetRef.current = secretRemoveAnimeTarget; }, [secretRemoveAnimeTarget]);
  useEffect(() => { currentEpisodeRef.current = currentEpisode; }, [currentEpisode]);
  useEffect(() => { selectedAnimeRef.current = selectedAnime; }, [selectedAnime]);
  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // Push history state whenever navigating into a subview so Android gesture swipe back works
  useEffect(() => {
    if (selectedAnime || currentEpisode || showEditProfileModal || showAddToListModal || cinemaLightOff) {
      window.history.pushState({ animezonaSubView: true }, '');
    }
  }, [selectedAnime?.id, currentEpisode?.id, showEditProfileModal, showAddToListModal, cinemaLightOff]);

  // HARDWARE BACK BUTTON & GESTURE NAVIGATION HANDLER
  useEffect(() => {
    let backListener: any = null;
    let lastBackPressTime = 0;

    const handleBackNavigation = () => {
      // 1. Apagar luz activa -> encender luz
      if (cinemaLightOffRef.current) {
        setCinemaLightOff(false);
        return true;
      }
      // 2. Modales abiertos -> cerrarlos
      if (showEditProfileModalRef.current) {
        setShowEditProfileModal(false);
        return true;
      }
      if (showAddToListModalRef.current) {
        setShowAddToListModal(false);
        return true;
      }
      if (showCastModalRef.current) {
        setShowCastModal(false);
        return true;
      }
      if (showLogoutConfirmRef.current) {
        setShowLogoutConfirm(false);
        return true;
      }
      if (showAuthRequiredModalRef.current) {
        setShowAuthRequiredModal(null);
        return true;
      }
      if (secretRestoreConfirmIdRef.current) {
        setSecretRestoreConfirmId(null);
        return true;
      }
      if (secretRemoveAnimeTargetRef.current) {
        setSecretRemoveAnimeTarget(null);
        return true;
      }
      // 2.5. Si está en pantalla completa de video (MP4 o Embed) -> salir de pantalla completa y volver a vertical
      if (isFullscreenPlayerRef.current) {
        exitPlayerFullscreen();
        return true;
      }
      // 3. Viendo episodio en reproductor -> volver a la ficha del anime
      if (currentEpisodeRef.current) {
        setCurrentEpisode(null);
        return true;
      }
      // 4. Viendo ficha del anime -> volver al catálogo o inicio
      if (selectedAnimeRef.current) {
        setSelectedAnime(null);
        return true;
      }
      // 5. Búsqueda con texto -> limpiar búsqueda
      if (searchQueryRef.current.trim().length > 0) {
        setSearchQuery('');
        return true;
      }
      // 6. En otra pestaña distinta de 'home' -> regresar a 'home'
      if (activeTabRef.current !== 'home') {
        setActiveTab('home');
        return true;
      }

      // 7. En 'home' sin nada abierto -> doble toque para salir de la app
      const now = Date.now();
      if (now - lastBackPressTime < 2000) {
        CapApp.exitApp();
        return false;
      } else {
        lastBackPressTime = now;
        showToast('Presiona de nuevo para salir de AnimeZona');
        return true;
      }
    };

    // Hardware back button en Android (Capacitor)
    CapApp.addListener('backButton', () => {
      handleBackNavigation();
    }).then((listener) => {
      backListener = listener;
    }).catch((err) => {
      console.log('CapApp backButton listener:', err);
    });

    // Gestos de deslizar para volver / botón atrás del navegador web
    const onPopState = () => {
      handleBackNavigation();
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      if (backListener) {
        backListener.remove();
      }
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  // 1. Al montar la aplicación: asegurar que siempre inicie bloqueada en vertical
  useEffect(() => {
    setAppOrientationPortrait();
  }, []);

  // 2. Control dinámico de orientación:
  // - En navegación normal y dentro del anime: VERTICAL
  // - Si el usuario sale del reproductor estando en pantalla completa: regresar a vertical y restaurar barras
  useEffect(() => {
    if (!currentEpisode && isFullscreenPlayerRef.current) {
      exitPlayerFullscreen();
    }
  }, [currentEpisode]);

  // 3. Listener nativo para cambios de pantalla completa del navegador / iframe embed
  useEffect(() => {
    const onFullscreenChange = () => {
      const isFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (isFull) {
        setIsFullscreenPlayer(true);
        enterAppFullscreen();
      } else {
        setIsFullscreenPlayer(false);
        exitAppFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  // AUTO-SCROLL TO ACTIVE EPISODE IN THE LIST
  useEffect(() => {
    if (currentEpisode) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`ep-card-${currentEpisode.episode_number}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentEpisode]);

  // Infinite Scroll Handler for Catalog
  const loadMoreCatalog = async () => {
    if (loadingMore || !hasMoreCatalog) return;
    setLoadingMore(true);
    const nextPage = catalogPage + 1;
    try {
      const newItems = await api.getDiscoverAnime(selectedGenre, searchQuery, nextPage);
      if (newItems.length === 0) {
        setHasMoreCatalog(false);
      } else {
        setCatalogAnimes((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const filtered = newItems.filter((a) => !existingIds.has(a.id));
          return [...prev, ...filtered];
        });
        setCatalogPage(nextPage);
      }
    } catch (e) {
      console.error('Error loading more catalog:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleGenreChange = async (genre: string) => {
    setSelectedGenre(genre);
    setCatalogPage(1);
    setHasMoreCatalog(true);
    setLoading(true);
    try {
      const res = await api.getDiscoverAnime(genre, searchQuery, 1);
      setCatalogAnimes(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 0 && activeTab !== 'catalog') {
      setSelectedAnime(null);
      setCurrentEpisode(null);
      setActiveTab('catalog');
    }
    setCatalogPage(1);
    setHasMoreCatalog(true);
    const clean = q.trim();
    if (!clean) {
      setRelatedAnimes([]);
      try {
        const res = await api.getDiscoverAnime(selectedGenre, '', 1);
        setCatalogAnimes(res);
      } catch (e) {
        console.error(e);
      }
      return;
    }

    try {
      const res = await api.getDiscoverAnime(selectedGenre, clean, 1);
      setCatalogAnimes(res);

      // Instantly fetch related & recommended animes if there is a primary match
      if (res.length > 0 && res[0].id) {
        api.getRelatedRecommendations(res[0].id).then((rel) => {
          const directIds = new Set(res.map((r) => String(r.id)));
          const uniqueRel = rel.filter((r) => !directIds.has(String(r.id)));
          setRelatedAnimes(uniqueRel);
        });
      } else {
        setRelatedAnimes([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset and reload fresh catalog every time the user enters
  const resetAndOpenCatalog = async () => {
    setSelectedAnime(null);
    setCurrentEpisode(null);
    setActiveTab('catalog');
    setSearchQuery('');
    setRelatedAnimes([]);
    setSelectedGenre('Todos');
    setCatalogPage(1);
    setHasMoreCatalog(true);
    setLoading(true);
    try {
      const res = await api.getDiscoverAnime('Todos', '', 1);
      setCatalogAnimes(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // LocalStorage Persist Helpers (Saved both to app keys and website keys + Supabase user_sync)
  const saveFavorites = (favs: string[], explicitObjects?: any[]) => {
    const cleanFavIds = cleanIdList(favs);
    setFavorites(cleanFavIds);
    localStorage.setItem('animezona_favs', JSON.stringify(cleanFavIds));

    let sourceObjs = explicitObjects && explicitObjects.length > 0 ? explicitObjects : favoriteAnimesData;
    if (!sourceObjs || sourceObjs.length === 0) {
      try {
        const stored = localStorage.getItem('animezona_fav_objects');
        if (stored) sourceObjs = JSON.parse(stored);
      } catch {}
    }
    sourceObjs = Array.isArray(sourceObjs) ? sourceObjs : [];

    const fullObjects = cleanFavIds.map((id) => {
      const found = sourceObjs.find((o: any) => String(o?.id).trim() === id) || findAnimeInCache(id);
      if (found && found.title && !found.title.startsWith('Anime #')) {
        return {
          id: String(found.id),
          title: found.title,
          image: found.image || (found as any).coverImage || ''
        };
      }
      return { id: String(id) };
    });

    localStorage.setItem('favoriteAnimes', JSON.stringify(fullObjects));
    if (userId) syncService.saveUserKey(userId, 'favoriteAnimes', fullObjects);
  };

  const saveSecretFavorites = (sf: string[]) => {
    const cleanIds = cleanIdList(sf);
    setSecretFavorites(cleanIds);
    localStorage.setItem('animezona_secret_favs', JSON.stringify(cleanIds));

    const sourceObjs = [...secretAnimesData, ...favoriteAnimesData];
    const fullObjs = cleanIds.map((id) => {
      const found = sourceObjs.find((o: any) => String(o?.id).trim() === id) || findAnimeInCache(id);
      if (found && found.title) {
        return { id: String(found.id), title: found.title, image: found.image || (found as any).coverImage || '' };
      }
      return { id: String(id) };
    });

    localStorage.setItem('secretLikes', JSON.stringify(fullObjs));
    if (userId) syncService.saveUserKey(userId, 'secretLikes', fullObjs);
  };

  const saveHidden = (hidden: string[]) => {
    const cleanIds = cleanIdList(hidden);
    setHiddenRecommendations(cleanIds);
    localStorage.setItem('animezona_hidden_recommendations', JSON.stringify(cleanIds));

    const fullObjs = cleanIds.map((id) => {
      const found = findAnimeInCache(id);
      if (found && found.title) {
        return { id: String(found.id), title: found.title, image: found.image || (found as any).coverImage || '' };
      }
      return { id: String(id) };
    });

    localStorage.setItem('hiddenAnimes', JSON.stringify(fullObjs));
    if (userId) syncService.saveUserKey(userId, 'hiddenAnimes', fullObjs);
  };

  const saveContinueWatching = (cw: typeof continueWatching) => {
    setContinueWatching(cw);
    localStorage.setItem('animezona_continue', JSON.stringify(cw));
    const webCw = cw.map((item: any) => ({
      ...item,
      id: item.animeId || item.id,
      timestamp: item.time ?? item.timestamp ?? 0
    }));
    localStorage.setItem('continueWatching', JSON.stringify(webCw));
    if (userId) syncService.saveUserKey(userId, 'continueWatching', webCw);
  };

  const saveWatchedAnimes = (wa: MappedAnime[]) => {
    setWatchedAnimesList(wa);
    localStorage.setItem('animezona_watched_animes', JSON.stringify(wa));
    localStorage.setItem('watchedAnimes', JSON.stringify(wa));
    if (userId) syncService.saveUserKey(userId, 'watchedAnimes', wa);
  };

  const saveCustomLists = (lists: typeof customLists) => {
    setCustomLists(lists);
    localStorage.setItem('animezona_custom_lists', JSON.stringify(lists));
    localStorage.setItem('customLists', JSON.stringify(lists));
    if (userId) syncService.saveUserKey(userId, 'customLists', lists);
  };

  // CHECK AUTH REQUIREMENT BEFORE SAVING
  const checkAuthOrPrompt = (actionMessage: string): boolean => {
    if (!isLoggedIn) {
      setShowAuthRequiredModal(actionMessage);
      return false;
    }
    return true;
  };

  // Helper to accurately determine if an anime is in favorites (by ID or Title)
  const isAnimeFavorited = (anime: MappedAnime | { id: string | number; title?: string } | null | undefined): boolean => {
    if (!anime) return false;
    const idStr = String(anime.id).trim();
    const titleLower = anime.title ? anime.title.trim().toLowerCase() : '';

    if (favorites.some((f) => String(f).trim() === idStr)) return true;

    if (titleLower) {
      if (favoriteAnimesData.some((fav) => fav.title && fav.title.trim().toLowerCase() === titleLower)) return true;
      if (favorites.some((f) => String(f).trim().toLowerCase() === titleLower)) return true;
    }
    return false;
  };

  // Toggle Favorite & 5-Second Long Press for Secret Favorites
  const handleLikeTouchStart = (animeOrId: MappedAnime | string | number) => {
    isSecretLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isSecretLongPressRef.current = true;
      const animeObj = typeof animeOrId === 'object' && animeOrId !== null ? animeOrId : findAnimeInCache(animeOrId);
      const idStr = String(animeObj ? animeObj.id : animeOrId).trim();
      if (!idStr || idStr === '[object Object]') return;

      const cleanSecrets = cleanIdList(secretFavorites);
      const updatedSecret = cleanSecrets.includes(idStr) ? cleanSecrets : [...cleanSecrets, idStr];
      saveSecretFavorites(updatedSecret);

      if (animeObj && animeObj.title && !animeObj.title.startsWith('Anime #')) {
        saveSecretAnimeObject(animeObj);
      } else {
        api.getAnimeInfo(idStr).then((info) => {
          if (info && info.title && !info.title.startsWith('Anime #')) {
            saveSecretAnimeObject(info);
          }
        });
      }

      const cleanNormal = cleanIdList(favorites);
      const updatedNormal = cleanNormal.filter((id) => id !== idStr);
      saveFavorites(updatedNormal);
      if (navigator.vibrate) navigator.vibrate(100);
      showToast('Enviado a Zona Secreta ★');
    }, 5000);
  };

  const handleLikeTouchEnd = (anime: MappedAnime | string | number, e?: any) => {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (isSecretLongPressRef.current) {
      return;
    }
    // Normal like toggle
    toggleFavorite(anime, e);
  };

  const toggleFavorite = (anime: MappedAnime | string | number, e?: any) => {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }

    let animeId: string | number;
    let animeObj: MappedAnime | undefined;

    if (typeof anime === 'object' && anime !== null) {
      animeId = anime.id;
      animeObj = anime;
    } else {
      animeId = anime;
      animeObj = findAnimeInCache(anime);
    }

    const idStr = String(animeId).trim();
    if (!idStr || idStr === '[object Object]') return;

    const isFav = isAnimeFavorited(animeObj || { id: idStr });
    const cleanCurrent = cleanIdList(favorites);

    let updatedFavorites: string[];
    let updatedData: MappedAnime[] = [];
    if (isFav) {
      const titleLower = animeObj?.title?.trim().toLowerCase();
      updatedFavorites = cleanCurrent.filter((f) => {
        if (f === idStr) return false;
        if (titleLower && f.toLowerCase() === titleLower) return false;
        return true;
      });
      updatedData = favoriteAnimesData.filter((a) => {
        if (String(a.id).trim() === idStr) return false;
        if (titleLower && a.title && a.title.trim().toLowerCase() === titleLower) return false;
        return true;
      });
      setFavoriteAnimesData(updatedData);
      localStorage.setItem('animezona_fav_objects', JSON.stringify(updatedData));
      showToast('Eliminado de Favoritos');
      saveFavorites(updatedFavorites, updatedData);
    } else {
      updatedFavorites = [...cleanCurrent.filter((f) => f !== idStr), idStr];
      const targetObj = (animeObj && animeObj.title && !animeObj.title.startsWith('Anime #')) 
        ? animeObj 
        : findAnimeInCache(idStr);

      if (targetObj && targetObj.title && !targetObj.title.startsWith('Anime #')) {
        updatedData = [
          ...favoriteAnimesData.filter((a) => String(a.id).trim() !== idStr),
          targetObj
        ];
        setFavoriteAnimesData(updatedData);
        localStorage.setItem('animezona_fav_objects', JSON.stringify(updatedData));
        saveFavorites(updatedFavorites, updatedData);
      } else {
        saveFavorites(updatedFavorites);
        api.getAnimeInfo(idStr).then((info) => {
          if (info && info.title && !info.title.startsWith('Anime #')) {
            setFavoriteAnimesData((prev) => {
              const u = [...prev.filter((a) => String(a.id).trim() !== idStr), info];
              localStorage.setItem('animezona_fav_objects', JSON.stringify(u));
              saveFavorites(updatedFavorites, u);
              return u;
            });
          }
        });
      }
      showToast('Añadido a Favoritos ❤️');
    }
  };

  // Restore Secret Favorite back to Normal
  const handleRestoreSecretFavorite = (animeId: string) => {
    const updatedSecret = secretFavorites.filter((id) => id !== animeId);
    saveSecretFavorites(updatedSecret);
    if (!favorites.includes(animeId)) {
      saveFavorites([...favorites, animeId]);
    }
    setSecretRestoreConfirmId(null);
    showToast('Devuelto a tus favoritos normales');
  };

  // Remove Anime from Secret Catalog (Allows taking out The Super Cube or any other anime)
  const handleRemoveFromSecretCatalog = async (anime: MappedAnime) => {
    try {
      await supabase.from('custom_animes').update({ is_secret: false }).eq('id', anime.id);
      setSecretAnimes((prev) => prev.filter((a) => a.id !== anime.id));
      setSecretRemoveAnimeTarget(null);
      showToast(`"${anime.title}" se retiró de la Zona Secreta y volvió al catálogo normal.`);
      loadInitialData();
    } catch (e) {
      showToast('Error al actualizar en la base de datos');
    }
  };

  // Hide Recommendation: stores ID and metadata so it NEVER gets stuck or shows broken image
  const hideRecommendation = (animeOrId: MappedAnime | string | number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const animeObj = typeof animeOrId === 'object' && animeOrId !== null ? animeOrId : findAnimeInCache(animeOrId);
    const animeId = animeObj ? animeObj.id : animeOrId;
    const idStr = String(animeId).trim();
    if (!idStr || idStr === '[object Object]') return;

    if (animeObj && animeObj.title && !animeObj.title.startsWith('Anime #')) {
      const updatedMap = { ...hiddenDataMap, [idStr]: { title: animeObj.title, image: animeObj.image } };
      setHiddenDataMap(updatedMap);
      localStorage.setItem('animezona_hidden_map', JSON.stringify(updatedMap));
    } else {
      api.getAnimeInfo(idStr).then((info) => {
        if (info && info.title && !info.title.startsWith('Anime #')) {
          setHiddenDataMap((prev) => {
            const u = { ...prev, [idStr]: { title: info.title, image: info.image } };
            localStorage.setItem('animezona_hidden_map', JSON.stringify(u));
            return u;
          });
        }
      });
    }

    const cleanHidden = cleanIdList(hiddenRecommendations);
    if (!cleanHidden.includes(idStr)) {
      const updated = [...cleanHidden, idStr];
      saveHidden(updated);
    }
    showToast('Recomendación oculta (Ver en Perfil > Animes Ocultos)');
  };

  const restoreRecommendation = (animeId: string | number) => {
    const idStr = String(animeId);
    const updated = hiddenRecommendations.filter((id) => id !== idStr);
    saveHidden(updated);
    showToast('Recomendación restaurada');
  };

  // Server Sorting Priority (MP4: ZONAAPS, CINEBEL first!)
  const sortServers = (srvList: MappedServer[]): MappedServer[] => {
    const getPriority = (name: string): number => {
      const n = name.toUpperCase();
      if (n.includes('ZONAAPS')) return 1;
      if (n.includes('CINEBEL')) return 2;
      if (n.includes('MULTI-AUDIO') || n.includes('MULTI - AUDIO')) return 3;
      if (n.includes('EARNVIDS')) return 4;
      if (n.includes('STREAMWISH')) return 5;
      if (n.includes('UQLOAD')) return 6;
      if (n.includes('FILEMOON')) return 7;
      if (n.includes('ARCHIVE')) return 8;
      return 90;
    };
    return [...srvList].sort((a, b) => getPriority(a.name) - getPriority(b.name));
  };

  // Select Anime -> Opens Details Page
  const openAnimeDetails = async (anime: MappedAnime) => {
    setSelectedAnime(anime);
    setCurrentEpisode(null);
    setLoadingServers(true);
    try {
      const eps = await api.getAnimeEpisodes(anime.id, anime.title);
      setEpisodesList(eps);
      const seasons = Array.from(new Set(eps.map((e) => e.season_number || 1))).sort((a, b) => a - b);
      if (seasons.length > 0) setActiveSeason(seasons[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingServers(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select Episode -> Opens Watch Screen
  const playEpisode = async (anime: MappedAnime, ep: MappedEpisode, autoPlayDirect = false) => {
    setCurrentEpisode(ep);
    setLoadingServers(true);
    setCinemaLightOff(false);
    setCurrentVideoTime(0);

    // Track anime in distinct watched list (if logged in)
    if (isLoggedIn && !watchedAnimesList.some((a) => String(a.id) === String(anime.id))) {
      const updatedWatched = [anime, ...watchedAnimesList];
      saveWatchedAnimes(updatedWatched);
    }

    // Check if there was a saved time in continueWatching
    const saved = continueWatching.find((c) => String(c.animeId) === String(anime.id));
    if (saved && saved.episodeNum === ep.episode_number && saved.time > 15 && !autoPlayDirect) {
      setSavedResumeTime(saved.time);
      setShowContinueOverlay(true);
    } else {
      setShowContinueOverlay(false);
      setSavedResumeTime(null);
    }

    try {
      const rawSrvs = await api.getEpisodeServers(anime.title, ep.episode_number, selectedLanguage);
      const sorted = sortServers(rawSrvs);
      setServers(sorted);
      setActiveServer(sorted.length > 0 ? sorted[0] : null);

      // Deduplicate continue watching (1 card per anime) only if logged in
      if (isLoggedIn) {
        const newItem = {
          animeId: anime.id,
          title: anime.title,
          image: anime.image,
          seasonNum: ep.season_number || 1,
          episodeNum: ep.episode_number,
          episodeName: ep.title,
          time: saved && saved.episodeNum === ep.episode_number ? saved.time : 1,
          duration: 1440
        };
        const filtered = continueWatching.filter((c) => String(c.animeId) !== String(anime.id));
        saveContinueWatching([newItem, ...filtered]);
      }

      if (autoPlayDirect) {
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
          }
        }, 300);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingServers(false);
    }
  };

  // Video Time Update
  const handleTimeUpdate = () => {
    if (!videoRef.current || !selectedAnime || !currentEpisode || !isLoggedIn) return;
    const current = Math.floor(videoRef.current.currentTime);
    const total = Math.floor(videoRef.current.duration || 1440);
    setCurrentVideoTime(current);
    setVideoDuration(total);

    if (current > 5 && current % 5 === 0) {
      const updated = continueWatching.map((item) => {
        if (String(item.animeId) === String(selectedAnime.id)) {
          return { ...item, time: current, duration: total };
        }
        return item;
      });
      saveContinueWatching(updated);
    }
  };

  // Skip Intro
  const handleSkipIntro = () => {
    if (!videoRef.current || !activeServer?.skip_end) return;
    videoRef.current.currentTime = activeServer.skip_end;
    showToast('Intro saltada');
  };

  // Next Episode Action: ONLY when user explicitly clicks "Ver ya", plays directly AND enters fullscreen!
  const handleNextEpisodeVerYa = () => {
    if (!selectedAnime || !currentEpisode) return;
    const nextEp = episodesList.find((e) => e.episode_number === currentEpisode.episode_number + 1);
    if (nextEp) {
      playEpisode(selectedAnime, nextEp, true);
      showToast(`Reproduciendo T${nextEp.season_number || 1}E${nextEp.episode_number}`);
      setTimeout(() => {
        enterPlayerFullscreen();
      }, 400);
    }
  };

  // Download MP4 Helper
  const downloadMp4 = () => {
    if (!activeServer || !activeServer.url) return;
    const isDirectMp4 = activeServer.url.toLowerCase().includes('.mp4');
    if (isDirectMp4) {
      const a = document.createElement('a');
      a.href = activeServer.url;
      a.download = `${selectedAnime?.title || 'Anime'}_Ep${currentEpisode?.episode_number || 1}.mp4`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Iniciando descarga MP4...');
    } else {
      window.open(activeServer.url, '_blank');
      showToast('Abriendo enlace de descarga...');
    }
  };

  // List Operations
  const handleMoveList = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= customLists.length) return;
    const updated = [...customLists];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    saveCustomLists(updated);
    showToast('Listas reordenadas');
  };

  const handleToggleAnimeInList = (listId: string, animeId: string | number) => {
    const cleanId = typeof animeId === 'object' && animeId !== null ? (animeId as any).id : animeId;
    const idStr = String(cleanId).trim();
    if (!idStr || idStr === '[object Object]') return;

    const updated = customLists.map((l) => {
      if (l.id === listId) {
        const cleanIds = (l.animeIds || []).map((id) => String(id));
        const has = cleanIds.includes(idStr);
        return {
          ...l,
          animeIds: has ? cleanIds.filter((id) => id !== idStr) : [...cleanIds, idStr]
        };
      }
      return l;
    });
    saveCustomLists(updated);
    showToast('Listas actualizadas');
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const newList = {
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      animeIds: selectedAnime ? [String(selectedAnime.id)] : []
    };
    saveCustomLists([...customLists, newList]);
    setNewListName('');
    showToast(`Lista "${newList.name}" creada.`);
  };

  const handleSaveEditList = (listId: string) => {
    if (!editingListName.trim()) return;
    const updated = customLists.map((l) => (l.id === listId ? { ...l, name: editingListName.trim() } : l));
    saveCustomLists(updated);
    setEditingListId(null);
    setEditingListName('');
    showToast('Nombre de la lista actualizado.');
  };

  const handleDeleteList = (listId: string) => {
    saveCustomLists(customLists.filter((l) => l.id !== listId));
    showToast('Lista eliminada');
  };

  // Profile Edit Save
  const handleSaveProfile = () => {
    setUsername(editTempUsername);
    setUserAvatar(editTempAvatar);
    localStorage.setItem('animezona_username', editTempUsername);
    localStorage.setItem('animezona_avatar', editTempAvatar);
    setShowEditProfileModal(false);
    showToast('Perfil actualizado correctamente');
  };

  // Authentication
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmailInput || !loginPasswordInput) return;
    setIsSubmittingAuth(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmailInput.trim(),
          password: loginPasswordInput
        });
        if (error) {
          showToast(`Error: ${error.message}`);
        } else if (data.user) {
          setUserId(data.user.id);
          setIsLoggedIn(true);
          setUserEmail(loginEmailInput.trim());
          const name = data.user.user_metadata?.username || loginEmailInput.split('@')[0];
          setUsername(name);
          localStorage.setItem('animezona_logged_in', 'true');
          localStorage.setItem('animezona_email', loginEmailInput.trim());
          localStorage.setItem('animezona_username', name);

          // Sync with user_profiles table
          syncService.syncUserProfile(data.user.id, data.user.email || loginEmailInput.trim());

          // Load cloud data from user_sync
          const cloudData = await syncService.loadUserData(data.user.id);
          if (cloudData.favoriteAnimes && Array.isArray(cloudData.favoriteAnimes)) {
            const cleanFavs = cleanIdList(cloudData.favoriteAnimes);
            const objs = cloudData.favoriteAnimes.filter((item: any) => item && typeof item === 'object' && item.title);
            if (objs.length > 0) {
              setFavoriteAnimesData((prev) => {
                const map = new Map<string, MappedAnime>();
                [...prev, ...objs].forEach((a) => {
                  if (a && a.id) map.set(String(a.id), a);
                });
                const arr = Array.from(map.values());
                localStorage.setItem('animezona_fav_objects', JSON.stringify(arr));
                return arr;
              });
            }
            setFavorites(cleanFavs);
            localStorage.setItem('animezona_favs', JSON.stringify(cleanFavs));
            localStorage.setItem('favoriteAnimes', JSON.stringify(cloudData.favoriteAnimes));
          }
          if (cloudData.continueWatching && Array.isArray(cloudData.continueWatching)) {
            const cleanCw = cloudData.continueWatching.map(normalizeContinueItem).filter(Boolean) as any[];
            setContinueWatching(cleanCw);
            localStorage.setItem('continueWatching', JSON.stringify(cleanCw));
          }
          if (cloudData.customLists && Array.isArray(cloudData.customLists)) {
            setCustomLists(cloudData.customLists);
            localStorage.setItem('customLists', JSON.stringify(cloudData.customLists));
          }
          if (cloudData.watchedAnimes && Array.isArray(cloudData.watchedAnimes)) {
            setWatchedAnimesList(cloudData.watchedAnimes);
            localStorage.setItem('watchedAnimes', JSON.stringify(cloudData.watchedAnimes));
          }
          if (cloudData.secretLikes && Array.isArray(cloudData.secretLikes)) {
            const cleanSecrets = cleanIdList(cloudData.secretLikes);
            setSecretFavorites(cleanSecrets);
            localStorage.setItem('animezona_secret_favs', JSON.stringify(cleanSecrets));
            localStorage.setItem('secretLikes', JSON.stringify(cloudData.secretLikes));
          }
          if (cloudData.hiddenAnimes && Array.isArray(cloudData.hiddenAnimes)) {
            const cleanHidden = cleanIdList(cloudData.hiddenAnimes);
            setHiddenRecommendations(cleanHidden);
            localStorage.setItem('animezona_hidden_recommendations', JSON.stringify(cleanHidden));
            localStorage.setItem('hiddenAnimes', JSON.stringify(cloudData.hiddenAnimes));
          }

          showToast(`¡Bienvenido de vuelta, ${name}!`);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: loginEmailInput.trim(),
          password: loginPasswordInput,
          options: {
            data: { username: loginEmailInput.split('@')[0], avatar_url: DEFAULT_AVATAR }
          }
        });
        if (error) {
          showToast(`Error: ${error.message}`);
        } else if (data.user) {
          setUserId(data.user.id);
          setIsLoggedIn(true);
          setUserEmail(loginEmailInput.trim());
          setUsername(loginEmailInput.split('@')[0]);
          localStorage.setItem('animezona_logged_in', 'true');
          localStorage.setItem('animezona_email', loginEmailInput.trim());
          syncService.syncUserProfile(data.user.id, data.user.email || loginEmailInput.trim());
          showToast('¡Cuenta creada con éxito!');
        }
      }
    } catch (err: any) {
      showToast('Error al conectar con el servidor.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut().catch(() => {});
    setIsLoggedIn(false);
    localStorage.removeItem('animezona_logged_in');
    setShowLogoutConfirm(false);
    showToast('Sesión cerrada');
  };

  const removeContinueItem = (animeId: string | number) => {
    const updatedCw = continueWatching.filter((c) => String(c.animeId) !== String(animeId));
    saveContinueWatching(updatedCw);
    const updatedWatched = watchedAnimesList.filter((a) => String(a.id) !== String(animeId));
    saveWatchedAnimes(updatedWatched);
    showToast('Eliminado de continuar viendo');
  };

  const formatTimeDetailed = (seconds: any) => {
    const s = Number(seconds);
    if (isNaN(s) || s <= 0) {
      return '0m 00s';
    }
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = Math.floor(s % 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    }
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const availableLanguages = Array.from(new Set(servers.map((s) => s.lang || 'latino')));
  const filteredTrending = trendingAnimes.filter((a) => !hiddenRecommendations.includes(String(a.id)));
  const filteredCatalog = catalogAnimes.filter((a) => !hiddenRecommendations.includes(String(a.id)));
  const carouselAnimes = filteredTrending.slice(0, 5);

  const availableSeasons = Array.from(new Set(episodesList.map((e) => e.season_number || 1))).sort((a, b) => a - b);
  const currentSeasonEpisodes = episodesList.filter((e) => (e.season_number || 1) === activeSeason);

  const isInsideIntro =
    activeServer?.skip_start != null &&
    activeServer?.skip_end != null &&
    currentVideoTime >= activeServer.skip_start &&
    currentVideoTime <= activeServer.skip_end;

  const isInsideOutro =
    (activeServer?.outro_start != null && currentVideoTime >= activeServer.outro_start) ||
    (videoDuration > 0 && videoDuration - currentVideoTime <= 45 && currentVideoTime > 60);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#080b11] text-slate-100 font-sans flex flex-col items-center select-none p-0 overflow-x-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 z-50 bg-[#7c3aed] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container: Full width on phone, responsive in landscape, cleanly centered on desktop without fake phone borders */}
      <div
        className={`w-full ${
          currentEpisode ? 'max-w-none' : 'max-w-md'
        } h-[100dvh] max-h-[100dvh] bg-[#0b0e14] flex flex-col transition-all duration-300 relative overflow-hidden`}
      >
        {/* Notch / Status Bar Safe-Area Margin (Tope superior fijo para no tapar reloj y notificaciones del sistema) */}
        {!currentEpisode && (
          <div
            className="w-full shrink-0 bg-[#0b0e14]"
            style={{ height: 'max(env(safe-area-inset-top, 0px), 32px)' }}
          />
        )}

        {/* Sutil Aviso de Conexión Offline */}
        {!isOnline && (
          <div className="bg-amber-950/90 border-b border-amber-500/40 text-amber-200 px-3.5 py-1.5 text-[11px] font-semibold flex items-center justify-between backdrop-blur-md shrink-0 z-50 animate-fade-in shadow-md">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0"></span>
              <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Sin conexión Wi-Fi/datos. Mostrando animes guardados.</span>
            </div>
            <button
              onClick={() => {
                if (navigator.onLine) {
                  setIsOnline(true);
                  loadInitialData();
                  showToast('🟢 ¡Conexión restablecida con éxito!');
                } else {
                  showToast('⚠️ Aún sin señal de internet');
                }
              }}
              className="bg-amber-900/80 hover:bg-amber-800 active:scale-95 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-600/40 shrink-0 ml-2 transition"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Header Estático AnimeZona (Fijo arriba: Logo, Avatar y Búsqueda, nunca desaparece al deslizar) */}
        {!currentEpisode && (
          <header className="px-4 pt-1.5 pb-2.5 shrink-0 border-b border-[#161c28] bg-[#0b0e14]/95 backdrop-blur-md z-40 space-y-2">
          {/* Fila 1: Logo ANIMEZONA y Avatar de perfil */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => {
                setSelectedAnime(null);
                setCurrentEpisode(null);
                setActiveTab('home');
              }}
              className="flex items-center gap-2 cursor-pointer active:scale-95 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] flex items-center justify-center shadow-lg shadow-purple-950/60">
                <Flame className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  ANIME<span className="text-[#a855f7]">ZONA</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedAnime(null);
                  setCurrentEpisode(null);
                  setActiveTab('profile');
                }}
                title="Mi Perfil"
                className={`p-1 rounded-full transition overflow-hidden border ${
                  activeTab === 'profile'
                    ? 'border-[#a855f7] ring-2 ring-[#7c3aed]/50'
                    : 'border-slate-700 bg-[#141924]'
                }`}
              >
                <img
                  src={userAvatar}
                  alt="Perfil"
                  onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                  className="w-7 h-7 rounded-full object-cover"
                />
              </button>
            </div>
          </div>

          {/* Fila 2: Barra de búsqueda estática siempre presente arriba */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar en AnimeZona..."
              className="w-full bg-[#121620] border border-[#1e2433] rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7c3aed] transition"
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => handleSearchChange('')}
                title="Borrar texto"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>
        )}

        {/* TELÓN DE DESENFOQUE PARA APAGAR LUZ (Todo oscuro y borroso excepto el reproductor) */}
        {cinemaLightOff && (
          <div
            onClick={() => setCinemaLightOff(false)}
            className="fixed inset-0 z-45 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 cursor-pointer transition-all duration-300"
          >
            <div className="text-center pt-8 pointer-events-none">
              <span className="bg-[#121620]/90 px-4 py-2 rounded-full text-xs text-slate-200 border border-slate-700 shadow-2xl inline-flex items-center gap-2">
                💡 Modo Cine Activo (Toca fuera del video para encender la luz)
              </span>
            </div>
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <div
          ref={mainScrollRef}
          onScroll={(e) => {
            const target = e.currentTarget;
            if (activeTab === 'catalog' && target.scrollHeight - target.scrollTop <= target.clientHeight + 350) {
              loadMoreCatalog();
            }
          }}
          className="flex-1 overflow-y-auto pb-28"
        >
          {/* ============================================================== */}
          {/* SCREEN 1: WATCH EPISODE (MATCHING USER'S IMAGE 2)              */}
          {/* ============================================================== */}
          {selectedAnime && currentEpisode ? (
            <div className="space-y-4 p-3 bg-[#080b11] relative">
              <button
                onClick={() => setCurrentEpisode(null)}
                className="text-xs font-semibold text-[#a855f7] hover:text-[#c084fc] flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver a {selectedAnime.title}</span>
              </button>

              <h1 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                T{currentEpisode.season_number || 1}E{currentEpisode.episode_number} - {currentEpisode.title}
              </h1>

              {/* Server & Language Control Container */}
              <div className="bg-[#0f131c] border border-[#1b2230] rounded-xl p-3 space-y-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold w-16">Idioma:</span>
                  <div className="flex items-center gap-2">
                    {availableLanguages.includes('latino') && (
                      <button
                        onClick={() => setSelectedLanguage('latino')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          selectedLanguage === 'latino'
                            ? 'bg-[#7c3aed] text-white shadow-md'
                            : 'bg-[#181f2c] text-slate-300 hover:text-white'
                        }`}
                      >
                        Latino
                      </button>
                    )}
                    {availableLanguages.includes('sub') && (
                      <button
                        onClick={() => setSelectedLanguage('sub')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          selectedLanguage === 'sub'
                            ? 'bg-[#7c3aed] text-white shadow-md'
                            : 'bg-[#181f2c] text-slate-300 hover:text-white'
                        }`}
                      >
                        Subtitulado
                      </button>
                    )}
                    {availableLanguages.includes('castellano') && (
                      <button
                        onClick={() => setSelectedLanguage('castellano')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          selectedLanguage === 'castellano'
                            ? 'bg-[#7c3aed] text-white shadow-md'
                            : 'bg-[#181f2c] text-slate-300 hover:text-white'
                        }`}
                      >
                        Castellano
                      </button>
                    )}
                  </div>
                </div>

                {/* Servidor Row: Más grande y en barra deslizable de izquierda a derecha */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold w-16 shrink-0">Servidor:</span>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1">
                    {servers.length > 0 ? (
                      servers.map((srv, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveServer(srv);
                            setShowContinueOverlay(false);
                          }}
                          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition ${
                            activeServer?.url === srv.url
                              ? 'bg-[#7c3aed] text-white font-extrabold shadow-lg shadow-purple-950/60'
                              : 'bg-[#181f2c] text-slate-300 border border-slate-700/60 hover:bg-[#20293a]'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{srv.name}</span>
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No hay servidores para este idioma aún.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Player Container (Con foco e iluminación cuando se apagan las luces) */}
              <div
                ref={playerContainerRef}
                className={`${
                  isFullscreenPlayer
                    ? 'fixed inset-0 z-50 bg-black w-screen h-screen flex flex-col justify-center items-center'
                    : `relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 transition-all duration-300 ${
                        cinemaLightOff
                          ? 'z-50 ring-4 ring-[#7c3aed]/80 shadow-[0_0_90px_rgba(124,58,237,0.7)] scale-[1.01]'
                          : ''
                      }`
                }`}
              >
                {/* Botón flotante para salir de pantalla completa */}
                {isFullscreenPlayer && (
                  <button
                    onClick={exitPlayerFullscreen}
                    className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-1.5 active:scale-95 transition"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Salir de Pantalla Completa</span>
                  </button>
                )}

                {loadingServers ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-2">
                    <RefreshCw className="w-7 h-7 animate-spin text-[#7c3aed]" />
                    <span>Conectando con servidor de video...</span>
                  </div>
                ) : activeServer?.url ? (
                  <>
                    {activeServer.url.toLowerCase().includes('.mp4') || activeServer.url.toLowerCase().includes('.m3u8') ? (
                      <video
                        ref={videoRef}
                        src={activeServer.url}
                        poster={selectedAnime.banner || selectedAnime.image}
                        controls={showNativeControls}
                        playsInline
                        autoPlay={false}
                        onTimeUpdate={handleTimeUpdate}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <iframe
                        src={activeServer.url}
                        allowFullScreen
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-encrypted-media"
                        className="w-full h-full border-0"
                        title={activeServer.name}
                      />
                    )}

                    {/* BOTÓN SALTAR INTRO: MÁS TRANSPARENTE, GRIS Y ARRIBA */}
                    {isInsideIntro && (
                      <button
                        onClick={handleSkipIntro}
                        className="absolute bottom-16 right-4 z-30 bg-black/40 hover:bg-black/60 text-slate-300 border border-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-xl flex items-center gap-1.5 transition"
                      >
                        <SkipForward className="w-3.5 h-3.5 text-slate-300" />
                        <span>Saltar Intro</span>
                      </button>
                    )}

                    {/* BOTÓN SIGUIENTE EPISODIO CON PANTALLA COMPLETA + AUTOPLAY EN "VER YA" */}
                    {isInsideOutro && (
                      <div className="absolute top-4 right-4 z-30 bg-black/40 text-slate-300 border border-white/10 backdrop-blur-sm p-2 rounded-xl shadow-xl flex items-center gap-2.5 transition">
                        <div className="text-left">
                          <p className="text-[10px] text-slate-400">Siguiente Episodio</p>
                          <p className="text-xs font-bold text-white">Ep. {currentEpisode.episode_number + 1}</p>
                        </div>
                        <button
                          onClick={handleNextEpisodeVerYa}
                          className="bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 border border-slate-600/30 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Ver ya</span>
                        </button>
                      </div>
                    )}

                    {/* "Continuar Viendo" Modal Overlay */}
                    {showContinueOverlay && savedResumeTime && (
                      <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col items-center justify-center p-4">
                        <div className="bg-[#121620] border border-slate-700 rounded-2xl p-5 max-w-[280px] w-full text-center space-y-3 shadow-2xl">
                          <h4 className="text-sm font-bold text-white">Continuar Viendo</h4>
                          <p className="text-xs text-slate-300">
                            Te quedaste en {formatTimeDetailed(savedResumeTime)}
                          </p>

                          <div className="flex flex-col gap-2 pt-1">
                            <button
                              onClick={() => {
                                if (videoRef.current && savedResumeTime) {
                                  videoRef.current.currentTime = savedResumeTime;
                                  videoRef.current.play().catch(() => {});
                                }
                                setShowContinueOverlay(false);
                              }}
                              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-2 rounded-lg text-xs transition"
                            >
                              Continuar
                            </button>
                            <button
                              onClick={() => {
                                if (videoRef.current) {
                                  videoRef.current.currentTime = 0;
                                  videoRef.current.play().catch(() => {});
                                }
                                setShowContinueOverlay(false);
                              }}
                              className="w-full bg-[#202636] hover:bg-[#283044] text-slate-300 py-2 rounded-lg text-xs transition"
                            >
                              Empezar de cero
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-[#ec4899] mb-2" />
                    <p className="text-xs text-white font-bold">Servidor no disponible en este momento.</p>
                  </div>
                )}
              </div>

              {/* Botón flotante para encender la luz si están apagadas */}
              {cinemaLightOff && (
                <div className="relative z-50 flex items-center justify-between px-3 py-2 bg-[#121620]/95 rounded-xl border border-purple-500/50 shadow-2xl backdrop-blur-md animate-fade-in">
                  <span className="text-xs text-purple-300 font-semibold flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-pulse" />
                    Modo Cine: Luces apagadas
                  </span>
                  <button
                    onClick={() => setCinemaLightOff(false)}
                    className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md transition flex items-center gap-1 active:scale-95"
                  >
                    <Lightbulb className="w-3.5 h-3.5 fill-current" />
                    <span>Encender luz</span>
                  </button>
                </div>
              )}

              {/* Action Buttons Below Video Player */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  onClick={() => setCinemaLightOff(!cinemaLightOff)}
                  className={`border px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition ${
                    cinemaLightOff
                      ? 'bg-[#7c3aed] border-purple-400 text-white font-bold shadow-lg shadow-purple-900/50'
                      : 'bg-[#121620] border-[#1e2636] text-slate-300 hover:text-white'
                  }`}
                >
                  <Lightbulb className={`w-3.5 h-3.5 ${cinemaLightOff ? 'fill-amber-300 text-amber-300' : 'text-amber-400'}`} />
                  <span>{cinemaLightOff ? 'Encender luz' : 'Apagar luz'}</span>
                </button>

                <button
                  onClick={handleContainerFullscreen}
                  className="bg-[#121620] border border-[#1e2636] text-slate-300 hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0"
                >
                  <Maximize className="w-3.5 h-3.5 text-slate-300" />
                  <span>Pantalla Completa</span>
                </button>

                <button
                  onClick={() => setShowNativeControls(!showNativeControls)}
                  className="bg-[#121620] border border-[#1e2636] text-slate-300 hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0"
                >
                  {showNativeControls ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showNativeControls ? 'Ocultar Controles' : 'Mostrar Controles'}</span>
                </button>

                <button
                  onClick={() => setShowCastModal(true)}
                  className="bg-[#121620] border border-[#1e2636] text-slate-300 hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0"
                >
                  <Cast className="w-3.5 h-3.5 text-[#a855f7]" />
                  <span>Transmitir</span>
                </button>

                <button
                  onClick={downloadMp4}
                  className="bg-[#1a2336] border border-[#2b3a55] text-purple-300 hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 font-semibold"
                >
                  <Download className="w-3.5 h-3.5 text-[#a855f7]" />
                  <span>Descargar MP4</span>
                </button>
              </div>

              {/* Botones < y > Ampliados */}
              <div className="bg-[#0f131c] border border-[#1b2230] rounded-xl py-2 px-3 flex items-center justify-between text-slate-300">
                <button
                  disabled={currentEpisode.episode_number <= 1}
                  onClick={() => {
                    const prev = episodesList.find((e) => e.episode_number === currentEpisode.episode_number - 1);
                    if (prev) playEpisode(selectedAnime, prev);
                  }}
                  title="Episodio Anterior"
                  className="px-6 py-2 rounded-xl bg-[#181f2c] hover:bg-[#20293a] disabled:opacity-30 transition flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={() => setCurrentEpisode(null)}
                  title="Lista de Episodios"
                  className="px-3 py-1.5 rounded-lg bg-[#181f2c] text-[#a855f7] hover:bg-[#20293a] flex items-center gap-1.5 text-xs font-bold transition"
                >
                  <List className="w-4 h-4" />
                  <span>Episodios ({episodesList.length})</span>
                </button>

                <button
                  disabled={currentEpisode.episode_number >= episodesList.length}
                  onClick={() => {
                    const next = episodesList.find((e) => e.episode_number === currentEpisode.episode_number + 1);
                    if (next) playEpisode(selectedAnime, next);
                  }}
                  title="Siguiente Episodio"
                  className="px-6 py-2 rounded-xl bg-[#181f2c] hover:bg-[#20293a] disabled:opacity-30 transition flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Lista de Episodios con Auto-Scroll al Episodio Activo */}
              <div
                id="episodes-scroll-container"
                className="space-y-1.5 pt-1 max-h-60 overflow-y-auto no-scrollbar scroll-smooth"
              >
                {episodesList.map((ep) => {
                  const isCurrent = ep.episode_number === currentEpisode.episode_number;
                  return (
                    <div
                      key={ep.episode_number}
                      id={`ep-card-${ep.episode_number}`}
                      onClick={() => playEpisode(selectedAnime, ep)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition cursor-pointer active:scale-98 ${
                        isCurrent
                          ? 'bg-[#181628] border-[#7c3aed] shadow-md ring-1 ring-[#7c3aed]'
                          : 'bg-[#0f131c] border-[#1b2230] hover:border-slate-700'
                      }`}
                    >
                      <div className="relative w-16 h-10 rounded-md overflow-hidden shrink-0 bg-black">
                        <img src={selectedAnime.image} alt={ep.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-3 h-3 fill-white text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold text-white truncate">
                          T{ep.season_number || 1}E{ep.episode_number} - {ep.title}
                        </h4>
                        {isCurrent ? (
                          <span className="text-[9px] font-bold text-[#a855f7] block">Viendo ahora</span>
                        ) : ep.episode_number === currentEpisode.episode_number + 1 ? (
                          <span className="text-[9px] font-medium text-slate-400 block">Siguiente</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : selectedAnime ? (
            /* ============================================================== */
            /* SCREEN 2: ANIME DETAILS (MATCHING USER'S IMAGE 1)              */
            /* ============================================================== */
            <div className="p-4 space-y-6 bg-[#080b11]">
              <button
                onClick={() => setSelectedAnime(null)}
                className="text-xs font-semibold text-[#a855f7] hover:text-[#c084fc] flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-36 sm:w-44 aspect-[2/3] rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-[#1e2638] bg-black">
                  <img src={selectedAnime.image} alt={selectedAnime.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 space-y-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                    {selectedAnime.title}
                  </h1>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#1a202c] text-slate-200 px-3 py-0.8 rounded-full text-xs font-semibold border border-slate-700/40">
                      {selectedAnime.status}
                    </span>

                    {/* Me Gusta con soporte para 5 segundos long-press secreto */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(selectedAnime, e);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLikeTouchStart(selectedAnime);
                      }}
                      onMouseUp={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLikeTouchEnd(selectedAnime, e);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        handleLikeTouchStart(selectedAnime);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLikeTouchEnd(selectedAnime, e);
                      }}
                      className={`px-3 py-0.8 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                        isAnimeFavorited(selectedAnime)
                          ? 'bg-[#3b1219] text-[#f87171] border border-[#7f1d1d]/50'
                          : 'bg-[#1a202c] text-slate-300 border border-slate-700/40'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{isAnimeFavorited(selectedAnime) ? 'En Favoritos' : 'Favoritos'}</span>
                    </button>

                    <button
                      onClick={() => setShowAddToListModal(true)}
                      className="bg-[#1e293b] text-slate-200 border border-slate-700 px-3 py-0.8 rounded-full text-xs font-semibold flex items-center gap-1.5 transition hover:bg-[#25334a]"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#a855f7]" />
                      <span>Añadir a Lista</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(selectedAnime.genres || ['Anime']).map((g, idx) => (
                      <span
                        key={idx}
                        className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-2.5 py-0.5 rounded text-[11px] font-semibold shadow-sm"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    {selectedAnime.description}
                  </p>
                </div>
              </div>

              {/* Episodes Section */}
              <div className="space-y-3 pt-3 border-t border-[#1a202c]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    Episodios ({episodesList.length})
                  </h2>

                  <button
                    onClick={() => {
                      removeContinueItem(selectedAnime.id);
                      showToast('Historial de vistos limpiado');
                    }}
                    className="bg-[#1a202c] hover:bg-[#242c3d] text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700/40 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar vistos</span>
                  </button>
                </div>

                {availableSeasons.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {availableSeasons.map((s) => (
                      <button
                        key={s}
                        onClick={() => setActiveSeason(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                          activeSeason === s
                            ? 'bg-[#0b0e14] text-white border-white shadow-md'
                            : 'bg-[#121620] text-slate-400 border-[#1e2433] hover:text-white'
                        }`}
                      >
                        Temporada {s}
                      </button>
                    ))}
                  </div>
                )}

                {loadingServers || episodesList.length === 0 ? (
                  <EpisodeListSkeleton count={6} />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                    {currentSeasonEpisodes.map((ep) => (
                      <button
                        key={ep.episode_number}
                        onClick={() => playEpisode(selectedAnime, ep)}
                        className="bg-[#121620] hover:bg-[#1a202c] hover:border-[#7c3aed] border border-[#1e2433] rounded-xl p-3 text-center transition flex flex-col items-center justify-center min-h-[58px] group active:scale-95"
                      >
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2">
                          T{ep.season_number || 1}E{ep.episode_number} - {ep.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'home' ? (
            /* ============================================================== */
            /* SCREEN 3: INICIO (HOME) CON CARRUSEL DE RECOMENDADOS          */
            /* ============================================================== */
            <div className="space-y-6">
              {/* CARRUSEL DE RECOMENDADOS DESLIZABLE */}
              {loading && carouselAnimes.length === 0 ? (
                <div className="px-4">
                  <HeroCarouselSkeleton />
                </div>
              ) : carouselAnimes.length > 0 ? (
                <div className="relative w-full h-72 overflow-hidden group">
                  {/* Diapositiva Actual */}
                  {carouselAnimes.map((item, idx) => {
                    if (idx !== carouselIndex) return null;
                    return (
                      <div key={item.id} className="relative w-full h-full animate-fade-in">
                        <img
                          src={item.banner || item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/55 to-transparent"></div>

                        <div className="absolute bottom-3 left-4 right-4 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#7c3aed] text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-md">
                              <Sparkles className="w-2.5 h-2.5" />
                              Recomendado
                            </span>
                            <span className="text-amber-400 text-xs font-bold">
                              ★ {item.score}
                            </span>
                          </div>

                          <h2 className="text-lg font-extrabold text-white line-clamp-1">
                            {item.title}
                          </h2>

                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => openAnimeDetails(item)}
                              className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] active:scale-95 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-lg shadow-purple-950 transition"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Ver Serie / Episodios</span>
                            </button>

                            <button
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className={`p-2 rounded-xl border transition ${
                                favorites.includes(String(item.id))
                                  ? 'bg-[#3b1219] border-[#7f1d1d] text-[#f87171]'
                                  : 'bg-[#121620] border-slate-700 text-slate-300'
                              }`}
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Flechas de navegación para deslizar el carrusel */}
                  <button
                    onClick={() =>
                      setCarouselIndex((prev) => (prev === 0 ? carouselAnimes.length - 1 : prev - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setCarouselIndex((prev) => (prev + 1) % carouselAnimes.length)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Paginación de puntos del carrusel */}
                  <div className="absolute top-3 right-4 flex items-center gap-1.5 z-20">
                    {carouselAnimes.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCarouselIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          carouselIndex === i ? 'w-5 bg-[#a855f7]' : 'w-1.5 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Continuar Viendo Row CON BOTÓN ENCIMA PARA QUITAR */}
              {continueWatching.length > 0 && (
                <div className="px-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-[#a855f7]" />
                      Continuar Viendo
                    </h3>
                  </div>

                  <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                    {continueWatching.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={async () => {
                          const info = await api.getAnimeInfo(item.animeId);
                          if (info) {
                            setSelectedAnime(info);
                            const eps = await api.getAnimeEpisodes(info.id, info.title);
                            setEpisodesList(eps);
                            const targetEp = eps.find((e) => e.episode_number === item.episodeNum) || eps[0];
                            if (targetEp) playEpisode(info, targetEp);
                          }
                        }}
                        className="w-40 sm:w-44 bg-[#121620] border border-[#1e2433] rounded-xl overflow-hidden cursor-pointer active:scale-95 transition shrink-0 group relative"
                      >
                        <div className="relative aspect-video w-full bg-black">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />

                          {/* BOTÓN ENCIMA DE LA IMAGEN PARA QUITARLO */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeContinueItem(item.animeId);
                            }}
                            title="Quitar de continuar viendo"
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/75 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-white/20 transition z-10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play className="w-4 h-4 fill-white text-white" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                            <div
                              style={{ width: `${Math.min(100, (item.time / (item.duration || 1440)) * 100)}%` }}
                              className="h-full bg-[#7c3aed]"
                            ></div>
                          </div>
                        </div>

                        <div className="p-2">
                          <h4 className="text-[11px] font-bold text-white truncate">{item.title}</h4>
                          <span className="text-[10px] text-[#a855f7] font-semibold block">
                            T{Number(item.seasonNum) || 1} Ep.{Number(item.episodeNum) || 1} • {formatTimeDetailed(item.time)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendaciones Populares (Con Long-Press de 5s para Favorito Secreto) */}
              <div className="px-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#ec4899]" />
                    Recomendaciones Populares
                  </h3>
                  <button
                    onClick={resetAndOpenCatalog}
                    className="text-[11px] text-[#a855f7] font-semibold"
                  >
                    Ver todo
                  </button>
                </div>

                {loading && filteredTrending.length === 0 ? (
                  <AnimeGridSkeleton count={4} />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredTrending.slice(0, 10).map((anime) => (
                      <div
                        key={anime.id}
                        onClick={() => openAnimeDetails(anime)}
                        className="bg-[#121620] border border-[#1e2433] rounded-xl overflow-hidden cursor-pointer active:scale-98 transition flex flex-col group relative"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden bg-black">
                          <img
                            src={anime.image}
                            alt={anime.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />

                          {/* Botón Ocultar recomendación */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              hideRecommendation(anime, e);
                            }}
                            title="Ocultar recomendación"
                            className="absolute top-2 left-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-slate-300 hover:text-white transition z-20"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>

                          {/* Botón Me Gusta */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(anime, e);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLikeTouchStart(anime);
                            }}
                            onMouseUp={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLikeTouchEnd(anime, e);
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              handleLikeTouchStart(anime);
                            }}
                            onTouchEnd={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLikeTouchEnd(anime, e);
                            }}
                            title="Me gusta"
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition active:scale-90 z-20"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 transition ${
                                isAnimeFavorited(anime)
                                  ? 'fill-[#f87171] text-[#f87171]'
                                  : 'text-white'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="p-2 flex-1 flex flex-col justify-center">
                          <h4 className="text-xs font-bold text-white line-clamp-1">
                            {anime.title}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'catalog' ? (
            /* ============================================================== */
            /* SCREEN 4: CATÁLOGO                                             */
            /* ============================================================== */
            <div className="px-4 py-3 space-y-4">
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {Object.keys(TMDB_GENRES).map((g) => (
                  <button
                    key={g}
                    onClick={() => handleGenreChange(g)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      selectedGenre === g
                        ? 'bg-[#7c3aed] text-white font-bold shadow-md'
                        : 'bg-[#121620] border border-[#1e2433] text-slate-400 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Indicador de Búsqueda */}
              {searchQuery.trim() && (
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ec4899]" />
                    Resultados para "{searchQuery}"
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{filteredCatalog.length} encontrados</span>
                </div>
              )}

              {/* Si no hay resultados de búsqueda */}
              {searchQuery.trim() && filteredCatalog.length === 0 && !loading && (
                <div className="py-10 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">No se encontraron animes con ese nombre.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Prueba con otra palabra o revisa la ortografía.</p>
                </div>
              )}

              {/* Cuadrícula de Resultados Directos */}
              {loading && filteredCatalog.length === 0 ? (
                <AnimeGridSkeleton count={8} />
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">
                {filteredCatalog.map((anime, index) => (
                  <div
                    key={anime.id}
                    onClick={() => openAnimeDetails(anime)}
                    className="bg-[#121620] border border-[#1e2433] rounded-xl overflow-hidden cursor-pointer active:scale-98 transition flex flex-col group relative"
                  >
                    {/* Badge para el anime exacto / más exacto */}
                    {searchQuery.trim() && index === 0 && (
                      <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-lg">
                        ★ Más Exacto
                      </div>
                    )}

                    <div className="aspect-[2/3] relative overflow-hidden bg-black">
                      <img
                        src={anime.image}
                        alt={anime.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />

                      <button
                        onClick={(e) => hideRecommendation(anime.id, e)}
                        title="Ocultar recomendación"
                        className="absolute top-2 left-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-slate-300 hover:text-white transition"
                        style={{ display: searchQuery.trim() && index === 0 ? 'none' : 'block' }}
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(anime, e);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLikeTouchStart(anime);
                        }}
                        onMouseUp={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLikeTouchEnd(anime, e);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          handleLikeTouchStart(anime);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLikeTouchEnd(anime, e);
                        }}
                        title="Me gusta"
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition active:scale-90 z-20"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition ${
                            isAnimeFavorited(anime)
                              ? 'fill-[#f87171] text-[#f87171]'
                              : 'text-white'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="p-2">
                      <h4 className="text-xs font-bold text-white truncate">{anime.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {/* Animes Relacionados y Recomendados según lo que escribió */}
              {searchQuery.trim() && relatedAnimes.length > 0 && (
                <div className="pt-6 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
                      Animes Relacionados y Recomendados
                    </h3>
                    <span className="text-[10px] text-[#a855f7] font-semibold">Similares a tu búsqueda</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {relatedAnimes.map((relAnime) => (
                      <div
                        key={`rel-${relAnime.id}`}
                        onClick={() => openAnimeDetails(relAnime)}
                        className="bg-[#121620] border border-[#1e2433] rounded-xl overflow-hidden cursor-pointer active:scale-98 transition flex flex-col group relative"
                      >
                        <div className="aspect-[2/3] relative overflow-hidden bg-black">
                          <img
                            src={relAnime.image}
                            alt={relAnime.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(relAnime, e);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLikeTouchStart(relAnime);
                            }}
                            onMouseUp={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLikeTouchEnd(relAnime, e);
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              handleLikeTouchStart(relAnime);
                            }}
                            onTouchEnd={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLikeTouchEnd(relAnime, e);
                            }}
                            title="Me gusta"
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition active:scale-90 z-20"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 transition ${
                                isAnimeFavorited(relAnime)
                                  ? 'fill-[#f87171] text-[#f87171]'
                                  : 'text-white'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="p-2">
                          <h4 className="text-xs font-bold text-white truncate">{relAnime.title}</h4>
                          <span className="text-[10px] text-[#a855f7]">Recomendado</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón Cargar Más */}
              <div className="py-4 text-center">
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-[#a855f7]">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Cargando más animes...</span>
                  </div>
                ) : filteredCatalog.length > 0 && hasMoreCatalog ? (
                  <button
                    onClick={loadMoreCatalog}
                    className="text-xs text-slate-300 hover:text-white bg-[#121620] hover:bg-[#181f2c] border border-[#1e2433] px-4 py-2 rounded-full font-semibold transition"
                  >
                    Cargar más automáticamente
                  </button>
                ) : filteredCatalog.length > 0 ? (
                  <span className="text-xs text-slate-500">Fin de los resultados.</span>
                ) : null}
              </div>
            </div>
          ) : activeTab === 'favorites' ? (
            /* ============================================================== */
            /* SCREEN 5: MIS FAVORITOS                                        */
            /* ============================================================== */
            <div className="px-4 py-3 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#f87171] fill-[#f87171]" />
                  Mis Favoritos ({favorites.length})
                </h3>
              </div>

              {loading && favorites.length === 0 ? (
                <AnimeGridSkeleton count={4} />
              ) : favorites.length === 0 ? (
                <div className="bg-[#121620] border border-[#1e2433] rounded-2xl p-6 text-center text-slate-400 text-xs">
                  No has agregado animes a tus favoritos todavía.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {cleanIdList(favorites).map((favId, idx) => {
                    const cleanId = String(favId).trim();
                    const anime =
                      favoriteAnimesData.find((a) => String(a.id) === cleanId) ||
                      findAnimeInCache(cleanId);

                    return (
                      <div
                        key={`fav-card-${cleanId}-${idx}`}
                        className="bg-[#121620] border border-[#1e2433] rounded-xl overflow-hidden relative group active:scale-98 transition flex flex-col"
                      >
                        <div onClick={() => anime && openAnimeDetails(anime)} className="cursor-pointer flex-1 flex flex-col">
                          <div className="aspect-[2/3] relative overflow-hidden bg-black">
                            <img
                              src={anime?.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80'}
                              alt={anime?.title || 'Anime'}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              loading="lazy"
                            />
                            {!anime && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <RefreshCw className="w-5 h-5 animate-spin text-[#a855f7]" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <h5 className="text-xs font-bold text-white line-clamp-1">{anime?.title || 'Cargando...'}</h5>
                            <span className="text-[10px] text-slate-400">{anime?.type || 'Anime'}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => toggleFavorite(anime || cleanId, e)}
                          title="Quitar de favoritos"
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-900 text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'secret' ? (
            /* ============================================================== */
            /* SCREEN 6: ZONA SECRETA (MATCHING IMAGE 2)                      */
            /* ============================================================== */
            <div className="px-4 py-3 space-y-4">
              <div className="bg-[#100d1c] border border-purple-900/60 rounded-2xl p-4 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-700/50 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#a855f7]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-purple-300">Zona Secreta</h3>
                    <p className="text-[11px] text-slate-400">Tu actividad aquí está oculta del perfil principal</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('home')}
                  className="bg-[#1b152b] hover:bg-[#251e3a] text-slate-200 border border-purple-800/40 text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
                  <span>Volver a la normalidad</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'historial', name: 'Historial Secreto' },
                  { id: 'favoritos', name: 'Favoritos Secretos' },
                  { id: 'catalogo', name: 'Catálogo Secreto' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSecretSubTab(st.id as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      secretSubTab === st.id
                        ? 'bg-[#7c3aed] text-white font-bold shadow-lg shadow-purple-950'
                        : 'bg-[#121620] text-slate-400 border border-[#1e2433] hover:text-white'
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>

              {secretSubTab === 'historial' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-purple-300">Continuar Viendo</h4>
                    <div className="bg-[#0e0c18] border border-dashed border-purple-950 rounded-2xl p-6 text-center text-xs text-slate-500">
                      No tienes episodios pendientes en modo secreto.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-purple-300">Animes Vistos</h4>
                    <div className="bg-[#0e0c18] border border-dashed border-purple-950 rounded-2xl p-6 text-center text-xs text-slate-500">
                      Aún no has marcado ningún anime secreto como visto.
                    </div>
                  </div>
                </div>
              )}

              {secretSubTab === 'favoritos' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-purple-300">Favoritos Secretos ({secretFavorites.length})</h4>
                  </div>

                  {secretFavorites.length === 0 ? (
                    <div className="bg-[#0e0c18] border border-dashed border-purple-950 rounded-2xl p-6 text-center text-xs text-slate-500">
                      No tienes favoritos secretos. Mantén presionado el botón ❤️ por 5 segundos en cualquier anime para enviarlo aquí.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {cleanIdList(secretFavorites).map((id, idx) => {
                        const cleanId = String(id).trim();
                        const anime =
                          secretAnimesData.find((a) => String(a.id) === cleanId) ||
                          findAnimeInCache(cleanId);
                        return (
                          <div key={`secret-fav-${cleanId}-${idx}`} className="bg-[#121620] border border-purple-900/40 rounded-xl overflow-hidden relative group">
                            <div onClick={() => anime && openAnimeDetails(anime)} className="cursor-pointer">
                              <div className="aspect-[2/3] relative overflow-hidden bg-black">
                                <img
                                  src={anime?.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80'}
                                  alt={anime?.title || 'Anime'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                  loading="lazy"
                                />
                                {!anime && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <RefreshCw className="w-4 h-4 animate-spin text-[#a855f7]" />
                                  </div>
                                )}
                              </div>
                              <div className="p-2">
                                <h5 className="text-xs font-bold text-white truncate">{anime?.title || 'Cargando anime...'}</h5>
                                <span className="text-[10px] text-[#a855f7] font-semibold">★ Secreto</span>
                              </div>
                            </div>

                            <button
                              onClick={() => setSecretRestoreConfirmId(cleanId)}
                              title="Devolver a la normalidad"
                              className="absolute top-2 right-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 p-1.5 rounded-full text-purple-300 hover:text-white transition"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Catálogo Secreto con opción para sacar animes como pidió el usuario */}
              {secretSubTab === 'catalogo' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-purple-300">Catálogo Secreto Oficial ({secretAnimes.length})</h4>
                  {secretAnimes.length === 0 ? (
                    <div className="bg-[#0e0c18] border border-dashed border-purple-950 rounded-2xl p-6 text-center text-xs text-slate-500">
                      No hay animes en el catálogo secreto. Los animes que marques en tu panel con "Marcar como Anime Secreto" aparecerán aquí.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {secretAnimes.map((sa) => (
                        <div
                          key={sa.id}
                          className="bg-[#121620] border border-purple-900/60 rounded-xl overflow-hidden relative group"
                        >
                          <div onClick={() => openAnimeDetails(sa)} className="cursor-pointer">
                            <img src={sa.image} alt={sa.title} className="w-full aspect-[2/3] object-cover" />
                            <div className="p-2">
                              <h5 className="text-xs font-bold text-white truncate">{sa.title}</h5>
                              <span className="text-[10px] text-amber-400 font-bold">★ Secreto Oficial</span>
                            </div>
                          </div>

                          {/* Botón para sacar del catálogo secreto */}
                          <button
                            onClick={() => setSecretRemoveAnimeTarget(sa)}
                            title="Sacar del catálogo secreto"
                            className="absolute top-2 right-2 bg-black/75 hover:bg-rose-950 text-slate-300 hover:text-rose-400 p-1.5 rounded-full border border-white/20 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* SCREEN 7: PERFIL (REQUIERE INICIAR SESIÓN / REGISTRO)          */
            /* ============================================================== */
            <div className="px-4 py-3 space-y-4">
              {!isLoggedIn ? (
                <div className="flex flex-col items-center justify-center min-h-[500px] px-2">
                  <div className="bg-[#0e111a] border border-[#1b2230] rounded-3xl p-6 max-w-[320px] w-full space-y-5 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white text-center">
                      {authMode === 'login' ? 'Iniciar Sesión' : 'Regístrate'}
                    </h3>

                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 block">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={loginEmailInput}
                          onChange={(e) => setLoginEmailInput(e.target.value)}
                          placeholder="tu@correo.com"
                          required
                          className="w-full bg-[#070a12] border border-[#1e2638] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#7c3aed]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 block">
                          Contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={loginPasswordInput}
                            onChange={(e) => setLoginPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-[#070a12] border border-[#1e2638] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#7c3aed]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingAuth}
                        className="w-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:opacity-95 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950/50 transition active:scale-98"
                      >
                        {isSubmittingAuth ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>{authMode === 'login' ? 'Ingresar' : 'Crear Cuenta'}</span>
                        )}
                      </button>

                      <div className="text-center pt-1">
                        {authMode === 'login' ? (
                          <p className="text-xs text-slate-400">
                            ¿No tienes cuenta?{' '}
                            <button
                              type="button"
                              onClick={() => setAuthMode('register')}
                              className="text-[#a855f7] hover:underline font-semibold"
                            >
                              Regístrate
                            </button>
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400">
                            ¿Ya tienes cuenta?{' '}
                            <button
                              type="button"
                              onClick={() => setAuthMode('login')}
                              className="text-[#a855f7] hover:underline font-semibold"
                            >
                              Inicia Sesión
                            </button>
                          </p>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* TOP USER CARD */}
                  <div className="bg-[#0b0e14] border-b border-[#1b2230] pb-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-xl bg-black shrink-0">
                      <img
                        src={userAvatar}
                        alt={username}
                        onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white leading-tight truncate">{username}</h3>
                      <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                      <p className="text-xs text-slate-300 font-medium">
                        {watchedAnimesList.length} Animes en Historial
                      </p>

                      <button
                        onClick={() => {
                          setEditTempUsername(username);
                          setEditTempAvatar(userAvatar);
                          setShowEditProfileModal(true);
                        }}
                        className="mt-1 bg-[#161c28] hover:bg-[#20293a] text-slate-200 border border-slate-700 text-[11px] font-semibold px-3 py-1 rounded-full transition"
                      >
                        Editar Perfil
                      </button>
                    </div>
                  </div>

                  {/* Sub-pestañas con separadores | semitransparentes */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#1a202c] no-scrollbar">
                    {[
                      { id: 'historial', name: 'Historial' },
                      { id: 'continuar', name: 'Continuar Viendo' },
                      { id: 'favoritos', name: 'Favoritos' },
                      { id: 'listas', name: 'Mis Listas' },
                      { id: 'ocultos', name: 'Animes Ocultos' },
                      { id: 'cuenta', name: 'Cuenta' }
                    ].map((st, idx) => (
                      <React.Fragment key={st.id}>
                        {idx > 0 && <span className="text-slate-600/50 text-xs select-none">|</span>}
                        <button
                          onClick={() => setProfileSubTab(st.id as any)}
                          className={`py-2 text-xs font-semibold whitespace-nowrap transition relative ${
                            profileSubTab === st.id
                              ? 'text-[#a855f7]'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>{st.name}</span>
                          {profileSubTab === st.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a855f7] rounded-full"></div>
                          )}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Subtab 1: Historial */}
                  {profileSubTab === 'historial' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Animes en tu Historial ({watchedAnimesList.length})
                        </h4>
                        {watchedAnimesList.length > 0 && (
                          <button
                            onClick={() => {
                              saveWatchedAnimes([]);
                              saveContinueWatching([]);
                              showToast('Historial borrado');
                            }}
                            className="text-[11px] text-rose-400 hover:text-rose-300"
                          >
                            Limpiar Historial
                          </button>
                        )}
                      </div>

                      {watchedAnimesList.length === 0 ? (
                        <div className="bg-[#121620] border border-[#1e2433] rounded-xl p-6 text-center text-slate-400 text-xs">
                          No hay animes en tu historial todavía.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {watchedAnimesList.map((anime) => (
                            <div
                              key={anime.id}
                              onClick={() => openAnimeDetails(anime)}
                              className="bg-[#121620] border border-[#1e2433] rounded-xl overflow-hidden cursor-pointer"
                            >
                              <img src={anime.image} alt={anime.title} className="w-full aspect-[2/3] object-cover" />
                              <div className="p-2">
                                <h5 className="text-xs font-bold text-white truncate">{anime.title}</h5>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtab 2: Continuar Viendo con botón para quitar */}
                  {profileSubTab === 'continuar' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Continuar Viendo ({continueWatching.length})
                      </h4>

                      {continueWatching.length === 0 ? (
                        <div className="bg-[#121620] border border-[#1e2433] rounded-xl p-6 text-center text-slate-400 text-xs">
                          No tienes episodios pendientes de continuar.
                        </div>
                      ) : (
                        continueWatching.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-[#121620] border border-[#1e2433] rounded-xl p-2.5 flex items-center justify-between gap-3 relative"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={item.image} alt={item.title} className="w-12 h-16 rounded-lg object-cover" />
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                                <p className="text-[10px] text-slate-400">T{Number(item.seasonNum) || 1} • Ep. {Number(item.episodeNum) || 1}</p>
                                <span className="text-[9px] text-[#a855f7] font-semibold">
                                  Progreso: {formatTimeDetailed(item.time)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={async () => {
                                  const info = await api.getAnimeInfo(item.animeId);
                                  if (info) {
                                    openAnimeDetails(info);
                                    const eps = await api.getAnimeEpisodes(info.id, info.title);
                                    setEpisodesList(eps);
                                    const targetEp = eps.find((e) => e.episode_number === item.episodeNum) || eps[0];
                                    if (targetEp) playEpisode(info, targetEp);
                                  }
                                }}
                                className="bg-[#7c3aed] text-white p-2 rounded-lg text-xs"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                              </button>

                              <button
                                onClick={() => removeContinueItem(item.animeId)}
                                className="p-2 text-rose-400 hover:text-rose-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Subtab 3: Favoritos */}
                  {profileSubTab === 'favoritos' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Favoritos ({favorites.length})
                      </h4>

                      {favorites.length === 0 ? (
                        <div className="bg-[#121620] border border-[#1e2433] rounded-xl p-6 text-center text-slate-400 text-xs">
                          No tienes animes en favoritos todavía.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {favorites.map((favId, idx) => {
                            const cleanId = typeof favId === 'object' && favId !== null ? String((favId as any).id || idx) : String(favId);
                            const anime =
                              favoriteAnimesData.find((a) => String(a.id) === cleanId) ||
                              [...trendingAnimes, ...topAnimes, ...catalogAnimes, ...relatedAnimes].find(
                                (a) => String(a.id) === cleanId
                              ) || {
                                id: cleanId,
                                title: cleanId.startsWith('custom-') ? 'Anime Favorito' : cleanId,
                                image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
                                type: 'Anime',
                                score: '9.0',
                                description: '',
                                genres: ['Anime'],
                                status: 'En emisión',
                                isCustom: false,
                                totalEpisodes: 12
                              };

                            return (
                              <div
                                key={`prof-fav-card-${anime.id}-${idx}`}
                                className="bg-[#121620] border border-[#1e2433] rounded-xl overflow-hidden relative group flex flex-col active:scale-98 transition"
                              >
                                <div onClick={() => openAnimeDetails(anime)} className="cursor-pointer flex-1 flex flex-col">
                                  <div className="aspect-[2/3] relative overflow-hidden bg-black">
                                    <img src={anime.image} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                  </div>
                                  <div className="p-2">
                                    <h5 className="text-xs font-bold text-white line-clamp-1">{anime.title}</h5>
                                    <span className="text-[10px] text-slate-400">{anime.type || 'Anime'}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => toggleFavorite(anime, e)}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-900 text-rose-400 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtab 4: Mis Listas */}
                  {profileSubTab === 'listas' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Listas Creadas ({customLists.length})
                        </h4>
                        {!showCreateListInline && (
                          <button
                            onClick={() => setShowCreateListInline(true)}
                            className="text-xs bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-3 py-1 rounded-full font-semibold transition"
                          >
                            + Nueva Lista
                          </button>
                        )}
                      </div>

                      {/* Formulario rápido para crear lista en perfil sin trabas */}
                      {showCreateListInline && (
                        <div className="bg-[#121620] border border-[#a855f7] rounded-xl p-3 space-y-2 animate-fade-in shadow-lg">
                          <label className="text-[11px] font-bold text-white block">Nombre de la nueva lista:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newListName}
                              onChange={(e) => setNewListName(e.target.value)}
                              placeholder="Ej: Shonen Favoritos, Por ver..."
                              className="bg-black border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 focus:outline-none focus:border-[#7c3aed]"
                            />
                            <button
                              onClick={() => {
                                handleCreateList();
                                setShowCreateListInline(false);
                              }}
                              className="bg-[#7c3aed] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#6d28d9]"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setShowCreateListInline(false)}
                              className="text-slate-400 hover:text-white text-xs px-2"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {customLists.map((l, idx) => (
                        <div key={`cust-list-${l.id}-${idx}`} className="bg-[#121620] border border-[#1e2433] rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            {editingListId === l.id ? (
                              <div className="flex items-center gap-1.5 flex-1 mr-2">
                                <input
                                  type="text"
                                  value={editingListName}
                                  onChange={(e) => setEditingListName(e.target.value)}
                                  className="bg-black border border-slate-700 rounded px-2 py-0.5 text-xs text-white flex-1"
                                />
                                <button
                                  onClick={() => handleSaveEditList(l.id)}
                                  className="bg-[#7c3aed] text-white px-2 py-0.5 rounded text-[11px] font-bold"
                                >
                                  OK
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-bold text-white">{l.name}</h5>
                                <span className="text-[10px] text-slate-400">({(l.animeIds || []).length})</span>
                                <button
                                  onClick={() => {
                                    setEditingListId(l.id);
                                    setEditingListName(l.name);
                                  }}
                                  className="text-slate-400 hover:text-white"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveList(idx, 'up')}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                disabled={idx === customLists.length - 1}
                                onClick={() => handleMoveList(idx, 'down')}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteList(l.id)} className="text-rose-400 p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {(l.animeIds || []).length > 0 && (
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              {cleanIdList(l.animeIds).map((rawId, aIdx) => {
                                const animeId = String(rawId).trim();
                                const anime = findAnimeInCache(animeId);
                                if (!anime) return null;
                                return (
                                  <div
                                    key={`list-card-${l.id}-${animeId}-${aIdx}`}
                                    onClick={() => openAnimeDetails(anime)}
                                    className="cursor-pointer relative group aspect-[2/3] rounded-lg overflow-hidden bg-black active:scale-95 transition"
                                  >
                                    <img src={anime.image} alt={anime.title} className="w-full h-full object-cover" loading="lazy" />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Subtab 5: Animes Ocultos */}
                  {profileSubTab === 'ocultos' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                        <EyeOff className="w-4 h-4 text-[#a855f7]" />
                        <span>Recomendaciones Ocultas ({hiddenRecommendations.length})</span>
                      </div>

                      {hiddenRecommendations.length === 0 ? (
                        <div className="bg-[#121620] border border-[#1e2433] rounded-xl p-6 text-center text-slate-400 text-xs">
                          No has ocultado ninguna recomendación todavía.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cleanIdList(hiddenRecommendations).map((rawId, idx) => {
                            const id = String(rawId).trim();
                            const meta = hiddenDataMap[id];
                            const anime = meta && !meta.title.startsWith('Anime #')
                              ? { id, title: meta.title, image: meta.image }
                              : findAnimeInCache(id);

                            return (
                              <div
                                key={`hidden-item-${id}-${idx}`}
                                className="bg-[#121620] border border-[#1e2433] rounded-xl p-2.5 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={anime?.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&q=80'}
                                    alt="Anime"
                                    className="w-10 h-14 rounded object-cover bg-black shrink-0"
                                    loading="lazy"
                                  />
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-white truncate block">
                                      {anime?.title || 'Anime Oculto'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">Oculto de recomendaciones</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => restoreRecommendation(id)}
                                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition"
                                >
                                  Restaurar
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtab 6: Cuenta */}
                  {profileSubTab === 'cuenta' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white">Mi Cuenta</h3>

                      <div className="bg-[#0b0e14] border border-[#1b2230] rounded-2xl p-4 space-y-4">
                        <div className="space-y-2 text-xs">
                          <div className="flex flex-col sm:flex-row gap-1">
                            <span className="font-bold text-white">Correo electrónico:</span>
                            <span className="text-slate-400">{userEmail}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-1">
                            <span className="font-bold text-white">Nombre de Usuario:</span>
                            <span className="text-slate-400">{username}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#1b2230]">
                          <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="bg-[#241215] hover:bg-[#34181c] border border-rose-900/60 text-rose-500 font-semibold text-xs px-4 py-2 rounded-xl transition"
                          >
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL 1: EDITAR PERFIL */}
        {showEditProfileModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowEditProfileModal(false);
            }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="bg-[#121620] border border-[#1e2433] rounded-3xl p-6 max-w-[340px] w-full space-y-5 shadow-2xl">
              <h3 className="text-xl font-bold text-white">Editar Perfil</h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 block">Nombre de Usuario</label>
                <input
                  type="text"
                  value={editTempUsername}
                  onChange={(e) => setEditTempUsername(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-[#1e2433] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">Selecciona un Avatar</label>
                <div className="grid grid-cols-4 gap-3 py-1">
                  {ORIGINAL_AVATARS.map((av) => {
                    const isSelected = editTempAvatar === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditTempAvatar(av.url)}
                        className={`aspect-square rounded-full overflow-hidden transition relative p-0.5 ${
                          isSelected
                            ? 'ring-2 ring-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.7)] scale-105'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={av.url}
                          alt={av.name}
                          onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                          className="w-full h-full object-cover rounded-full bg-black"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs px-5 py-2 rounded-full transition shadow-lg shadow-purple-950/50"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: AÑADIR A LISTAS */}
        {showAddToListModal && selectedAnime && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddToListModal(false);
            }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="bg-[#121620] border border-[#1e2433] rounded-3xl p-5 max-w-[320px] w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <List className="w-4 h-4 text-[#a855f7]" />
                  <span>Añadir a tus Listas</span>
                </h4>
                <button onClick={() => setShowAddToListModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Selecciona las listas donde deseas incluir a <strong>{selectedAnime.title}</strong>:
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {customLists.map((l) => {
                  const isInList = (l.animeIds || []).map(String).includes(String(selectedAnime.id));
                  return (
                    <div
                      key={l.id}
                      onClick={() => handleToggleAnimeInList(l.id, selectedAnime.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isInList
                          ? 'bg-purple-950/40 border-[#a855f7] text-white'
                          : 'bg-[#0b0e14] border-[#1e2433] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold">{l.name}</span>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isInList ? 'bg-[#7c3aed] border-[#7c3aed]' : 'border-slate-600'
                        }`}
                      >
                        {isInList && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#1e2433] space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block">O crea una nueva lista:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Nombre de la lista..."
                    className="flex-1 bg-[#0b0e14] border border-[#1e2433] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                  <button
                    onClick={handleCreateList}
                    className="bg-[#7c3aed] text-white px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
                  >
                    Crear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: REQUIERE INICIAR SESIÓN PARA GUARDAR */}
        {showAuthRequiredModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAuthRequiredModal(null);
            }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="bg-[#121620] border border-[#7c3aed] rounded-3xl p-6 max-w-[300px] w-full text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-[#7c3aed]/20 text-[#a855f7] flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Inicia Sesión</h4>
              <p className="text-xs text-slate-300">
                Para {showAuthRequiredModal}, necesitas tener una cuenta en la aplicación.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    setShowAuthRequiredModal(null);
                    setSelectedAnime(null);
                    setCurrentEpisode(null);
                    setActiveTab('profile');
                  }}
                  className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-purple-950"
                >
                  Iniciar Sesión / Registrarme
                </button>
                <button
                  onClick={() => setShowAuthRequiredModal(null)}
                  className="w-full bg-[#181f2c] text-slate-400 hover:text-white py-2 rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: CONFIRMACIÓN DE RESTAURAR FAVORITO SECRETO */}
        {secretRestoreConfirmId && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setSecretRestoreConfirmId(null);
            }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="bg-[#121620] border border-purple-800 rounded-2xl p-5 max-w-[280px] w-full text-center space-y-3">
              <h4 className="text-sm font-bold text-white">¿Devolver a favoritos normales?</h4>
              <p className="text-xs text-slate-300">
                Este anime dejará de ser secreto y volverá a aparecer en tus favoritos principales.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSecretRestoreConfirmId(null)}
                  className="flex-1 bg-[#1a202c] text-slate-300 py-1.5 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRestoreSecretFavorite(secretRestoreConfirmId)}
                  className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-1.5 rounded-lg text-xs"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: SACAR ANIME DEL CATÁLOGO SECRETO */}
        {secretRemoveAnimeTarget && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setSecretRemoveAnimeTarget(null);
            }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="bg-[#121620] border border-purple-800 rounded-2xl p-5 max-w-[290px] w-full text-center space-y-3">
              <h4 className="text-sm font-bold text-white">¿Sacar del catálogo secreto?</h4>
              <p className="text-xs text-slate-300">
                ¿Deseas retirar a <strong>{secretRemoveAnimeTarget.title}</strong> de la Zona Secreta? Volverá al catálogo normal para todos.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSecretRemoveAnimeTarget(null)}
                  className="flex-1 bg-[#1a202c] text-slate-300 py-1.5 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRemoveFromSecretCatalog(secretRemoveAnimeTarget)}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 rounded-lg text-xs"
                >
                  Sacar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 6: CONFIRMACIÓN CERRAR SESIÓN */}
        {showLogoutConfirm && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowLogoutConfirm(false);
            }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="bg-[#121620] border border-[#1e2433] rounded-2xl p-5 max-w-[280px] w-full text-center space-y-3">
              <h4 className="text-sm font-bold text-white">¿Cerrar Sesión?</h4>
              <p className="text-xs text-slate-300">
                ¿Estás seguro de que deseas salir de tu cuenta?
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-[#1a202c] text-slate-300 py-1.5 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 rounded-lg text-xs"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 7: TRANSMITIR A SMART TV */}
        {showCastModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCastModal(false);
            }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="bg-[#121620] border border-[#1e2433] rounded-3xl p-5 max-w-[320px] w-full space-y-3.5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Cast className="w-4 h-4 text-[#a855f7]" />
                  <span>Transmitir a tu Pantalla</span>
                </div>
                <button onClick={() => setShowCastModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Selecciona cómo deseas transmitir este video a tu Smart TV (Samsung TV, Roku, Google TV):
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    if ((window as any).PresentationRequest) {
                      try {
                        const request = new (window as any).PresentationRequest([activeServer?.url || '']);
                        request.start();
                      } catch (e) {}
                    }
                    showToast('Buscando dispositivos Smart TV en tu red Wi-Fi...');
                    setShowCastModal(false);
                  }}
                  className="w-full bg-[#7c3aed] text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Cast className="w-4 h-4" />
                  <span>Buscar Samsung TV / Roku (Wi-Fi)</span>
                </button>

                <button
                  onClick={() => {
                    if (activeServer?.url) {
                      navigator.clipboard.writeText(activeServer.url);
                      showToast('Enlace de video copiado para navegador de tu TV');
                      setShowCastModal(false);
                    }
                  }}
                  className="w-full bg-[#181f2c] text-slate-300 hover:text-white p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Copiar enlace de video para tu TV</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clean Mobile Bottom Navigation Bar: Ergonomic for Poco M6 Pro & Mobile Gesture Bars */}
        {!currentEpisode && (
          <nav className="border-t border-[#181f2c] bg-[#0b0e14]/95 backdrop-blur-md px-3 pt-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around fixed sm:absolute bottom-0 left-0 right-0 z-40 shadow-2xl">
          <button
            onClick={() => {
              if (activeTab === 'home' && !selectedAnime) {
                scrollToTop();
              } else {
                setSelectedAnime(null);
                setCurrentEpisode(null);
                setActiveTab('home');
                scrollToTop();
              }
            }}
            onDoubleClick={scrollToTop}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'home' && !selectedAnime
                ? 'text-[#a855f7] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span className="text-[10px]">Inicio</span>
          </button>

          <button
            onClick={() => {
              if (activeTab === 'catalog') {
                scrollToTop();
              } else {
                resetAndOpenCatalog();
                scrollToTop();
              }
            }}
            onDoubleClick={scrollToTop}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'catalog'
                ? 'text-[#a855f7] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px]">Catálogo</span>
          </button>

          <button
            onClick={() => {
              if (activeTab === 'favorites') {
                scrollToTop();
              } else {
                setSelectedAnime(null);
                setCurrentEpisode(null);
                setActiveTab('favorites');
                scrollToTop();
              }
            }}
            onDoubleClick={scrollToTop}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'favorites'
                ? 'text-[#a855f7] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span className="text-[10px]">Favoritos</span>
          </button>

          <button
            onClick={() => {
              if (activeTab === 'profile') {
                scrollToTop();
              } else {
                setSelectedAnime(null);
                setCurrentEpisode(null);
                setActiveTab('profile');
                scrollToTop();
              }
            }}
            onDoubleClick={scrollToTop}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'profile'
                ? 'text-[#a855f7] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">Perfil</span>
          </button>
        </nav>
        )}
      </div>
    </div>
  );
}
