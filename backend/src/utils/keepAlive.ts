import https from 'https';
import http from 'http';
import { logger } from './logger';

/**
 * Keep-Alive Service for Free-Tier Cloud Deployments (e.g. Render).
 * Periodically pings the Backend and ML Engine health endpoints to prevent
 * inactivity sleep (Render 15-minute spin-down).
 */
export function initKeepAlive(): void {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
  const keepAliveEnabled = process.env.KEEP_ALIVE === 'true' || isProduction;

  if (!keepAliveEnabled) {
    logger.info('[KeepAlive] Disabled in current environment.');
    return;
  }

  const backendUrl = process.env.RENDER_EXTERNAL_URL || 'https://realestateiq-1.onrender.com';
  const mlUrl = process.env.ML_SERVICE_URL || 'https://realestateiq-8b3k.onrender.com';
  const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

  logger.info(`[KeepAlive] Service initialized. Target backend: ${backendUrl}, ML: ${mlUrl}`);

  const pingUrl = (targetUrl: string, serviceName: string) => {
    try {
      const fullUrl = `${targetUrl.replace(/\/$/, '')}/health`;
      const client = fullUrl.startsWith('https') ? https : http;

      const req = client.get(fullUrl, (res) => {
        if (res.statusCode === 200) {
          logger.info(`[KeepAlive] Ping success for ${serviceName} (${res.statusCode})`);
        } else {
          logger.warn(`[KeepAlive] ${serviceName} ping returned status ${res.statusCode}`);
        }
      });

      req.on('error', (err) => {
        logger.warn(`[KeepAlive] Network error pinging ${serviceName}: ${err.message}`);
      });

      req.setTimeout(30000, () => {
        req.destroy();
        logger.warn(`[KeepAlive] Timeout pinging ${serviceName}`);
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.warn(`[KeepAlive] Failed to dispatch ping to ${serviceName}: ${errorMsg}`);
    }
  };

  // Initial ping 45 seconds after server startup
  setTimeout(() => {
    pingUrl(backendUrl, 'Backend API');
    pingUrl(mlUrl, 'ML Engine API');
  }, 45000);

  // Subsequent pings every 10 minutes
  setInterval(() => {
    pingUrl(backendUrl, 'Backend API');
    pingUrl(mlUrl, 'ML Engine API');
  }, PING_INTERVAL_MS);
}
