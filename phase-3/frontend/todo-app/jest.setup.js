/**
 * Jest Setup File
 *
 * Runs before each test file to configure testing environment.
 * Imports custom matchers from @testing-library/jest-dom.
 */

import "@testing-library/jest-dom";
import React from "react";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => {
      // Filter out Framer Motion specific props
      const { initial, animate, exit, variants, whileHover, whileTap, transition, ...rest } = props;
      return <div ref={ref} {...rest}>{children}</div>;
    }),
    section: React.forwardRef(({ children, ...props }, ref) => {
      const { initial, animate, exit, variants, whileHover, whileTap, transition, ...rest } = props;
      return <section ref={ref} {...rest}>{children}</section>;
    }),
    button: React.forwardRef(({ children, ...props }, ref) => {
      const { initial, animate, exit, variants, whileHover, whileTap, transition, ...rest } = props;
      return <button ref={ref} {...rest}>{children}</button>;
    }),
    span: React.forwardRef(({ children, ...props }, ref) => {
      const { initial, animate, exit, variants, whileHover, whileTap, transition, ...rest } = props;
      return <span ref={ref} {...rest}>{children}</span>;
    }),
    aside: React.forwardRef(({ children, ...props }, ref) => {
      const { initial, animate, exit, variants, whileHover, whileTap, transition, ...rest } = props;
      return <aside ref={ref} {...rest}>{children}</aside>;
    }),
    nav: React.forwardRef(({ children, ...props }, ref) => {
      const { initial, animate, exit, variants, whileHover, whileTap, transition, ...rest } = props;
      return <nav ref={ref} {...rest}>{children}</nav>;
    }),
    p: React.forwardRef(({ children, ...props }, ref) => {
      const { initial, animate, exit, variants, whileHover, whileTap, transition, ...rest } = props;
      return <p ref={ref} {...rest}>{children}</p>;
    }),
    h1: React.forwardRef(({ children, ...props }, ref) => {
      const { initial, animate, exit, variants, whileHover, whileTap, transition, ...rest } = props;
      return <h1 ref={ref} {...rest}>{children}</h1>;
    }),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useReducedMotion: () => true,
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};
