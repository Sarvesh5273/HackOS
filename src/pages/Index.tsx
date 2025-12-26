import { FloatingNav } from "@/components/FloatingNav";
import AnimatedCardStack from "@/components/ui/animate-card-animation";
import { TextGlitch } from "@/components/ui/text-glitch-effect";
import { SITE_CONTENT } from "@/constants/content";
import { PipelineBoard } from "@/components/PipelineBoard";
import { AnalysisLab } from "@/components/AnalysisLab";

const Index = () => {
  const { hero, sections, footer } = SITE_CONTENT;

  return (
    <div className="min-h-screen bg-background">
      <FloatingNav />

      {/* COMMAND CENTER (Home Section) */}
      <section id="home" className="min-h-screen pt-24 pb-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto h-full">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
              {hero.version}
            </span>
            <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mt-2">
              {hero.title} <span className="text-gradient-teal">{hero.name}</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {hero.subtitle}
            </p>
          </div>

          {/* Main Content Split */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-6">
            {/* Left Side - 80% (Targets) */}
            <div className="lg:w-[80%] animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="glass-surface rounded-2xl p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-primary glow-teal" />
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    {sections.showcase.title}
                  </span>
                </div>
                <AnimatedCardStack />
              </div>
            </div>

            {/* Right Side - 20% (Links) */}
            <div className="lg:w-[20%] animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="glass-surface rounded-2xl p-6 h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    {sections.quickLinks.title}
                  </span>
                </div>
                <div className="space-y-2">
                  {sections.quickLinks.links.map((link) => (
                    <TextGlitch 
                      key={link.text}
                      text={link.text} 
                      hoverText={link.hover} 
                      href={link.href}
                      delay={link.delay} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE PIPELINE (Work Area Section) */}
      <section id={sections.workArea.id} className="min-h-screen pt-24 pb-12 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
                {sections.workArea.label}
              </span>
              <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mt-2">
                {sections.workArea.title}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {sections.workArea.subtitle}
              </p>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-full border border-border/50">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Operational
            </div>
          </div>

          <div className="min-h-[60vh]">
            <PipelineBoard />
          </div>
        </div>
      </section>

      {/* ANALYSIS LAB (New Section with Container Scroll) */}
      {/* NOTE: We removed the inner 'div' and headers here because 
         AnalysisLab now includes the ContainerScroll animation 
         which handles the Title and Layout internally.
      */}
      <section id={sections.analysis.id} className="min-h-screen border-t border-border/30 bg-secondary/5 overflow-hidden">
         <AnalysisLab />
      </section>

      {/* UPLINK (Contact Section) */}
      <section id={sections.contact.id} className="py-24 px-6 lg:px-12 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
              {sections.contact.label}
            </span>
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mt-2">
              {sections.contact.title}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {sections.contact.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.contact.socials.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="group glass-surface p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:translate-y-[-2px]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    {social.platform}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-border group-hover:bg-primary group-hover:glow-teal transition-colors" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    {social.handle}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            {footer.copyright}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {footer.credit}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;