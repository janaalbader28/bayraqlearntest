export function isAdminRole(role: string | undefined | null): boolean {
  return role === "admin" || role === "super_admin";
}
