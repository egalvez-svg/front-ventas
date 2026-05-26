export const ROLES = {
  admin: "admin",
  manager: "manager",
  cashier: "cashier",
  waiter: "waiter",
  kitchen: "kitchen",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Which roles are allowed in each section.
 * admin and manager share full access everywhere.
 * waiter → only pos
 * kitchen → only kitchen
 * cashier → pos + cashier
 */
export const ROUTE_ROLES = {
  admin:   [ROLES.admin, ROLES.manager] as Role[],
  kitchen: [ROLES.admin, ROLES.manager, ROLES.kitchen] as Role[],
  cashier: [ROLES.admin, ROLES.manager, ROLES.cashier] as Role[],
  pos:     [ROLES.admin, ROLES.manager, ROLES.cashier, ROLES.waiter, ROLES.kitchen] as Role[],
} as const;
