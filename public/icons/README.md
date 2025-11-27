Icons for PWA

This folder should contain the PWA app icons referenced by the manifest:

- icon-192.png
- icon-512.png
- maskable-192.png
- maskable-512.png

Using a Flaticon gym icon

1. Download a gym/fitness icon from Flaticon that fits your style.
2. Ensure you comply with the Flaticon license (attribution typically required unless you have a plan).
3. Export PNGs at 192x192 and 512x512. For maskable variants, keep ample padding and export square PNGs.
4. Name files exactly as above and place them in this folder.
5. If attribution is required, add it to your app (e.g., in About/Settings) and to this README:
   - Icon: <icon name>
   - Author: <author name>
   - Source: https://www.flaticon.com/
   - License: Flaticon license

Optional: Generate icons automatically

- Install pwa-asset-generator locally and generate the sizes from a single source image:
  npx pwa-asset-generator ./public/icons/source.png ./public/icons --type png --background "#0ea5e9" --padding 10
- Then rename the generated files to the names expected above.

Note: iOS prefers large, padded icons. Maskable icons improve Android adaptive icon appearance.
