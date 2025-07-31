import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div id="home">
        <Hero />
      </div>
      <div id="services">
        <Services />
      </div>
      <FAQ />
      <div id="contact">
        <Contact />
      </div>
    </div>
  );
};

export default Index;
