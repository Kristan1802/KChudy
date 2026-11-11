/*
 * Everything in the room comes from this file.
 * Edit the text, save, refresh. There is no build step.
 *
 * The companies, projects and numbers below are SAMPLE content.
 * Replace them with your own.
 *
 * Room coordinates (`spots`) are pixels in assets/room.webp, which is 2000 × 1125.
 * Open the image in any editor, hover over an object and copy the x / y you see.
 */
window.ROOM = {
  name: "Kristan",
  role: "Product designer",
  city: "Hyderabad",
  location: "Hyderabad, India",
  timezone: "Asia/Kolkata", // any IANA zone
  tz: "IST", // the label next to the clock
  email: "hello@kristan.design",
  availability: "Available from Jan 2027", // "" hides it
  resume: "", // e.g. "assets/resume.pdf". Empty hides the button.
  motto: "Design what excites.",

  socials: [
    { label: "LinkedIn", handle: "in/kristan", url: "https://www.linkedin.com/" },
    { label: "Dribbble", handle: "@kristan", url: "https://dribbble.com/" },
    { label: "GitHub", handle: "kristan1802", url: "https://github.com/kristan1802" },
    { label: "Instagram", handle: "@kristan", url: "https://www.instagram.com/" },
  ],

  /* ---------------- The room ----------------
   * Each spot is something you can hover in the room.
   *   go:      "about" | "work" | "contact" opens that page with a zoom into this spot
   *   action:  "neon" | "lamp" | "cat" | "moon" does something in the room
   *   primary: shows a little bouncing marker so people find it
   *   place:   "below" puts the label under the spot (for things near the top)
   *   align:   "start" | "end" lines the label up with the spot's left or right edge
   */
  spots: [
    { id: "sketchbook", x: 842, y: 568, w: 126, h: 128, tip: "Peek at my sketchbook, this is me", go: "about", primary: true },
    { id: "laptop", x: 104, y: 636, w: 248, h: 66, tip: "Open the laptop, my work lives here", go: "work", primary: true },
    { id: "mug", x: 420, y: 574, w: 86, h: 72, tip: "Chai's on me. Let's talk", go: "contact", primary: true },
    { id: "corkboard", x: 0, y: 280, w: 182, h: 172, tip: "Pinned up: the story so far", go: "about", align: "start" },
    { id: "binders", x: 1665, y: 748, w: 205, h: 154, tip: "Case studies, filed", go: "work", align: "end" },
    { id: "neon", x: 212, y: 188, w: 312, h: 202, tip: "House rule. Click to switch it off", action: "neon" },
    { id: "lamp", x: 424, y: 408, w: 132, h: 160, tip: "Mood lighting. Click me", action: "lamp" },
    { id: "lantern", x: 244, y: 394, w: 162, h: 236, tip: "Keeps the light on for late nights" },
    { id: "crew", x: 236, y: 18, w: 252, h: 110, tip: "The crew. They review every design", place: "below" },
    { id: "crew2", x: 1838, y: 92, w: 162, h: 272, tip: "More of the crew", align: "end" },
    { id: "poster", x: 96, y: 108, w: 96, h: 166, tip: "A print of the night sky", align: "start" },
    { id: "books", x: 90, y: 476, w: 104, h: 166, tip: "On the desk: Thinking in Systems", align: "start" },
    { id: "moon", x: 1518, y: 48, w: 74, h: 66, tip: "Night owl hours. Click to make a wish", action: "moon", place: "below" },
    { id: "bridge", x: 716, y: 138, w: 456, h: 238, tip: "Durgam Cheruvu cable bridge" },
    { id: "charminar", x: 1448, y: 168, w: 190, h: 254, tip: "Charminar. Home, Hyderabad" },
    { id: "ps5", x: 1752, y: 462, w: 248, h: 236, tip: "Player 2? Coming soon…", align: "end" },
    { id: "beanbag", x: 1690, y: 866, w: 310, h: 259, tip: "The thinking spot", align: "end" },
    { id: "cat", x: 24, y: 928, w: 300, h: 154, tip: "Shh. The cat is asleep", action: "cat", align: "start" },
  ],

  // Which spot the camera zooms into when a page is opened from the menu.
  zoomTo: { about: "sketchbook", work: "laptop", contact: "mug" },

  /* ---------------- About (the corkboard) ---------------- */
  about: {
    hello: "Hi, I'm Kristan!",
    // The typed card: the official version.
    intro:
      "Product designer, sometimes photographer, occasional type nerd. I design fintech and B2B products people understand and trust, and I care about the numbers after launch as much as the pixels before it.",
    // A crop of you from the room, used as the photo on the typed card. Pixels in assets/room.webp.
    roomCrop: { x: 520, y: 330, w: 470, h: 420, caption: "Me, mid-sketch. Mostly seen from behind." },
    experience: [
      { years: "2024 – now", role: "Senior Product Designer", company: "Northwind Pay", where: "Hyderabad", note: "Onboarding, KYC and payments for 2M people." },
      { years: "2022 – 2024", role: "Product Designer", company: "Fieldwork Labs", where: "Remote", note: "Field inspection tools and a 60-component design system." },
      { years: "2021 – 2022", role: "UI/UX Designer", company: "Studio Kettle", where: "Bengaluru", note: "Apps and identities for small food and retail brands." },
      { years: "2017 – 2021", role: "B.Des, Interaction Design", company: "Design school", where: "", note: "" },
    ],
    canDo: [
      "Product design, research to shipped UI",
      "Design systems and tokens",
      "User research and usability tests",
      "Prototyping in Figma, ProtoPie and code",
      "Interaction and motion design",
      "Identity, posters and type",
    ],
    toolkit: ["Figma", "FigJam", "ProtoPie", "Framer", "Rive", "Maze", "Mixpanel", "Lightroom", "HTML & CSS"],
    // The real version: one sticky note each.
    interests: [
      { title: "Golden hour", text: "I plan walks around the sunset. Most of my photos happen in the 40 minutes before it." },
      { title: "Lakes", text: "Visiting every lake in the city. Durgam Cheruvu is the one outside my window." },
      { title: "Cricket nets", text: "Weekend batting, which turned into a side project." },
      { title: "Old type specimens", text: "Collecting scans of 1970s type catalogues." },
    ],
    currently: [
      { label: "Learning", value: "Interactive motion in Rive" },
      { label: "Reading", value: "Thinking in Systems, Donella Meadows" },
      { label: "Building", value: "A booking app for my local cricket nets" },
    ],
    polaroids: [
      { src: "assets/kristan-600.webp", alt: "Kristan in a striped T-shirt and cap, leaning on a railing above a lake at sunset", caption: "golden hour, as usual" },
      { src: "assets/cap.webp", alt: "Portrait in a cap against an orange sky", caption: "thinking face" },
      { src: "assets/lake.webp", alt: "A wooded island on a still lake at dusk", caption: "the island nobody can reach" },
    ],
  },

  /* ---------------- Work (the laptop) ----------------
   * group: "product" | "visual" | "personal" (the filter chips on the laptop)
   * cover: { art: "phone" | "dashboard" | "meals" | "nets" | "stripes" | "chai" | "monsoon", bg: "#hex" }
   *        or { image: "assets/your-cover.jpg" }
   */
  projects: [
    {
      id: "ledger",
      name: "Ledger",
      client: "Northwind Pay",
      kind: "Mobile app",
      year: "2025",
      group: "product",
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
    },
    {
      id: "fieldnote",
      name: "Fieldnote",
      client: "Fieldwork Labs",
      kind: "Web app",
      year: "2024",
      group: "product",
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
    },
    {
      id: "dabba",
      name: "Dabba",
      client: "Dabba Meals, freelance",
      kind: "Mobile app",
      year: "2023",
      group: "product",
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
    },
    {
      id: "nets",
      name: "Nets",
      client: "Side project",
      kind: "Booking app",
      year: "2026",
      group: "personal",
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
    },
    {
      id: "chai-club",
      name: "Chai Club",
      client: "Chai Club, Banjara Hills",
      kind: "Visual identity",
      year: "2025",
      group: "visual",
      type: ["Logo", "Identity", "Packaging"],
      role: "Designer, freelance",
      summary:
        "Identity for a twelve-seat chai counter: a round stamp that works on paper cups, the shop sign and a loyalty card stamped by hand.",
      cover: { art: "chai", bg: "#e39a3c" },
    },
    {
      id: "monsoon",
      name: "Monsoon",
      client: "Ira Menon",
      kind: "EP cover",
      year: "2025",
      group: "visual",
      type: ["Art direction", "Cover design", "Typography"],
      role: "Designer",
      summary:
        "Cover art and type for a friend's four-track EP, recorded during the rains. Rain lines set at the angle of the lyric sheet, and nothing else.",
      cover: { art: "monsoon", bg: "#1f2b3a" },
    },
    {
      id: "stripe-study",
      name: "Stripe Study",
      client: "Personal",
      kind: "Poster series",
      year: "2026",
      group: "personal",
      type: ["Typography", "Poster", "Colour"],
      role: "Designer",
      summary:
        "Twelve posters built from one T-shirt: oxblood, sky blue and cream stripes, set against a single letter. A way to practise colour with a fixed palette.",
      cover: { art: "stripes", bg: "#5a2722" },
    },
    {
      id: "golden-hour",
      name: "Golden Hour",
      client: "Personal",
      kind: "Photo series",
      year: "2026",
      group: "personal",
      type: ["Photography", "Editing"],
      role: "Photographer",
      summary:
        "A running series shot in the 40 minutes before sunset at lakes around the city. One camera, no reflectors, whatever the sky gives.",
      gallery: [
        { src: "assets/sun.webp", alt: "The sun breaking through cloud above a lake" },
        { src: "assets/lake.webp", alt: "A wooded island on a still lake at dusk" },
        { src: "assets/cap.webp", alt: "Portrait in a cap against an orange sky" },
      ],
      cover: { image: "assets/sun.webp" },
    },
  ],

  /* ---------------- Contact (the chai) ---------------- */
  contact: {
    heading: "Chai's on me.",
    text:
      "If you're building something people should understand and trust, I'd love to hear about it. Full-time, freelance, or just a chat about design.",
    reply: "I usually reply within a day.",
  },
};
