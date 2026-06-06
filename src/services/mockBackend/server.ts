/**
 * G005 放射RIS系统 v3.0.0 - MSW Node Server(测试用)
 * Phase T4-W9: 单元/组件测试用
 *
 * 用法:
 *   import { server } from '@services/mockBackend/server';
 *   beforeAll(() => server.listen());
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
