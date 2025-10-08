import offsiteLogo from "@/assets/images/offsite-logo.png";
import bootcampImg from "@/assets/images/bootcamp.jpeg";
import cfbLogo from "@/assets/images/cfb-logo.png";

export interface ExtraWork {
  title: string;
  imgSrc: string;
  href: string;
  textColor: "light" | "dark";
  alt: string;
}

export const extraWorkData: ExtraWork[] = [
  {
    title: "OFFSITE Hospitality",
    imgSrc: offsiteLogo,
    href: "https://www.getoffsite.com/",
    textColor: "dark",
    alt: "home.extra-work.offsite",
  },
  {
    title: "Bar Management Bootcamp",
    imgSrc: bootcampImg,
    href: "https://www.getoffsite.com/bootcamp",
    textColor: "dark",
    alt: "home.extra-work.bar-management-bootcamp",
  },
  {
    title: "Code for Boston",
    imgSrc: cfbLogo,
    href: "https://www.codeforboston.org/",
    textColor: "light",
    alt: "home.extra-work.code-for-boston",
  },
];
