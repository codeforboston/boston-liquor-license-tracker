import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { FormattedMessage, useIntl } from "react-intl";

type MobileZipNavProps = {
  currentIndex: number;
  totalZips: number;
  onPrevious: () => void;
  onNext: () => void;
};

// 44px matches the minimum touch target size in WCAG 2.5.5. The dot pagination
// this replaces on mobile uses 12px dots, which is well under that.
const navButtonClasses = [
  "flex items-center justify-center",
  "w-[44px] h-[44px] shrink-0",
  "border-[2px] border-button-hovered-light rounded-[4px]",
  "bg-background-light cursor-pointer",
  "hover:bg-button-hovered-light",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
].join(" ");

/**
 * Previous/next zip controls shown only below the 768px breakpoint, where the
 * dot pagination is hidden. The position counter stands in for the dots, which
 * conveyed both navigation and where you were in the sequence.
 */
export const MobileZipNav = ({
  currentIndex,
  totalZips,
  onPrevious,
  onNext,
}: MobileZipNavProps) => {
  const intl = useIntl();

  return (
    <nav
      className="flex md:hidden items-center justify-between gap-2 mb-3"
      aria-label={intl.formatMessage({ id: "map.zipNav.label" })}
    >
      <button
        type="button"
        onClick={onPrevious}
        className={navButtonClasses}
        aria-label={intl.formatMessage({ id: "map.zipNav.previous" })}
      >
        <ChevronLeftIcon
          aria-hidden
          sx={{ fill: "var(--color-button-default-dark)" }}
        />
      </button>

      <p className="text-center">
        <FormattedMessage
          id="map.zipNav.position"
          values={{ current: currentIndex + 1, total: totalZips }}
        />
      </p>

      <button
        type="button"
        onClick={onNext}
        className={navButtonClasses}
        aria-label={intl.formatMessage({ id: "map.zipNav.next" })}
      >
        <ChevronRightIcon
          aria-hidden
          sx={{ fill: "var(--color-button-default-dark)" }}
        />
      </button>
    </nav>
  );
};
