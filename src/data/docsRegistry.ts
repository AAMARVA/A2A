import { DocSection, NavCategory } from '../types';

// Markdown imports via Vite raw loader
import homeMd from '../../docs/index.md?raw';
import whatIsA2aMd from '../../docs/topics/what-is-a2a.md?raw';
import a2aAndMcpMd from '../../docs/topics/a2a-and-mcp.md?raw';
import keyConceptsMd from '../../docs/topics/key-concepts.md?raw';
import lifeOfTaskMd from '../../docs/topics/life-of-a-task.md?raw';
import agentDiscoveryMd from '../../docs/topics/agent-discovery.md?raw';
import enterpriseReadyMd from '../../docs/topics/enterprise-ready.md?raw';
import streamingAsyncMd from '../../docs/topics/streaming-and-async.md?raw';
import multiTenancyMd from '../../docs/topics/multi-tenancy.md?raw';

import extensionsMd from '../../docs/topics/extensions.md?raw';
import customBindingsMd from '../../docs/topics/custom-protocol-bindings.md?raw';
import governanceMd from '../../docs/topics/extension-and-binding-governance.md?raw';
import aamarvaIntegrationMd from '../../docs/topics/aamarva-integration.md?raw';

import specOverviewMd from '../../docs/specification.md?raw';
import whatsNewV1Md from '../../docs/whats-new-v1.md?raw';
import definitionsMd from '../../docs/definitions.md?raw';
import protoRaw from '../../specification/a2a.proto?raw';

import sdkOverviewMd from '../../docs/sdk/index.md?raw';
import sdkPythonMd from '../../docs/sdk/python.md?raw';
import tutorialsOverviewMd from '../../docs/tutorials/index.md?raw';
import tut1Md from '../../docs/tutorials/python/1-introduction.md?raw';
import tut2Md from '../../docs/tutorials/python/2-setup.md?raw';
import tut3Md from '../../docs/tutorials/python/3-agent-skills-and-card.md?raw';
import tut4Md from '../../docs/tutorials/python/4-agent-executor.md?raw';
import tut5Md from '../../docs/tutorials/python/5-start-server.md?raw';
import tut6Md from '../../docs/tutorials/python/6-interact-with-server.md?raw';
import tut7Md from '../../docs/tutorials/python/7-streaming-and-multiturn.md?raw';
import tut8Md from '../../docs/tutorials/python/8-next-steps.md?raw';

import communityMd from '../../docs/community.md?raw';
import roadmapMd from '../../docs/roadmap.md?raw';
import partnersMd from '../../docs/partners.md?raw';
import blogIndexMd from '../../docs/blog/index.md?raw';
import blogAnnounceMd from '../../docs/blog/posts/announcing-1.0.md?raw';
import blogAaifMd from '../../docs/blog/posts/a2a-joins-aaif.md?raw';

export const PROTO_CONTENT = protoRaw;

