export type AccountType = "listener" | "artist" | "both";
export type Role = "user" | "artist" | "admin";

export function isArtistAccount(accountType?: string | null): boolean {
  return accountType === "artist" || accountType === "both";
}

export function isAdminRole(role?: string | null): boolean {
  return role === "admin";
}

