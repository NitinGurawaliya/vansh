# For You, Vansh ♡

A fully local responsive Next.js letter-book. The five original images are kept unchanged in `public/pages/` and displayed in their required order.

## Run it

1. Install [Node.js LTS](https://nodejs.org/).
2. Open this project folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the shown local address, usually `http://localhost:3000`.

## Create a deployable static site

1. Run `npm run build`.
2. Upload the contents of the generated `out/` folder to any static-hosting provider.

No external images, API calls, remote fonts, or audio files are used. The bundled song plays locally after the book is opened, looping from 0:16 to 2:04.

## Change cover words

Open `app/page.tsx` and edit `COVER_TITLE` and `COVER_SUBTITLE` near the top.

## Replace a page

Replace exactly one of these files, retaining its filename: `public/pages/page_1.jpeg` through `public/pages/page_5.jpeg`. Images use `object-fit: contain`, so they are never cropped or stretched.
