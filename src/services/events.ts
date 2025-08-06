/**
 * Simple event emitter for cross-component communication
 */
class EventService {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

export const eventService = new EventService();

// Event types
export const EVENTS = {
  ACCOUNT_DELETED: 'account_deleted',
  TRANSACTIONS_UPDATED: 'transactions_updated',
} as const;
