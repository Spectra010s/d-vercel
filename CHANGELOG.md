# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-08-13

### Added

- `git-aic` added to `devDependencies` to assist with generating conventional commit messages ([#10](https://github.com/Spectra010s/d-vercel/pull/10))
- `comment-marker` input - set a distinct sticky comment marker per job so monorepo workflows (multiple apps per PR) keep separate deployment comments ([#12](https://github.com/Spectra010s/d-vercel/issues/12))

### Changed

- Bumped `git-aic` to `1.4.1`, `prettier` to `3.9.6`, and `rollup` to `4.62.4`

## [1.2.0] - 2026-07-10

### Added

- `prebuilt` input option — deploy prebuilt assets using `--prebuilt`, skipping `vercel pull` ([#4](https://github.com/Spectra010s/d-vercel/pull/6))
- `sticky-comment` input option — choose between updating a single sticky PR comment or posting a new one on each change ([#3](https://github.com/Spectra010s/d-vercel/pull/5))
- [CONTRIBUTING.md](./CONTRIBUTING.md) — developer onboarding guide ([#8](https://github.com/Spectra010s/d-vercel/pull/8))
- `prettier` added to `devDependencies` for consistent formatting on fresh checkouts ([#8](https://github.com/Spectra010s/d-vercel/pull/8))
- Linked contributing guide in README and updated compiled dist ([#11](https://github.com/Spectra010s/d-vercel/pull/11))

### Removed

- `marker` input — internalized as a constant; users no longer need to configure it

## [1.1.0] - 2026-07-10

### Added

- `ignore-build-step` input option to skip deployments based on a custom command (e.g. `npx turbo-ignore`) ([#1](https://github.com/Spectra010s/d-vercel/pull/1))

## [1.0.0] - 2026-07-09

### Added

- Initial release of d-vercel
- Deploy to Vercel from GitHub Actions workflows
- Support preview and production deployments
- Configure Vercel organization and project IDs
- Automatically capture deployment URLs
- Add/update deployment comments on pull requests
- Customizable deployment options

[Unreleased]: https://github.com/Spectra010s/d-vercel/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/Spectra010s/d-vercel/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Spectra010s/d-vercel/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Spectra010s/d-vercel/releases/tag/v1.0.0
