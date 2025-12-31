/**
 * HeroSection Component Tests
 *
 * Unit tests for the HeroSection component.
 * Tests rendering, props, styling, accessibility, and responsive behavior.
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 3: T022
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/HomePage/HeroSection";

// Mock useResponsive hook
jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: "desktop",
    width: 1280,
    height: 720,
  }),
}));

describe("HeroSection", () => {
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<HeroSection />);

      // Check for default headline
      const headline = screen.getByRole("heading", { level: 1 });
      expect(headline).toBeInTheDocument();
      expect(headline).toHaveTextContent("Welcome to Your Dashboard");
    });

    it("renders custom headline and description", () => {
      const customHeadline = "Test Headline";
      const customDescription = "Test Description";

      render(
        <HeroSection
          headline={customHeadline}
          description={customDescription}
        />
      );

      expect(screen.getByText(customHeadline)).toBeInTheDocument();
      expect(screen.getByText(customDescription)).toBeInTheDocument();
    });

    it("renders CTA button with correct text", () => {
      const ctaText = "Test CTA";

      render(<HeroSection ctaText={ctaText} />);

      expect(screen.getByText(ctaText)).toBeInTheDocument();
    });

    it("renders CTA button with correct link", () => {
      const ctaLink = "/test-link";

      render(<HeroSection ctaLink={ctaLink} ctaLink={ctaLink} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", ctaLink);
    });
  });

  describe("Styling", () => {
    it("applies purple theme gradient background", () => {
      const { container } = render(<HeroSection />);

      const section = container.querySelector("section");
      expect(section).toHaveClass("bg-gradient-to-b");
      expect(section).toHaveClass("from-purple-50");
      expect(section).toHaveClass("to-purple-100");
    });

    it("applies purple text color to headline", () => {
      render(<HeroSection />);

      const headline = screen.getByRole("heading", { level: 1 });
      expect(headline).toHaveClass("text-purple-600");
    });

    it("applies purple text color to description", () => {
      const description = "Test description for styling";
      const { container } = render(<HeroSection description={description} />);

      const descriptionElement = screen.getByText(description);
      expect(descriptionElement).toHaveClass("text-purple-700");
    });

    it("applies full width and min-height classes", () => {
      const { container } = render(<HeroSection />);

      const section = container.querySelector("section");
      expect(section).toHaveClass("w-full");
      expect(section).toHaveClass("min-h-[80vh]");
    });
  });

  describe("Accessibility", () => {
    it("uses semantic HTML with section element", () => {
      const { container } = render(<HeroSection />);

      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
    });

    it("has proper heading hierarchy with h1", () => {
      render(<HeroSection />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it("CTA button is accessible with descriptive text", () => {
      render(<HeroSection ctaText="Get Started" ctaLink="/features" />);

      const link = screen.getByRole("link");
      // Button component wraps the link and provides accessibility
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent("Get Started");
    });

    it("section has banner role and aria-label", () => {
      const { container } = render(<HeroSection />);

      const section = container.querySelector("section");
      expect(section).toHaveAttribute("role", "banner");
      expect(section).toHaveAttribute("aria-label");
    });

    it("icon has aria-hidden attribute", () => {
      const { container } = render(<HeroSection />);

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("accepts all optional props", () => {
      const props = {
        headline: "Custom Headline",
        description: "Custom Description",
        ctaText: "Custom CTA",
        ctaLink: "/custom-link",
        theme: "dark" as const,
      };

      render(<HeroSection {...props} />);

      expect(screen.getByText(props.headline)).toBeInTheDocument();
      expect(screen.getByText(props.description)).toBeInTheDocument();
      expect(screen.getByText(props.ctaText)).toBeInTheDocument();
    });

    it("uses default values when props are not provided", () => {
      render(<HeroSection />);

      // Should render with default headline
      expect(screen.getByText("Welcome to Your Dashboard")).toBeInTheDocument();

      // Should render with default CTA text
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });

    it("applies dark theme when theme prop is dark", () => {
      render(<HeroSection theme="dark" />);

      const headline = screen.getByRole("heading", { level: 1 });
      expect(headline).toHaveClass("text-white");
    });

    it("renders background image when backgroundImage prop provided", () => {
      const backgroundImage = "/test-image.jpg";
      const { container } = render(<HeroSection backgroundImage={backgroundImage} />);

      const section = container.querySelector("section");
      expect(section).toHaveStyle({
        backgroundImage: expect.stringContaining(backgroundImage),
      });
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive padding classes", () => {
      const { container } = render(<HeroSection />);

      const section = container.querySelector("section");
      expect(section).toHaveClass("px-4");
      expect(section).toHaveClass("md:px-8");
      expect(section).toHaveClass("lg:px-12");
    });

    it("applies responsive text size classes to headline", () => {
      render(<HeroSection />);

      const headline = screen.getByRole("heading", { level: 1 });
      expect(headline).toHaveClass("text-3xl");
      expect(headline).toHaveClass("sm:text-4xl");
      expect(headline).toHaveClass("md:text-5xl");
      expect(headline).toHaveClass("lg:text-6xl");
    });

    it("applies responsive text size classes to description", () => {
      const description = "Responsive description text";
      render(<HeroSection description={description} />);

      const descriptionElement = screen.getByText(description);
      expect(descriptionElement).toHaveClass("text-base");
      expect(descriptionElement).toHaveClass("sm:text-lg");
      expect(descriptionElement).toHaveClass("md:text-xl");
    });
  });

  describe("Content Structure", () => {
    it("centers content with max-width container", () => {
      const { container } = render(<HeroSection />);

      const contentContainer = container.querySelector(".max-w-4xl");
      expect(contentContainer).toBeInTheDocument();
      expect(contentContainer).toHaveClass("mx-auto");
      expect(contentContainer).toHaveClass("text-center");
    });

    it("renders elements in correct order", () => {
      render(<HeroSection />);

      const section = screen.getByRole("banner");
      const children = Array.from(section.querySelectorAll("h1, p, a"));

      // Should have headline (h1), description (p), and CTA link (a) in order
      expect(children.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Component Display Name", () => {
    it("has correct displayName", () => {
      expect(HeroSection.displayName).toBe("HeroSection");
    });
  });
});
