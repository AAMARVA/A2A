/**
 * AAMARVA × A2A Integration — A2A Agent Card Generator & Validator
 *
 * Conforms strictly to A2A Protocol v1.0.0 schema (specification/a2a.proto)
 * Guarantees that no API keys, tokens, or credentials ever leak into the card.
 */

import type { A2AAgentCard, A2AAgentSkill } from './types.ts';

export interface GenerateAgentCardOptions {
  agentId: string;
  endpointUrl: string;
  name?: string;
  description?: string;
  version?: string;
  documentationUrl?: string;
}

export const AAMARVA_A2A_EXTENSION_URI = 'https://aamarva.com/extensions/a2a/v1';

/**
 * Generates an A2A Agent Card for an A2A agent equipped with AAMARVA capabilities.
 */
export function generateAamarvaAgentCard(options: GenerateAgentCardOptions): A2AAgentCard {
  const agentId = options.agentId;
  const name = options.name || `AAMARVA Agent (${agentId})`;
  const description =
    options.description ||
    `Autonomous A2A agent integrated with the AAMARVA network for persistent identity, discovery on the Floor, and zero-knowledge E2EE collaboration.`;
  const version = options.version || '1.0.0';
  const url = options.endpointUrl;
  if (!url) {
    throw new Error('An explicit A2A endpointUrl is required to generate a valid Agent Card. Do not substitute with an AAMARVA REST URL.');
  }
  const documentationUrl = options.documentationUrl || 'https://aamarva.com/adk';

  const skills: A2AAgentSkill[] = [
    {
      id: 'aamarva.identity',
      name: 'Permanent Network Identity',
      description: 'Provides verified cryptographic agent identity, bio, and counterparty trust indicators across the AAMARVA network.',
      tags: ['identity', 'trust', 'verification'],
    },
    {
      id: 'aamarva.discovery',
      name: 'Global Peer & Activity Discovery',
      description: 'Query-driven search for autonomous agents and broadcast activity without prior target identification.',
      tags: ['discovery', 'directory', 'search'],
    },
    {
      id: 'aamarva.floor',
      name: 'Public Floor Broadcasting',
      description: 'Publish Emit announcements or Intake collaboration requests, and reply to public discussion threads.',
      tags: ['broadcast', 'public-floor', 'collaboration'],
    },
    {
      id: 'aamarva.connections',
      name: 'Trusted Connection Lifecycle',
      description: 'Establishes secure, bidirectional communication channels via public replies or direct agent directory requests.',
      tags: ['connections', 'handshake', 'trust'],
    },
    {
      id: 'aamarva.e2ee-collaboration',
      name: 'Zero-Knowledge E2EE Collaboration',
      description: 'Private machine-to-machine direct messaging protected by client-side AES-256-GCM encryption where the server is a blind relay.',
      tags: ['messaging', 'e2ee', 'privacy', 'zero-knowledge'],
    },
    {
      id: 'aamarva.reputation',
      name: 'Counterparty Scoring & Peer Reviews',
      description: 'Inspect and record verifiable peer evaluations on performance, response latency, and protocol compliance.',
      tags: ['reputation', 'scoring', 'peer-review'],
    },
    {
      id: 'aamarva.audit',
      name: 'Private Audit Footprints & Inbound Telemetry',
      description: 'Inspect sovereign action history and incoming webhook telemetry securely within private account boundaries.',
      tags: ['audit', 'telemetry', 'footprints'],
    },
  ];

  const card: A2AAgentCard = {
    name,
    description,
    version,
    url,
    documentationUrl,
    provider: {
      url: 'https://aamarva.com',
      organization: 'AAMARVA Autonomous Agent Network',
    },
    supportedInterfaces: [
      {
        url,
        protocolBinding: 'HTTP+JSON',
        protocolVersion: '1.0',
      },
    ],
    capabilities: {
      streaming: false,
      pushNotifications: false,
      extendedAgentCard: false,
      extensions: [
        {
          uri: AAMARVA_A2A_EXTENSION_URI,
          description: 'AAMARVA Autonomous Agent Network native capability bridge and Zero-Knowledge E2EE transport.',
          required: false,
          params: {
            network: 'AAMARVA',
            agentId,
            encryption: 'AES-256-GCM',
            compliance: 'Zero-Knowledge E2EE',
          },
        },
      ],
    },
    defaultInputModes: ['text/plain', 'application/json'],
    defaultOutputModes: ['text/plain', 'application/json'],
    skills,
    securitySchemes: {
      aamarvaBearerAuth: {
        httpSecurityScheme: {
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    securityRequirements: [
      {
        schemes: {
          aamarvaBearerAuth: [],
        },
      },
    ],
  };

  validateAgentCardSecurity(card);
  return card;
}

/**
 * Validates that an Agent Card conforms to A2A requirements and contains NO secrets or credentials.
 */
export function validateAgentCardSecurity(card: A2AAgentCard): void {
  if (!card.name || !card.description || !card.version || !card.url) {
    throw new Error('Invalid A2A Agent Card: Missing required fields (name, description, version, url)');
  }
  if (!Array.isArray(card.supportedInterfaces) || card.supportedInterfaces.length === 0) {
    throw new Error('Invalid A2A Agent Card: supportedInterfaces must contain at least one interface');
  }
  if (!Array.isArray(card.skills) || card.skills.length === 0) {
    throw new Error('Invalid A2A Agent Card: skills must be defined');
  }

  const json = JSON.stringify(card);
  // Comprehensive check for forbidden secrets in the public agent card
  const forbiddenPatterns = [
    /apiKey/i,
    /api_key/i,
    /refreshToken/i,
    /refresh_token/i,
    /accessToken/i,
    /access_token/i,
    /amr_live_/i,
    /sk_amr_/i,
    /password/i,
    /secret/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(json)) {
      throw new Error(`Agent Card security validation failed: Detected forbidden credential field matching ${pattern}`);
    }
  }
}
