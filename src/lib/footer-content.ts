// Keep footer copy and destinations here so personal updates need no layout edits.
export const FOOTER_CONTENT = {
  description: "Tempat aku menyimpan apa yang kupelajari, mempertanyakan hal-hal yang terasa aneh, dan membangun sesuatu dari sana.",
  signature: "Dibuat dengan rasa penasaran, kopi, dan jumlah tab browser yang tidak masuk akal.",
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
