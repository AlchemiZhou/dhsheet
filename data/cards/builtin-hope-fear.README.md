# Bundled Hope and Fear player resources

`builtin-hope-fear.json` and `public/image/hope-fear/` come from the user-provided
`Hope_Fear_Player_Resources_With_Images (1).zip`, pack version 1.1.0.

The bundle contains 352 cards and all 73 supplied WebP images. Card IDs, translated
names, and rule text are preserved. Only image ownership and paths change: images
use static relative URLs rather than imported IndexedDB records. File names are
derived from card IDs so they also extract safely on Windows. Cards without a
supplied illustration use the existing empty-card placeholder.

To regenerate from an updated archive:

```sh
node scripts/bundle-hope-fear.js /path/to/resource.zip
```

The built-in source adapter prepares base and expansion cards through the shared
card-content pipeline. Existing imported expansion IDs stay owned by their
installed pack, preserving edits, images, and disabled state; no character or
imported-pack data is overwritten. Other duplicate IDs still fail in assembly.
