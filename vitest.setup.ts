import { vi } from 'vitest';
import 'vitest-canvas-mock';

// Mock ResizeObserver
class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

global.ResizeObserver = ResizeObserverMock as any;
