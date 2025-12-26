export const SITE_CONTENT = {
  navigation: [
    { label: "Ops Center", href: "#home" },
    { label: "Pipeline", href: "#work-area" },
    { label: "Analysis Lab", href: "#analysis" }, // This connects to the new section
    { label: "Uplink", href: "#contact" },
  ],
  hero: {
    version: "// hackathon_os v2.0",
    title: "Command Center:",
    name: "Sarvesh",
    subtitle: "Track targets, manage builds, analyze outcomes.",
  },
  sections: {
    showcase: {
      title: "Upcoming Targets", 
    },
    quickLinks: {
      title: "Resources",
      links: [
        { text: "DEVPOST", hover: "BROWSE", href: "https://devpost.com", delay: 0.3 },
        { text: "ETHGLOBAL", hover: "APPLY", href: "https://ethglobal.com", delay: 0.5 },
        { text: "DORA", hover: "HACKS", href: "https://dorahacks.io", delay: 0.7 },
      ],
    },
    workArea: {
      id: "work-area",
      label: "// pipeline",
      title: "Active Operations",
      subtitle: "Current status of ongoing hackathons.",
    },
    // This was missing and caused the error:
    analysis: {
      id: "analysis",
      label: "// post-mortem",
      title: "Deep Dive Analysis",
      subtitle: "Compare your codebase against winning solutions.",
    },
    contact: {
      id: "contact",
      label: "// uplink",
      title: "Establish Connection",
      subtitle: "Open channels for collaboration.",
      socials: [
        { platform: "Twitter / X", handle: "@sarvesh_dev", url: "https://twitter.com" },
        { platform: "GitHub", handle: "sarvesh-dev", url: "https://github.com" },
        { platform: "Email", handle: "hello@hackos.dev", url: "mailto:hello@hackos.dev" },
      ]
    }
  },
  footer: {
    copyright: "© 2025 Hackathon OS",
    credit: "System Online",
  },
};