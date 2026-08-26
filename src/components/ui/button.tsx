import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] transition-[scale,background-color,color,box-shadow,opacity] duration-150 ease-out",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-foreground hover:bg-accent/90 shadow-border",
        secondary:
          "bg-surface text-fg shadow-border hover:shadow-border-hover hover:bg-surface-muted",
        ghost: "text-fg hover:bg-surface-muted",
        outline:
          "bg-transparent text-fg shadow-border hover:bg-surface-muted",
        danger:
          "bg-danger text-danger-foreground hover:bg-danger/90",
      },
      size: {
        sm: "h-8 rounded-sm px-3 text-sm",
        md: "h-10 rounded-md px-4 text-sm",
        lg: "h-11 rounded-md px-5 text-sm",
        icon: "size-10 rounded-md",
        "icon-sm": "size-8 rounded-sm",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, asChild = false, ...props },
    ref,
  ) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

export { buttonVariants };
