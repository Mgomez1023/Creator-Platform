import type { ZodSchema } from "zod";

import {
  analysesSchema,
  analysisSchema,
  analyzeInputSchema,
  type Analysis,
  type AnalyzeInput,
} from "./schemas";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJsonSafely(text: string): Promise<unknown> {
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>(path: string, schema: ZodSchema<T>, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const raw = await response.text();
  const payload = await parseJsonSafely(raw);

  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" && "detail" in payload
        ? String((payload as Record<string, unknown>).detail)
        : `HTTP ${response.status}`;
    throw new ApiError(detail, response.status);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError("API response validation failed", response.status);
  }

  return parsed.data;
}

export const apiClient = {
  async listAnalyses(): Promise<Analysis[]> {
    return request("/analyses", analysesSchema);
  },

  async getAnalysis(id: number): Promise<Analysis> {
    return request(`/analyses/${id}`, analysisSchema);
  },

  async createAnalysis(input: AnalyzeInput): Promise<Analysis> {
    const payload = analyzeInputSchema.parse(input);
    return request("/analyze", analysisSchema, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export { ApiError };
