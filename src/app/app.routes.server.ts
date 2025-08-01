import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'chat/:conversationId',
    renderMode: RenderMode.Dynamic
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
