# Mascot asset audit

All18 source images were opened in a contact sheet; full-size wave/jump originals were also inspected. Plush beige fur, cobalt felt coat, red felt hat and glossy boots are consistent. No signs/logo boards used.

| Index | Source | Pixels | Alpha range | Role |
|---|---|---|---|---|
|0|ChatGPT Image Nov 10, 2026, 01_42_58 PM-1.png|1254×1254|[0, 255]|front|
|1|ChatGPT Image Nov 10, 2026, 01_42_59 PM-2.png|1254×1254|[0, 255]|side|
|2|ChatGPT Image Nov 10, 2026, 01_43_01 PM-3.png|1254×1254|[0, 255]|wave|
|3|ChatGPT Image Nov 10, 2026, 01_43_02 PM-4.png|1254×1254|[0, 255]|jump|
|4|ChatGPT Image Nov 10, 2026, 01_43_03 PM-5.png|1254×1254|[0, 255]|sit|
|5|ChatGPT Image Nov 10, 2026, 01_43_04 PM-6.png|1254×1254|[0, 255]|laptop|
|6|ChatGPT Image Nov 10, 2026, 02_38_02 PM-1.png|1254×1254|[0, 255]|front|
|7|ChatGPT Image Nov 10, 2026, 02_38_03 PM-2.png|1254×1254|[0, 255]|wave|
|8|ChatGPT Image Nov 10, 2026, 02_38_05 PM-3.png|1254×1254|[0, 255]|jump|
|9|ChatGPT Image Nov 10, 2026, 02_38_06 PM-4.png|1254×1254|[0, 255]|laptop|
|10|ChatGPT Image Nov 10, 2026, 02_38_08 PM-5.png|1254×1254|[0, 255]|point|
|11|ChatGPT Image Nov 10, 2026, 02_38_09 PM-6.png|1254×1254|[0, 255]|portrait|
|12|ChatGPT Image Nov 10, 2026, 02_38_11 PM-7.png|1672×941|[255, 255]|excluded-composite|
|13|ChatGPT Image Nov 10, 2026, 02_38_13 PM-8.png|1672×941|[255, 255]|excluded-composite|
|14|ChatGPT Image Nov 10, 2026, 02_38_14 PM-9.png|1672×941|[255, 255]|excluded-composite|
|15|ChatGPT Image Nov 10, 2026, 02_38_15 PM-10.png|1672×941|[255, 255]|excluded-composite|
|16|빨간 모자 곰인형 인사하기-1.png|1122×1402|[255, 255]|excluded-checkerboard|
|17|빨간 모자 쓴 점프 곰돌이-2.png|1233×1276|[255, 255]|excluded-checkerboard|

The last two RGB originals contain baked checkerboard, so they are never used as transparent assets. Four landscape RGB composites contain scene/glow decorations and are excluded from the new brand. All used derivative assets originate from actual RGBA transparent files with alpha0–255; sources are immutable, SHA256 recorded in docs/EVIDENCE/mascot-inventory.json. No duplicate byte hashes detected. Pose proportions were checked in contact sheet; the jump pose has small red edge speckles at the top, so wave is the primary hero and jump reserved for small success contexts. Portrait is intentionally cropped and used only as brand avatar. Standardized width/height/alt/placement are in the typed mascot manifest; derivation script uses Sharp WEBP and strips source metadata.

The supplied favicon pack contains6 PNG renditions plus ICO and a web manifest. The512px portrait was opened and verified to match the bear. Provided ICO/apple/192/512 variants are copied without image changes; the manifest is rewritten with actual ObjectScan names/colors.16/32 PNGs remain original and unused because ICO contains small sizes.
