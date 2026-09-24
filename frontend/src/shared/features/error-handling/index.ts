/**
 * Feature: Error Handling & Notifications — نقطه خروج عمومی
 */
export { notify, type NotifyOptions } from './lib/notify';
export { renderApiErrorToast } from './lib/api-error-toast';
export {
  useNotificationHistoryStore,
  type NotificationRecord,
  type NotificationType,
} from './lib/notification-history-store';
export { useOffline, simulateOffline, type UseOfflineResult } from './hooks/use-offline';
export {
  ErrorBoundary,
  ErrorFallback,
  CrashingComponent,
  type ErrorFallbackProps,
} from './components/error-boundary';
export { OfflineBanner } from './components/offline-banner';
export { GlobalErrorListeners } from './components/global-error-listeners';
export { AppToaster } from './components/app-toaster';
