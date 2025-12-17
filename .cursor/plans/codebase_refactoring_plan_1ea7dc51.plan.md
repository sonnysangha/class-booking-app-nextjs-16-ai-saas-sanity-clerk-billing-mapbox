---
name: Codebase Refactoring Plan
overview: "Aggressive refactoring to simplify the codebase: delete dead code, merge similar components, consolidate small files, remove barrel exports, and organize into a clean feature-based folder structure."
todos: []
---

# Codebase Refactoring Plan

## Summary

Aggressive simplification: delete 550+ lines of dead code, merge 3 widget components into 1, consolidate small utility files, remove barrel exports, and organize into feature-based folders.

---

## Part 1: Aggressive Code Simplification

### 1.1 Delete Dead Code (550+ lines)

| File | Lines | Reason |

|------|-------|--------|

| `components/app/AIAssistant.tsx` | 550 | Unused duplicate of ChatSheet, references non-existent VenueCardWidget |

| `components/app/chat/ToolCallUI.tsx:97-101` | 5 | Debug console.log |

---

### 1.2 Merge 3 Widget Components into 1 (~200 lines → ~80 lines)

**Current:** 3 nearly identical files

- `ai/ClassCardWidget.tsx` (68 lines)
- `ai/SessionCardWidget.tsx` (89 lines)  
- `ai/BookingCardWidget.tsx` (114 lines)

**Problem:** All three have:

- Same `handleClick` mobile detection pattern
- Same card structure and styling
- Same link wrapper pattern

**Solution:** Create ONE `ResultCard.tsx` component with a `variant` prop:

```typescript
type ResultCardProps = 
  | { variant: "class"; data: SearchClass; onClose: () => void }
  | { variant: "session"; data: ClassSession; onClose: () => void }
  | { variant: "booking"; data: UserBooking; onClose: () => void };

export function ResultCard({ variant, data, onClose }: ResultCardProps) {
  // Single component handling all 3 cases
}
```

---

### 1.3 Inline `lib/ai/types.ts` (~85 lines)

**Current usage:** Only 3 widget files + AIAssistant (being deleted)

**After widget merge:** Only 1 file uses these types

**Solution:** Move types directly into `ResultCard.tsx` - no separate types file needed

---

### 1.4 Consolidate Constants (~170 lines → ~100