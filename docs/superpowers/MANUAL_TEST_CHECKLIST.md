# Manual Test Checklist: Manual Data Refresh Feature

**Implementation Status:** ✅ Complete (Tasks 1-6)  
**Ready for Testing:** Yes  
**Date:** 2026-06-12

---

## Test Environment Setup

- [ ] Start dev server: `pnpm dev`
- [ ] Verify server is running on http://localhost:3000
- [ ] Open browser DevTools for network inspection

---

## Test 1: Basic Refresh Flow

**Actions:**
1. Open http://localhost:3000 in browser
2. Click the refresh button (🔄) in the header
3. Observe loading animation (spinning icon)
4. Wait for toast notification to appear
5. Verify toast shows success message with updated count

**Expected Results:**
- [ ] Button disables during loading
- [ ] Icon spins continuously
- [ ] Toast appears in top-right corner
- [ ] Toast shows "数据已更新，共更新 X 场比赛"
- [ ] Toast disappears after 3 seconds
- [ ] Button returns to enabled state after completion

**Notes:**

---

## Test 2: Rapid Clicking Protection

**Actions:**
1. Click refresh button rapidly 5 times in succession
2. Observe network requests in DevTools
3. Observe button behavior

**Expected Results:**
- [ ] Button stays disabled during loading
- [ ] Only one network request is sent to /api/sync
- [ ] Subsequent clicks are ignored while loading

**Notes:**

---

## Test 3: Dark Mode Styling

**Actions:**
1. Toggle theme to dark mode using the theme toggle button
2. Click refresh button
3. Observe toast notification appearance
4. Verify button styling in dark mode

**Expected Results:**
- [ ] Toast is visible and readable in dark mode
- [ ] Toast text contrasts well with background
- [ ] Button styling is appropriate for dark theme
- [ ] No visual issues or layout problems

**Notes:**

---

## Test 4: Mobile Viewport

**Actions:**
1. Resize browser to mobile width (< 768px)
2. Verify refresh button is visible in header
3. Click button and verify functionality
4. Check toast notification positioning

**Expected Results:**
- [ ] Refresh button is visible in mobile header
- [ ] Button is easily tappable (adequate touch target size)
- [ ] Toast appears correctly positioned (not hidden by mobile tab bar)
- [ ] All functionality works on mobile viewport

**Notes:**

---

## Test 5: Error Handling - Network Failure

**Actions:**
1. Open browser DevTools
2. Go to Network tab
3. Enable "Offline" mode
4. Click refresh button
5. Observe error toast

**Expected Results:**
- [ ] Error toast appears with message: "网络连接失败，请检查网络后重试"
- [ ] Button returns to enabled state
- [ ] User can retry after re-enabling network

**Notes:**

---

## Test 6: Layout and Spacing

**Actions:**
1. Inspect header layout on desktop viewport
2. Verify spacing between navigation links, refresh button, and theme toggle
3. Check alignment and visual consistency

**Expected Results:**
- [ ] Refresh button is positioned between nav links and theme toggle
- [ ] Spacing is consistent with other header buttons
- [ ] Visual hierarchy is clear
- [ ] No layout shifts or overlapping elements

**Notes:**

---

## Test 7: Toast Z-Index (Mobile)

**Actions:**
1. Switch to mobile viewport
2. Trigger a toast notification
3. Verify toast appears above mobile tab bar

**Expected Results:**
- [ ] Toast (z-50) renders above mobile tab bar
- [ ] Toast is fully visible and not obscured
- [ ] Toast dismisses correctly

**Notes:**

---

## Integration Verification

**Actions:**
1. Click refresh button and verify data updates
2. Navigate to different pages and check if champion rates changed
3. Check match results for updates

**Expected Results:**
- [ ] Champion rates update after sync
- [ ] Match results update after sync
- [ ] Historical data snapshot is saved
- [ ] All stores refresh correctly

**Notes:**

---

## Summary

**Tests Passed:** ___ / 7  
**Tests Failed:** ___ / 7  
**Blocking Issues:** 

**Overall Assessment:**
- [ ] Ready for production
- [ ] Needs minor fixes
- [ ] Needs major fixes

**Sign-off:**
- Tested by: _______________
- Date: _______________
