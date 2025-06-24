import React from "react";
// import DragWindowRegion from "@/components/global/DragWindowRegion";
import Header from "@/components/global/Header";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <DragWindowRegion /> */}
      <Header />  
      <main className="h-screen pb-4 p-2">{children}</main>
    </>
  );
}
