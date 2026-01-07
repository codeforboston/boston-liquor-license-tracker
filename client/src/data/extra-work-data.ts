import offsiteLogo from "@/assets/images/offsite-logo.jpeg";
import bootcampImg from "@/assets/images/bootcamp.jpeg";
import cfbLogo from "@/assets/images/cfb-logo.png";

export interface ExtraWork {
  name: string;
  title: string;
  imgSrc: string;
  href: string;
  alt: string;
}

export const extraWorkData: ExtraWork[] = [
  {
    name: "offsite",
    title: "OFFSITE Hospitality",
    imgSrc: offsiteLogo,
    href: "https://www.getoffsite.com/",
    alt: "home.extraWork.altTest.offsite",
  },
  {
    name: "bootcamp",
    title: "Bar Management Bootcamp",
    imgSrc: bootcampImg,
    href: "https://www.getoffsite.com/bootcamp",
    alt: "home.extraWork.altText.barManagementBootcamp",
  },
  {
    name: "cfb",
    title: "Code for Boston",
    imgSrc: cfbLogo,
    href: "https://www.codeforboston.org/",
    alt: "home.extraWork.altText.codeForBoston",
  },
];
