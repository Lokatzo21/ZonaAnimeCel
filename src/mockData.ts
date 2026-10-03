import { Anime } from './types';

export const INITIAL_ANIMES: Anime[] = [
  {
    id: 'solo-leveling-s2',
    title: 'Solo Leveling: Arise from the Shadow',
    romajiTitle: 'Ore dake Level Up na Ken',
    synopsis: 'Sung Jinwoo continúa su ascenso como el Cazador de Sombras más formidable del mundo, enfrentando mazmorras de rango S y misterios antiguos.',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    genres: ['Acción', 'Fantasía', 'Superpoderes'],
    status: 'En emisión',
    rating: 9.7,
    totalEpisodes: 12,
    isFeatured: true,
    episodes: [
      {
        id: 1,
        number: 1,
        title: 'El Despertar del Monarca',
        thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        duration: '24:15',
        uploadDate: 'Hace 2 horas',
        servers: [
          {
            id: 'srv-1',
            name: 'Servidor 1 (Rápido HD)',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            quality: '1080p',
            language: 'sub',
            type: 'direct'
          },
          {
            id: 'srv-2',
            name: 'Servidor 2 (Streamwish)',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            quality: '720p',
            language: 'sub',
            type: 'direct'
          },
          {
            id: 'srv-3',
            name: 'Servidor 3 (Audio Latino)',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            quality: '1080p',
            language: 'latino',
            type: 'direct'
          }
        ]
      },
      {
        id: 2,
        number: 2,
        title: 'La Sombra Carmesí',
        thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        duration: '23:50',
        uploadDate: 'Ayer',
        servers: [
          {
            id: 'srv-1',
            name: 'Servidor 1 (Rápido HD)',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            quality: '1080p',
            language: 'sub',
            type: 'direct'
          }
        ]
      }
    ]
  },
  {
    id: 'jujutsu-kaisen-s2',
    title: 'Jujutsu Kaisen: Shibuya Incident',
    romajiTitle: 'Jujutsu Kaisen',
    synopsis: 'La barrera cae en Shibuya durante la noche de Halloween. Los hechiceros de grado especial se enfrentan a maldiciones de poder devastador.',
    coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    genres: ['Acción', 'Sobrenatural', 'Shonen'],
    status: 'Finalizado',
    rating: 9.8,
    totalEpisodes: 23,
    isFeatured: true,
    episodes: [
      {
        id: 1,
        number: 1,
        title: 'Puerta del Dragón',
        thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
        duration: '24:00',
        uploadDate: 'Hace 3 días',
        servers: [
          {
            id: 'srv-1',
            name: 'Servidor Principal',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            quality: '1080p',
            language: 'sub',
            type: 'direct'
          }
        ]
      }
    ]
  },
  {
    id: 'frieren-beyond-journey',
    title: 'Sousou no Frieren',
    romajiTitle: 'Frieren: Beyond Journey\'s End',
    synopsis: 'Tras derrotar al Rey Demonio, la elfa maga Frieren emprende un viaje para comprender a la humanidad y el paso del tiempo.',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    genres: ['Aventura', 'Drama', 'Fantasía'],
    status: 'Finalizado',
    rating: 9.9,
    totalEpisodes: 28,
    episodes: [
      {
        id: 1,
        number: 1,
        title: 'El Fin del Viaje',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        duration: '25:10',
        uploadDate: 'Hace 5 días',
        servers: [
          {
            id: 'srv-1',
            name: 'Servidor 1',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            quality: '1080p',
            language: 'sub',
            type: 'direct'
          }
        ]
      }
    ]
  },
  {
    id: 'demon-slayer-hashira',
    title: 'Demon Slayer: Hashira Training Arc',
    romajiTitle: 'Kimetsu no Yaiba',
    synopsis: 'Tanjiro y sus compañeros entrenan bajo la tutela de los Pilares más fuertes antes de la batalla definitiva en el Castillo Infinito.',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
    genres: ['Acción', 'Fantasía Oscura', 'Demonios'],
    status: 'En emisión',
    rating: 9.4,
    totalEpisodes: 8,
    episodes: [
      {
        id: 1,
        number: 1,
        title: 'Para Derrotar a Muzan Kibutsuji',
        thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
        duration: '48:30',
        uploadDate: 'Hace 1 día',
        servers: [
          {
            id: 'srv-1',
            name: 'Servidor HD Ultra',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
            quality: '1080p',
            language: 'sub',
            type: 'direct'
          }
        ]
      }
    ]
  }
];
