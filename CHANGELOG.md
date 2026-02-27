# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-27

### Added
- Initial release of Aruvi Agent SDK
- Support for multiple LLM providers:
  - OpenAI (GPT-4, GPT-3.5, etc.)
  - Anthropic Claude
  - Azure OpenAI
  - Ollama (local)
  - OpenRouter (100+ models)
  - Xiaomi Mimo
- Real-time streaming support for all providers
- Agent framework with tool calling and multi-turn conversations
- Multi-agent runtime with Hono HTTP adapter
- TypeScript support with full type safety
- No external SDK dependencies - uses fetch API directly
- Comprehensive examples and documentation
- Production-ready error handling and fallback patterns

### Features
- Provider-agnostic architecture
- Lightweight and fast
- Stream responses in real-time with AsyncGenerator
- Custom tool creation and registration
- Multi-agent deployment
- Load balancing and fallback patterns
- Parallel request handling
- Type-safe Message and Tool interfaces

---

## Future Releases

### [1.1.0] - Planned
- [ ] Memory/context management
- [ ] Function calling improvements
- [ ] Rate limiting utilities
- [ ] Caching layer
- [ ] More provider integrations

### [2.0.0] - Planned
- [ ] Web UI for agent management
- [ ] Vector database integration
- [ ] Advanced memory systems
- [ ] Custom middleware support
