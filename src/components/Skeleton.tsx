import React from 'react';

// Bloque base con animación de pulso y gradiente metálico oscuro
export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`bg-gradient-to-r from-[#141923] via-[#1e2535] to-[#141923] bg-[length:200%_100%] animate-pulse rounded-lg ${className}`}
  />
);

// 1. Esqueleto para el Carrusel Principal (Hero) de Inicio
export const HeroCarouselSkeleton: React.FC = () => (
  <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-[#0d1017] p-4 flex flex-col justify-end gap-2.5 border border-slate-800/40 shadow-xl">
    <div className="flex items-center gap-2">
      <SkeletonBlock className="w-24 h-5 rounded-full" />
      <SkeletonBlock className="w-12 h-5 rounded-full" />
    </div>
    <SkeletonBlock className="w-3/4 h-7 rounded-md" />
    <SkeletonBlock className="w-5/6 h-3 rounded" />
    <SkeletonBlock className="w-2/3 h-3 rounded" />
    <div className="flex items-center gap-2 pt-2">
      <SkeletonBlock className="flex-1 h-9 rounded-xl" />
      <SkeletonBlock className="w-10 h-9 rounded-xl" />
    </div>
  </div>
);

// 2. Esqueleto para Tarjeta Individual de Anime
export const AnimeCardSkeleton: React.FC = () => (
  <div className="flex flex-col space-y-2">
    <div className="relative aspect-[3/4.2] w-full rounded-2xl overflow-hidden bg-[#10141d] border border-slate-800/50 shadow-md">
      <SkeletonBlock className="w-full h-full rounded-none" />
      <div className="absolute top-2 right-2">
        <SkeletonBlock className="w-8 h-4 rounded-full" />
      </div>
    </div>
    <SkeletonBlock className="w-4/5 h-3.5 rounded mt-1" />
    <SkeletonBlock className="w-1/2 h-2.5 rounded" />
  </div>
);

// 3. Cuadrícula de Tarjetas de Anime (Catálogo / Búsqueda / Favoritos)
export const AnimeGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1 animate-fade-in">
    {Array.from({ length: count }).map((_, i) => (
      <AnimeCardSkeleton key={i} />
    ))}
  </div>
);

// 4. Carrusel Horizontal de Anime (Trending / Populares / Continuar Viendo)
export const AnimeRowSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="flex gap-3 overflow-hidden py-1 animate-fade-in">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="w-32 shrink-0 space-y-2">
        <SkeletonBlock className="w-32 h-44 rounded-2xl" />
        <SkeletonBlock className="w-28 h-3.5 rounded" />
        <SkeletonBlock className="w-16 h-2.5 rounded" />
      </div>
    ))}
  </div>
);

// 5. Lista de Episodios dentro del Anime Seleccionado
export const EpisodeListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-2 animate-fade-in">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0f131c] border border-slate-800/60 shadow-sm">
        <SkeletonBlock className="w-16 h-10 rounded-md shrink-0" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <SkeletonBlock className="w-3/4 h-3.5 rounded" />
          <SkeletonBlock className="w-1/3 h-2.5 rounded" />
        </div>
      </div>
    ))}
  </div>
);
