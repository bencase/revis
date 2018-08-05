import { TestBed, inject } from '@angular/core/testing';

import { RedisCmdService } from './redis-cmd.service';

describe('RedisCmdService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RedisCmdService]
    });
  });

  it('should be created', inject([RedisCmdService], (service: RedisCmdService) => {
    expect(service).toBeTruthy();
  }));
});
