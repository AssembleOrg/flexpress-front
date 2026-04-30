import api from '@/lib/api';

export const pushApi = {
  subscribe: (dto: { endpoint: string; p256dh: string; auth: string }) =>
    api.post('/push/subscribe', dto),

  unsubscribe: (endpoint: string) =>
    api.delete('/push/unsubscribe', { data: { endpoint } }),
};
