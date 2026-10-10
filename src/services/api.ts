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
  backdrop?: string | null;
  hasBackdrop?: boolean;
  contentType?: 'todos' | 'animes' | 'peliculas' | 'series';
  is_secret?: boolean;
  episode_names?: Record<string, string>;
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

const DB_CATALOG_ITEMS: Record<string, MappedAnime> = {
  // === 13 Películas en anime_episodes ===
  '1242898': {
    id: 1242898,
    title: 'Depredador: Tierras salvajes',
    image: 'https://image.tmdb.org/t/p/w500/r7TEWHLr1lsIsTkiEFwtM3hAWma.jpg',
    banner: 'https://image.tmdb.org/t/p/original/82lM4GJ9uuNvNDOEpxFy77uv4Ak.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/82lM4GJ9uuNvNDOEpxFy77uv4Ak.jpg',
    hasBackdrop: true,
    score: '7.8',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'En el futuro, en un planeta remoto, un joven Depredador, marginado de su clan, encuentra un aliado inesperado en Thia y se embarca en un peligroso viaje en busca del adversario definitivo.',
    genres: ['Action & Adventure', 'Sci-Fi & Fantasy'],
    status: 'Finalizado',
    isCustom: false
  },
  '1007734': {
    id: 1007734,
    title: 'Nadie 2',
    image: 'https://image.tmdb.org/t/p/w500/21agmmYf9mJo8QuphtkZA3R4gsG.jpg',
    banner: 'https://image.tmdb.org/t/p/original/82C04rTiXYZ7c8XZv91Nu53w82Y.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/82C04rTiXYZ7c8XZv91Nu53w82Y.jpg',
    hasBackdrop: true,
    score: '6.9',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'El ex asesino Hutch Mansell lleva a su familia a unas nostálgicas vacaciones a un parque temático de una pequeña ciudad, solo para volver a verse arrastrado a la violencia cuando se enfrentan a un operador corrupto, un sheriff corrupto y un despiadado jefe criminal.',
    genres: ['Action & Adventure', 'Drama'],
    status: 'Finalizado',
    isCustom: false
  },
  '614933': {
    id: 614933,
    title: 'Atlas',
    image: 'https://image.tmdb.org/t/p/w500/wSnBSv7oHgm1kZmiM8IqithlTmJ.jpg',
    banner: 'https://image.tmdb.org/t/p/original/3TNSoa0UHGEzEz5ndXGjJVKo8RJ.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/3TNSoa0UHGEzEz5ndXGjJVKo8RJ.jpg',
    hasBackdrop: true,
    score: '6.6',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'Una analista antiterrorista que no confía en la inteligencia artificial descubre que esta puede ser su única esperanza cuando una misión para capturar a un robot rebelde sale mal.',
    genres: ['Sci-Fi & Fantasy', 'Action & Adventure'],
    status: 'Finalizado',
    isCustom: false
  },
  '9313': {
    id: 9313,
    title: 'El hombre de la máscara de hierro',
    image: 'https://image.tmdb.org/t/p/w500/50Ug4tJ66gJ9ZgivMGzZnGkdw1p.jpg',
    banner: 'https://image.tmdb.org/t/p/original/uhhtglfXNaTavkKtjer38qHLfVi.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/uhhtglfXNaTavkKtjer38qHLfVi.jpg',
    hasBackdrop: true,
    score: '6.7',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'Francia se muere de hambre, mientras el Rey Luis XIV mantiene un reinado de terror. Sólo "los tres mosqueteros" podrán salir al rescate. Su misión: liberar a un misterioso prisionero en La Bastilla, en cuya identidad radica el secreto que podrá salvar a la nación...',
    genres: ['Action & Adventure', 'Drama'],
    status: 'Finalizado',
    isCustom: false
  },
  '718930': {
    id: 718930,
    title: 'Tren bala',
    image: 'https://image.tmdb.org/t/p/w500/kM6iLHkDfyoMsTIm567mUFzFO9e.jpg',
    banner: 'https://image.tmdb.org/t/p/original/y2Ca1neKke2mGPMaHzlCNDVZqsK.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/y2Ca1neKke2mGPMaHzlCNDVZqsK.jpg',
    hasBackdrop: true,
    score: '7.4',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'El desafortunado asesino "Catarina" está decidido a hacer su trabajo pacíficamente después de que demasiados encargos se descarrilaron, pero el destino lo pone en curso de colisión con adversarios letales de todo el mundo en el tren más rápido del planeta.',
    genres: ['Action & Adventure', 'Comedia'],
    status: 'Finalizado',
    isCustom: false
  },
  '1265609': {
    id: 1265609,
    title: 'Máquina de guerra',
    image: 'https://image.tmdb.org/t/p/w500/aq2vbzxcG5K3SSLReMqO5TettmE.jpg',
    banner: 'https://image.tmdb.org/t/p/original/6yeVcxFR0j08vlv2OlL6zbewm4D.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/6yeVcxFR0j08vlv2OlL6zbewm4D.jpg',
    hasBackdrop: true,
    score: '7.5',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'En su última misión de entrenamiento, un ingeniero de combate debe liderar a su unidad en una lucha por sobrevivir ante una amenaza inimaginable.',
    genres: ['Action & Adventure', 'Sci-Fi & Fantasy'],
    status: 'Finalizado',
    isCustom: false
  },
  '550': {
    id: 550,
    title: 'El Club de la Pelea',
    image: 'https://image.tmdb.org/t/p/w500/bI0BhpswEApC0B17RhLZtRVPZiQ.jpg',
    banner: 'https://image.tmdb.org/t/p/original/c6OLXfKAk5BKeR6broC8pYiCquX.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/c6OLXfKAk5BKeR6broC8pYiCquX.jpg',
    hasBackdrop: true,
    score: '8.4',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'Un hombre consumido por el insomnio y una vida sin sentido conoce a Tyler Durden, un carismático anarquista que lo arrastra a un club secreto donde el dolor despierta algo dormido.',
    genres: ['Drama'],
    status: 'Finalizado',
    isCustom: false
  },
  '283995': {
    id: 283995,
    title: 'Guardianes de la Galaxia volumen 2',
    image: 'https://image.tmdb.org/t/p/w500/kdg6Y06jfq9FV7qknWNcKLYtBJn.jpg',
    banner: 'https://image.tmdb.org/t/p/original/aJn9XeesqsrSLKcHfHP4u5985hn.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/aJn9XeesqsrSLKcHfHP4u5985hn.jpg',
    hasBackdrop: true,
    score: '7.6',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'Continúan las aventuras del equipo en su travesía por los confines del cosmos. Los Guardianes deberán luchar para mantener unida a su nueva familia mientras intentan resolver el misterio de los verdaderos orígenes de Peter Quill.',
    genres: ['Sci-Fi & Fantasy', 'Action & Adventure', 'Comedia'],
    status: 'Finalizado',
    isCustom: false
  },
  '107846': {
    id: 107846,
    title: 'Plan de escape',
    image: 'https://image.tmdb.org/t/p/w500/8YpUgKQE7osYU7L49VE34PxVrKA.jpg',
    banner: 'https://image.tmdb.org/t/p/original/ix9WYBqQ2xSZCgyeQ1vVdrbaFa4.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/ix9WYBqQ2xSZCgyeQ1vVdrbaFa4.jpg',
    hasBackdrop: true,
    score: '6.7',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'Ray Breslin, un experto en seguridad carcelaria, se enfrenta a su mayor reto: escapar de la prisión que él mismo ha diseñado.',
    genres: ['Action & Adventure', 'Misterio'],
    status: 'Finalizado',
    isCustom: false
  },
  '440471': {
    id: 440471,
    title: 'Plan de Escape 2',
    image: 'https://image.tmdb.org/t/p/w500/vyhtl0GJvGQqNNs3CzOrFtGCGYU.jpg',
    banner: 'https://image.tmdb.org/t/p/original/xIAaN3AQqaJiN5RJ0WsmBady8Hq.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/xIAaN3AQqaJiN5RJ0WsmBady8Hq.jpg',
    hasBackdrop: true,
    score: '5.2',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'El experto en seguridad Ray Breslin y su equipo élite regresan para rescatar a Shu Ren, un agente de confianza que ha sido secuestrado y confinado en Hades, la prisión de máxima seguridad más impenetrable del planeta.',
    genres: ['Action & Adventure', 'Sci-Fi & Fantasy', 'Misterio'],
    status: 'Finalizado',
    isCustom: false
  },
  '480042': {
    id: 480042,
    title: 'Plan de Escape 3: El Rescate',
    image: 'https://image.tmdb.org/t/p/w500/AyLUHyEce0RNRwcjQQY2frhS7P.jpg',
    banner: 'https://image.tmdb.org/t/p/original/yxmfjj4YiFcJipn9nYVBRxeCvo9.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/yxmfjj4YiFcJipn9nYVBRxeCvo9.jpg',
    hasBackdrop: true,
    score: '5.4',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'El experto en seguridad Ray Breslin es contratado para rescatar a la hija de un magnate de la tecnología de Hong Kong que ha sido secuestrada en una prisión de Letonia.',
    genres: ['Action & Adventure', 'Drama'],
    status: 'Finalizado',
    isCustom: false
  },
  '1062722': {
    id: 1062722,
    title: 'Frankenstein',
    image: 'https://image.tmdb.org/t/p/w500/hTj8x0ElKldJyAjTYvaqxkQNxxN.jpg',
    banner: 'https://image.tmdb.org/t/p/original/hpXBJxLD2SEf8l2CspmSeiHrBKX.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/hpXBJxLD2SEf8l2CspmSeiHrBKX.jpg',
    hasBackdrop: true,
    score: '7.6',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'El Dr. Victor Frankenstein, un científico brillante pero egoísta, da vida a una criatura en un monstruoso experimento que finalmente conduce a la ruina tanto del creador como de su trágica creación.',
    genres: ['Drama', 'Sci-Fi & Fantasy'],
    status: 'Finalizado',
    isCustom: false
  },
  '533533': {
    id: 533533,
    title: 'TRON: Ares',
    image: 'https://image.tmdb.org/t/p/w500/dz1PbMrkpVhURKtvv7w2Ib1iZDK.jpg',
    banner: 'https://image.tmdb.org/t/p/original/pUNfHmVqfwRdILhCkU8TdysVOXo.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/pUNfHmVqfwRdILhCkU8TdysVOXo.jpg',
    hasBackdrop: true,
    score: '6.5',
    totalEpisodes: 1,
    episodes: 1,
    type: 'Película',
    contentType: 'peliculas',
    description: 'Un programa altamente sofisticado llamado Ares es enviado del mundo digital al mundo real en una misión peligrosa, marcando el primer encuentro de la humanidad con seres de IA.',
    genres: ['Sci-Fi & Fantasy', 'Action & Adventure'],
    status: 'Finalizado',
    isCustom: false
  },

  // === 7 Series con TMDB ID en anime_episodes ===
  '202411': {
    id: 202411,
    title: 'Monarch: Legado de monstruos',
    image: 'https://image.tmdb.org/t/p/w500/66Ofbs8H1ZiYVjxaG6OWIev4xrR.jpg',
    banner: 'https://image.tmdb.org/t/p/original/n5FGEUmId87nZAdFiOFmCKXynmT.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/n5FGEUmId87nZAdFiOFmCKXynmT.jpg',
    hasBackdrop: true,
    score: '7.7',
    totalEpisodes: 20,
    episodes: 20,
    type: 'Serie',
    contentType: 'series',
    description: 'Después de haber sobrevivido al ataque de Godzilla en San Francisco, Cate se embarca en una aventura por todo el mundo para saber la verdad sobre su familia y la misteriosa organización conocida como Monarch.',
    genres: ['Sci-Fi & Fantasy', 'Drama', 'Action & Adventure'],
    status: 'En emisión',
    isCustom: false
  },
  '228878': {
    id: 228878,
    title: 'Efectos colaterales',
    image: 'https://image.tmdb.org/t/p/w500/rYsLEca2TwkABX5c04LuKZdjSTG.jpg',
    banner: 'https://image.tmdb.org/t/p/original/4drV6iluttgjZmU1Q0xDqjrBQ1.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/4drV6iluttgjZmU1Q0xDqjrBQ1.jpg',
    hasBackdrop: true,
    score: '8.5',
    totalEpisodes: 10,
    episodes: 10,
    type: 'Serie',
    contentType: 'series',
    description: 'Marshall y Frances, dos excompañeros que comparten un secreto: descubrieron la mejor medicina del mundo, un hongo que puede curar casi cualquier cosa.',
    genres: ['Animación', 'Drama', 'Comedia', 'Sci-Fi & Fantasy'],
    status: 'En emisión',
    isCustom: false
  },
  '95350': {
    id: 95350,
    title: 'Linternas',
    image: 'https://image.tmdb.org/t/p/w500/t6Ub9GTbw6uwphRZQQiQlKim0vO.jpg',
    banner: 'https://image.tmdb.org/t/p/original/wJjnJbVUwPz0GADAgpFt9nWtzUu.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/wJjnJbVUwPz0GADAgpFt9nWtzUu.jpg',
    hasBackdrop: true,
    score: '8.3',
    totalEpisodes: 8,
    episodes: 8,
    type: 'Serie',
    contentType: 'series',
    description: 'El nuevo recluta John Stewart y la leyenda Hal Jordan, dos policías intergalácticos, se ven envueltos en un oscuro misterio terrestre mientras investigan un asesinato en el corazón de Estados Unidos.',
    genres: ['Drama', 'Misterio', 'Sci-Fi & Fantasy'],
    status: 'En emisión',
    isCustom: false
  },
  '291339': {
    id: 291339,
    title: 'Memoria de un Asesino',
    image: 'https://image.tmdb.org/t/p/w500/79EO16C4zs8fwxKEjRENVvIQHIB.jpg',
    banner: 'https://image.tmdb.org/t/p/original/llrSuUkFiR6EjDnh79dq8HEeziF.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/llrSuUkFiR6EjDnh79dq8HEeziF.jpg',
    hasBackdrop: true,
    score: '7.8',
    totalEpisodes: 10,
    episodes: 10,
    type: 'Serie',
    contentType: 'series',
    description: 'Angelo lleva una doble vida, como asesino y como padre de familia, y todo funcionaba bien hasta que le sobrevino un principio de Alzheimer. Ahora sus mundos chocan, poniendo a su familia en peligro.',
    genres: ['Drama', 'Misterio'],
    status: 'En emisión',
    isCustom: false
  },
  '226362': {
    id: 226362,
    title: 'El Eternauta',
    image: 'https://image.tmdb.org/t/p/w500/9Krv5NvKa5a3Q3b1l2B3rP9Bj8E.jpg',
    banner: 'https://image.tmdb.org/t/p/original/yMjGzK7L4gwzpQNNtFKDeG79upo.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/yMjGzK7L4gwzpQNNtFKDeG79upo.jpg',
    hasBackdrop: true,
    score: '7.4',
    totalEpisodes: 6,
    episodes: 6,
    type: 'Serie',
    contentType: 'series',
    description: 'Después de una nevada mortal que acaba con gran parte de la población, Juan Salvo y un grupo de sobrevivientes en Buenos Aires deben resistir a una amenaza de otro planeta.',
    genres: ['Drama', 'Action & Adventure', 'Sci-Fi & Fantasy'],
    status: 'En emisión',
    isCustom: false
  },
  '127529': {
    id: 127529,
    title: 'Sabuesos',
    image: 'https://image.tmdb.org/t/p/w500/pWzp4HpDifuyNF8zkPIy8MKCg2d.jpg',
    banner: 'https://image.tmdb.org/t/p/original/zhsEnDNCQX5dlI2wbKzV90pV0B9.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/zhsEnDNCQX5dlI2wbKzV90pV0B9.jpg',
    hasBackdrop: true,
    score: '8.5',
    totalEpisodes: 15,
    episodes: 15,
    type: 'Serie',
    contentType: 'series',
    description: 'Dos jóvenes boxeadores unen fuerzas con un benévolo prestamista para destruir a un despiadado usurero que se aprovecha de los más vulnerables.',
    genres: ['Drama', 'Action & Adventure'],
    status: 'Finalizado',
    isCustom: false
  },
  '278624': {
    id: 278624,
    title: 'Lucky',
    image: 'https://image.tmdb.org/t/p/w500/vZ3GfOoeha2xVCPec0jv2jf3yfC.jpg',
    banner: 'https://image.tmdb.org/t/p/original/mKrhRPB7rMvy0bIU1l1NYhgh1eI.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/mKrhRPB7rMvy0bIU1l1NYhgh1eI.jpg',
    hasBackdrop: true,
    score: '7.3',
    totalEpisodes: 7,
    episodes: 7,
    type: 'Serie',
    contentType: 'series',
    description: 'Cuando un robo multimillonario sale mal, la estafadora Lucky se ve obligada a escapar. Perseguida por el FBI y un despiadado jefe militar, Lucky debe pelear por su vida y por una salida.',
    genres: ['Drama', 'Action & Adventure'],
    status: 'Finalizado',
    isCustom: false
  }
};

