# Changelog

All notable changes to the Translation Manager package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
