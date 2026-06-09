# Assets — how to add your photos

The site loads images by filename and gracefully shows a placeholder if a file is missing,
so you can add these any time and just re-push.

## Profile photo (hero)
Add your headshot here:

```
assets/profile.jpg
```

(square or 4:5 portrait works best)

## Slider photos (About section)
The About section shows a photo slider. Photos live directly in `assets/`:

```
assets/photo1.jpg
assets/photo2.jpg
...
assets/photo7.jpg
```

**Captions** for each photo are edited in `js/main.js` — see the `PHOTOS` array
near the top of the file. Each entry is `{ src, caption }`. To add or remove
photos, just add/remove entries there (and the matching image file).

JPG or PNG are fine. Keep each under ~500 KB for fast loading. Sideways-looking
phone photos display upright automatically (the slider respects EXIF rotation).
