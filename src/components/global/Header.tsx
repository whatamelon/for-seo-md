import React from "react";
import ToggleTheme from "@/components/feat/ToggleTheme";
import logo from "@/assets/images/logo.png";
import NavigationMenu from "@/components/template/NavigationMenu";

export default function Header() {
  return (
    <header
      className="sticky top-2 z-40 flex items-center justify-between w-[calc(100%-16px)] h-14 mx-2 px-4 rounded"
      style={{
        marginTop: 4,
        background: "hsl(var(--header))",
        color: "hsl(var(--header-foreground))",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
        borderBottom: "1px solid hsl(var(--border))"
      }}
    >
      <div className="flex items-start w-full h-full">
        <div className="flex items-center h-full">
          <img src={logo} alt="FORSEO MD Logo" className="h-8 w-auto" />
        </div>
        <div className="flex-1 flex justify-start h-full">
          <NavigationMenu />
        </div>
      </div>
      <div className="flex items-center h-full">
        <ToggleTheme />
      </div>
    </header>
  );
} 