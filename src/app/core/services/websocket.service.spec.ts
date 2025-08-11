import { WebSocketService } from './websocket.service';

describe('WebSocketService', () => {
  it('should instantiate', () => {
    const svc = new WebSocketService();
    expect(svc).toBeTruthy();
  });
});


