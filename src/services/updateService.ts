import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { supabase } from './supabase';

export interface AppUpdateInfo {
  id: number;
  version: string;
  bundle_url: string;
  checksum?: string;
  changelog?: string;
  created_at?: string;
}

export const BASE_APP_VERSION = '1.0.0';

class UpdateService {
  private isInitialized = false;

  /**
   * Notifica a Capgo que la aplicación cargó correctamente.
   * Si no se llama esto en una versión nueva, Capgo asume que falló y hace rollback automático.
   */
  async notifyAppReady(): Promise<void> {
    try {
      await CapacitorUpdater.notifyAppReady();
      this.isInitialized = true;
      console.log('[UpdateService] App marked as ready for CapacitorUpdater');
    } catch (err) {
      console.warn('[UpdateService] Error notifying app ready (puede estar corriendo en web):', err);
    }
  }

  /**
   * Obtiene la versión actual instalada/activa en la app.
   */
  async getCurrentVersion(): Promise<string> {
    try {
      const current = await CapacitorUpdater.current();
      if (current && current.bundle && current.bundle.version) {
        return current.bundle.version;
      }
      return BASE_APP_VERSION;
    } catch {
      return BASE_APP_VERSION;
    }
  }

  /**
   * Consulta en Supabase si hay una actualización activa más reciente.
   */
  async checkForUpdates(): Promise<{
    hasUpdate: boolean;
    currentVersion: string;
    latestUpdate: AppUpdateInfo | null;
  }> {
    const currentVersion = await this.getCurrentVersion();

    try {
      const { data, error } = await supabase
        .from('app_updates')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return { hasUpdate: false, currentVersion, latestUpdate: null };
      }

      const latest = data[0] as AppUpdateInfo;

      // Comparación simple de versión
      const isNewer = latest.version !== currentVersion;

      return {
        hasUpdate: isNewer,
        currentVersion,
        latestUpdate: isNewer ? latest : null
      };
    } catch (err) {
      console.error('[UpdateService] Error al consultar actualizaciones en Supabase:', err);
      return { hasUpdate: false, currentVersion, latestUpdate: null };
    }
  }

  /**
   * Descarga la actualización e instala en segundo plano.
   */
  async installUpdate(
    update: AppUpdateInfo,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    try {
      let progressListener: any = null;
      if (onProgress) {
        progressListener = await CapacitorUpdater.addListener('download', (info: any) => {
          if (info && typeof info.percent === 'number') {
            onProgress(info.percent);
          }
        });
      }

      console.log(`[UpdateService] Descargando versión ${update.version} desde ${update.bundle_url}...`);

      // Asegurarse de tener el checksum SHA-256 requerido por Capgo v8 en Android
      let checksum = update.checksum;
      if (!checksum) {
        try {
          console.log('[UpdateService] Checksum no provisto en update, calculando SHA-256...');
          const resp = await fetch(update.bundle_url);
          const buffer = await resp.arrayBuffer();
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          checksum = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
          console.log('[UpdateService] Checksum calculado con éxito:', checksum);
        } catch (e) {
          console.warn('[UpdateService] No se pudo calcular hash del zip:', e);
        }
      }

      const downloaded = await CapacitorUpdater.download({
        url: update.bundle_url,
        version: update.version,
        checksum: checksum
      });

      if (progressListener) {
        await progressListener.remove();
      }

      console.log(`[UpdateService] Activando versión ${downloaded.version || update.version}...`);
      await CapacitorUpdater.set({ id: downloaded.id });

      return true;
    } catch (err: any) {
      console.error('[UpdateService] Error al descargar/instalar actualización:', err);
      throw err;
    }
  }

  /**
   * Recarga la app para aplicar inmediatamente la versión recién instalada.
   */
  async reloadApp(): Promise<void> {
    try {
      await CapacitorUpdater.reload();
    } catch {
      window.location.reload();
    }
  }

  /**
   * Restaura la app a la versión base original del APK o revierte.
   * Permite volver atrás si la versión nueva no funciona bien.
   */
  async revertToBaseVersion(): Promise<void> {
    try {
      console.log('[UpdateService] Revirtiendo a la versión base original del APK...');
      await CapacitorUpdater.reset();
      await this.reloadApp();
    } catch (err: any) {
      console.error('[UpdateService] Error al revertir versión:', err);
      throw err;
    }
  }

  /**
   * Lista las versiones descargadas en el dispositivo para verificar historial.
   */
  async getInstalledVersions(): Promise<any[]> {
    try {
      const res = await CapacitorUpdater.list();
      return (res && res.bundles) ? res.bundles : [];
    } catch {
      return [];
    }
  }
}

export const updateService = new UpdateService();
