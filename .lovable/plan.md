
## Plan: Page "Statut de la Liseuse"

### Overview
Add a new "Status" view accessible from the Dock that displays real-time system information fetched from the backend, plus local stats from the app data.

### 1. New API endpoint & types

**New endpoint in `src/lib/api.ts`:**
```
GET /api/system/status
```
Returns system info: RAM usage, CPU usage, OS version, display server, network status, uptime, disk usage, etc.

**New type in `src/types/bookos.ts`:**
```typescript
interface SystemStatus {
  ram: { total: number; used: number; free: number }; // in MB
  cpu: { usage: number; cores: number; model: string };
  os: { name: string; version: string; kernel: string };
  display: { server: string; resolution: string };
  network: { connected: boolean; ip?: string; ssid?: string };
  uptime: number; // seconds
  disk: { total: number; used: number; free: number }; // in MB
}
```

### 2. New component: `src/components/bookos/SystemStatusView.tsx`

Sections displayed:
- **Backend connection** - Card with status indicator + input to change backend URL
- **System resources** - RAM and CPU gauges using recharts (RadialBarChart or simple bar charts) with auto-refresh every 5s
- **Database stats** - Number of apps, books, secrets, with icons
- **System info** - OS version, kernel, display server in a simple info grid
- **Network** - Connection status, IP, SSID
- **Disk usage** - Progress bar showing used/total

Uses `recharts` (already installed) for RAM/CPU charts. Fetches `/api/system/status` with polling (5s interval). Falls back to "Backend offline" state gracefully.

### 3. Integration in Dock & Index

- Add `'status'` to `ViewType` in `Index.tsx`
- Add a new Dock item with `Monitor` (or `Activity`) icon labeled "Statut"
- Update Dock's `activeView` type to include `'status'`
- Render `<SystemStatusView>` when `activeView === 'status'`, passing `apps.length`, `books.length`, `secrets.length`

### 4. Update `src/BACKEND_SPECS.md`

Add documentation for:
- `GET /api/system/status` endpoint with response format
- Example backend implementation using Node.js `os` module

### Files modified
- `src/types/bookos.ts` - Add `SystemStatus` interface
- `src/lib/api.ts` - Add `fetchSystemStatus()` function
- `src/components/bookos/SystemStatusView.tsx` - New component (charts, info cards, backend URL config)
- `src/components/bookos/Dock.tsx` - Add "Statut" button, update types
- `src/pages/Index.tsx` - Add status view routing
- `src/BACKEND_SPECS.md` - Document new endpoint
