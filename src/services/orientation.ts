import { registerPlugin, Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

interface AppOrientationPlugin {
  setPortrait(): Promise<void>;
  setLandscapeBothSides(): Promise<void>;
  enterFullscreen(): Promise<void>;
  exitFullscreen(): Promise<void>;
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

/**
 * Entra en modo PANTALLA COMPLETA INMERSIVA:
 * 1. Oculta la barra de estado de Android (hora, notificaciones, batería) y botones del sistema.
 * 2. Bloquea la orientación a horizontal de ambos lados (sensor landscape: izquierda y derecha).
 */
export async function enterAppFullscreen(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await AppOrientation.enterFullscreen();
      return;
    } catch (err) {
      console.warn('[Orientation] Error en AppOrientation.enterFullscreen:', err);
    }
  }

  // Fallback web / capacitor estándar
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

/**
 * Sale de modo PANTALLA COMPLETA:
 * 1. Restaura la barra de estado de Android (hora, notificaciones, batería).
 * 2. Regresa la orientación a vertical (portrait).
 */
export async function exitAppFullscreen(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await AppOrientation.exitFullscreen();
      return;
    } catch (err) {
      console.warn('[Orientation] Error en AppOrientation.exitFullscreen:', err);
    }
  }

  // Fallback web / capacitor estándar
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
