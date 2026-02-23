import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Conference Tracker",
  description: "400+ conferences worldwide, scored & ranked",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
