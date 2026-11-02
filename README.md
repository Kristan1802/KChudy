# Kristan OS

A portfolio set up as a desktop. Your sunset photo is the wallpaper, your name sits behind your head like a magazine masthead, and every project is a file you can open.

It is plain HTML, CSS and JavaScript. There is no build step and nothing to install.

## What's on it

- **Wallpaper.** The photo is split into two layers: the lake and sky (blurred), and you, cut out. **KRISTAN** sits between them, so the top of your cap covers part of the letters. In light mode the sunset glows through the name; in dark mode the photo dims and the name turns cream.
- **Menu bar.** The sun menu (About this desktop, Clean up icons, Close all windows, Switch appearance), shortcuts to Work, About, Photos and Contact, an "Available" badge, today's sunset time in Bengaluru, a light/dark switch and your local time.
- **Desktop icons.** Eight projects plus `kristan.jpg`, `README.txt`, `Resume.pdf` and a Photos folder. Click to select, double-click (or tap, or press Enter) to open. Drag them around, or drag on empty space to select several. Positions are remembered in the visitor's browser.
- **Info windows.** Each project opens a Get Info–style window: summary, Details (type, role, team, timeline), Results, Process and a Preview. Windows can be dragged, resized, minimised to the dock, zoomed and closed. Press Esc to close the front window.
- **Dock.** About (with About me, CV, Interests and Contact tabs), Work (a list of every project), Photos (a gallery with a viewer), Mail (a message that opens in the visitor's email app, plus a copy button), Links and Trash. Icons magnify on hover.
- **Phones.** The desktop becomes a home screen: name at the top, app grid at the bottom, windows open as full-screen sheets.
- **Links.** Every window has its own address, for example `yoursite.com/#ledger`, `#about`, `#cv`, `#photos` or `#contact`.

Type: **Fraunces** (soft, 70s-style serif) for the name and headings, **Instrument Sans** for the interface and **Geist Mono** for small details. Colours come from the photo: sunset amber and the oxblood, sky-blue and cream stripes of the T-shirt.

## Make it yours

Nearly everything lives in **`content.js`**:

1. Change `name`, `role`, `location`, `city`, `timezone`, `coords`, `email` and `availability`.
2. Rewrite `coverlines` (the two small lines either side of your head) and the `about` section.
3. Replace the sample `projects`. Each has a `desk` position (`x` and `y` are percentages of the screen) and a `cover`:
   - `{ art: "phone" | "dashboard" | "meals" | "nets" | "stripes" | "chai" | "monsoon", bg: "#hex" }` for a drawn cover, or
   - `{ image: "assets/your-cover.jpg" }` for a real image.
4. Edit `files`, `photos`, `socials` and `trash`.
5. To link a real résumé, put the PDF in `assets/` and set `resume: "assets/resume.pdf"`.
6. Set `sample: false` to remove the sticky note.

Also update the `<title>`, description and the email in the `<noscript>` line in `index.html`.

### Changing the photo

The wallpaper needs the photo split into two layers. A script does it for you:

```sh
pip install pillow numpy onnxruntime
python tools/make-wallpaper.py path/to/photo.jpg
```

It writes `assets/wall.webp` and `assets/wall-person.webp` and prints a `wallpaper` block to paste into `content.js`. The first run downloads a 170 MB person-segmentation model. If you'd rather skip this, point `wallpaper.background` at any photo and set `wallpaper.person` to `""`; the name then sits in front.

The other images in `assets/` (`kristan.webp`, `face.webp` and the crops used in Photos and Golden Hour) are ordinary files you can replace.

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
