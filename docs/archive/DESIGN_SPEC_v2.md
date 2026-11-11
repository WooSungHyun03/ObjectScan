# ObjectScan — visual reference specification

Open `objectscan-ui-reference.png` BEFORE building UI.

Desktop reference canvas includes two coordinated screens:
- Left: premium marketing landing with dark graphite background, mint accent, editorial headline, furniture 3D object half photoreal/half wireframe, two major routes (`Object Mesh` / `Full Scene Mesh`).
- Right: authenticated workspace with sidebar, image upload wizard, SAM2 mask review, reconstruction mode, true 3D preview, settings and a start button.

Design tokens: BG #0D1317, SURFACE #151C21, ELEVATED #1B2529, BORDER #304047, MINT #A9F5CD, FOREGROUND #F6F7F4, MUTED #9BABAE. High typography contrast; rounded-lg to 2xl only where structural; sparing shadows, no neon gradients, no fake metrics, no decorative inert buttons.

Create fully responsive accessible React components; do not use the reference image as flattened page content. On narrow viewports move settings below upload, convert sidebar to a usable sheet. Build image-selection and 3D preview from functional state. Choose authentic sample 3D assets only where properly licensed and label demo content as such; actual user's job renders from real GLB.

Scene mode is distinct: no background removal/mask review step; full scene COLMAP and Gaussian Wrapping path, with appropriate warnings for too few photos. Use precise service copy, e.g. '객체만 3D로 복원' and '장면 전체를 3D로 복원'.
