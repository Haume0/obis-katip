import type { ComponentProps } from "react";

// Görünüm globals.css'teki MainButton sınıfında; Link gibi buton olmayan öğeler
// sınıfı doğrudan kullanır.
export default function Button({
  variant,
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: "tehlike" }) {
  return (
    <button
      type={type}
      className={`MainButton ${variant === "tehlike" ? "hover:border-ret/48! hover:bg-ret/12! hover:text-ret!" : ""} ${className}`}
      {...props}
    />
  );
}
