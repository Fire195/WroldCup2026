# Manual Data Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a manual refresh button in the navigation bar that triggers immediate data synchronization and updates champion probability predictions.

**Architecture:** Toast notification system using global reactive state + RefreshButton component that calls /api/sync and refreshes stores + Modified API authentication to allow frontend calls.

**Tech Stack:** Vue 3 Composition API, Nuxt 3, TypeScript, Pinia stores, Tailwind CSS

---

## File Structure

**New files:**
- `app/composables/useToast.ts` - Toast notification composable with global state
- `app/components/ToastContainer.vue` - Toast display component (fixed top-right positioning)
- `app/components/RefreshButton.vue` - Refresh button with loading state and click handler

**Modified files:**
- `server/api/sync.ts:10-13` - Update authentication logic to allow frontend calls
- `app/layouts/default.vue:3,7` - Add ToastContainer to layout
- `app/components/AppHeader.vue:2,33` - Import and place RefreshButton

---

## Task 1: Create Toast Notification System

**Files:**
- Create: `app/composables/useToast.ts`

- [ ] **Step 1: Create useToast composable with global state**

```typescript
interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

const toasts = ref<Toast[]>([])
let nextId = 0

export const useToast = () => {
  const add = (message: string, type: 'success' | 'error') => {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3000)
  }

  return {
    toasts: readonly(toasts),
    success: (message: string) => add(message, 'success'),
    error: (message: string) => add(message, 'error'),
  }
}
```

- [ ] **Step 2: Verify file was created**

Run: `ls -la app/composables/useToast.ts`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add app/composables/useToast.ts
git commit -m "feat: add toast notification composable"
```

---

## Task 2: Create Toast Display Component

**Files:**
- Create: `app/components/ToastContainer.vue`

- [ ] **Step 1: Create ToastContainer component with transitions**

```vue
<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts } = useToast()
</script>
<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm font-medium text-sm',
          'min-w-[300px] max-w-md',
          toast.type === 'success'
            ? 'bg-green-500/90 text-white'
            : 'bg-red-500/90 text-white'
        ]"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>
<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
```

- [ ] **Step 2: Verify file was created**

Run: `ls -la app/components/ToastContainer.vue`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add app/components/ToastContainer.vue
git commit -m "feat: add toast display component"
```

---

## Task 3: Add ToastContainer to Layout

**Files:**
- Modify: `app/layouts/default.vue:3,7`

- [ ] **Step 1: Import ToastContainer in default layout**

Add after line 2 (after MobileTabBar import):
```typescript
import ToastContainer from '~/components/ToastContainer.vue'
```

- [ ] **Step 2: Add ToastContainer to template**

Add after line 11 (after MobileTabBar):
```vue
    <ToastContainer />
```

Full modified template section:
```vue
<template>
  <div class="min-h-screen flex flex-col bg-stone-50 dark:bg-gray-950">
    <AppHeader />
    <main class="flex-1 pb-20 md:pb-12">
      <slot />
    </main>
    <MobileTabBar />
    <ToastContainer />
  </div>
</template>
```

- [ ] **Step 3: Verify the layout file looks correct**

Run: `head -15 app/layouts/default.vue`
Expected: Should see ToastContainer import and usage

- [ ] **Step 4: Commit**

```bash
git add app/layouts/default.vue
git commit -m "feat: integrate toast container into layout"
```

---

## Task 4: Update API Authentication

**Files:**
- Modify: `server/api/sync.ts:10-13`

- [ ] **Step 1: Modify authentication logic to allow frontend calls**

Replace lines 10-13:
```typescript
  const cronAuth = getHeader(event, 'authorization')
  const isManualTrigger = !cronAuth
  const isCronJob = cronAuth === `Bearer ${process.env.CRON_SECRET}`
  if (process.env.CRON_SECRET && !isManualTrigger && !isCronJob) {
    throw createError({ statusCode: 401 })
  }
```

Full context (lines 5-17):
```typescript
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'GET' && method !== 'POST') {
    throw createError({ statusCode: 405 })
  }
  const cronAuth = getHeader(event, 'authorization')
  const isManualTrigger = !cronAuth
  const isCronJob = cronAuth === `Bearer ${process.env.CRON_SECRET}`
  if (process.env.CRON_SECRET && !isManualTrigger && !isCronJob) {
    throw createError({ statusCode: 401 })
  }
  const token = useRuntimeConfig().footballDataApiKey
  if (!token) throw createError({ statusCode: 500, statusMessage: 'API key not configured' })
  return await runSync(token)
})
```

- [ ] **Step 2: Verify the changes**

Run: `head -17 server/api/sync.ts`
Expected: Should see modified auth logic

- [ ] **Step 3: Commit**

```bash
git add server/api/sync.ts
git commit -m "fix: allow frontend to call sync API without auth"
```

---

## Task 5: Create RefreshButton Component

**Files:**
- Create: `app/components/RefreshButton.vue`

- [ ] **Step 1: Create RefreshButton with loading state and error handling**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { useTeamStore } from '~/stores/teamStore'
import { useMatchStore } from '~/stores/matchStore'

const { success, error } = useToast()
const teamStore = useTeamStore()
const matchStore = useMatchStore()
const isLoading = ref(false)

