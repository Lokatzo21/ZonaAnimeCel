export interface AvatarOption {
  id: string;
  name: string;
  url: string;
}

export const ORIGINAL_AVATARS: AvatarOption[] = [
  { id: '1', name: 'Silhouette', url: '/avatars/1.jpg' },
  { id: '2', name: 'Violet', url: '/avatars/2.jpg' },
  { id: '3', name: 'Toji Santa', url: '/avatars/3.jpg' },
  { id: '4', name: 'Smile Boy', url: '/avatars/4.jpg' },
  { id: '5', name: 'Oreki', url: '/avatars/5.jpg' },
  { id: '6', name: 'Subaru', url: '/avatars/6.jpg' },
  { id: '7', name: 'Kokushibo', url: '/avatars/7.jpg' },
  { id: '8', name: 'Tanjiro', url: '/avatars/8.jpg' },
  { id: '9', name: 'Giyu', url: '/avatars/9.jpg' },
  { id: '10', name: 'Jinwoo Rain', url: '/avatars/10.jpg' },
  { id: '11', name: 'Purple Girl', url: '/avatars/11.jpg' }
];

// Pre-determinada solicitada por el usuario
export const DEFAULT_AVATAR = '/avatars/1.jpg';
