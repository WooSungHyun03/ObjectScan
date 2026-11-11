# Information architecture and flows

Public: / → /create → /create/object or /create/scene → authenticated upload. /demo and /demo/edit are explicitly labeled licensed examples. /marketplace is approved previews; /pricing explains the no-commerce school scope. /docs contains customer guides; /legal/opensource alone lists required technical attribution. /terms and /privacy document actual current operations.

Authenticated: /dashboard and /projects list owned projects. /create/object preserves target selection/area review; /create/scene omits that step. /projects/[id] shows actual state/result; /projects/[id]/edit requires the owner and an existing artifact. /account aliases existing account settings; /billing shows school policy. Legacy /reconstruct/new links remain functional during transition.

Editor: private original → worker validates embedded GLB → select part/typed operation → re-export/reimport verifies textures → new immutable private version → owner-only signed download. Original never changes. Undo/redo replays up to80 commands from the current base. Saving starts a new history base; previous versions remain available. No physical units are inferred. Browser limit64MB and1.2M triangles; external resources, animation/skin and compressed extensions are unsupported. P1 face editing/repair/remesh/cuts remain omitted, not fake controls.
