# Vendored fonts (OG card rendering only)

These TTFs exist so `scripts/og_card.py` can render social-share cards in the
site's real typefaces. The website itself does **not** use these files — it
loads Cabinet Grotesk and Satoshi from the Fontshare CDN. Pillow cannot read
the `.woff2` files the CDN serves, hence the local TTF copies.

| File | Role on the card |
|---|---|
| `CabinetGrotesk-Extrabold.ttf` | headline |
| `CabinetGrotesk-Bold.ttf` | F1WOW NEWS brand mark |
| `Satoshi-Medium.ttf` | category label, domain |

Both families are from the Indian Type Foundry via [Fontshare](https://fontshare.com)
under the **ITF Free Font License** (full text in `ITF-Free-Font-License.txt`),
which permits commercial use and embedding. They cost nothing, per the project
constraint that every font on this site must be free.

Re-download with:

    curl -L -o cabinet-grotesk.zip https://api.fontshare.com/v2/fonts/download/cabinet-grotesk
    curl -L -o satoshi.zip         https://api.fontshare.com/v2/fonts/download/satoshi
