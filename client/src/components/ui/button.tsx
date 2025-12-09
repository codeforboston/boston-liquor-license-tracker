import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-background-dark focus-visible:ring-background-dark/50 focus-visible:ring-[3px]"
  // For Design: need to define an aria-invalid state for buttons
  // aria-invalid:ring-<new-color-variable>/20 aria-invalid:border-<new-color-variable>
  ,
  {
    variants: {
      variant: {
        default:
          "bg-background-dark hover:bg-button-hovered-dark active:bg-button-active-dark text-font-light hover:text-font-links-hover active:text-font-links-active rounded-[8px] cursor-pointer w-[200px] text-[18px] font-medium",
        // We have not implemented button variants yet, these are suggested from shadcn:
        // destructive:
        //   "",
        // outline:
        //   "",
        // secondary:
        //   "",
        // ghost:
        //   "",
        // link: 
        //   "",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
