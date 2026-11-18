# Contributing to PVE Command Center Docs & Website

Thank you for helping improve the PVE Command Center documentation portal!

## Documentation Guidelines

1. **Keep EN and FR in Sync**: Every guide or reference update under `docs/guide/` or `docs/reference/` should have a matching update under `docs/fr/guide/` or `docs/fr/reference/`.
2. **Verify Against Source Code**: All API routes, configuration keys, defaults, and CLI commands must match the actual implementations in:
   - [`PVE-Center/pve-panel`](https://github.com/PVE-Center/pve-panel)
   - [`PVE-Center/pve-center-apple`](https://github.com/PVE-Center/pve-center-apple)
   - [`PVE-Center/pve-center-clients`](https://github.com/PVE-Center/pve-center-clients)
3. **Never Commit Real Secrets or Private Infrastructure**: Use placeholder values (`admin@example.com`, `192.168.1.x`, `https://pve-panel.example.ts.net`, `${VAR_NAME}`).
4. **Verify Dead Links Before Opening a PR**:
   ```bash
   npm ci
   npm run docs:build
   ```

## Pull Request Process

1. Fork this repository and branch from `main`.
2. Make focused, clean commits.
3. Run `npm run docs:build` and verify zero VitePress build errors or dead-link warnings.
4. Open a Pull Request using the repository template.
