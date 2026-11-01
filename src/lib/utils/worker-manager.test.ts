import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ManagedWorker } from "./worker-manager";

interface FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
}

const createWorker = (): FakeWorker => ({
  onmessage: null,
  onerror: null,
  postMessage: vi.fn(),
  terminate: vi.fn(),
});

describe("ManagedWorker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a worker, reports ready and routes messages", () => {
    const worker = createWorker();
    const onMessage = vi.fn();
    const onReady = vi.fn();
    const subscriber = vi.fn();

    const managed = new ManagedWorker<{ type: string }>();
    managed.init(() => worker as unknown as Worker, { onMessage, onReady }, "Test");
    managed.subscribe(subscriber);

    expect(onReady).toHaveBeenCalledOnce();

    worker.onmessage?.({ data: { type: "ok" } } as MessageEvent);

    expect(onMessage).toHaveBeenCalledWith({ type: "ok" });
    expect(subscriber).toHaveBeenCalledWith({ type: "ok" });

    managed.destroy();
  });

  it("only posts while a worker exists", () => {
    const worker = createWorker();
    const managed = new ManagedWorker();

    managed.post({ ping: true });
    expect(worker.postMessage).not.toHaveBeenCalled();

    managed.init(() => worker as unknown as Worker, { onMessage: vi.fn() });
    managed.post({ ping: true });
    expect(worker.postMessage).toHaveBeenCalledWith({ ping: true }, []);

    managed.terminate();
    managed.post({ ping: true });
    expect(worker.postMessage).toHaveBeenCalledTimes(1);
  });

  it("retries a failed worker until the limit", () => {
    const onError = vi.fn();
    const managed = new ManagedWorker({ maxRetries: 1, retryDelay: 10 });

    managed.init(
      () => {
        throw new Error("boom");
      },
      { onMessage: vi.fn(), onError },
    );

    expect(onError).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(10);

    expect(onError).toHaveBeenCalledTimes(2);

    managed.destroy();
  });
});
