import "./home.module.css";
import Hero from "@/components/pages/home/hero";
import Navigation from "@/components/pages/home/navigation";
import Quote from "@/components/pages/home/quote";
import AboutUs from "@/components/pages/home/about-us";
import CaseStudy from "@/components/pages/home/case-study";
import ExtraWork from "@/components/pages/home/extra-work";

const Home = () => {
  return (
    <main className="home-page">
      <Hero />
      <Navigation />
      <AboutUs />
      <Quote />
      <CaseStudy />
      <ExtraWork />
    </main>
  );
};

export default Home;