export const DOC_SECTIONS: DocSection[] = [
  {
    id: 'home',
    title: 'Overview',
    category: 'Getting Started',
    summary: 'An open protocol enabling communication and interoperability between opaque agentic applications.',
    content: homeMd,
  },
  {
    id: 'what-is-a2a',
    title: 'What is A2A?',
    category: 'Documentation',
    summary: 'The motivation, architectural foundations, and core benefits of the Agent2Agent protocol.',
    content: whatIsA2aMd,
  },
  {
    id: 'a2a-and-mcp',
    title: 'A2A and MCP',
    category: 'Documentation',
    summary: 'How A2A complements the Model Context Protocol (MCP) for tools vs agents.',
    content: a2aAndMcpMd,
  },
  {
    id: 'key-concepts',
    title: 'Key Concepts',
    category: 'Documentation',
    summary: 'Agents, Agent Cards, Tasks, Messages, Parts, Artifacts, and States.',
    content: keyConceptsMd,
  },
  {
    id: 'life-of-a-task',
    title: 'Life of a Task',
    category: 'Documentation',
    summary: 'Walkthrough of an A2A task lifecycle from initialization to completion.',
    content: lifeOfTaskMd,
  },
  {
    id: 'agent-discovery',
    title: 'Agent Discovery',
    category: 'Documentation',
    summary: 'How agents advertise and discover capabilities via Agent Cards and registries.',
    content: agentDiscoveryMd,
  },
  {
    id: 'enterprise-ready',
    title: 'Enterprise Features',
    category: 'Documentation',
    summary: 'Security, authorization, tenancy, and production readiness.',
    content: enterpriseReadyMd,
  },
  {
    id: 'streaming-and-async',
    title: 'Streaming & Async',
    category: 'Documentation',
    summary: 'Server-Sent Events (SSE), gRPC streaming, push notifications, and long-running tasks.',
    content: streamingAsyncMd,
  },
  {
    id: 'multi-tenancy',
    title: 'Multi-Tenancy',
    category: 'Documentation',
    summary: 'Partitioning agent instances and data across organizational boundaries.',
    content: multiTenancyMd,
  },

  // Extensions
  {
    id: 'extensions',
    title: 'Extensions Overview',
    category: 'Extensions',
    summary: 'Extending A2A with domain-specific capabilities and bindings.',
    content: extensionsMd,
  },
  {
    id: 'custom-bindings',
    title: 'Custom Protocol Bindings',
    category: 'Extensions',
    summary: 'Transport protocols beyond gRPC and REST (e.g., WebSockets, queues).',
    content: customBindingsMd,
  },
  {
    id: 'governance',
    title: 'Extension Governance',
    category: 'Extensions',
    summary: 'Tiered governance model for community and core extensions.',
    content: governanceMd,
  },
  {
    id: 'aamarva-integration',
    title: 'AAMARVA Integration',
    category: 'Extensions',
    badge: 'v1.0',
    summary: 'Native AAMARVA network integration for autonomous agent discovery, Floor broadcasting, and Zero-Knowledge E2EE messaging.',
    content: aamarvaIntegrationMd,
  },

  // Specification
  {
    id: 'specification',
    title: 'Specification Overview',
    category: 'Specification',
    badge: 'v1.0',
    summary: 'Normative specification for the A2A communication protocol.',
    content: specOverviewMd,
  },
  {
    id: 'whats-new-v1',
    title: "What's New in v1.0",
    category: 'Specification',
    badge: 'v1.0',
    summary: 'Changes, deprecations, and new features introduced in version 1.0.',
    content: whatsNewV1Md,
  },
  {
    id: 'definitions',
    title: 'Protocol Definitions',
    category: 'Specification',
    summary: 'Exhaustive glossary of terms and semantic definitions.',
    content: definitionsMd,
  },
  {
    id: 'proto-inspector',
    title: 'Protobuf & API Schema',
    category: 'Specification',
    badge: 'Proto3',
    summary: 'Interactive inspector for the official lf.a2a.v1 Protobuf schema and RPC definitions.',
    content: '',
  },

  // Resources
  {
    id: 'sdk-overview',
    title: 'SDK Overview',
    category: 'Resources',
    summary: 'Official and community client libraries for building A2A agents.',
    content: sdkOverviewMd,
  },
  {
    id: 'sdk-python',
    title: 'Python SDK',
    category: 'Resources',
    summary: 'Getting started with the Python a2a-sdk library.',
    content: sdkPythonMd,
  },
  {
    id: 'tutorials',
    title: 'Tutorials Overview',
    category: 'Tutorials',
    summary: 'Hands-on guided walkthroughs for building interoperable agents.',
    content: tutorialsOverviewMd,
  },
  {
    id: 'tut-1',
    title: '1. Introduction',
    category: 'Tutorials',
    subcategory: 'Python Quickstart',
    content: tut1Md,
  },
  {
    id: 'tut-2',
    title: '2. Environment Setup',
    category: 'Tutorials',
    subcategory: 'Python Quickstart',
    content: tut2Md,
  },
  {
    id: 'tut-3',
    title: '3. Skills & Agent Card',
    category: 'Tutorials',
    subcategory: 'Python Quickstart',
    content: tut3Md,
  },
  {
    id: 'tut-4',
    title: '4. Agent Executor',
    category: 'Tutorials',
    subcategory: 'Python Quickstart',
    content: tut4Md,
  },
  {
    id: 'tut-5',
    title: '5. Starting the Server',
    category: 'Tutorials',
    subcategory: 'Python Quickstart',
    content: tut5Md,
  },
  {
    id: 'tut-6',
    title: '6. Interacting with Server',
    category: 'Tutorials',
    subcategory: 'Python Quickstart',
    content: tut6Md,
  },
  {
    id: 'tut-7',
    title: '7. Streaming & Multiturn',
    category: 'Tutorials',
    subcategory: 'Python Quickstart',
    content: tut7Md,
  },
  {
    id: 'tut-8',
    title: '8. Next Steps & Production',
    category: 'Tutorials',
    subcategory: 'Python Quickstart',
    content: tut8Md,
  },

  // Community
  {
    id: 'community',
    title: 'Community & Working Groups',
    category: 'Community',
    summary: 'Get involved in the A2A open source community under The Linux Foundation.',
    content: communityMd,
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    category: 'Community',
    summary: 'Upcoming features and development milestones for A2A.',
    content: roadmapMd,
  },
  {
    id: 'partners',
    title: 'Partners & Ecosystem',
    category: 'Community',
    summary: 'Organizations and projects supporting the A2A standard.',
    content: partnersMd,
  },
  {
    id: 'blog',
    title: 'Blog & Announcements',
    category: 'Community',
    summary: 'Latest updates and thought leadership on agentic interoperability.',
    content: blogIndexMd,
  },
  {
    id: 'blog-v1',
    title: 'Announcing A2A 1.0',
    category: 'Community',
    subcategory: 'Blog',
    content: blogAnnounceMd,
  },
  {
    id: 'blog-aaif',
    title: 'A2A Joins AAIF',
    category: 'Community',
    subcategory: 'Blog',
    content: blogAaifMd,
  }
];

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'get-started',
    title: 'Getting Started',
    icon: 'Compass',
    items: [
      { id: 'home', title: 'Overview' },
      { id: 'what-is-a2a', title: 'What is A2A?' },
      { id: 'a2a-and-mcp', title: 'A2A and MCP' },
    ],
  },
  {
    id: 'core-docs',
    title: 'Architecture & Concepts',
    icon: 'Layers',
    items: [
      { id: 'key-concepts', title: 'Key Concepts' },
      { id: 'life-of-a-task', title: 'Life of a Task' },
      { id: 'agent-discovery', title: 'Agent Discovery' },
      { id: 'enterprise-ready', title: 'Enterprise Features' },
      { id: 'streaming-and-async', title: 'Streaming & Async' },
      { id: 'multi-tenancy', title: 'Multi-Tenancy' },
    ],
  },
  {
    id: 'specification-cat',
    title: 'Protocol Specification',
    icon: 'FileCode2',
    items: [
      { id: 'specification', title: 'Overview', badge: 'v1.0' },
      { id: 'whats-new-v1', title: "What's New in v1.0" },
      { id: 'definitions', title: 'Protocol Definitions' },
      { id: 'proto-inspector', title: 'Protobuf & API Schema', badge: 'Proto3' },
    ],
  },
  {
    id: 'tutorials-cat',
    title: 'Tutorials & SDK',
    icon: 'GraduationCap',
    items: [
      { id: 'sdk-overview', title: 'SDK Overview' },
      { id: 'sdk-python', title: 'Python SDK' },
      { id: 'tutorials', title: 'Tutorials Hub' },
      { id: 'tut-1', title: '1. Introduction' },
      { id: 'tut-2', title: '2. Setup' },
      { id: 'tut-3', title: '3. Skills & Agent Card' },
      { id: 'tut-4', title: '4. Agent Executor' },
      { id: 'tut-5', title: '5. Start Server' },
      { id: 'tut-6', title: '6. Interact with Server' },
      { id: 'tut-7', title: '7. Streaming & Multiturn' },
      { id: 'tut-8', title: '8. Next Steps' },
    ],
  },
  {
    id: 'extensions-cat',
    title: 'Extensions',
    icon: 'Puzzle',
    items: [
      { id: 'extensions', title: 'Overview' },
      { id: 'custom-bindings', title: 'Custom Bindings' },
      { id: 'governance', title: 'Governance' },
      { id: 'aamarva-integration', title: 'AAMARVA Integration', badge: 'v1.0' },
    ],
  },
  {
    id: 'community-cat',
    title: 'Community',
    icon: 'Users',
    items: [
      { id: 'community', title: 'Working Groups' },
      { id: 'roadmap', title: 'Roadmap' },
      { id: 'partners', title: 'Partners' },
      { id: 'blog', title: 'Blog' },
    ],
  },
];