const handleRefresh = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const response = await $fetch<{ updated: number; error?: string }>('/api/sync', {
      method: 'POST',
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (response.error) {
      error(`更新失败：${response.error}`)
      return
    }
    
    await Promise.all([
      teamStore.hydrate(true),
      matchStore.hydrate(true),
    ])
    
    success(`数据已更新，共更新 ${response.updated} 场比赛`)
  } catch (e: any) {
    if (e.name === 'AbortError') {
      error('更新超时，请稍后重试')
    } else if (e.message?.includes('fetch')) {
      error('网络连接失败，请检查网络后重试')
    } else {
      error('数据刷新失败，请重新加载页面')
    }
  } finally {
    isLoading.value = false
  }
}
</script>
<template>
  <button
    @click="handleRefresh"
    :disabled="isLoading"
    :aria-label="isLoading ? '正在更新数据' : '更新数据'"
    :aria-busy="isLoading"
    :class="[
      'p-2 rounded-lg transition-all',
      'text-stone-600 dark:text-gray-300',
      'hover:bg-stone-100/60 dark:hover:bg-gray-800/60',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ]"
  >
    <span
      :class="[
        'block text-xl',
        isLoading && 'animate-spin'
      ]"
    >
      🔄
    </span>
  </button>
</template>
```

- [ ] **Step 2: Verify file was created**

Run: `ls -la app/components/RefreshButton.vue`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add app/components/RefreshButton.vue
git commit -m "feat: add refresh button component"
```

---

## Task 6: Integrate RefreshButton into AppHeader

**Files:**
- Modify: `app/components/AppHeader.vue:2,33`

- [ ] **Step 1: Import RefreshButton**

Add after line 1 (after ThemeToggle import):
```typescript
import RefreshButton from './RefreshButton.vue'
```

- [ ] **Step 2: Add RefreshButton to header layout**

Add before line 33 (before ThemeToggle):
```vue
      <RefreshButton />
```

Full modified section (lines 24-35):
```vue
      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to"
          class="px-4 py-2 text-sm font-medium text-stone-600 dark:text-gray-300 hover:text-stone-900 dark:hover:text-gray-100 rounded-lg hover:bg-stone-100/60 dark:hover:bg-gray-800/60 transition-all"
          active-class="!text-wc-green !bg-wc-green/10">
          {{ l.label }}
        </NuxtLink>
      </nav>

      <RefreshButton />
      <ThemeToggle />
    </div>
  </header>
```

- [ ] **Step 3: Verify the header file looks correct**

Run: `head -35 app/components/AppHeader.vue | tail -15`
Expected: Should see RefreshButton import and usage

- [ ] **Step 4: Commit**

```bash
git add app/components/AppHeader.vue
git commit -m "feat: integrate refresh button into header"
```

---

## Task 7: Manual Testing

**Files:**
- Test: All components integrated

- [ ] **Step 1: Start dev server if not running**

Run: `pnpm dev`
Expected: Server starts on port 3000

- [ ] **Step 2: Test basic refresh flow**

Actions:
1. Open http://localhost:3000 in browser
2. Click the refresh button (🔄) in the header
3. Observe loading animation (spinning icon)
4. Wait for toast notification to appear
5. Verify toast shows success message with updated count

Expected: 
- Button disables during loading
- Icon spins continuously
- Toast appears in top-right corner
- Toast shows "数据已更新，共更新 X 场比赛"
- Toast disappears after 3 seconds

- [ ] **Step 3: Test rapid clicking protection**

Actions:
1. Click refresh button rapidly 5 times
2. Observe that only one request fires

Expected: Button stays disabled during loading, prevents multiple requests

- [ ] **Step 4: Test dark mode styling**

Actions:
1. Toggle theme to dark mode
2. Click refresh button
3. Observe toast notification appearance

Expected: Toast is visible and readable in dark mode

- [ ] **Step 5: Test mobile viewport**

Actions:
1. Resize browser to mobile width (< 768px)
2. Verify refresh button is visible in header
3. Click button and verify functionality

Expected: Button works on mobile, toast is positioned correctly

- [ ] **Step 6: Test error handling (network failure simulation)**

Actions:
1. Open browser DevTools
2. Go to Network tab
3. Enable "Offline" mode
4. Click refresh button
5. Observe error toast

Expected: Toast shows "网络连接失败，请检查网络后重试"

- [ ] **Step 7: Document test results**

Create a brief summary of manual testing:
- All flows tested: ✓ or ✗
- Any issues found
- Browser/device combinations tested

---

## Self-Review Checklist

**Spec Coverage:**
- ✓ Button placement in navigation bar (Task 6)
- ✓ Loading state with rotation animation (Task 5)
- ✓ Toast notification system (Tasks 1, 2, 3)
- ✓ API authentication update (Task 4)
- ✓ Store refresh on success (Task 5)
- ✓ Error handling for all scenarios (Task 5)
- ✓ Accessibility attributes (Task 5)
- ✓ Dark mode support (Task 2 - CSS classes)
- ✓ Mobile viewport support (implicit via responsive design)

**Placeholder Scan:** None found - all code blocks complete

**Type Consistency:**
- Toast interface: `{ id: number, message: string, type: 'success' | 'error' }`
- useToast methods: `success(message: string)`, `error(message: string)`
- API response: `{ updated: number, error?: string }`
- All usage consistent across components

**Dependencies:**
- Task 3 depends on Tasks 1, 2 (ToastContainer must exist)
- Task 5 depends on Task 1 (useToast composable)
- Task 6 depends on Task 5 (RefreshButton component)
- Task 4 is independent (can run in parallel)
- Task 7 depends on all previous tasks

---

## Notes

**Testing Strategy:** Manual testing is specified in Task 7. No automated tests are included in this plan because the feature is primarily UI/interaction focused and the existing codebase doesn't show evidence of component testing infrastructure.

**Animation:** CSS `animate-spin` utility from Tailwind provides the rotation animation - no custom keyframes needed.

**Error Boundaries:** Each error type (timeout, network, API error, store error) has specific handling with user-friendly messages in Chinese to match the existing UI language.

**Accessibility:** ARIA attributes (`aria-label`, `aria-busy`) are included for screen reader support.
