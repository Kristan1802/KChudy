/*
 * Everything on the desktop comes from this file.
 * Edit the text, save, refresh. There is no build step.
 *
 * The projects, companies and numbers below are SAMPLE content.
 * Replace them with your own, then set `sample` to false to remove the sticky note.
 *
 * Desktop positions (`desk`) are percentages of the screen: x from the left, y from the top.
 * Visitors can drag icons around; "Clean up icons" in the sun menu puts them back here.
 */
window.PORTFOLIO = {
  sample: true,

  name: "Kristan",
  role: "Product designer",
  location: "Bengaluru, India",
  city: "Bengaluru",
  timezone: "Asia/Kolkata", // any IANA zone, e.g. "Europe/Berlin"
  coords: { lat: 12.97, lon: 77.59 }, // used for "Sunset" in the menu bar. Remove to hide it.
  email: "hello@kristan.design",
  availability: "Available Jan 2027", // set to "" to hide the menu bar badge
  resume: "", // e.g. "assets/resume.pdf". Empty opens the CV tab instead.

  // Small lines either side of your head, under the name. One string per line.
  coverlines: {
    left: ["Product designer.", "Fintech, B2B and consumer apps."],
    right: ["Bengaluru, India", "12.97° N 77.59° E"],
  },

  // The wallpaper is you, cut out of the photo with a few motion-blur streaks, on a plain
  // off-white desktop (the colour is --wall in styles.css). tools/make-wallpaper.py makes it.
  // `head` is where the top of your head is in the photo, in pixels, so the name can tuck behind it.
  wallpaper: {
    background: "", // optional photo behind you, e.g. "assets/wall.webp" from make-wallpaper.py --scene
    person: "assets/wall-person.webp", // set to "" to put the name in front of everything
    size: [1200, 1600],
    head: { x: 550, top: 506, height: 210, left: 445, right: 655 },
  },

  photo: {
    src: "assets/kristan.webp",
    small: "assets/kristan-600.webp",
    face: "assets/face.webp",
    alt: "Kristan in a striped T-shirt and cap, leaning on a railing above a lake at sunset",
  },

  socials: [
    { label: "LinkedIn", handle: "in/kristan", url: "https://www.linkedin.com/" },
    { label: "Dribbble", handle: "@kristan", url: "https://dribbble.com/" },
    { label: "GitHub", handle: "kristan1802", url: "https://github.com/kristan1802" },
    { label: "Instagram", handle: "@kristan", url: "https://www.instagram.com/" },
  ],

  about: {
    intro:
      "Product designer, sometimes photographer, occasional type nerd. I design fintech and B2B products people understand and trust, and I care about the numbers after launch as much as the pixels before it.",
    canDo: [
      "Product design, from research to shipped UI",
      "Design systems and tokens",
      "User research and usability testing",
      "Prototyping in Figma, ProtoPie and code",
      "Interaction and motion design",
      "Visual identity and logos",
      "Posters, covers and type",
      "Photography",
      "Landing pages in Framer or HTML and CSS",
    ],
    experience: [
      { years: "2024 – now", role: "Senior Product Designer", company: "Northwind Pay" },
      { years: "2022 – 2024", role: "Product Designer", company: "Fieldwork Labs" },
      { years: "2021 – 2022", role: "UI/UX Designer", company: "Studio Kettle" },
    ],
    education: [{ years: "2017 – 2021", role: "B.Des, Interaction Design", company: "Design school" }],
    toolkit: ["Figma", "FigJam", "ProtoPie", "Framer", "Maze", "Mixpanel", "Rive", "Lightroom", "HTML & CSS"],
    interests: [
      { title: "Golden hour", text: "I plan walks around the sunset. Most of my photos happen in the 40 minutes before it." },
      { title: "Lakes of Bengaluru", text: "Slowly visiting every lake in the city. 23 so far." },
      { title: "Cricket nets", text: "Weekend batting, which turned into a side project." },
      { title: "Old type specimens", text: "Collecting scans of 1970s type catalogues." },
    ],
    currently: [
      { label: "Learning", value: "Interactive motion in Rive" },
      { label: "Reading", value: "Thinking in Systems, Donella Meadows" },
      { label: "Building", value: "A booking app for my local cricket nets" },
    ],
  },

  projects: [
    {
      id: "ledger",
      name: "Ledger",
      client: "Northwind Pay",
      kind: "Mobile app",
      year: "2025",
      type: ["Product design", "Research", "Prototyping", "A/B testing"],
      role: "Lead product designer",
      team: "Me, a PM, 4 engineers and a compliance lead",
      timeline: "10 weeks",
      summary:
        "Redesigned identity verification for a personal finance app, so new users finish signing up instead of dropping off at the KYC step.",
      problem:
        "Almost 6 in 10 new users quit at identity verification. A blurry document photo sent them back to the start, and nobody knew if their upload had worked.",
      steps: [
        { title: "Found where people quit", text: "Funnel data and 14 session recordings showed two drop-off spikes: the document photo and the pending screen." },
        { title: "Talked to people who gave up", text: "Eight interviews. The pattern was uncertainty, not effort." },
        { title: "Prototyped three flows", text: "Auto-capture, step-by-step guidance and save-and-resume, tested with 12 people." },
        { title: "Shipped behind an A/B test", text: "Released in two phases and compared completion with the old flow for four weeks." },
      ],
      results: [
        { value: "41% → 68%", label: "KYC completion" },
        { value: "−52%", label: "verification tickets" },
        { value: "3m 10s", label: "median time to verify" },
      ],
      links: [{ label: "View the prototype", url: "https://www.figma.com/" }],
      cover: { art: "phone", bg: "#1f5652" },
      desk: { x: 6, y: 40 },
    },
    {
      id: "fieldnote",
      name: "Fieldnote",
      client: "Fieldwork Labs",
      kind: "Web app",
      year: "2024",
      type: ["Product design", "Design system", "Field research"],
      role: "Product designer",
      team: "2 designers, 6 engineers and a PM",
      timeline: "4 months",
      summary:
        "A reporting tool for field inspection teams that replaced spreadsheets and photo dumps with one place to file, review and share reports.",
      problem:
        "Inspectors filed reports through spreadsheets, chat photos and email. Managers spent hours a week chasing missing details.",
      steps: [
        { title: "Shadowed inspectors on site", text: "Two days in the field: notes taken one-handed, in bright sun, often offline." },
        { title: "Mapped the report lifecycle", text: "A service blueprint with ops, sales and two client admins." },
        { title: "Built the component library", text: "60 Figma components with tokens shared with the front-end team." },
      ],
      results: [
        { value: "25 → 9 min", label: "per inspection report" },
        { value: "3×", label: "faster client sign-off" },
        { value: "60", label: "components shipped" },
      ],
      links: [{ label: "Read the write-up", url: "https://medium.com/" }],
      cover: { art: "dashboard", bg: "#4a6684" },
      desk: { x: 17, y: 49 },
    },
    {
      id: "dabba",
      name: "Dabba",
      client: "Dabba Meals, freelance",
      kind: "Mobile app",
      year: "2023",
      type: ["Product design", "0 to 1", "Visual design"],
      role: "Product designer",
      team: "Me, the founder and 2 engineers",
      timeline: "8 weeks",
      summary:
        "A home-cooked meal subscription where skipping, swapping or pausing a meal takes one tap, so subscribers stopped cancelling.",
      problem:
        "Most subscribers cancelled after month one. If you were travelling or eating out, cancelling was the only way to stop paying.",
      steps: [
        { title: "Read 300 exit surveys", text: "Rigid plans outweighed price and food quality combined." },
        { title: "Tested it over chat first", text: "40 subscribers managed meals by message before anything was built." },
        { title: "Designed and shipped v1", text: "Full app UI, an illustration style and an icon set in eight weeks." },
      ],
      results: [
        { value: "+32%", label: "renewals after month one" },
        { value: "4.6", label: "Play Store rating" },
        { value: "1 tap", label: "to skip a meal" },
      ],
      links: [{ label: "See it on the Play Store", url: "https://play.google.com/" }],
      cover: { art: "meals", bg: "#c4532f" },
      desk: { x: 5, y: 62 },
    },
    {
      id: "nets",
      name: "Nets",
      client: "Side project",
      kind: "Booking app",
      year: "2026",
      type: ["Product design", "Prototyping", "In progress"],
      role: "Everything",
      team: "Me, and the people who keep asking for a slot",
      timeline: "Weekends since August",
      summary:
        "Booking for my local cricket nets, which still runs on a WhatsApp group and a paper register. Pick a lane, pick an hour, split the fee.",
      problem:
        "Slots get double-booked every weekend and nobody knows who has paid. The owner spends Sunday mornings on the phone.",
      steps: [
        { title: "Sat with the register", text: "Photographed six weeks of the paper book to see real demand by hour." },
        { title: "Designed the slot grid", text: "Lanes across, hours down, booked slots filled in. Readable in the sun." },
      ],
      results: [{ value: "Beta", label: "with 30 regulars in December" }],
      links: [],
      cover: { art: "nets", bg: "#38623f" },
      desk: { x: 18, y: 71 },
    },
    {
      id: "golden-hour",
      name: "Golden Hour",
      client: "Personal",
      kind: "Photo series",
      year: "2026",
      type: ["Photography", "Editing"],
      role: "Photographer",
      summary:
        "A running series shot in the 40 minutes before sunset at lakes around Bengaluru. One camera, no reflectors, whatever the sky gives.",
      gallery: [
        { src: "assets/sun.webp", alt: "The sun breaking through cloud above a lake" },
        { src: "assets/lake.webp", alt: "A wooded island on a still lake at dusk" },
        { src: "assets/cap.webp", alt: "Portrait in a cap against an orange sky" },
      ],
      cover: { image: "assets/sun.webp" },
      desk: { x: 30, y: 58 },
    },
    {
      id: "stripe-study",
      name: "Stripe Study",
      client: "Personal",
      kind: "Poster series",
      year: "2026",
      type: ["Typography", "Poster", "Colour"],
      role: "Designer",
      summary:
        "Twelve posters built from one T-shirt: oxblood, sky blue and cream stripes, set against a single letter. A way to practise colour with a fixed palette.",
      cover: { art: "stripes", bg: "#5a2722" },
      desk: { x: 72, y: 50 },
    },
    {
      id: "chai-club",
      name: "Chai Club",
      client: "Chai Club, Indiranagar",
      kind: "Visual identity",
      year: "2025",
      type: ["Logo", "Identity", "Packaging"],
      role: "Designer, freelance",
      summary:
        "Identity for a twelve-seat chai counter: a round stamp that works on paper cups, the shop sign and a loyalty card stamped by hand.",
      cover: { art: "chai", bg: "#e39a3c" },
      desk: { x: 84, y: 43 },
    },
    {
      id: "monsoon",
      name: "Monsoon",
      client: "Ira Menon",
      kind: "EP cover",
      year: "2025",
      type: ["Art direction", "Cover design", "Typography"],
      role: "Designer",
      summary:
        "Cover art and type for a friend's four-track EP, recorded during the rains. Rain lines set at the angle of the lyric sheet, and nothing else.",
      cover: { art: "monsoon", bg: "#1f2b3a" },
      desk: { x: 86, y: 62 },
    },
  ],

  // Other things on the desktop. `opens` names a window: about, about:cv, photos, mail, work, links, trash.
  files: [
    { id: "portrait", name: "kristan.jpg", icon: "image", src: "assets/kristan-600.webp", opens: "preview", desk: { x: 72, y: 72 } },
    { id: "readme", name: "README.txt", icon: "text", opens: "about", desk: { x: 30, y: 76 } },
    { id: "resume", name: "Resume.pdf", icon: "pdf", opens: "resume", desk: { x: 63, y: 79 } },
    { id: "photos-folder", name: "Photos", icon: "folder", opens: "photos", desk: { x: 84, y: 79 }, phone: false },
  ],

  // The Photos app.
  photos: [
    { src: "assets/kristan.webp", thumb: "assets/kristan-600.webp", alt: "Kristan at a lakeside railing at sunset", caption: "Me, at the lake, right before the sun went." },
    { src: "assets/sun.webp", alt: "The sun breaking through cloud above a lake", caption: "Five minutes later it was gone." },
    { src: "assets/lake.webp", alt: "A wooded island on a still lake at dusk", caption: "The island nobody can get to." },
    { src: "assets/stripes.webp", alt: "Close-up of a striped terry T-shirt in oxblood, sky blue and cream", caption: "The shirt that became Stripe Study." },
    { src: "assets/cap.webp", alt: "Portrait in a cap against an orange sky", caption: "Golden hour, my favourite time to think." },
    { src: "assets/phone.webp", alt: "A hand holding a phone in a clear case", caption: "Where every prototype gets tested first." },
  ],

  trash: [
    { name: "logo-final-FINAL-v7.fig", note: "v8 was the one." },
    { name: "hamburger-menu.svg", note: "Replaced by a tab bar. Nobody missed it." },
    { name: "dark-patterns.txt", note: "Deleted on principle." },
  ],
};