const DB_CATALOG_LIST: MappedAnime[] = [
  DB_CATALOG_ITEMS['1242898'],
  DB_CATALOG_ITEMS['1007734'],
  DB_CATALOG_ITEMS['614933'],
  DB_CATALOG_ITEMS['9313'],
  DB_CATALOG_ITEMS['718930'],
  DB_CATALOG_ITEMS['1265609'],
  DB_CATALOG_ITEMS['550'],
  DB_CATALOG_ITEMS['283995'],
  DB_CATALOG_ITEMS['107846'],
  DB_CATALOG_ITEMS['440471'],
  DB_CATALOG_ITEMS['480042'],
  DB_CATALOG_ITEMS['1062722'],
  DB_CATALOG_ITEMS['533533'],
  DB_CATALOG_ITEMS['202411'],
  DB_CATALOG_ITEMS['228878'],
  DB_CATALOG_ITEMS['95350'],
  DB_CATALOG_ITEMS['291339'],
  DB_CATALOG_ITEMS['226362'],
  DB_CATALOG_ITEMS['127529'],
  DB_CATALOG_ITEMS['278624']
];

const dedupeCatalogList = (items: MappedAnime[]): MappedAnime[] => {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const result: MappedAnime[] = [];
  for (const item of items) {
    if (!item || !item.id) continue;
    const idStr = String(item.id).trim();
    const titleNorm = (item.title || '').trim().toLowerCase();
    if (seenIds.has(idStr) || (titleNorm && seenTitles.has(titleNorm))) continue;
    seenIds.add(idStr);
    if (titleNorm) seenTitles.add(titleNorm);
    result.push(item);
  }
  return result;
};

