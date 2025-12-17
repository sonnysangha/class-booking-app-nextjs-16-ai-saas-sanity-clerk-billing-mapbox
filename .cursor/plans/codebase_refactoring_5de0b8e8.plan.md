---
name: Codebase Refactoring
overview: "Aggressive codebase simplification: delete 550+ lines of dead code, merge similar components, consolidate duplicate configs and utilities, fix type safety issues, remove barrel exports for faster HMR, and organize components into feature-based folders with direct imports."
todos:
  - id: delete-dead-code
    content: Delete AIAssistant.tsx and remove console.log from ToolCallUI.tsx
    status: completed
  - id: merge-widgets
    content: Merge 3 widget components into single ResultCard.tsx with variants
    status: completed
  - id: consolidate-status-config
    content: Merge BookingCardWidget statusConfig into lib/constants/status.ts
    status: completed
  - id: remove-tool-display-name
    content: Delete getToolDisplayName from chat/utils.ts (duplicate of toolConfig)
    status: completed
  - id: extract-is-mobile
    content: Create lib/utils/is-mobile.ts for mobile viewport detection
    status: completed
  - id: extract-user-profile
    content: Extract duplicate getOrCreateUserProfile to lib/utils/user-profile.ts
    status: completed
  - id: remove-barrels
    content: Delete barrel index.ts files (chat/, ai/, lib/constants/)
    status: completed
  - id: fix-types
    content: Fix unsafe casts and improve types in chat/types.ts and ToolCallUI.tsx
    status: completed
  - id: centralize-query
    content: Move inline GROQ query from profile.ts to sanity queries
    status: completed
  - id: extract-booking-card
    content: Extract BookingCard from bookings/page.tsx to component file
    status: completed
  - id: create-folders
    content: Create layout/, bookings/, classes/, maps/, onboarding/ folders
    status: completed
  - id: move-components
    content: Move all components to appropriate feature folders
    status: completed
  - id: update-imports
    content: Update all import paths across the entire app
    status: in_progress
---

# Codebase Refactoring Plan

## Requirements Summary

- Delete dead/duplicate code
- Merge similar components
- Consolidate duplicate configs and utilities
- Fix type safety (no `any`/`unknown`, use Sanity typegen)
- Remove barrel exports (direct imports only)
- Organize into feature-based folders
- **No functionality changes**

---

## Part 1: Delete Dead Code (-555 lines)

| File | Lines | Action |

|------|-------|--------|

| `components/app/AIAssistant.tsx` | 550 | Delete - unused duplicate of ChatSheet |

| `components/app/chat/ToolCallUI.tsx:97-101` | 5 | Remove debug console.log |

---

## Part 2: Merge 3 Widget Components into 1 (-130 lines)

**Current:** 3 nearly identical files (271 total lines)

- `ai/ClassCardWidget.tsx` (68 lines)
- `ai/SessionCardWidget.tsx` (89 lines)
- `ai/BookingCardWidget.tsx` (114 lines)

**After:** 1 file `chat/ResultCard.tsx` (~80 lines) with discriminated union props

---

## Part 3: Consolidate Duplicate Configs

### 3.1 Status Config Duplication

**Current:** Two separate status configs

- `components/app/ai/BookingCardWidget.tsx` has `statusConfig` (icons + labels + colors)
- `lib/constants/status.ts` has `BOOKING_STATUS_COLORS` (just colors)

**Fix:** Merge into single comprehensive `BOOKING_STATUS_CONFIG` in `lib/constants/status.ts` with colors, labels, and icons

### 3.2 Tool Display Config Duplication

**Current:** Two ways to get tool display info

- `chat/ToolCallUI.tsx` has `toolConfig` object (complete with icons)
- `chat/utils.ts` has `getToolDisplayName()` function (partial, labels only)

**Fix:** Delete `getToolDisplayName` from utils.ts - it's only used via the barrel export which we're removing anyway. Keep `toolConfig` in ToolCallUI.tsx.

---

## Part 4: Extract Duplicate Utilities

### 4.1 Mobile Detection Pattern (4 files)

**Duplicated in:**

- `ai/ClassCardWidget.tsx`
- `ai/SessionCardWidget.tsx`
- `ai/BookingCardWidget.tsx`
- `chat/MessageContent.tsx`

