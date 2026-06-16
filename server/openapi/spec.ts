import { Router, type Request, type Response } from 'express';

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'G005 RIS Open Platform API',
    version: '3.0.2.23',
    description: 'RESTful API for G005 Radiology Information System third-party integrations'
  },
  servers: [
    { url: '/api/v1', description: 'Current API v1' },
    { url: '/fhir', description: 'FHIR R4 API' }
  ],
  security: [
    { ApiKeyAuth: [] }
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' }
    },
    schemas: {
      ApiKey: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          scopes: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['active', 'revoked'] },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Webhook: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          events: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['active', 'disabled'] }
        }
      },
      Channel: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          sourceType: { type: 'string', enum: ['hl7', 'fhir', 'dicom', 'http', 'internal'] },
          destinationType: { type: 'string', enum: ['hl7', 'fhir', 'dicom', 'http', 'internal', 'log'] },
          status: { type: 'string', enum: ['stopped', 'started', 'error'] }
        }
      },
      FHIRResource: {
        type: 'object',
        properties: {
          resourceType: { type: 'string' },
          id: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/openapi/keys': {
      get: { summary: 'List API keys', security: [{ ApiKeyAuth: [] }], responses: { '200': { description: 'Array of API keys' } } },
      post: { summary: 'Create API key', security: [{ ApiKeyAuth: [] }], responses: { '201': { description: 'Created API key' } } }
    },
    '/openapi/keys/{id}': {
      get: { summary: 'Get API key details', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'API key details' } } },
      delete: { summary: 'Revoke API key', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Key revoked' } } }
    },
    '/openapi/webhooks': {
      get: { summary: 'List webhooks', responses: { '200': { description: 'Webhook list' } } },
      post: { summary: 'Register webhook', responses: { '201': { description: 'Webhook created' } } }
    },
    '/openapi/webhooks/{id}': {
      get: { summary: 'Get webhook', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Webhook details' } } },
      put: { summary: 'Update webhook', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Webhook updated' } } },
      delete: { summary: 'Delete webhook', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Webhook deleted' } } }
    },
    '/integration/channels': {
      get: { summary: 'List integration channels', responses: { '200': { description: 'Channel list' } } },
      post: { summary: 'Create channel', responses: { '201': { description: 'Channel created' } } }
    },
    '/fhir/Patient': {
      get: { summary: 'Search Patients (FHIR R4)', responses: { '200': { description: 'FHIR Bundle' } } },
      post: { summary: 'Create Patient (FHIR R4)', responses: { '201': { description: 'FHIR Patient resource' } } }
    },
    '/fhir/DiagnosticReport': {
      get: { summary: 'Search DiagnosticReports (FHIR R4)', responses: { '200': { description: 'FHIR Bundle' } } }
    }
  }
};

export function specRouter(): Router {
  const router = Router();

  router.get('/openapi/spec', (_req: Request, res: Response) => {
    res.json(spec);
  });

  router.get('/openapi/spec.yaml', (_req: Request, res: Response) => {
    const yamlLines: string[] = [];
    function toYaml(obj: unknown, indent = 0): void {
      const prefix = '  '.repeat(indent);
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          yamlLines.push(`${prefix}- ${JSON.stringify(obj)}`);
        } else {
          for (const [k, v] of Object.entries(obj)) {
            if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
              yamlLines.push(`${prefix}${k}:`);
              toYaml(v, indent + 1);
            } else {
              yamlLines.push(`${prefix}${k}: ${typeof v === 'string' ? `"${v}"` : JSON.stringify(v)}`);
            }
          }
        }
      } else {
        yamlLines.push(`${prefix}${String(obj)}`);
      }
    }
    yamlLines.push('openapi: "3.1.0"', `info:`, `  title: "${spec.info.title}"`, `  version: "${spec.info.version}"`);
    res.set('Content-Type', 'text/yaml').send(yamlLines.join('\n'));
  });

  return router;
}
