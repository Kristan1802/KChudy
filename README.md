# Kristan · Design what excites

A portfolio set in a pixel-art room at night, looking out over Hyderabad. Visitors look around the room. The laptop, the sketchbook and the chai each zoom the camera in and open a page.

It is plain HTML, CSS and JavaScript. There is no build step and nothing to install.

## What's in the room

- **Things to open.** A small bouncing marker sits over each one.
  - **Sketchbook** (or the corkboard on the wall) → **About**, a corkboard with a timeline of where you've worked, sticky notes, polaroids, "things I can do" and your toolkit. On a desktop the notes can be dragged around.
  - **Laptop** (or the binders on the shelf) → **Work**, a laptop screen with filterable project cards. Each card opens a full case study: problem, process, results, links and the next/previous project.
  - **Chai mug** → **Contact**, a letter on the desk with your email (with a copy button) and availability, plus a chai-stall receipt that lists your socials.
- **Things to play with.** Hover anything for a label. Click the neon sign or the lamp to switch them off. Click the moon for a shooting star. Click the cat (it stays asleep).
- **Things that move by themselves.** The neon flickers now and then, stars twinkle, shooting stars cross the sky, the bridge lights shift colour, the lake reflections ripple, the lantern flickers, the chai steams and the cat breathes and snores.
- **Camera.** On a computer the room leans gently towards the mouse, which also reveals the edges on screens that crop the picture. On a phone the room keeps its height and you swipe sideways to look around.
- **Menu bar.** Your name (top left), a live clock in your time zone (top right) and Work / About / Contact at the bottom, the same as clicking the objects.
- **Links.** Every page has its own address: `#about`, `#work`, `#contact` and `#work/ledger` for a single project. Back and forward work, and Esc goes back.

Type: **Instrument Serif** for headings, **Instrument Sans** for text, **VT323** (a pixel font) for labels and the receipt, and **Gochi Hand** for anything handwritten. The fonts are the `--f-*` tokens at the top of `room.css`.

## Make it yours

Nearly everything lives in **`content.js`**:

1. Change `name`, `role`, `city`, `timezone`, `tz`, `email`, `availability` and `socials`.
2. Rewrite `about`: the typed intro, `experience` (the timeline), `interests` (one sticky note each), `canDo`, `toolkit`, `currently` and `polaroids`.
3. Replace the sample `projects`. Each has a `group` (`product`, `visual` or `personal`, used by the filter chips) and a `cover`:
   - `{ art: "phone" | "dashboard" | "meals" | "nets" | "stripes" | "chai" | "monsoon", bg: "#hex" }` for a drawn cover, or
   - `{ image: "assets/your-cover.jpg" }` for a real image.
4. To link a résumé, put the PDF in `assets/` and set `resume: "assets/resume.pdf"`. A download button appears on the corkboard and the contact letter.
5. Edit the `spots` to change what the labels say or what each object does.

The companies, projects and numbers in `content.js` are sample content.

Also update the `<title>`, the description and the email in the `<noscript>` block in `index.html`.

### Spots and coordinates

Each spot is a box in **picture pixels** of `assets/room.webp` (2000 × 1125): `x`, `y` for the top-left corner, then `w` and `h`. Open the image in any editor and read the coordinates off it.

- `go: "about" | "work" | "contact"` opens that page, zooming into this spot.
- `action: "neon" | "lamp" | "cat" | "moon"` does something in the room.
- `primary: true` adds the bouncing marker.
- `place: "below"` puts the label under the spot, for things near the top of the picture.

`zoomTo` sets which spot the camera zooms into when a page is opened from the menu instead.

### Changing the picture

Replace `assets/room.webp` with another 16:9 picture and update the `spots`. The moving effects (neon, lamp, lantern, steam, cat, stars, bridge, lake) are placed in the same picture pixels near the top of the "Room effects" section of `room.js`. Move or delete them to match the new picture.

## Files

- `index.html`: the page.
- `content.js`: your words, projects and the spots in the room.
- `room.css`: all styling.
- `room.js`: the room, the camera, the pages and the address handling.
- `assets/`: the room picture and photos.
- `desktop/`: the earlier desktop-style version of this portfolio, kept as it was. It is served at `/desktop/`.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Publish on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick your branch and the `/ (root)` folder, then save.
4. Your site appears at `https://<your-username>.github.io/<repo-name>/` within a minute or two.
