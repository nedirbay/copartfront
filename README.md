# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Real-time täzelenmeler

Başga ulanyjylaryň üýtgeşmeleri sahypa täzelenmän görünýär (WebSocket, `src/realtime/`).
Sahypa wakalara `useRealtime([...], handler)` bilen ýazylýar we maglumaty REST-den täzeden okaýar.

* Dev: `vite.config.ts` `/ws` ýoluny backend-e (`127.0.0.1:8000`) proksi edýär.
* Prod: nginx `/ws/` ýoluny Upgrade sözbaşylary bilen backend-e geçirmeli (backend: `docs/REALTIME.md`).
* Backend başga domende bolsa: `VITE_WS_URL=wss://api.example.com/ws/`
