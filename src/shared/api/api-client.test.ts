import { afterEach, describe, expect, it, vi } from "vitest";

import { api, ApiError } from "./api-client";
import { getToken, setToken } from "../lib/storage";

describe("api client", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("sends bearer token and parses JSON responses", async () => {
    setToken("abc");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await expect(api("/health")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/health",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    const headers = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer abc");
  });

  it("clears token on unauthorized responses", async () => {
    setToken("abc");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Token inválido" }), { status: 401 }),
    );

    await expect(api("/me")).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBeNull();
  });
});
