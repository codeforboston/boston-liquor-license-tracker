import "./home.module.css";
import Hero from "@/components/pages/home/hero";
import Navigation from "@/components/pages/home/navigation";
import Quote from "@/components/pages/home/quote";
import AboutUs from "@/components/pages/home/about-us";
import CaseStudy from "@/components/pages/home/case-study";
import ExtraWork from "@/components/pages/home/extra-work";
import { useIntl } from "react-intl";

const Home = () => {
  const intl = useIntl();
  const title = intl.formatMessage({ id: "home.pageTitle" });
  return (
    <article className="home-page">
      <title>{title}</title>
      <Hero />
      <Navigation />
      <AboutUs />
      <Quote />
      <CaseStudy />
      <ExtraWork />
    </article>
  );
};

export default Home;
