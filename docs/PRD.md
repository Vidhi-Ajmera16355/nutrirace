# NutriRace — Product Requirements (vision)

> **Status legend:** every capability below is **Planned** unless `IMPLEMENTATION_STATUS.md` says it is implemented and verified. Phase 1 delivers infrastructure only.

## Vision

NutriRace is a social diet-planning and healthy-habit platform. People plan meals, track daily habits, and race friends toward routines they want to keep. Motivation comes from friendly social structure (shared races, streaks, chat, leaderboards) rather than from restriction or shame.

## Target users

- Individuals who want structure for eating and daily habits.
- Friend groups, families and teams who want shared accountability.

## Planned capabilities (not yet built)

| Area                      | Summary                                         | Phase   |
| ------------------------- | ----------------------------------------------- | ------- |
| Accounts & authentication | Sign-up, sign-in, sessions, profile             | Planned |
| Diet planner              | Goals, weekly meal plans, preferences           | Planned |
| Habit tracking            | Daily check-ins, streaks, history               | Planned |
| Races & friends           | Invite friends, create time-boxed habit races   | Planned |
| Leaderboards              | Rankings per race/group that reward consistency | Planned |
| Real-time group chat      | Socket.IO chat inside a race group              | Planned |
| Reminders & notifications | Background jobs (BullMQ) for nudges             | Planned |
| Privacy controls          | Visibility settings, data export and deletion   | Planned |

## Principles

1. **Honest by default** — the product never presents unbuilt features as working.
2. **Positive framing** — progress and consistency over perfection.
3. **Privacy-first** — diet and health-adjacent data is sensitive; see `PRIVACY.md`.
4. **Accessible** — WCAG 2.2 AA is a baseline, not a stretch goal.

## Out of scope for Phase 1

Authentication, planner, habit tracking, chat, leaderboards, reminders, payments, native apps.
