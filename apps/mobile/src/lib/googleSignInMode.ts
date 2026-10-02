export type GoogleSignInMode = "native" | "unsupported";

export function googleSignInMode(input: {
  appOwnership: string | null | undefined;
  hasNativeModule: boolean;
}): GoogleSignInMode {
  if (input.appOwnership === "expo") return "unsupported";
  if (!input.hasNativeModule) return "unsupported";
  return "native";
}
