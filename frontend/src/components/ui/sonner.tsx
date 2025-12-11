"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          success: "toast-success",
          error: "toast-error",
          info: "toast-info",
          warning: "toast-warning",
        },
        style: {
          minHeight: "80px",
          padding: "16px",
          fontSize: "16px",
        },
      }}
      style={
        {
          "--width": "420px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
