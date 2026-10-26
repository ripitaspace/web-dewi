// Keep footer copy and destinations here so personal updates need no layout edits.
export const FOOTER_CONTENT = {
  description: "Tempat aku menyimpan apa yang kupelajari, mempertanyakan hal-hal yang terasa aneh, dan membangun sesuatu dari sana.",
  signature: "Dibuat dengan rasa penasaran, kopi, dan jumlah tab browser yang tidak masuk akal.",
  socials: [
    { platform: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/puspita-dewi-rahmawati-ripita/" },
    { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/puspitara27/" },
    { platform: "threads", label: "Threads", href: "https://www.threads.com/@puspitara27" },
    { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/puspita.dewir/" },
    { platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@pitaaa696?_r=1&_t=ZS-9AsbYSoBqSq" },
    { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/@PuspitaDewiRahmawati" },
    { platform: "x", label: "X", href: "https://x.com/pustara_27?s=11" },
  ],
  navigation: [
    { title: "Jelajahi", links: [
      { label: "Pemikiran", href: "/pemikiran" },
      { label: "Karya & Tools", href: "/karya" },
      { label: "Belajar", href: "/belajar" },
    ] },
    { title: "Kenalan", links: [
      { label: "Tentang PuspitaCore", href: "/tentang" },
      { label: "Ekosistem RIPITA", href: "/ripita" },
    ] },
  ],
  contact: {
    title: "Ada yang ingin dibangun?",
    description: "Mulai dari satu percakapan.",
    label: "Mari ngobrol",
    href: "https://wa.me/6282333360110?text=Halo%20Kak%20Puspita%2C%20aku%20tertarik%20untuk%20ngobrol%20sesuatu%20nich",
  },
} as const;
