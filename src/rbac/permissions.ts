export enum AdminRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
}

/** Fine-grained permissions used by route guards and the admin UI. */
export type Permission =
  | "dashboard:read"
  | "gold_price:read"
  | "gold_price:create"
  | "gold_price:update"
  | "scheme_requests:read"
  | "scheme_requests:update"
  | "support_requests:read"
  | "support_requests:update"
  | "daily_tasks:read"
  | "daily_tasks:create"
  | "daily_tasks:update"
  | "daily_tasks:delete"
  | "circulars:read"
  | "circulars:create"
  | "circulars:update"
  | "circulars:delete"
  | "users:create"
  | "users:read"
  | "users:update"
  | "users:delete"
  | "users:lookup"
  | "schemes:read"
  | "schemes:create"
  | "schemes:update"
  | "schemes:delete"
  | "settings:read"
  | "settings:write"
  | "files:upload"
  | "files:read"
  | "referrals:read"
  | "referrals:update"
  | "transactions:read"
  | "transactions:write"
  | "redemptions:read"
  | "redemptions:update"
  | "analytics:read"
  | "staff:manage"
  | "notifications:broadcast";

const ALL_PERMISSIONS: Permission[] = [
  "dashboard:read",
  "gold_price:read",
  "gold_price:create",
  "gold_price:update",
  "scheme_requests:read",
  "scheme_requests:update",
  "support_requests:read",
  "support_requests:update",
  "daily_tasks:read",
  "daily_tasks:create",
  "daily_tasks:update",
  "daily_tasks:delete",
  "circulars:read",
  "circulars:create",
  "circulars:update",
  "circulars:delete",
  "users:create",
  "users:read",
  "users:update",
  "users:delete",
  "users:lookup",
  "schemes:read",
  "schemes:create",
  "schemes:update",
  "schemes:delete",
  "settings:read",
  "settings:write",
  "files:upload",
  "files:read",
  "referrals:read",
  "referrals:update",
  "transactions:read",
  "transactions:write",
  "redemptions:read",
  "redemptions:update",
  "analytics:read",
  "staff:manage",
  "notifications:broadcast",
];

/** Staff: CRU on gold price, scheme/support requests, daily tasks, circulars; create-only users. */
const STAFF_PERMISSIONS: Permission[] = [
  "gold_price:read",
  "gold_price:create",
  "gold_price:update",
  "scheme_requests:read",
  "scheme_requests:update",
  "support_requests:read",
  "support_requests:update",
  "daily_tasks:read",
  "daily_tasks:create",
  "daily_tasks:update",
  "circulars:read",
  "circulars:create",
  "circulars:update",
  "users:create",
  "users:lookup",
  "schemes:read",
  "settings:read",
  "files:upload",
  "files:read",
];

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.ADMIN]: ALL_PERMISSIONS,
  [AdminRole.STAFF]: STAFF_PERMISSIONS,
};

export function permissionsForRole(role: string | AdminRole | undefined | null): Permission[] {
  if (role === AdminRole.STAFF) {
    return ROLE_PERMISSIONS[AdminRole.STAFF];
  }
  // Default to full admin for legacy tokens / missing role
  return ROLE_PERMISSIONS[AdminRole.ADMIN];
}

export function hasPermission(
  role: string | AdminRole | undefined | null,
  permission: Permission
): boolean {
  return permissionsForRole(role).includes(permission);
}

export function hasAllPermissions(
  role: string | AdminRole | undefined | null,
  permissions: Permission[]
): boolean {
  const granted = permissionsForRole(role);
  return permissions.every((p) => granted.includes(p));
}