// Persistent and In-Memory Cache for ultra-fast instant loading (0ms)
const animeCache = new Map<string, MappedAnime>();
DB_CATALOG_LIST.forEach((item) => animeCache.set(String(item.id), item));

const initCacheFromStorage = () => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('animezona_global_anime_cache') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: MappedAnime) => {
          if (item && item.id && item.title && !item.title.startsWith('Anime #')) {
            const idStr = String(item.id);
            if (DB_CATALOG_ITEMS[idStr]) {
              animeCache.set(idStr, DB_CATALOG_ITEMS[idStr]);
            } else if (item.title !== 'AMAZON 3D' && item.title !== 'La Spirale' && item.title !== 'Day at the Park') {
              animeCache.set(idStr, item);
            }
          }
        });
      }
    }
    DB_CATALOG_LIST.forEach((item) => animeCache.set(String(item.id), item));
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

const CUSTOM_MEDIA_ENRICHMENT: Record<string, { backdrop?: string; image?: string }> = {
  'silo': {
    backdrop: 'https://image.tmdb.org/t/p/original/uTWhbLc7Bj4qNSdW3ZvZKL8cOHv.jpg',
    image: 'https://image.tmdb.org/t/p/w500/s4yRu8IRcMLbfoUsO4q9Yuci4F0.jpg'
  },
  'the super cube': {
    backdrop: 'https://image.tmdb.org/t/p/original/89qSKhLrJOUhp6xgbqgSTpzblbA.jpg',
    image: 'https://image.tmdb.org/t/p/w500/8nJV1CEh2eLK5fL3puEOE2tIEQI.jpg'
  },
  'super cube': {
    backdrop: 'https://image.tmdb.org/t/p/original/89qSKhLrJOUhp6xgbqgSTpzblbA.jpg',
    image: 'https://image.tmdb.org/t/p/w500/8nJV1CEh2eLK5fL3puEOE2tIEQI.jpg'
  },
  'lord of mysteries': {
    backdrop: 'https://image.tmdb.org/t/p/original/gdvUUqWutEulHSB4JBoWWnbsLo6.jpg',
    image: 'https://image.tmdb.org/t/p/w500/cR5KiAdVeZLG4nDUiCyqfvGzZ3f.jpg'
  },
  'deadpool & wolverine': {
    backdrop: 'https://image.tmdb.org/t/p/original/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg',
    image: 'https://image.tmdb.org/t/p/w500/6aY3OzCIdxoBMYdiH5s17rWFFFA.jpg'
  },
  'la oficina': {
    backdrop: 'https://image.tmdb.org/t/p/original/mLyW3UTgi2lsMdtueYODcfAB9Ku.jpg',
    image: 'https://image.tmdb.org/t/p/w500/mZMmfkTDiXgdKADBykhEFDp940V.jpg'
  },
  'boushoku no berserk': {
    backdrop: 'https://image.tmdb.org/t/p/original/w6UrhLiXEMLwI4PFv2I2JEPhLRj.jpg',
    image: 'https://image.tmdb.org/t/p/w500/p5rtHwieByHo1NdzOxB3vtVJJnA.jpg'
  },
  'spider-noir': {
    backdrop: 'https://image.tmdb.org/t/p/original/reAZlLG6YMkBuxPT1XKuCH97TM1.jpg',
    image: 'https://image.tmdb.org/t/p/w500/4Pec5a1At5UMeADkgcxwf6nLqau.jpg'
  },
  'el eternauta': {
    backdrop: 'https://image.tmdb.org/t/p/original/yMjGzK7L4gwzpQNNtFKDeG79upo.jpg',
    image: 'https://image.tmdb.org/t/p/w500/9Krv5NvKa5a3Q3b1l2B3rP9Bj8E.jpg'
  },
  'amigos y vecinos': {
    backdrop: 'https://image.tmdb.org/t/p/original/e0mloha4ZQfLVZj0nsUtU7AoRs4.jpg',
    image: 'https://image.tmdb.org/t/p/w500/ikaSVbTZyzsnjHK0ex64bJqQpgd.jpg'
  },
  'cazador de demonios': {
    backdrop: 'https://image.tmdb.org/t/p/original/vfEtEzBIn0wwWM7ppzJCGEZUSu2.jpg',
    image: 'https://image.tmdb.org/t/p/w500/6Ru3HStuwofNr6d20sKzAgmI2Yu.jpg'
  },
  'efectos colaterales': {
    backdrop: 'https://image.tmdb.org/t/p/original/4drV6iluttgjZmU1Q0xDqjrBQ1.jpg',
    image: 'https://image.tmdb.org/t/p/w500/rYsLEca2TwkABX5c04LuKZdjSTG.jpg'
  },
  'the pitt': {
    backdrop: 'https://image.tmdb.org/t/p/original/z3BkMbCy5ajZPMyKEUwsPHuz2cV.jpg',
    image: 'https://image.tmdb.org/t/p/w500/kvFSpESyBZMjaeOJDx7RS3P1jey.jpg'
  },
  'el nivel secreto': {
    backdrop: 'https://image.tmdb.org/t/p/original/5AvZxT1BtPyP9ua1SjcUyWUMIiz.jpg',
    image: 'https://image.tmdb.org/t/p/w500/y5jxT1jnydJL6sB3QkzCLu8e3HS.jpg'
  },
  'kaiju no. 8': {
    backdrop: 'https://image.tmdb.org/t/p/original/htGeuCcNhlBe8GTx3izKOsd8frw.jpg',
    image: 'https://image.tmdb.org/t/p/w500/A6JOsCdFFTxtbDnKAfE0iY6jOiE.jpg'
  },
  'el chacal': {
    backdrop: 'https://image.tmdb.org/t/p/original/enVrO8TRkdT8dmYXTfI4sEjR5Kp.jpg',
    image: 'https://image.tmdb.org/t/p/w500/faqXSU7eXffSxtyIX4EGyCITQpQ.jpg'
  },
  'piratas del caribe': {
    backdrop: 'https://image.tmdb.org/t/p/original/uRNgkJSkNBFbbn9fPsEjDIy8Sh3.jpg',
    image: 'https://image.tmdb.org/t/p/w500/8zHnkTGyAImBcI49a1xFJHUjbaK.jpg'
  },
  'arma mortal': {
    backdrop: 'https://image.tmdb.org/t/p/original/yqZ5ACKeNJ30mylUEzvtWZu4pGU.jpg',
    image: 'https://image.tmdb.org/t/p/w500/wP5ujjLHBWJFkwcExjwtGmhPagU.jpg'
  },
  'animales fantásticos': {
    backdrop: 'https://image.tmdb.org/t/p/original/8Qsr8pvDL3s1jNZQ4HK1d1Xlvnh.jpg',
    image: 'https://image.tmdb.org/t/p/w500/wduJFXlHQTIw1TBf6kTO3bHf2VN.jpg'
  },
  'así aprenderás': {
    backdrop: 'https://image.tmdb.org/t/p/original/vyG93jhmPL7tBIhRtCLa5mdBKob.jpg',
    image: 'https://image.tmdb.org/t/p/w500/lG83nWVT7cHl3nSxonaYhOjqyWH.jpg'
  },
  'el mentalista': {
    backdrop: 'https://image.tmdb.org/t/p/original/rJFqKcmMSttdNP58l0dVzY2NcTA.jpg',
    image: 'https://image.tmdb.org/t/p/w500/f3F6NA7A8TY8EjdIiGyYqoo38ug.jpg'
  },
  'harry potter colección': {
    backdrop: 'https://image.tmdb.org/t/p/original/8r4r9Qzp393epFaEv0FiB8ENen3.jpg',
    image: 'https://image.tmdb.org/t/p/original/pNeqCBGdEOhdaMTPlwdy1oJLG75.jpg'
  }
};

