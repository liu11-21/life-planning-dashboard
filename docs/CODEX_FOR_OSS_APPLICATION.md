# Codex for Open Source 申請草稿

> 本文件用於整理申請資訊。正式提交前，請填入 Email 與 OpenAI Organization ID，並確認公開 Demo、CI 與 Release 皆可正常存取。

## Applicant

- GitHub account: `liu11-21`
- Role: Primary maintainer and repository owner
- Email: `<待填>`
- OpenAI Organization ID: `<待填>`

## Project

- Repository: `https://github.com/liu11-21/life-planning-dashboard`
- Public demo: `https://liu11-21.github.io/life-planning-dashboard/`
- License: MIT
- Primary language: JavaScript
- Project category: Open-source financial education and life-planning simulator

## 500-character project description

Life Planning Dashboard is an open-source, browser-based financial education simulator designed for Taiwan-oriented life planning. It models income, expenses, taxes, debt, investments, real estate, insurance coverage gaps, and assets through age 100. The project emphasizes transparent assumptions, local-first data handling, reproducible tests, and auditable formulas. Codex would support calculation modularization, regression testing, issue triage, accessibility, and maintenance.

## Why Codex would help

The project combines a large interactive front end with financial formulas, date-sensitive institutional parameters, JSON compatibility, visualization, and privacy requirements. Maintenance requires careful cross-checking rather than simple feature generation. Codex would be used to:

- separate pure calculations from DOM and rendering logic;
- generate and review regression tests for tax, debt, insurance and asset projections;
- detect compatibility regressions in exported planning files;
- assist with accessibility and responsive UI improvements;
- review pull requests against documented calculation assumptions;
- help triage issues without replacing human review of financial rules.

## Current maintenance evidence

- Sustained commit history on the original application
- Public MIT-licensed repository
- Documented calculation assumptions and limitations
- Security, contribution and governance documents
- Reproducible `npm test` workflow
- Core calculation regression tests
- Automated pull-request checks
- GitHub Pages deployment workflow
- Public roadmap and structured Issue forms

## Honest adoption statement

The project is currently an early-stage open-source release rather than a widely adopted library. The application originated from a working life-planning prototype and is being converted into a transparent, reusable public tool. The application should not claim broad adoption, high download volume, or external contributor activity unless such evidence exists at submission time.

## Final submission checklist

- [ ] PR #1 merged into `main`
- [ ] Quality workflow passed on `main`
- [ ] GitHub Pages deployment succeeded
- [ ] Public Demo manually verified
- [ ] Screenshot added to README
- [ ] `v0.1.0` GitHub Release published
- [ ] Repository description and topics configured
- [ ] At least three genuine roadmap Issues opened
- [ ] Email filled in
- [ ] OpenAI Organization ID filled in
- [ ] Character limits rechecked in the live form
