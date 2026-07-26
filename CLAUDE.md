# MediConnect AI — Project Context

## Project

MediConnect AI is an AI-assisted doctor appointment platform with a persistent
patient medical history, a dual-entry symptom checker (body map + free-text AI
chat), a three-tier urgency triage system (critical/urgent/routine), a
dedicated Emergency Appointment module, and standard doctor booking + payments.

## Stack

- **Frontend (`/client`)**: React (Vite) + TypeScript + Tailwind CSS
- **Backend (`/server`)**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: JWT (access + refresh tokens)
- **AI**: Claude API (`@anthropic-ai/sdk`) for symptom-to-specialty suggestions
- **Payments**: Razorpay
- **File storage**: Cloudinary
- **Real-time**: Socket.io — emergency matching (**stretch goal**)
- **Video**: Agora / Daily.co — video consults (**stretch goal**)

## Design Tokens

| Name | Hex | Usage |
| --- | --- | --- |
| Primary Teal | `#0F6E56` | Primary buttons, active states, AI suggestion highlights |
| Deep Blue | `#1E5B8C` | Headers, links, doctor/professional-facing screens |
| Soft Mint | `#E1F5EE` | Background tints, card highlights, hover states |
| Warm Coral | `#D85A30` | **Reserved only** for the Emergency Appointment module |
| Neutral Gray | `#5F5E5A` | Body text, secondary labels |
| Off-White | `#F7F9F8` | Page background |

**Headings**: Poppins (Medium/SemiBold)
**Body text**: Inter (Regular)

## Roles

- **Patient** — account activates immediately on registration
- **Doctor** — requires Admin approval (`approvalStatus: pending_approval`) before login works
- **Admin** — manages doctor approvals, platform-wide data

## Core Differentiators (always respect these)

1. **Dual-entry symptom checker** — an interactive SVG body map (localized issues) and a free-form AI chat entry point (systemic/non-localized issues), both converging into one conversational AI panel.
2. **Three-tier urgency triage** — Critical (instant rule-based red-flag block, no booking shown) → Urgent (routed to Emergency Appointment module) → Routine (normal AI suggestion + booking flow).
3. **Dedicated Emergency Appointment module** — Warm-Coral-themed, on-call doctor pool only, transparent priority fee disclosure, instant-match flow.

## Critical Security Rule

`CLAUDE_API_KEY` and all other secrets (JWT secrets, Razorpay keys, Cloudinary
keys, Mongo URI) live **only** in `/server/.env`. They must **never** appear in
`/client` code or in any `VITE_`-prefixed environment variable.

## Reference Docs

This project has authoritative source documents — always check them before
guessing at schema fields, screen names, copy, or design tokens:

- `/docs/MediConnect_AI_PRD.docx` (or `.md`) — product scope, features, data model
- `/docs/MediConnect_AI_Design_Doc.docx` (or `.md`) — UI/UX spec, screens, flows
- `/docs/MediConnect_AI_Tech_Stack.docx` (or `.md`) — stack rationale, architecture

> **Action needed from you**: create a `/docs` folder at the project root and
> place your PRD, Design Document, and Tech Stack Document there (as `.docx`
> or `.md`). Once they're in `/docs`, reference them directly for any
> UI/UX or schema question instead of guessing.

## Working Style Notes

- Single solo student developer, building across multiple sessions on a
  college semester timeline — keep answers practical and buildable, not
  enterprise-scale.
- MVP boundary: Phase 1 through Phase 5 + core Phase 7 (routine booking +
  Razorpay). Socket.io emergency queue, video consults, SMS, and real-time
  notification bell are stretch goals — defer if deadline pressure hits.
