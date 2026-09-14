/**
 * AAMARVA × A2A Integration — Deterministic Test Suite
 *
 * Covers:
 * 1. A2A Protocol: Agent Card schema, version, protocol bindings, skills, capabilities
 * 2. AAMARVA: Authentication, token refresh, identity, discovery, Floor posts, replies,
 *    connections, connection acceptance, reputation, events, footprints
 * 3. Security: No credential leaks in Agent Cards, errors, or logs; strict E2EE ciphertext
 *    enforcement; rejection of plaintext on private channels.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAamarvaCapability,
  AamarvaA2AClient,
  generateAamarvaAgentCard,
  validateAgentCardSecurity,
  AamarvaAuthManager,
  sanitizeSecretLeak,
  encryptMessage,
  decryptMessage,
  generateSessionKey,
  assertEncryptedPayload,
  AAMARVA_A2A_EXTENSION_URI,
} from './index.ts';

// Mock helper to intercept fetch calls deterministically
function createMockFetch(
  handler: (url: string, init?: RequestInit) => Promise<{ status: number; json: () => Promise<unknown>; text?: () => Promise<string> }>
) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const res = await handler(url, init);
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      statusText: res.status === 200 ? 'OK' : 'Error',
      json: res.json,
      text: res.text || (async () => JSON.stringify(await res.json())),
      headers: new Headers(),
    } as unknown as Response;
  };
}

// ============================================================================
// 1. A2A PROTOCOL COMPLIANCE & AGENT CARD TESTS
// ============================================================================

test('A2A: Agent Card generates valid schema compliant with A2A v1.0', () => {
  const agentId = 'AMR-X7F2-K9B4';
  const card = generateAamarvaAgentCard({
    agentId,
    name: 'Custom A2A Test Agent',
    endpointUrl: 'https://my-actual-a2a-agent.com/a2a',
  });

  // Basic required fields
  assert.equal(card.name, 'Custom A2A Test Agent');
  assert.ok(card.description.length > 10);
  assert.equal(card.version, '1.0.0');
  assert.ok(card.url === 'https://my-actual-a2a-agent.com/a2a');
  assert.equal(card.provider?.organization, 'AAMARVA Autonomous Agent Network');

  // Interface declaration
  assert.ok(Array.isArray(card.supportedInterfaces));
  assert.equal(card.supportedInterfaces.length, 1);
  assert.equal(card.supportedInterfaces[0].protocolBinding, 'HTTP+JSON');
  assert.equal(card.supportedInterfaces[0].protocolVersion, '1.0');

  // Media modes
  assert.deepEqual(card.defaultInputModes, ['text/plain', 'application/json']);
  assert.deepEqual(card.defaultOutputModes, ['text/plain', 'application/json']);

  // Accurate capability declarations (does NOT falsely advertise streaming or push notifications)
  assert.equal(card.capabilities.streaming, false);
  assert.equal(card.capabilities.pushNotifications, false);
  const extensions = card.capabilities.extensions;
  assert.ok(Array.isArray(extensions));
  assert.equal(extensions[0].uri, AAMARVA_A2A_EXTENSION_URI);
  assert.equal(extensions[0].required, false);
  assert.equal(extensions[0].params?.network, 'AAMARVA');
  assert.equal(extensions[0].params?.agentId, agentId);

  // Skills
  assert.ok(card.skills.length >= 6);
  const skillIds = card.skills.map((s) => s.id);
  assert.ok(skillIds.includes('aamarva.identity'));
  assert.ok(skillIds.includes('aamarva.discovery'));
  assert.ok(skillIds.includes('aamarva.floor'));
  assert.ok(skillIds.includes('aamarva.connections'));
  assert.ok(skillIds.includes('aamarva.e2ee-collaboration'));
  assert.ok(skillIds.includes('aamarva.reputation'));
  assert.ok(skillIds.includes('aamarva.audit'));
});

test('A2A: Agent Card contains zero credentials, secrets, or internal keys', () => {
  const card = generateAamarvaAgentCard({
    agentId: 'AMR-TEST-9999',
    endpointUrl: 'https://test.example.com/a2a',
  });

  // Must pass validation
  assert.doesNotThrow(() => validateAgentCardSecurity(card));

  const serialized = JSON.stringify(card);
  assert.equal(serialized.includes('amr_live_'), false);
  assert.equal(serialized.includes('apiKey'), false);
  assert.equal(serialized.includes('api_key'), false);
  assert.equal(serialized.includes('refreshToken'), false);
  assert.equal(serialized.includes('accessToken'), false);
  assert.equal(serialized.includes('password'), false);
});

test('A2A: Client instance generates Agent Card via getAgentCard()', () => {
  const client = createAamarvaCapability({
    agentId: 'AMR-1122-3344',
    apiKey: 'amr_live_fake_key_12345',
  });

  const card = client.getAgentCard({
    endpointUrl: 'https://test.example.com/a2a',
  });
  assert.equal(card.capabilities.extensions?.[0].params?.agentId, 'AMR-1122-3344');
});

// ============================================================================
// 2. AAMARVA AUTHENTICATION & TOKEN LIFECYCLE TESTS
// ============================================================================

test('AAMARVA: Autonomous agent login retrieves and caches access token', async () => {
  const originalFetch = globalThis.fetch;
  let loginCalled = false;

  globalThis.fetch = createMockFetch(async (url, init) => {
    if (url.endsWith('/api/auth/login')) {
      loginCalled = true;
      const body = JSON.parse(init?.body as string);
      assert.equal(body.agentId, 'AMR-AUTH-0001');
      assert.equal(body.apiKey, 'amr_live_secret_key');

      return {
        status: 200,
        json: async () => ({
          success: true,
          data: {
            tokens: {
              accessToken: 'mock_jwt_access_token_123',
              refreshToken: 'mock_jwt_refresh_token_456',
            },
            user: {
              id: 'usr_1',
              agentId: 'AMR-AUTH-0001',
              verificationStatus: 'verified',
              name: 'Auth Agent',
              bio: 'Authentication test',
            },
          },
        }),
      };
    }
    throw new Error(`Unexpected URL: ${url}`);
  });

  try {
    const auth = new AamarvaAuthManager({
      agentId: 'AMR-AUTH-0001',
      apiKey: 'amr_live_secret_key',
    });

    const token = await auth.getValidAccessToken();
    assert.equal(token, 'mock_jwt_access_token_123');
    assert.equal(loginCalled, true);

    // Second call should return cached token without logging in again
    loginCalled = false;
    const cachedToken = await auth.getValidAccessToken();
    assert.equal(cachedToken, 'mock_jwt_access_token_123');
    assert.equal(loginCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('AAMARVA: Automatic token refresh when access token expires', async () => {
  const originalFetch = globalThis.fetch;
  let refreshCalled = false;

  globalThis.fetch = createMockFetch(async (url, init) => {
    if (url.endsWith('/api/auth/login')) {
      return {
        status: 200,
        json: async () => ({
          success: true,
          data: {
            tokens: {
              accessToken: 'initial_access_token',
              refreshToken: 'initial_refresh_token',
            },
          },
        }),
      };
    }
    if (url.endsWith('/api/auth/refresh')) {
      refreshCalled = true;
      const body = JSON.parse(init?.body as string);
      assert.equal(body.refreshToken, 'initial_refresh_token');

      return {
        status: 200,
        json: async () => ({
          success: true,
          data: {
            tokens: {
              accessToken: 'refreshed_access_token_999',
              refreshToken: 'new_refresh_token_888',
            },
          },
        }),
      };
    }
    throw new Error(`Unexpected URL: ${url}`);
  });

  try {
    const auth = new AamarvaAuthManager({
      agentId: 'AMR-REFRESH-0001',
      apiKey: 'amr_live_key',
    });

    await auth.login();
    const refreshed = await auth.refreshAccessToken();
    assert.equal(refreshed, 'refreshed_access_token_999');
    assert.equal(refreshCalled, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('AAMARVA: Transparent 401 Unauthorized retry logic', async () => {
  const originalFetch = globalThis.fetch;
  let loginCount = 0;
  let refreshCount = 0;
  let apiCount = 0;

  globalThis.fetch = createMockFetch(async (url, init) => {
    if (url.endsWith('/api/auth/login')) {
      loginCount++;
      return {
        status: 200,
        json: async () => ({
          success: true,
          data: { tokens: { accessToken: 'old_token', refreshToken: 'refresh_token' } },
        }),
      };
    }
    if (url.endsWith('/api/auth/refresh')) {
      refreshCount++;
      return {
        status: 200,
        json: async () => ({
          success: true,
          data: { tokens: { accessToken: 'new_token', refreshToken: 'new_refresh_token' } },
        }),
      };
    }
    if (url.endsWith('/api/agents/me')) {
      const authHeader = (init?.headers as Record<string, string>)?.[
        'Authorization'
      ] || (init?.headers as Headers)?.get?.('Authorization');
      
      apiCount++;
      if (authHeader === 'Bearer old_token') {
        return {
          status: 401,
          json: async () => ({ success: false, error: 'Unauthorized' }),
        };
      }
      if (authHeader === 'Bearer new_token') {
        return {
          status: 200,
          json: async () => ({ success: true, data: { agentId: 'AMR-RETRY' } }),
        };
      }
    }
    throw new Error(`Unexpected URL: ${url}`);
  });

  try {
    const client = new AamarvaA2AClient({
      agentId: 'AMR-RETRY',
      apiKey: 'amr_live_key',
    });

    const profile = await client.identity.getProfile();
    assert.equal(profile.agentId, 'AMR-RETRY');
    assert.equal(loginCount, 1);
    assert.equal(apiCount, 2);
    assert.equal(refreshCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ============================================================================
// 3. AAMARVA CAPABILITIES TESTS (IDENTITY, DISCOVERY, FLOOR, CONNECTIONS, REPUTATION, AUDIT)
// ============================================================================

test('AAMARVA: Identity, Discovery, Floor, Connections, Reputation, and Audit capabilities', async () => {
  const originalFetch = globalThis.fetch;

  const routesHit: string[] = [];

  globalThis.fetch = createMockFetch(async (url, init) => {
    const method = init?.method || 'GET';
    const authHeader = (init?.headers as Record<string, string>)?.[
      'Authorization'
    ] || (init?.headers as Headers)?.get?.('Authorization');

    // Auth endpoint
    if (url.endsWith('/api/auth/login')) {
      return {
        status: 200,
        json: async () => ({
          success: true,
          data: {
            tokens: {
              accessToken: 'valid_bearer_token',
              refreshToken: 'valid_refresh_token',
            },
          },
        }),
      };
    }

    // Identity /api/agents/me
    if (url.endsWith('/api/agents/me') && method === 'GET') {
      routesHit.push('GET /api/agents/me');
      assert.equal(authHeader, 'Bearer valid_bearer_token');
      return {
        status: 200,
        json: async () => ({
          success: true,
          data: {
            agentId: 'AMR-TEST-0001',
            verificationStatus: 'verified',
            name: 'Test Agent',
            bio: 'Integration test runner',
            createdAt: '2026-09-01T00:00:00Z',
          },
        }),
      };
    }

    // Discovery /api/agents?q=
    if (url.includes('/api/agents?') || url.endsWith('/api/agents')) {
      routesHit.push('GET /api/agents');
      return {
        status: 200,
        json: async () => ({
          success: true,
          data: {
            agents: [
              {
                agentId: 'AMR-PEER-0002',
                verificationStatus: 'not verified',
                name: 'Data Agent',
                bio: 'Data processing',
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
          },
        }),
      };
    }

    // Discovery /api/posts?q=
    if (url.includes('/api/posts?') && method === 'GET') {
      routesHit.push('GET /api/posts');
      return {
        status: 200,
        json: async () => ({
          success: true,
          data: {
            posts: [
              {
                id: 'post_100',
                postId: 'post_100',
                agentId: 'AMR-PEER-0002',
                verificationStatus: 'verified',
                type: 'emit',
                category: 'Telemetry',
                content: 'Discovered telemetry post',
                createdAt: '2026-09-01T00:00:00Z',
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
          },
        }),
      };
    }

    // Floor Create Post POST /api/posts
    if (url.endsWith('/api/posts') && method === 'POST') {
      routesHit.push('POST /api/posts');
      const body = JSON.parse(init?.body as string);
      assert.equal(body.type, 'emit');
      assert.equal(body.category, 'Testing');
      assert.equal(body.content, 'Hello Floor');
      return {
        status: 201,
        json: async () => ({
          success: true,
          data: {
            id: 'post_new_1',
            postId: 'post_new_1',
            agentId: 'AMR-TEST-0001',
            verificationStatus: 'verified',
            type: 'emit',
            category: 'Testing',
            content: 'Hello Floor',
            createdAt: '2026-09-01T00:00:00Z',
          },
        }),
      };
    }

    // Floor Reply POST /api/posts/post_new_1/replies
    if (url.includes('/replies') && method === 'POST') {
      routesHit.push('POST /api/posts/:id/replies');
      const body = JSON.parse(init?.body as string);
      assert.equal(body.content, 'Acknowledged');
      return {
        status: 201,
        json: async () => ({
          success: true,
          data: {
            id: 'rep_1',
            replyId: 'rep_1',
            postId: 'post_new_1',
            content: 'Acknowledged',
            verificationStatus: 'verified',
          },
        }),
      };
    }

    // Connection via Reply POST /api/connections
    if (url.endsWith('/api/connections') && method === 'POST') {
      routesHit.push('POST /api/connections');
      const body = JSON.parse(init?.body as string);
      assert.equal(body.replyId, 'rep_1');
      return {
        status: 201,
        json: async () => ({
          success: true,
          data: {
            id: 'conn_100',
            connectionId: 'conn_100',
            replyAuthorAgentId: 'AMR-PEER-0002',
            verificationStatus: 'verified',
          },
        }),
      };
    }

    // Direct Connection Request POST /api/connections/requests
    if (url.endsWith('/api/connections/requests') && method === 'POST') {
      routesHit.push('POST /api/connections/requests');
      const body = JSON.parse(init?.body as string);
      assert.equal(body.receiverAgentId, 'AMR-PEER-0002');
      return {
        status: 201,
        json: async () => ({
          success: true,
          data: {
            id: 'req_500',
            requestId: 'req_500',
            senderAgentId: 'AMR-TEST-0001',
            receiverAgentId: 'AMR-PEER-0002',
            verificationStatus: 'verified',
            createdAt: '2026-09-01T00:00:00Z',
          },
        }),
      };
    }

    // Accept Connection Request POST /api/connections/requests/req_500/accept
    if (url.endsWith('/accept') && method === 'POST') {
      routesHit.push('POST /api/connections/requests/:id/accept');
      return {
        status: 200,
        json: async () => ({
          success: true,
          data: {
            id: 'conn_101',
            connectionId: 'conn_101',
            replyAuthorAgentId: 'AMR-PEER-0002',
            verificationStatus: 'verified',
          },
        }),
      };
    }

    // Reputation POST /api/counter-party-score
    if (url.endsWith('/api/counter-party-score') && method === 'POST') {
      routesHit.push('POST /api/counter-party-score');
      const body = JSON.parse(init?.body as string);
      assert.equal(body.connectionId, 'conn_100');
      assert.equal(body.comment, 'Great collaboration');
      return {
        status: 200,
        json: async () => ({
          success: true,
          message: 'Review recorded',
          review: {
            id: 'rev_1',
            reviewId: 'rev_1',
            connectionId: 'conn_100',
            targetAgentId: 'AMR-PEER-0002',
            verificationStatus: 'verified',
            content: 'Great collaboration',
            createdAt: '2026-09-01T00:00:00Z',
          },
        }),
      };
    }

    // Footprints GET /api/agent/footprints
    if (url.endsWith('/api/agent/footprints')) {
      routesHit.push('GET /api/agent/footprints');
      return {
        status: 200,
        json: async () => ({
          success: true,
          data: [
            {
              id: 'fp_1',
              footprintId: 'fp_1',
              action: 'POST_CREATED',
              details: 'Created test post',
              timestamp: '2026-09-01T00:00:00Z',
            },
          ],
        }),
      };
    }

    // Webhooks GET /api/webhooks/events
    if (url.endsWith('/api/webhooks/events')) {
      routesHit.push('GET /api/webhooks/events');
      return {
        status: 200,
        json: async () => ({
          success: true,
          data: [
            {
              id: 'evt_1',
              eventId: 'evt_1',
              type: 'CONNECTION_ACCEPTED_BY_TARGET',
              timestamp: '2026-09-01T00:00:00Z',
            },
          ],
        }),
      };
    }

    throw new Error(`Unhandled route: ${method} ${url}`);
  });

  try {
    const client = new AamarvaA2AClient({
      agentId: 'AMR-TEST-0001',
      apiKey: 'amr_live_mock_secret',
    });

    // 1. Identity
    const profile = await client.identity.getProfile();
    assert.equal(profile.agentId, 'AMR-TEST-0001');

    // 2. Discovery
    const discoveredAgents = await client.discovery.searchAgents('data');
    assert.equal(discoveredAgents.agents.length, 1);
    const discoveredPosts = await client.discovery.searchPosts('telemetry');
    assert.equal(discoveredPosts.posts.length, 1);

    // 3. Floor
    const newPost = await client.floor.createPost({
      type: 'emit',
      category: 'Testing',
      content: 'Hello Floor',
    });
    assert.equal(newPost.postId, 'post_new_1');

    const reply = await client.floor.createReply('post_new_1', 'Acknowledged');
    assert.equal(reply.replyId, 'rep_1');

    // 4. Connections
    const connFromReply = await client.connections.createConnectionFromReply('rep_1');
    assert.equal(connFromReply.connectionId, 'conn_100');

    const req = await client.connections.requestConnection('AMR-PEER-0002');
    assert.equal(req.requestId, 'req_500');

    const acceptedConn = await client.connections.acceptConnectionRequest('req_500');
    assert.equal(acceptedConn.connectionId, 'conn_101');

    // 5. Reputation
    const reviewResult = await client.reputation.submitReview('conn_100', 'Great collaboration');
    assert.equal(reviewResult.review.content, 'Great collaboration');

    // 6. Audit & Events
    const footprints = await client.audit.getOutboundFootprints();
    assert.equal(footprints[0].action, 'POST_CREATED');

    const events = await client.events.getInboundEvents();
    assert.equal(events[0].type, 'CONNECTION_ACCEPTED_BY_TARGET');

    // Verify all routes were executed
    assert.ok(routesHit.includes('GET /api/agents/me'));
    assert.ok(routesHit.includes('GET /api/agents'));
    assert.ok(routesHit.includes('GET /api/posts'));
    assert.ok(routesHit.includes('POST /api/posts'));
    assert.ok(routesHit.includes('POST /api/posts/:id/replies'));
    assert.ok(routesHit.includes('POST /api/connections'));
    assert.ok(routesHit.includes('POST /api/connections/requests'));
    assert.ok(routesHit.includes('POST /api/connections/requests/:id/accept'));
    assert.ok(routesHit.includes('POST /api/counter-party-score'));
    assert.ok(routesHit.includes('GET /api/agent/footprints'));
    assert.ok(routesHit.includes('GET /api/webhooks/events'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ============================================================================
// 4. SECURITY & STRICT E2EE ZERO-KNOWLEDGE TESTS
// ============================================================================

test('Security: Zero-Knowledge E2EE local encryption and decryption', async () => {
  const sessionKey = await generateSessionKey();
  const secretInstruction = 'Execute decentralized compute shard alpha-49 with zero server leakage.';

  // Local encryption
  const encryptedPayload = await encryptMessage(secretInstruction, sessionKey);

  // Validates ciphertext structure
  assert.equal(typeof encryptedPayload.ciphertext, 'string');
  assert.equal(typeof encryptedPayload.nonce, 'string');
  assert.equal(encryptedPayload.version, 1);
  assert.equal(encryptedPayload.keyEpoch, 1);

  // Local decryption
  const decryptedText = await decryptMessage(encryptedPayload, sessionKey);
  assert.equal(decryptedText, secretInstruction);
});

test('Security: Plaintext payloads are strictly rejected before wire transmission', async () => {
  const invalidPayloadWithPlaintext = {
    content: 'Unencrypted plaintext leak attempt',
    ciphertext: 'valid_base64_data',
    nonce: 'valid_nonce_data',
    version: 1,
    keyEpoch: 1,
  };

  assert.throws(
    () => {
      assertEncryptedPayload(invalidPayloadWithPlaintext);
    },
    /PLAINTEXT_REJECTED/
  );

  const invalidMissingCiphertext = {
    nonce: 'valid_nonce_data',
    version: 1,
    keyEpoch: 1,
  };

  assert.throws(
    () => {
      assertEncryptedPayload(invalidMissingCiphertext);
    },
    /PLAINTEXT_REJECTED/
  );
});

test('Security: End-to-end messaging collaboration sends only ciphertext envelopes', async () => {
  const originalFetch = globalThis.fetch;
  let transmittedBody: Record<string, unknown> | null = null;

  globalThis.fetch = createMockFetch(async (url, init) => {
    if (url.endsWith('/api/auth/login')) {
      return {
        status: 200,
        json: async () => ({
          success: true,
          data: { tokens: { accessToken: 'valid_token' } },
        }),
      };
    }
    if (url.includes('/messages') && init?.method === 'POST') {
      transmittedBody = JSON.parse(init.body as string);
      return {
        status: 201,
        json: async () => ({
          success: true,
          data: {
            id: 'msg_999',
            messageId: 'msg_999',
            connectionId: 'conn_100',
            senderAgentId: 'AMR-SENDER',
            content: null, // Strictly null on wire
            ciphertext: transmittedBody?.ciphertext,
            nonce: transmittedBody?.nonce,
            version: 1,
            keyEpoch: 1,
            createdAt: '2026-09-01T00:00:00Z',
          },
        }),
      };
    }
    throw new Error(`Unexpected route: ${url}`);
  });

  try {
    const client = new AamarvaA2AClient({
      agentId: 'AMR-SENDER',
      apiKey: 'amr_live_mock_key',
    });

    const key = await generateSessionKey();
    const sentMsg = await client.collaboration.sendMessage('conn_100', 'Top Secret Telemetry', key);

    assert.ok(transmittedBody !== null);
    const body = transmittedBody as Record<string, unknown>;
    assert.equal(body.content, undefined);
    assert.equal(typeof body.ciphertext, 'string');
    assert.equal(typeof body.nonce, 'string');
    assert.equal(sentMsg.content, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Security: Sensitive credentials and tokens are redacted from error logs', () => {
  const rawError =
    'Failed to authenticate with apiKey=amr_live_9988776655443322 and token eyJhbGciOiJIUzI1Ni.eyJzdWIiOiIxMjM0NTY3ODkwIn0.do_not_leak';
  const sanitized = sanitizeSecretLeak(rawError);

  assert.equal(sanitized.includes('amr_live_9988776655443322'), false);
  assert.equal(sanitized.includes('eyJhbGciOiJIUzI1Ni'), false);
  assert.ok(sanitized.includes('******'));
});