const mapCustomAnime = (item: any): MappedAnime => {
  const isMovieOrSaga = (Number(item.total_episodes) === 1) || 
    /colecci[oó]n|pel[ií]cula|saga|harry potter|piratas del caribe|arma mortal|animales fant[aá]sticos|deadpool/i.test(item.title);
  const isAnime = /berserk|mysteries|cube|anime/i.test(item.title) || 
    (Array.isArray(item.genres) && item.genres.includes('Animación') && !isMovieOrSaga);
  const isSeries = !isMovieOrSaga && !isAnime;

  const titleKey = (item.title || '').trim().toLowerCase();
  const enrichment = CUSTOM_MEDIA_ENRICHMENT[titleKey] || 
    Object.entries(CUSTOM_MEDIA_ENRICHMENT).find(([k]) => titleKey.includes(k))?.[1] || {};

  const posterImage = (item.image && item.image.includes('image.tmdb.org'))
    ? item.image
    : (enrichment.image || item.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80');

  const backdropUrl = item.banner || enrichment.backdrop || null;
  const hasBackdrop = Boolean(backdropUrl);

  const mapped: MappedAnime = {
    id: item.id,
    title: item.title,
    image: posterImage,
    banner: backdropUrl || posterImage || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80',
    backdrop: backdropUrl,
    hasBackdrop,
    score: item.score || '9.5',
    totalEpisodes: (Number(item.total_episodes) === 1) ? 1 : (item.total_episodes || 12),
    episodes: (Number(item.total_episodes) === 1) ? 1 : (item.total_episodes || 12),
    type: isMovieOrSaga ? 'Película / Saga' : (isSeries ? 'Serie' : 'Anime'),
    contentType: isMovieOrSaga ? 'peliculas' : (isAnime ? 'animes' : 'series'),
    description: item.description || 'Sinopsis agregada por la comunidad AnimeZona.',
    genres: item.genres || ['Anime'],
    status: item.status || 'En emisión',
    isCustom: true,
    is_secret: item.is_secret || false,
    episode_names: item.episode_names || {}
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

  // Get full catalog animes (DB_CATALOG_LIST + custom_animes deduplicated)
  getCatalogAnimes: async (includeSecret: boolean = false): Promise<MappedAnime[]> => {
    const custom = await api.getCustomAnimes(includeSecret);
    DB_CATALOG_LIST.forEach(cacheAnime);
    return dedupeCatalogList([...DB_CATALOG_LIST, ...custom]);
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
      const custom = await api.getCatalogAnimes();
      const url1 = `${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=es-MX&with_original_language=ja&sort_by=popularity.desc&page=1`;
      const res = await fetchWithDelay(url1);
      const tmdbMapped = (res?.results || []).map(mapAnimeData);
      const combined = dedupeCatalogList([...custom, ...tmdbMapped]);
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
      const custom = await api.getCatalogAnimes();
      const url = `${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=es-MX&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=300&page=1`;
      const res = await fetchWithDelay(url);
      const tmdbMapped = (res?.results || []).map(mapAnimeData);
      const combined = dedupeCatalogList([...custom.slice(0, 4), ...tmdbMapped]);
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
        const custom = await api.getCatalogAnimes();
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
      let combined = dedupeCatalogList([...customAnimes, ...tmdbList]);
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

    // 0. Instant match from DB_CATALOG_ITEMS
    if (DB_CATALOG_ITEMS[idStr]) {
      cacheAnime(DB_CATALOG_ITEMS[idStr]);
      return DB_CATALOG_ITEMS[idStr];
    }

    // 1. FAST PATH: Check memory and local storage cache (0ms)
    const cached = animeCache.get(idStr);
    if (cached && cached.title && !cached.title.startsWith('Anime #') && cached.title !== 'AMAZON 3D') {
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
        // Verificar si está registrado en anime_episodes y desambiguar Serie vs Película usando search_title y episode_number
        try {
          const { data: dbRows } = await supabase
            .from('anime_episodes')
            .select('anime_tmdb_id, search_title, episode_name, episode_number')
            .eq('anime_tmdb_id', idStr)
            .limit(5);

          if (dbRows && dbRows.length > 0) {
            const expectedTitle = (dbRows[0].search_title || '').toLowerCase().trim();
            const hasMultipleEps = dbRows.some((r: any) => Number(r.episode_number) > 1);
            const [tvRes, movieRes] = await Promise.all([
              fetchWithDelay(`${BASE_URL}/tv/${idStr}?api_key=${TMDB_API_KEY}&language=es-MX`).catch(() => null),
              fetchWithDelay(`${BASE_URL}/movie/${idStr}?api_key=${TMDB_API_KEY}&language=es-MX`).catch(() => null)
            ]);

            if (tvRes && movieRes && expectedTitle) {
              const tvName = (tvRes.name || '').toLowerCase();
              const tvOrig = (tvRes.original_name || '').toLowerCase();
              const movName = (movieRes.title || '').toLowerCase();
              const movOrig = (movieRes.original_title || '').toLowerCase();

              const tvMatches = tvName.includes(expectedTitle) || expectedTitle.includes(tvName) || tvOrig.includes(expectedTitle);
              const movMatches = movName.includes(expectedTitle) || expectedTitle.includes(movName) || movOrig.includes(expectedTitle);

              if ((tvMatches && !movMatches) || hasMultipleEps) {
                const mapped = mapAnimeData(tvRes);
                cacheAnime(mapped);
                return mapped;
              }
              if (movMatches && !tvMatches) {
                const mapped = mapAnimeData({ ...movieRes, media_type: 'movie' });
                mapped.type = 'Película';
                mapped.totalEpisodes = 1;
                cacheAnime(mapped);
                return mapped;
              }
            }

            if (hasMultipleEps && tvRes && (tvRes.name || tvRes.original_name)) {
              const mapped = mapAnimeData(tvRes);
              cacheAnime(mapped);
              return mapped;
            }
            if (!hasMultipleEps && movieRes && (movieRes.title || movieRes.original_title)) {
              const mapped = mapAnimeData({ ...movieRes, media_type: 'movie' });
              mapped.type = 'Película';
              mapped.totalEpisodes = 1;
              cacheAnime(mapped);
              return mapped;
            }
            if (tvRes && (tvRes.name || tvRes.original_name)) {
              const mapped = mapAnimeData(tvRes);
              cacheAnime(mapped);
              return mapped;
            }
          }
        } catch {}

        let tvData: any = null;
        let movieData: any = null;

        try {
          const url = `${BASE_URL}/tv/${idStr}?api_key=${TMDB_API_KEY}&language=es-MX`;
          tvData = await fetchWithDelay(url);
        } catch {}

        try {
          const movieUrl = `${BASE_URL}/movie/${idStr}?api_key=${TMDB_API_KEY}&language=es-MX`;
          movieData = await fetchWithDelay(movieUrl);
        } catch {}

        if (tvData && movieData) {
          const movieVotes = Number(movieData.vote_count || 0);
          const tvVotes = Number(tvData.vote_count || 0);
          if (movieVotes > tvVotes * 5) {
            const mapped = mapAnimeData(movieData);
            mapped.type = 'Película';
            mapped.totalEpisodes = 1;
            cacheAnime(mapped);
            return mapped;
          }
          const mapped = mapAnimeData(tvData);
          cacheAnime(mapped);
          return mapped;
        }

        if (tvData && (tvData.name || tvData.original_name)) {
          const mapped = mapAnimeData(tvData);
          cacheAnime(mapped);
          return mapped;
        }

        if (movieData && (movieData.title || movieData.original_title)) {
          const mapped = mapAnimeData(movieData);
          mapped.type = 'Película';
          mapped.totalEpisodes = 1;
          cacheAnime(mapped);
          return mapped;
        }
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
  getAnimeEpisodes: async (id: string | number, animeTitle: string, isMovieHint: boolean = false): Promise<MappedEpisode[]> => {
    try {
      const idStr = String(id).trim();
      const clean = animeTitle.trim().toLowerCase();
      const shortTitle = clean.split(/[:\-\(]/)[0].trim();
      const cached = getCachedAnime(id);

      const isMovie = isMovieHint ||
        (cached && (cached.type === 'Película' || cached.contentType === 'peliculas' || Number(cached.totalEpisodes) === 1)) ||
        /pel[ií]cula|deadpool/i.test(clean);

      if (isMovie && !/colecci[oó]n|saga/i.test(clean)) {
        return [
          {
            id: 1,
            episode_number: 1,
            season_number: 1,
            title: animeTitle || 'Película Completa'
          }
        ];
      }

      // First check Supabase scraped episodes by anime_tmdb_id (if numeric) or search_title
      let scrapedEps: any[] | null = null;
      if (idStr && /^\d+$/.test(idStr)) {
        const { data: byTmdb } = await supabase
          .from('anime_episodes')
          .select('episode_number, season_number, episode_name')
          .eq('anime_tmdb_id', idStr)
          .order('episode_number', { ascending: true });
        if (byTmdb && byTmdb.length > 0) {
          scrapedEps = byTmdb;
        }
      }

      if (!scrapedEps || scrapedEps.length === 0) {
        let query = supabase
          .from('anime_episodes')
          .select('episode_number, season_number, episode_name')
          .order('episode_number', { ascending: true });

        if (shortTitle && shortTitle !== clean) {
          query = query.or(`search_title.ilike.%${clean}%,search_title.ilike.%${shortTitle}%`);
        } else {
          query = query.ilike('search_title', `%${clean}%`);
        }

        const { data: byTitle } = await query;
        scrapedEps = byTitle;
      }

      if (scrapedEps && scrapedEps.length > 0) {
        const unique = new Map<number, MappedEpisode>();
        for (const ep of scrapedEps) {
          const epNum = Number(ep.episode_number) || 1;
          const existing = unique.get(epNum);
          const candidateTitle = ep.episode_name ? String(ep.episode_name).trim() : '';
          const isDescriptive = candidateTitle && candidateTitle.toLowerCase() !== `episodio ${epNum}`;
          if (!existing) {
            unique.set(epNum, {
              id: epNum,
              episode_number: epNum,
              season_number: ep.season_number || 1,
              title: candidateTitle || `Episodio ${epNum}`
            });
          } else if (isDescriptive && existing.title.toLowerCase() === `episodio ${epNum}`) {
            unique.set(epNum, {
              ...existing,
              title: candidateTitle
            });
          }
        }
        return Array.from(unique.values()).sort((a, b) => a.episode_number - b.episode_number);
      }

      // Default episode generator (1 to total episodes or 12)
      const count = isMovie ? 1 : (cached?.totalEpisodes || 12);
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        episode_number: i + 1,
        season_number: 1,
        title: isMovie ? (animeTitle || 'Película Completa') : `Episodio ${i + 1}`
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
    language: string = 'latino',
    animeId: string | number | null = null
  ): Promise<MappedServer[]> => {
    try {
      const clean = animeTitle.trim().toLowerCase();
      const shortTitle = clean.split(/[:\-\(]/)[0].trim();
      let matchedData: any[] = [];

      // 1. Prioridad: Buscar por anime_tmdb_id si está provisto
      if (animeId) {
        const idStr = String(animeId).trim();
        let q = supabase.from('anime_episodes').select('*').eq('anime_tmdb_id', idStr);
        if (!idStr.startsWith('custom-')) {
          q = q.eq('episode_number', episodeNum);
        }
        const { data: byId } = await q.order('created_at', { ascending: false });
        if (byId && byId.length > 0) {
          matchedData = byId;
        } else if (!idStr.startsWith('custom-')) {
          // Si no encontró por episode_number estricto, buscar por anime_tmdb_id y filtrar
          const { data: anyById } = await supabase.from('anime_episodes').select('*').eq('anime_tmdb_id', idStr);
          if (anyById && anyById.length > 0) {
            const epMatches = anyById.filter((e: any) => Number(e.episode_number) === Number(episodeNum));
            if (epMatches.length > 0) matchedData = epMatches;
            else if (Number(episodeNum) === 1) matchedData = anyById;
          }
        }
      }

      // 2. Prioridad: Buscar por episode_name
      if (matchedData.length === 0 && clean) {
        const { data: byEpName } = await supabase
          .from('anime_episodes')
          .select('*')
          .ilike('episode_name', `%${clean}%`)
          .order('created_at', { ascending: false });
        if (byEpName && byEpName.length > 0) {
          matchedData = byEpName;
        }
      }

      // 3. Prioridad: Buscar por search_title clásico
      if (matchedData.length === 0 && clean) {
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
          matchedData = data;
        }
      }

      if (matchedData.length > 0) {
        const servers: MappedServer[] = matchedData.map((item: any) => ({
          id: item.id,
          name: item.server_name || 'Servidor Oficial',
          description: `Servidor (${(item.language || 'Sub').toUpperCase()})`,
          url: item.video_url,
          color: item.server_name?.includes('ZONAAPS')
            ? '#ec4899'
            : item.server_name?.includes('CINEBEL')
            ? '#e11d48'
            : item.server_name?.includes('MULTI')
            ? '#f97316'
            : item.server_name?.includes('ARCHIVE')
            ? '#eab308'
            : item.server_name?.includes('EARNVIDS')
            ? '#10b981'
            : item.server_name?.includes('VIMEO')
            ? '#06b6d4'
            : item.server_name?.includes('GOODSTREAM')
            ? '#0ea5e9'
            : item.server_name?.includes('STREAMWISH')
            ? '#8b5cf6'
            : item.server_name?.includes('UQLOAD')
            ? '#6366f1'
            : item.server_name?.includes('FILEMOON')
            ? '#3b82f6'
            : item.server_name?.includes('FILELIONS')
            ? '#14b8a6'
            : item.server_name?.includes('VOE')
            ? '#a855f7'
            : item.server_name?.includes('VIDEOAPP')
            ? '#f43f5e'
            : '#64748b',
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
