import offsiteLogo from "@/assets/images/offsite-logo.jpeg";
import bootcampImg from "@/assets/images/bootcamp.jpeg";
import cfbLogo from "@/assets/images/cfb-logo.png";

export interface ExtraWork {
  name: string;
  title: string;
  imgSrc: string;
  href: string;
}

export const extraWorkData: ExtraWork[] = [
  {
    name: "offsite",
    title: "OFFSITE Hospitality",
    imgSrc: offsiteLogo,
    href: "https://www.getoffsite.com/",
  },
  {
    name: "bootcamp",
    title: "Bar Management Bootcamp",
    imgSrc: bootcampImg,
    href: "https://www.getoffsite.com/bootcamp",
  },
  {
    name: "cfb",
    title: "Code for Boston",
    imgSrc: cfbLogo,
    href: "https://www.codeforboston.org/",
  },
];
