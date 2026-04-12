import { PublicKey } from "@solana/web3.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const TEST_KEY = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

describe("getEscrowPublicKey", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_ESCROW_PUBLIC_KEY", TEST_KEY);
  });

  it("returns a PublicKey from env", async () => {
    const { getEscrowPublicKey } = await import("./escrow");
    const pk = getEscrowPublicKey();
    expect(pk).toBeInstanceOf(PublicKey);
    expect(pk.toBase58()).toBe(TEST_KEY);
  });
});
