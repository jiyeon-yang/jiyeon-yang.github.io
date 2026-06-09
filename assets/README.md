# Assets — how to add your photos

The site loads images by filename and gracefully shows a placeholder if a file is missing,
so you can add these any time and just re-push.

## Profile photo (hero)
Add your headshot here:

```
assets/profile.jpg
```

(square or 4:5 portrait works best)

## Gallery photos (About section)
Add up to four photos of yourself:

```
assets/photos/photo1.jpg   ← shown tall (left)
assets/photos/photo2.jpg
assets/photos/photo3.jpg
assets/photos/photo4.jpg
```

JPG or PNG are fine. Keep each under ~500 KB for fast loading.
Want more or fewer than four? Edit the `.gphoto` entries in `index.html` (About section).
