import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg" | "icon" | "default";
  fullWidth?: boolean;
}

type ButtonVariantsProps = {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "ghost"
    | "default"
    | "outline"
    | "link"
    | "destructive";
  size?: "sm" | "md" | "lg" | "icon" | "default";
};

export function buttonVariants({
  variant = "default",
  size = "default",
}: ButtonVariantsProps = {}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default: "bg-[#625EE8] text-white hover:bg-[#5449D4] active:bg-[#4739C0]",
    primary: "bg-[#625EE8] text-white hover:bg-[#5449D4] active:bg-[#4739C0]",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400",
    danger: "bg-[#EF4444] text-white hover:bg-red-600 active:bg-red-700",
    destructive: "bg-[#EF4444] text-white hover:bg-red-600 active:bg-red-700",
    success: "bg-[#10B981] text-white hover:bg-green-600 active:bg-green-700",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200",
    outline:
      "border border-gray-300 bg-transparent hover:bg-gray-100 active:bg-gray-200",
    link: "bg-transparent text-[#625EE8] hover:underline",
  };

  const sizes = {
    default: "px-4 py-2",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    icon: "h-9 w-9 p-0",
  };

  return `${baseStyles} ${variants[variant] || variants.default} ${
    sizes[size] || sizes.default
  }`;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${buttonVariants({
        variant,
        size: size as any,
      })} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
