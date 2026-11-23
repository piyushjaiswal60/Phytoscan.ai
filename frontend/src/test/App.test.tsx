import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ status: "healthy", models_loaded: true, classes_count: 38 }),
  }));
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("PhytoScan AI interface", () => {
  it("shows the scanner and both model choices", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /a healthier harvest/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /run a plant health scan/i })).toBeInTheDocument();
    expect(screen.getByText("Custom CNN")).toBeInTheDocument();
    expect(screen.getByText("MobileNetV2")).toBeInTheDocument();
  });

  it("starts in compare mode and disables scanning until an image is selected", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /start ai analysis/i })).toBeDisabled();
    expect(screen.getByText(/both models will analyse the same image/i)).toBeInTheDocument();
  });
});
