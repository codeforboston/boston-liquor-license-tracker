import { Link } from "@tanstack/react-router";
import { FormattedMessage } from "react-intl";
import backToHomeStyles from "./back-to-home.module.css";

function BackToHome() {
  return (
    <Link
      to="/"
      className={`
        flex
        justify-center
        items-center
        gap-[10px]
        w-[311px]
        px-[24px] py-[8px]
        border-[1px]
        border-background-dark
        rounded-[8px]
        bg-button-default-light
        hover:bg-button-hovered-light
        active:bg-button-active-light
        !text-font-dark
        !hover:text-button-hovered-dark
        !active:text-button-active-dark
        font-bold
        transition-all
        duration-200
        ${backToHomeStyles.backToHome}
    `}
    >
      <FormattedMessage id="shared.backToHomeButton" />
    </Link>
  );
}

export default BackToHome;
