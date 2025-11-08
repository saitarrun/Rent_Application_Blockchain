export function preferredChainId(): number {
  const pref = (process.env.NEXT_PUBLIC_NETWORK || "local").toLowerCase();
  if (pref === "sepolia") return 11155111;
  return 1337; // default to local
}

export function chainIdToName(id: number): string {
  switch (id) {
    case 1337:
      return "Localhost";
    case 11155111:
      return "Sepolia";
    default:
      return `Chain ${id}`;
  }
}

