# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`stocky` is a Vue 3 + TypeScript + Vite app, currently the unmodified `create-vue` starter template (`App.vue` renders the `HelloWorld`/`TheWelcome` demo components). Uses `<script setup>` SFCs; no router, store, linter, or test runner is configured.

## Commands

- `npm install` — install deps (Node `^22.18.0 || >=24.12.0` required)
- `npm run dev` — Vite dev server with HMR
- `npm run build` — runs `type-check` and `build-only` in parallel (`run-p`)
- `npm run build-only` — `vite build` without type checking
- `npm run type-check` — `vue-tsc --build` (use `vue-tsc`, not `tsc`, so `.vue` imports are typed)
- `npm run preview` — serve the production build

## Structure

- Entry: `index.html` → `src/main.ts` → `src/App.vue`
- `@` alias maps to `src/` (configured in `vite.config.ts`)
- TS config is split: `tsconfig.app.json` (src) and `tsconfig.node.json` (Vite config), referenced from `tsconfig.json`
- `vite-plugin-vue-devtools` is enabled in dev
