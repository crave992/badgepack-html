import { TestBed } from '@angular/core/testing';

import { AssignChecklistService } from './assign-checklist.service';

describe('AssignChecklistService', () => {
  let service: AssignChecklistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignChecklistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
