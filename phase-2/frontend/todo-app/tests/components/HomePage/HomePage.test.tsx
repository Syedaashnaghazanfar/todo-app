/**
 * HomePage Component Tests
 *
 * Unit tests for the HomePage container component.
 * Tests component composition, layout, responsive behavior, and state management.
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 3: T023
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import { HomePage } from "@/components/HomePage/HomePage";

// Mock child components to isolate HomePage logic
jest.mock("@/components/HomePage/Navigation", () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));

jest.mock("@/components/HomePage/Sidebar", () => ({
  Sidebar: ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => (
    <aside data-testid="sidebar" data-open={isOpen}>
      <button onClick={onToggle} data-testid="sidebar-toggle">
        Toggle Sidebar
      </button>
    </aside>
  ),
}));

jest.mock("@/components/HomePage/HeroSection", () => ({
  HeroSection: (props: any) => (
    <section data-testid="hero-section">
      <h1>{props.headline || "Welcome to Your Dashboard"}</h1>
      <p>{props.description}</p>
      <a href={props.ctaLink}>{props.ctaText}</a>
    </section>
  ),
}));

jest.mock("@/components/HomePage/Footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

// Mock useResponsive hook with different breakpoints
const mockUseResponsive = jest.fn();
jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => mockUseResponsive(),
}));

describe("HomePage", () => {
  beforeEach(() => {
    // Default to desktop view
    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      breakpoint: "desktop",
      width: 1280,
      height: 720,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all major sections", () => {
      render(<HomePage />);

      expect(screen.getByTestId("navigation")).toBeInTheDocument();
      expect(screen.getByTestId("hero-section")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("renders main content area", () => {
      render(<HomePage />);

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute("aria-label", "Main content");
    });

    it("renders HeroSection with correct props", () => {
      render(<HomePage />);

      const heroSection = screen.getByTestId("hero-section");
      expect(heroSection).toBeInTheDocument();

      // Check if default headline is rendered
      expect(within(heroSection).getByText("Welcome to Your Dashboard")).toBeInTheDocument();

      // Check if CTA link has correct href
      const ctaLink = within(heroSection).getByRole("link");
      expect(ctaLink).toHaveAttribute("href", "/features");
    });
  });

  describe("Layout Structure", () => {
    it("has correct flex container structure", () => {
      const { container } = render(<HomePage />);

      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass("flex");
      expect(rootDiv).toHaveClass("min-h-screen");
      expect(rootDiv).toHaveClass("flex-col");
    });

    it("applies background color classes", () => {
      const { container } = render(<HomePage />);

      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass("bg-gray-50");
      expect(rootDiv).toHaveClass("dark:bg-gray-900");
    });

    it("main content area has flex-1 class to fill space", () => {
      render(<HomePage />);

      const main = screen.getByRole("main");
      expect(main).toHaveClass("flex-1");
      expect(main).toHaveClass("flex-col");
    });
  });

  describe("Sidebar Behavior - Desktop", () => {
    it("renders sidebar on desktop", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        breakpoint: "desktop",
        width: 1280,
        height: 720,
      });

      render(<HomePage />);

      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    it("sidebar is open by default on desktop", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        breakpoint: "desktop",
        width: 1280,
        height: 720,
      });

      render(<HomePage />);

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveAttribute("data-open", "true");
    });
  });

  describe("Sidebar Behavior - Mobile", () => {
    it("renders mobile sidebar in overlay when open", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        breakpoint: "mobile",
        width: 375,
        height: 667,
      });

      const { container } = render(<HomePage />);

      // On mobile with sidebarOpen=true (default), sidebar and backdrop are rendered
      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toBeInTheDocument();

      // Backdrop overlay should be present
      const backdrop = container.querySelector(".bg-black\\/50");
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe("Sidebar Behavior - Tablet", () => {
    it("renders tablet sidebar in overlay when open (similar to mobile)", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        breakpoint: "tablet",
        width: 768,
        height: 1024,
      });

      const { container } = render(<HomePage />);

      // On tablet, similar to mobile - sidebar rendered in overlay when open
      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toBeInTheDocument();

      // Backdrop overlay should be present
      const backdrop = container.querySelector(".bg-black\\/50");
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("renders loading overlay when initialLoading is true", () => {
      render(<HomePage initialLoading={true} />);

      expect(screen.getByText("Loading your dashboard...")).toBeInTheDocument();
    });

    it("does not render loading overlay by default", () => {
      render(<HomePage />);

      expect(screen.queryByText("Loading your dashboard...")).not.toBeInTheDocument();
    });

    it("loading overlay has correct styling", () => {
      const { container } = render(<HomePage initialLoading={true} />);

      const overlay = screen.getByText("Loading your dashboard...").closest("div");
      expect(overlay?.parentElement).toHaveClass("fixed");
      expect(overlay?.parentElement).toHaveClass("inset-0");
      expect(overlay?.parentElement).toHaveClass("z-50");
    });

    it("loading spinner is present when loading", () => {
      const { container } = render(<HomePage initialLoading={true} />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Component Composition", () => {
    it("renders components in correct order: Navigation, Content, Footer", () => {
      const { container } = render(<HomePage />);

      const elements = Array.from(container.querySelectorAll("nav, main, footer"));
      expect(elements.length).toBe(3);

      // Navigation should come first
      expect(elements[0].tagName).toBe("NAV");
      // Main content in middle
      expect(elements[1].tagName).toBe("MAIN");
      // Footer last
      expect(elements[2].tagName).toBe("FOOTER");
    });

    it("Navigation is rendered outside main flex container", () => {
      render(<HomePage />);

      const navigation = screen.getByTestId("navigation");
      const main = screen.getByRole("main");

      // Navigation should not be inside main
      expect(main).not.toContainElement(navigation);
    });

    it("Footer is rendered outside main content area", () => {
      render(<HomePage />);

      const footer = screen.getByTestId("footer");
      const main = screen.getByRole("main");

      // Footer should not be inside main
      expect(main).not.toContainElement(footer);
    });
  });

  describe("Props", () => {
    it("accepts initialLoading prop", () => {
      const { rerender } = render(<HomePage initialLoading={false} />);

      expect(screen.queryByText("Loading your dashboard...")).not.toBeInTheDocument();

      rerender(<HomePage initialLoading={true} />);

      expect(screen.getByText("Loading your dashboard...")).toBeInTheDocument();
    });

    it("renders without any props (uses defaults)", () => {
      expect(() => render(<HomePage />)).not.toThrow();
    });
  });

  describe("Accessibility", () => {
    it("main element has role and aria-label", () => {
      render(<HomePage />);

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("aria-label", "Main content");
    });

    it("uses semantic HTML structure", () => {
      render(<HomePage />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // Footer
    });

    it("mobile backdrop overlay can have aria-hidden", () => {
      mockUseResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        breakpoint: "mobile",
        width: 375,
        height: 667,
      });

      const { container } = render(<HomePage />);

      // On mobile with sidebar open, backdrop should be present with aria-hidden
      // Since sidebarOpen defaults to true, backdrop will be rendered
      const backdrop = container.querySelector('[aria-hidden="true"]');

      // Verify backdrop exists on mobile when sidebar is "open"
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe("Component Display Name", () => {
    it("has correct displayName", () => {
      expect(HomePage.displayName).toBe("HomePage");
    });
  });

  describe("Responsive Layout", () => {
    it("applies pt-16 for navigation height offset", () => {
      const { container } = render(<HomePage />);

      const layoutContainer = container.querySelector(".pt-16");
      expect(layoutContainer).toBeInTheDocument();
    });
  });

  describe("Phase Readiness", () => {
    it("renders main content area ready for future phases", () => {
      render(<HomePage />);

      const main = screen.getByRole("main");

      // Main content area exists and can accommodate future sections
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass("flex-1");
      expect(main).toHaveClass("flex-col");
    });

    it("hero section is the first content section", () => {
      render(<HomePage />);

      const main = screen.getByRole("main");
      const heroSection = screen.getByTestId("hero-section");

      // Hero section should be inside main
      expect(main).toContainElement(heroSection);
    });
  });
});
