# Changelog

All notable changes to the Translation Manager package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-23

### Added
- **Headless Mode**: Support for reactive frameworks (Vue.js, React, etc.) with external state management.
- **Vue.js SPA Demo**: Complete working example with full UI internationalization.
- **Bundled Library**: Pre-bundled TranslationManager distribution for standalone usage.
- **Comprehensive Documentation**: Detailed headless mode integration guide for modern SPAs.

### Fixed
- Vue demo TranslationManager integration with proper event handling.
- Full UI i18n implementation across all demo components.
- Proper vendored TranslationManager with bundled version for GAS deployment.
- Required scriptlet includes for Google Apps Script deployment.

### Changed
- Enhanced examples directory with Vue.js SPA template.
- Improved documentation for reactive framework integration patterns.

## [1.0.0] - 2026-01-18

### Added
- Initial extraction of `TranslationManager` from Calendar app core logic.
- Configurable `TranslationManager` singleton.
- Viewport visibility detection via `TranslationWindow`.
- In-memory partitioning via `TranslationCache`.
- Client-side persistence via `PersistentQueue`.
- Interface-based configuration for `I18nService`, `UrlExtractor`, and `Sanitizer`.
- Detailed examples for Calendar, Tasks, and Notes applications.
- Comprehensive README and API documentation.

### Fixed
- Fixed `google.script.run` syntax error for dynamic function calls.
- Resolved server-side `ReferenceError` when running logic in certain GAS environments.
- Corrected namespace conflicts in compiled output for `TranslationWindow` and `PersistentQueue`.
