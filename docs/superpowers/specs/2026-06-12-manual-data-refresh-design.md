# Manual Data Refresh Feature Design

**Date**: 2026-06-12  
**Feature**: Add manual data refresh button to the application header

## Overview

Add a manual refresh button in the top navigation bar that allows users to trigger an immediate data synchronization from the Football Data API and update all champion probability predictions and match results.

## Motivation

Currently, data updates only happen once per day at 15:00 Beijing time via a scheduled cron job. During active tournament periods, users may want to see the latest match results and updated predictions immediately after a match ends, without waiting for the next scheduled sync.

## User Experience

### Button Placement
- Location: Top navigation bar (AppHeader.vue), between the navigation links and the theme toggle button
- Visible on all pages (desktop and mobile)
- Icon-based button to minimize space usage

### Interaction Flow
1. User clicks the refresh button (circular arrow icon)
2. Button enters loading state with rotating animation
3. System fetches latest data from Football Data API
4. System recalculates champion probabilities
5. UI updates with fresh data
6. Success toast notification shows: "数据已更新，共更新 X 场比赛"
7. Button returns to idle state

### Visual Design
- Icon: Circular arrow (🔄 or SVG equivalent)
- Loading state: Continuous 360° rotation animation
- Style: Consistent with existing AppHeader buttons (rounded, hover effects)
- Dark mode: Proper color adaptation
- Disabled state: Lower opacity during loading

## Technical Architecture

### Component Structure

**New Component**: `RefreshButton.vue`
- Manages local loading state
- Handles click events
- Displays loading animation
- Shows toast notifications

**Modified Component**: `AppHeader.vue`
- Integrate RefreshButton between nav links and ThemeToggle
- Layout: `<nav> ... </nav> <RefreshButton /> <ThemeToggle />`

**New Composable**: `composables/useToast.ts`
- Provides `toast.success(message)` and `toast.error(message)` methods
- Manages toast notification display (top-right corner, 3s auto-dismiss)
- Implementation: Global reactive state with array of toast objects
- Each toast: `{ id, message, type: 'success' | 'error', timestamp }`
- Auto-remove after 3000ms using setTimeout

### Data Flow

```
User Click
    ↓
RefreshButton: isLoading = true
    ↓
POST /api/sync
    ↓
Server: Fetch from Football Data API
Server: Update match results in KV
Server: Recalculate champion rates
Server: Save historical snapshot
    ↓
Response: { updated: number } or { updated: number, error: string }
    ↓
Client: teamStore.hydrate(force: true)
Client: matchStore.hydrate(force: true)
    ↓
RefreshButton: isLoading = false
    ↓
Toast: Show success/error message
```

### API Authentication

**Current Issue**: `/api/sync` requires CRON_SECRET header for authentication

**Solution**: Modify authentication logic in `server/api/sync.ts`:
```typescript
// Allow manual triggers from frontend
const cronAuth = getHeader(event, 'authorization')
const isManualTrigger = !cronAuth // No auth header = frontend call
const isCronJob = cronAuth === `Bearer ${process.env.CRON_SECRET}`

if (process.env.CRON_SECRET && !isManualTrigger && !isCronJob) {
  throw createError({ statusCode: 401 })
}
```

**Why**: Frontend calls should not require a secret token. Only external cron job calls need authentication to prevent abuse.

### Store Updates

Both stores support force refresh via `hydrate(force: true)`:
- `teamStore.hydrate(true)` - Refetch `/api/teams` (champion rates)
- `matchStore.hydrate(true)` - Refetch `/api/matches` (match results)

The `force` parameter bypasses the `loaded` check and ensures fresh data is retrieved.

## Error Handling

### Error Scenarios

**1. Network Failure**
- Catch: `fetch` timeout or connection error
- Action: Show toast.error('网络连接失败，请检查网络后重试')
- Recovery: Button returns to idle, user can retry

**2. API Error Response**
- Catch: `/api/sync` returns error in response body
- Action: Show toast.error('更新失败：' + error message)
- Recovery: Button returns to idle

**3. Sync Timeout**
- Timeout: 10 seconds for `/api/sync` call
- Action: Show toast.error('更新超时，请稍后重试')
- Recovery: Button returns to idle

**4. Store Hydration Failure**
- Catch: Exception during `hydrate()` calls
- Action: Show toast.error('数据刷新失败，请重新加载页面')
- Recovery: Button returns to idle

### Anti-Spam Protection

**Rate Limiting**:
- Disable button during loading state (prevents double-click)
- Optional: Add 5-second cooldown after each sync (can be added later if needed)

**Why not cooldown initially**: Users should be able to retry immediately if a request fails. Cooldown adds complexity and may frustrate users during legitimate retry scenarios.

## Implementation Checklist

### Phase 1: Core Functionality
1. Create `composables/useToast.ts` - Toast notification composable
2. Create `components/ToastContainer.vue` - Toast display component (fixed top-right)
3. Create `components/RefreshButton.vue` - Button component with loading state
4. Modify `server/api/sync.ts` - Update authentication logic to allow frontend calls
5. Add ToastContainer to `app.vue` layout
6. Integrate RefreshButton into `AppHeader.vue`
7. Test basic flow: click → loading → success → toast

### Phase 2: Error Handling
6. Add timeout handling (10s)
7. Add error catch for all failure scenarios
8. Test error states: network failure, API error, timeout

### Phase 3: Polish
9. Add rotation animation for loading state
10. Verify dark mode styling
11. Test on mobile viewport
12. Add accessibility attributes (aria-label, aria-busy)

## Testing Strategy

### Manual Testing
- Click button and verify data updates
- Check loading animation appears
- Verify toast notifications show correct messages
- Test on desktop and mobile viewports
- Test in light and dark modes
- Test rapid clicking (button should stay disabled)

### Error Testing
- Disconnect network and click button (should show network error)
- Modify API to return error response (should show error toast)
- Test with slow network (should complete within timeout)

### Integration Testing
- Verify champion rates update after sync
- Verify match results update after sync
- Verify historical data snapshot is saved

## Future Enhancements

### Potential Additions (Not in Initial Scope)
- Display last sync timestamp in tooltip
- Add rate limiting (5-second cooldown between syncs)
- Add optimistic UI updates
- Add progress indicator during long syncs
- Batch multiple store updates with Promise.all

## Design Decisions

### Why Navigation Bar vs Floating Button?
Navigation bar provides better visibility and consistency across all pages. Floating buttons can interfere with page content and are less discoverable.

### Why Synchronous Loading vs Background Sync?
Synchronous loading with visible feedback is simpler and more predictable. Users know exactly when the update is complete. Background sync would require polling or websockets, adding complexity without significant UX benefit for a 1-2 second operation.

### Why Single Button vs Per-Section Buttons?
Single button updates all data atomically, ensuring consistency across the app. Per-section updates would create race conditions and confusing partial states.

### Why Toast vs Inline Message?
Toast notifications don't disrupt the page layout and are visible regardless of scroll position. They're appropriate for transient status messages like sync confirmations.
