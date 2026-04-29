export const PORTFOLIO_TEMPLATE: Record<string, unknown> = {
  profile: {
    displayName: "PAV KHEMERAK",
    tags: ["STATUS: ONLINE", "CLEARANCE: FULL-STACK", "ROLE: CYBER_ANALYST"],
    facts: [
      { label: "Origin", value: "CAMBODIAN" },
      { label: "Code_Name", value: "PRINZE" },
      { label: "Age", value: "22" },
      { label: "Status", value: "ONLINE" },
    ],
  },
  skills: {
    languages: [
      { keyword: "fn", name: "Rust" },
      { keyword: "const", name: "JavaScript", delay: "delay-75" },
      { keyword: "def", name: "Python", delay: "delay-100" },
    ],
    linux: [
      { name: "Arch Linux / Windows", label: "Daily Driver", labelColor: "text-tertiary bg-tertiary/10" },
      { name: "Pop!_OS", label: "Secondary", labelColor: "text-zinc-500 bg-zinc-800/50" },
      { name: "i3wm / Hyprland", label: "WM/Compositor", labelColor: "text-primary bg-primary/10" },
    ],
    ecosystems: ["Full-Stack Web Development", "Pentesting", "Next.js", "Spring Boot", "Web3"],
  },
  tools: {
    projects: [
      {
        title: "Ket — Fast, Interactive Download Manager",
        description: "A minimalist, high-velocity CLI utility designed for organizing and retrieving technical snippets and study resources.",
        tags: [
          { label: "SHELL", color: "text-secondary bg-secondary/10 border-secondary/30" },
          { label: "TOOL", color: "text-primary bg-primary/10 border-primary/30" },
        ],
        status: "STABLE",
        statusColor: "text-secondary-fixed-dim bg-secondary-fixed-dim/10",
        language: "Rust",
        filename: "ket.exe",
        imageUrl: "/assets/img/ket.png",
        imageAlt: "Ket CLI Tool Preview",
        primaryAction: { label: "View Source", icon: "terminal", href: "https://github.com/khemerak/ket.git" },
        secondaryAction: { label: "Documentation", icon: "menu_book", href: "https://github.com/khemerak/ket.git" },
      },
    ],
  },
  contact: {
    location: "CAMBODIA // PHNOM_PENH // TOUL KORK",
    email: "pavkhemerak.official@gmail.com",
    socials: [
      { label: "GitHub", href: "https://github.com/khemerak", icon: "terminal" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/pav-khemerak-6b7270269/", icon: "connect_without_contact" },
      { label: "TELEGRAM", href: "https://t.me/pavkhemerak", icon: "send" },
    ],
  },
};
