import type { HydratedViolation } from "@/lib/data/index";
import type { RemediationStatus, User } from "@/lib/data/types/domain";

const STORAGE_KEY = "accessops:issue-overrides";

const VALID_STATUSES = new Set<string>([
  "open",
  "in-progress",
  "fixed",
  "verified",
  "accepted-risk",
]);

type OverrideEntry = { assigneeId?: string | null; status?: string };
type OverrideMap = Record<string, OverrideEntry>;

function load(): OverrideMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return parsed as OverrideMap;
  } catch {
    return {};
  }
}

function persist(map: OverrideMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors (private browsing, quota exceeded, etc.)
  }
}

export function persistOverride(
  id: string,
  patch: { assigneeId?: string | null; status?: RemediationStatus },
): void {
  const map = load();
  const entry: OverrideEntry = map[id] ?? {};
  if ("assigneeId" in patch) entry.assigneeId = patch.assigneeId ?? null;
  if (patch.status !== undefined) entry.status = patch.status;
  map[id] = entry;
  persist(map);
}

export function persistOverrides(
  ids: string[],
  patch: { assigneeId?: string | null; status?: RemediationStatus },
): void {
  if (ids.length === 0) return;
  const map = load();
  for (const id of ids) {
    const entry: OverrideEntry = map[id] ?? {};
    if ("assigneeId" in patch) entry.assigneeId = patch.assigneeId ?? null;
    if (patch.status !== undefined) entry.status = patch.status;
    map[id] = entry;
  }
  persist(map);
}

export function applyOverrides(
  violations: HydratedViolation[],
  users: User[],
): HydratedViolation[] {
  const map = load();
  if (Object.keys(map).length === 0) return violations;
  return violations.map((v) => {
    const o = map[v.id];
    if (!o) return v;
    const result = { ...v };
    if ("assigneeId" in o) {
      const aId = o.assigneeId ?? null;
      result.assigneeId = aId ?? undefined;
      result.assignee = aId ? (users.find((u) => u.id === aId) ?? undefined) : undefined;
    }
    if (o.status !== undefined && VALID_STATUSES.has(o.status)) {
      result.status = o.status as RemediationStatus;
    }
    return result;
  });
}
