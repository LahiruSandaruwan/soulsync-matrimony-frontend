import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VideoCallService } from './video-call.service';
import { WebSocketService } from './websocket.service';
import { environment } from '../../../environments/environment';
import { VideoCall, VideoCallInitiateRequest } from '../models/video-call.model';

describe('VideoCallService', () => {
  let service: VideoCallService;
  let httpMock: HttpTestingController;
  let webSocketService: jasmine.SpyObj<WebSocketService>;

  const mockVideoCall: VideoCall = {
    id: 1,
    caller_id: 1,
    receiver_id: 2,
    status: 'active',
    start_time: new Date().toISOString(),
    end_time: null,
    session_id: 'session123',
    token: 'token123',
    type: 'video',
    caller: { id: 1, name: 'John Doe' },
    receiver: { id: 2, name: 'Jane Smith' }
  };

  beforeEach(() => {
    const webSocketSpy = jasmine.createSpyObj('WebSocketService', ['on', 'connect', 'disconnect']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VideoCallService,
        { provide: WebSocketService, useValue: webSocketSpy }
      ]
    });

    service = TestBed.inject(VideoCallService);
    httpMock = TestBed.inject(HttpTestingController);
    webSocketService = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCallHistory', () => {
    it('should fetch call history successfully', () => {
      const mockResponse = {
        success: true,
        data: {
          calls: [mockVideoCall],
          pagination: {
            current_page: 1,
            total: 1,
            per_page: 20
          }
        }
      };

      service.getCallHistory(1, 20).subscribe(response => {
        expect(response.data.calls).toEqual([mockVideoCall]);
        expect(response.data.pagination.current_page).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/video-calls?page=1&limit=20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching call history fails', () => {
      const errorMessage = 'Failed to load call history';

      service.getCallHistory().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/video-calls?page=1&limit=20`);
      req.flush({ success: false, message: errorMessage });
    });
  });

  describe('initiateCall', () => {
    it('should initiate a video call successfully', () => {
      const request: VideoCallInitiateRequest = {
        receiver_id: 2,
        type: 'video'
      };

      const mockResponse = {
        success: true,
        data: {
          call: mockVideoCall,
          caller_token: 'caller_token_123',
          room_id: 'room_123'
        }
      };

      service.initiateCall(request).subscribe(response => {
        expect(response.call).toEqual(mockVideoCall);
        expect(response.tokens.caller_token).toBe('caller_token_123');
        expect(response.tokens.room_id).toBe('room_123');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/video-calls/initiate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });

    it('should handle error when initiating call fails', () => {
      const request: VideoCallInitiateRequest = {
        receiver_id: 2,
        type: 'video'
      };

      const errorMessage = 'Failed to initiate video call';

      service.initiateCall(request).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/video-calls/initiate`);
      req.flush({ success: false, message: errorMessage });
    });
  });

  describe('acceptCall', () => {
    it('should accept a video call successfully', () => {
      const callId = 1;
      const mockResponse = {
        success: true,
        data: {
          call: mockVideoCall,
          callee_token: 'callee_token_123',
          room_id: 'room_123'
        }
      };

      service.acceptCall(callId).subscribe(response => {
        expect(response.call).toEqual(mockVideoCall);
        expect(response.tokens.callee_token).toBe('callee_token_123');
        expect(response.tokens.room_id).toBe('room_123');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/video-calls/${callId}/accept`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('rejectCall', () => {
    it('should reject a video call successfully', () => {
      const callId = 1;
      const mockResponse = { success: true };

      service.rejectCall(callId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/video-calls/${callId}/reject`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('endCall', () => {
    it('should end a video call successfully', () => {
      const callId = 1;
      const mockResponse = {
        success: true,
        data: {
          call: { ...mockVideoCall, status: 'ended', end_time: new Date().toISOString() }
        }
      };

      service.endCall(callId).subscribe(response => {
        expect(response.status).toBe('ended');
        expect(response.end_time).toBeDefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/video-calls/${callId}/end`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getCallDetails', () => {
    it('should get call details successfully', () => {
      const callId = 1;
      const mockResponse = {
        success: true,
        data: mockVideoCall
      };

      service.getCallDetails(callId).subscribe(response => {
        expect(response).toEqual(mockVideoCall);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/video-calls/${callId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('observables', () => {
    it('should provide active call observable', () => {
      service.activeCall$.subscribe(call => {
        expect(call).toBeNull(); // Initially null
      });
    });

    it('should provide call history observable', () => {
      service.callHistory$.subscribe(history => {
        expect(history).toEqual([]); // Initially empty
      });
    });

    it('should provide is in call observable', () => {
      service.isInCall$.subscribe(isInCall => {
        expect(isInCall).toBeFalse(); // Initially false
      });
    });

    it('should provide incoming call observable', () => {
      service.incomingCall$.subscribe(incomingCall => {
        expect(incomingCall).toBeNull(); // Initially null
      });
    });
  });

  describe('WebSocket integration', () => {
    it('should setup WebSocket listeners on initialization', () => {
      expect(webSocketService.on).toHaveBeenCalledWith('video_call_incoming');
      expect(webSocketService.on).toHaveBeenCalledWith('video_call_status_changed');
      expect(webSocketService.on).toHaveBeenCalledWith('video_call_ended');
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', () => {
      const request: VideoCallInitiateRequest = {
        receiver_id: 2,
        type: 'video'
      };

      service.initiateCall(request).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/video-calls/initiate`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
