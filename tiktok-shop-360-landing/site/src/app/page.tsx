import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import CaseStudies from "@/components/CaseStudies";
import Process from "@/components/Process";
import WhyUs from "@/components/WhyUs";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Services />
      <CaseStudies />
      <Process />
      <WhyUs />
      <FAQ />
      <Contact />
      <Footer />
    </>
  );
}
