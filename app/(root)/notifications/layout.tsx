import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/navbar";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Find and connect with entrepreneurs.",
};

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main>
      <Navbar />
      <div className="w-full">{children}</div>
      <Footer />
    </main>
  );
};

export default Layout;
