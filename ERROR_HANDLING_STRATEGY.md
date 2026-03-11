# Error Handling & Business Logic Validation Strategy

## Context

Full overhaul of error handling and input validation for the travel itinerary CLI app.
Two categories of issues were identified:

1. Technical error handling (missing try/catch, unguarded async calls, silent failures)
2. Business logic validation (dates in the past, invalid countries, negative costs, etc.)

---

## Architecture Decisions

### 1. Two-layer validation

- **Inquirer `validate` callbacks** — synchronous checks (non-empty, positive number, date format). User stays in the prompt until input is valid.
- **Async pre-checks in handlers** — checks that need DB or API (country exists, date within trip range). Run after prompt returns, before calling the service.

### 2. Country validation

- Reuse `getDestinationInfo()` inside `handleCreateTrip`.
- If it throws → print error and return without creating the trip.
- Print `"Validating destination..."` before the API call so user knows it's working.

### 3. Central error handler in main()

- Wrap the entire `switch` block in a single try/catch.
- Any uncaught service error prints a clean message instead of crashing.
- Replace `void main()` with `main().catch(err => { console.error(err); process.exit(1); })`.

### 4. Services just rethrow

- Services throw meaningful errors, let cli.ts handle presentation.
- Remove `console.error` inside services before rethrowing.

---

## Phased Implementation Plan

### Phase 1 — `src/services/destinationService.ts`

**Status: [x] Done**

Changes:

- Add `if (!response.ok)` check after fetch — a 404 (unknown country) is not a thrown error
- Add `if (!Array.isArray(data) || data.length === 0)` guard before accessing `data[0]`
- Make thrown error messages distinguish "country not found" vs "network error"

Example shape:

```typescript
if (!response.ok) {
  throw new Error(`Country "${countryName}" not found`);
}
if (!Array.isArray(data) || data.length === 0) {
  throw new Error(`No results for "${countryName}"`);
}
```

---

### Phase 2 — `src/utils/validators.ts` (NEW FILE)

**Status: [x] Done**

Pure, synchronous, zero-dependency helpers using date-fns (already installed).

Functions:

- `isValidDateString(input: string): boolean` — validates YYYY-MM-DD using regex + date-fns `isValid(parseISO(input))`
- `isValidDateTimeString(input: string): boolean` — validates YYYY-MM-DDTHH:mm
- `isPositiveNumber(value: number | undefined): boolean` — `Number.isFinite(value) && value > 0`
- `isNonEmptyString(value: string): boolean` — `value.trim().length > 0`
- `isDateInRange(date: Date, start: Date, end?: Date): boolean` — for activity-in-trip-range check

Note: Pair date-fns `parseISO` with a regex to enforce strict format — `parseISO` can accept loosely-formatted dates.

---

### Phase 3 — `src/services/budgetManager.ts`

**Status: [x] Done**

Changes:

- `highCost()` silently swallows errors (catch logs but doesn't rethrow). This function is also dead code — `cli.ts` calls `findHighCostItem` directly, bypassing it. Remove or mark as unused.
- Remove `console.error(error)` before `throw error` in `getTripTotalCost` and `findHighCostItem` — let cli.ts present errors.

---

### Phase 4 — `src/services/activityService.ts` + `src/services/tripService.ts`

**Status: [ ] Not started**

Changes (both files):

- Wrap all `fs.writeFile` calls in try/catch and rethrow with clear message: `"Failed to save data: " + error.message`

Note (tripService.ts): `db.trips.length + 1` for trip ID generation causes ID collisions after deletion. Flag for follow-up — not a blocking issue but worth noting.

Note (activityService.ts): `trip.startDate` comes from DB as a raw ISO string — must wrap with `new Date()` when comparing to activity startTime.

---

### Phase 5 — `src/cli.ts`

**Status: [ ] Not started**

This is the largest phase. Changes per handler:

**`handleCreateTrip`:**

- `validate` on destination: `isNonEmptyString(input) || "Destination cannot be empty"`
- `validate` on startDate: `isValidDateString(input) || "Enter a valid date (YYYY-MM-DD)"`
- After prompts: check startDate is not in the past
- After prompts: call `getDestinationInfo()` to validate country — if throws, print error and return

**`handleAddActivity`:**

- `validate` on name: `isNonEmptyString(input) || "Activity name cannot be empty"`
- `validate` on cost: `isPositiveNumber(input) || "Cost must be a positive number"`
- `validate` on startTime: `isValidDateTimeString(input) || "Enter a valid datetime (YYYY-MM-DDTHH:mm)"`
- After prompts: check startTime is not before trip's startDate (fetch trip from DB)

**`handleHighCost`:**

- `validate` on threshold: `isPositiveNumber(input) || "Threshold must be a positive number"`
- Move `currentTripId` guard ABOVE the prompt (currently it's checked after)

**`handleFilterActivities` (filter by day):**

- `validate` on date: `input.toLowerCase() === "back" || isValidDateString(input) || "Enter YYYY-MM-DD or 'back'"`

**`main()` central error handler:**

```typescript
// Wrap switch block:
try {
  switch (choice) { ... }
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.log(`\nSomething went wrong: ${message}`);
}

// Replace void main():
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
```

---

### Phase 6 — `src/models.ts` (OPTIONAL)

**Status: [ ] Not started**

- Add `endDate?: Date` to the `Trip` type
- Update `handleCreateTrip` to prompt for end date
- Enables full "activity must fall within trip date range" validation
- Cascades into both services and cli.ts — do this last

---

## Business Logic Rules Summary

| Field                  | Rule                                                     |
| ---------------------- | -------------------------------------------------------- |
| `destination`          | Non-empty + must resolve via REST Countries API          |
| `startDate` (trip)     | Valid `YYYY-MM-DD` + not in the past                     |
| `startTime` (activity) | Valid `YYYY-MM-DDTHH:mm` + not before trip's `startDate` |
| `cost`                 | Finite, positive number (not NaN, not 0, not negative)   |
| `name`                 | Non-empty after trimming                                 |
| `threshold`            | Positive number                                          |
| Filter date            | Valid `YYYY-MM-DD` or the literal string `"back"`        |

---

## Gotchas

1. Inquirer `type: "number"` passes `undefined` if user presses Enter on empty — `isPositiveNumber` must handle `undefined`
2. `trip.startDate` from DB is a raw ISO string, not a Date — must use `new Date(trip.startDate)` when comparing
3. `date-fns parseISO` accepts loosely-formatted dates — always pair with regex `^\d{4}-\d{2}-\d{2}$`
4. Phase 6 (endDate) touches models.ts, both services, and cli.ts — do it last
5. Country API validation adds latency — print "Validating destination..." before the call