All have identical: `window.matchMedia("(max-width: 767px)").matches`

**Fix:** Create `lib/utils/is-mobile.ts` with `isMobileViewport()` function

### 4.2 User Profile Creation (2 files)

**Duplicated in:**

- `lib/actions/bookings.ts` (lines 33-60)
- `lib/actions/profile.ts` (lines 34-60)

**Fix:** Extract to `lib/utils/user-profile.ts`

---

## Part 5: Remove Barrel Exports

Delete these barrel files and update all imports to be direct:

| File to Delete | Affected Imports |

|----------------|------------------|

| `components/app/chat/index.ts` | ChatSheet.tsx |

| `components/app/ai/index.ts` | chat/ToolCallUI.tsx |

| `lib/constants/index.ts` | 5 files |

---

## Part 6: Fix Type Safety Issues

### 6.1 Remove unsafe casts in `chat/ToolCallUI.tsx`

- Line 83-85: `as Record<string, unknown>` 
- Lines 162, 170, 178: `as never` casts

### 6.2 Remove unsafe cast in `chat/utils.ts`

- Line 22: `as unknown as ToolCallPart`

### 6.3 Improve `chat/types.ts`

- Add proper discriminated union types for tool results
- Remove `unknown` from `output` and `result` fields

### 6.4 Inline `lib/ai/types.ts` into `ResultCard.tsx`

- After widget merge, only 1 file uses these types

---

## Part 7: Centralize Inline GROQ Query

**File:** `lib/actions/profile.ts` (lines 10-14)

Move inline query to `sanity/lib/queries/bookings.ts` with `defineQuery()` wrapper

---

## Part 8: Extract Inline Component

**File:** `app/(app)/bookings/page.tsx`

Extract `BookingCard` component (lines 246-341) to `components/app/bookings/BookingCard.tsx`

---

## Part 9: Folder Restructuring

### New Structure (no barrel files)

```
components/app/
├── layout/
│   ├── AppHeader.tsx
│   └── AppShell.tsx
│
├── chat/
│   ├── ChatButton.tsx
│   ├── ChatSheet.tsx
│   ├── MessageBubble.tsx
│   ├── MessageContent.tsx
│   ├── ResultCard.tsx      ← merged widgets + inlined types
│   ├── ToolCallUI.tsx
│   ├── WelcomeScreen.tsx
│   ├── types.ts
│   └── utils.ts
│
├── bookings/
│   ├── AttendanceAlert.tsx
│   ├── BookingActions.tsx
│   ├── BookingButton.tsx
│   ├── BookingCard.tsx     ← extracted from page
│   ├── BookingsCalendar.tsx
│   ├── BookingsCalendarView.tsx
│   └── DayBookings.tsx
│
├── classes/
│   ├── ClassesContent.tsx
│   ├── ClassesFilters.tsx
│   ├── ClassSearch.tsx
│   └── SessionCard.tsx
│
├── maps/
│   ├── AddressSearch.tsx
│   ├── ClassesMapSidebar.tsx
│   ├── RadiusSelector.tsx
│   └── VenueMap.tsx
│
└── onboarding/
    └── OnboardingGuard.tsx
```

---

## Files Summary

### Delete (8 files)

- `components/app/AIAssistant.tsx`
- `components/app/ai/index.ts`
- `components/app/ai/ClassCardWidget.tsx`
- `components/app/ai/SessionCardWidget.tsx`
- `components/app/ai/BookingCardWidget.tsx`
- `components/app/chat/index.ts`
- `lib/constants/index.ts`
- `lib/ai/types.ts`

### Create (4 files)

- `lib/utils/user-profile.ts`
- `lib/utils/is-mobile.ts`
- `components/app/chat/ResultCard.tsx`
- `components/app/bookings/BookingCard.tsx`

### Move (16 files to new folders)

---

## Estimated Impact

| Metric | Before | After |

|--------|--------|-------|

| Lines of code | ~3500 | ~2700 |

| Component files | 23+ flat | 20 organized |

| Barrel exports | 3 | 0 |

| Duplicate functions | 3 | 0 |

| Duplicate configs | 2 | 0 |

| `as never` casts | 3 | 0 |

| `as unknown` casts | 2 | 0 |