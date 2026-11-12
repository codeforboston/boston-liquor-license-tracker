import { cva } from "class-variance-authority";

/**
 * The site's button styles. Use them through <Button> (a <button>, or a link
 * via `asChild`), or call `buttonVariants()` directly to style a component
 * that must render its own element, such as a react-aria <Button>.
 *
 * Layout (width, flex sizing, margins) belongs at the call site, not here.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center text-center rounded-[8px]",
  {
    variants: {
      variant: {
        // Dark button: home navigation, resource links
        primary:
          "cursor-pointer bg-button-default-dark hover:bg-button-hovered-dark active:bg-button-active-dark text-button-default-light hover:text-button-hovered-light active:text-button-active-light",
        // Yellow call to action: case study
        accent:
          "cursor-pointer shadow-md bg-case-study-button-default-yellow hover:bg-case-study-button-hover-yellow active:bg-case-study-button-active-yellow text-font-dark hover:text-button-active-dark active:text-button-hovered-dark",
        // Light gray control: filter dropdowns, table legend
        secondary: "bg-ui-gray",
      },
      size: {
        sm: "px-[16px] py-[8px]",
        md: "min-h-[34px] px-[24px] py-[7px] gap-[12px] text-[16px] font-medium leading-[1.25] [&_svg]:size-4 [&_svg]:shrink-0",
        lg: "px-8 py-4 gap-2.5 text-2xl font-bold",
        xl: "min-h-[34px] md:min-h-[62px] px-[24px] py-[8px] md:py-[12px] text-[15px] md:text-[32px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);
