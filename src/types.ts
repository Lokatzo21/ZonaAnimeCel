export interface ServerOption {
  id: string;
  name: string;
  url: string;
  quality: string;
  language: 'sub' | 'latino' | 'castellano';
  type: 'embed' | 'direct' | 'hls';
}

export interface Episode {
  id: number;
  number: number;
  title: string;
  thumbnail: string;
  duration: string;
  uploadDate: string;
  servers: ServerOption[];
}

export interface Anime {
  id: string;
  title: string;
  romajiTitle?: string;
  synopsis: string;
  coverImage: string;
  bannerImage: string;
  genres: string[];
  status: 'En emisión' | 'Finalizado';
  rating: number;
  totalEpisodes: number;
  episodes: Episode[];
  isFeatured?: boolean;
}
