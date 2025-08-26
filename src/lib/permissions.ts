export type Role = 'admin' | 'editor' | 'viewer'

export type Permission = 'service:create' | 'service:update' | 'service:delete'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['service:create', 'service:update', 'service:delete'],
  editor: ['service:create', 'service:update'],
  viewer: [],
}

export function getCurrentRole(): Role {
  // derive from localStorage flags
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  if (isAdmin) return 'admin'
  const stored = (localStorage.getItem('role') || '').toLowerCase()
  if (stored === 'editor' || stored === 'viewer' || stored === 'admin') return stored as Role
  return 'viewer'
}

export function can(permission: Permission, role: Role = getCurrentRole()): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function useCan() {
  const role = getCurrentRole()
  return {
    role,
    canCreateService: can('service:create', role),
    canUpdateService: can('service:update', role),
    canDeleteService: can('service:delete', role),
  }
}


