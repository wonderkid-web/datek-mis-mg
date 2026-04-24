"use client";

import Link from "next/link";
import React from "react";

type NavbarBoundaryProps = {
  children: React.ReactNode;
};

type NavbarBoundaryState = {
  hasError: boolean;
};

export default class NavbarBoundary extends React.Component<
  NavbarBoundaryProps,
  NavbarBoundaryState
> {
  state: NavbarBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): NavbarBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Navbar failed to render:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <nav className="fixed inset-x-0 top-0 z-50 shrink-0 bg-primary p-3 text-primary-foreground shadow-md sm:p-4">
          <div className="container mx-auto flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center justify-center text-base font-bold sm:text-lg"
            >
              Datek MIS
            </Link>
          </div>
        </nav>
      );
    }

    return this.props.children;
  }
}
