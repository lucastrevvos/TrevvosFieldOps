import { Test } from '@nestjs/testing';

import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('reports the API as healthy', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    const controller = module.get(HealthController);

    const response = controller.getHealth();

    expect(response.service).toBe('trevvos-fieldops-api');
    expect(response.status).toBe('ok');
    expect(Number.isNaN(Date.parse(response.timestamp))).toBe(false);
  });
});
