import { registerPlugin, Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

interface AppOrientationPlugin {
  setPortrait(): Promise<void>;
  setLandscapeBothSides(): Promise<void>;
  unlock(): Promise<void>;
}

const AppOrientation = registerPlugin<AppOrientationPlugin>('AppOrientation');

/**
 * Bloquea la orientación de la aplicación estrictamente en VERTICAL (Portrait).
 */
export async function setAppOrientationPortrait(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await AppOrientation.setPortrait();
      return;
    } catch (err) {
      console.warn('[Orientation] Error en AppOrientation.setPortrait, usando fallback:', err);
    }
  }

  try {
    await ScreenOrientation.lock({ orientation: 'portrait' });
  } catch {
    try {
      if (screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('portrait');
      }
    } catch {}
  }
}

/**
 * Bloquea la orientación estrictamente en HORIZONTAL (Landscape)
 * admitiendo ambos lados (sensor landscape: tanto izquierda como derecha).
 */
export async function setAppOrientationLandscape(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await AppOrientation.setLandscapeBothSides();
      return;
    } catch (err) {
      console.warn('[Orientation] Error en AppOrientation.setLandscapeBothSides, usando fallback:', err);
    }
  }

  try {
    await ScreenOrientation.lock({ orientation: 'landscape' });
  } catch {
    try {
      if (screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch {}
  }
}
