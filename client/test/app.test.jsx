import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, afterEach } from "vitest";
import App from "../src/App.jsx"; 

// mock fetch
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        id: "abc123",
        shortUrl: "http://short.ly/abc123"
      })
  })
);

afterEach(() => { vi.restoreAllMocks(); });

test("renders UI", () => {
  render(<App />);
  expect(screen.getByText(/URL COMPILER/i)).toBeInTheDocument();
});

test("accepts input", () => {
  render(<App />);
  const input = screen.getAllByPlaceholderText(/https:\/\/example.com/i)[0];

  fireEvent.change(input, { target: { value: "google.com" } });

  expect(input.value).toBe("google.com");
});

test("shortens URL and shows result", async () => {
  render(<App />);

  const input = screen.getAllByPlaceholderText(/https:\/\/example.com/i)[0];
  const button = screen.getAllByRole("button")[0];

  fireEvent.change(input, { target: { value: "https://google.com" } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(/short.ly/)).toBeInTheDocument();
  });
});