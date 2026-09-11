import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '../src/app.module.js';

describe('OpenAPI document', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('documents the create-work-order operation and its schemas', () => {
    const config = new DocumentBuilder().setTitle('Trevvos FieldOps API').setVersion('1.0').build();
    const document = SwaggerModule.createDocument(app, config);

    const operation = document.paths['/work-orders']?.post;
    expect(operation).toBeDefined();
    expect(operation?.requestBody).toBeDefined();
    expect(operation?.responses['201']).toBeDefined();
    expect(document.components?.schemas?.CreateWorkOrderDto).toBeDefined();
    expect(document.components?.schemas?.CreatedWorkOrderResponse).toBeDefined();
  });
});
