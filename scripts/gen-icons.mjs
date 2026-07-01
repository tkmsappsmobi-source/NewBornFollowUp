import sharp from 'sharp'
import { writeFileSync } from 'fs'

// Full logo SVG — matches the NewbornLogo component in App.jsx
// White background added for solid icon
const svg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="240" height="240" rx="48" fill="#E8F6FC"/>

  <!-- Outer circle -->
  <circle cx="118" cy="112" r="88" stroke="#B8DFF0" stroke-width="3.5" fill="none"/>

  <!-- Holding arc at bottom -->
  <path d="M48 168 Q60 192 100 196 Q128 198 160 185 Q178 178 185 165"
    stroke="#90C4E8" stroke-width="10" stroke-linecap="round" fill="none"/>

  <!-- Baby swaddle body -->
  <ellipse cx="110" cy="138" rx="44" ry="52" fill="#80CBC4" transform="rotate(-8 110 138)"/>
  <ellipse cx="112" cy="142" rx="34" ry="40" fill="#A5D6D0" transform="rotate(-8 112 142)"/>
  <path d="M88 115 Q112 108 134 118" stroke="#6ABFB8" stroke-width="2" stroke-linecap="round" fill="none"/>

  <!-- Baby neck -->
  <rect x="103" y="88" width="16" height="14" rx="6" fill="#FFCCB3"/>

  <!-- Baby head -->
  <circle cx="111" cy="74" r="28" fill="#FFCCB3"/>
  <ellipse cx="96" cy="80" rx="8" ry="6" fill="#F9A8A0" opacity="0.55"/>
  <ellipse cx="126" cy="80" rx="8" ry="6" fill="#F9A8A0" opacity="0.55"/>
  <path d="M101 71 Q106 68 111 71" stroke="#7B5E52" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M113 71 Q118 68 123 71" stroke="#7B5E52" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <line x1="101" y1="71" x2="99" y2="69" stroke="#7B5E52" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="123" y1="71" x2="125" y2="69" stroke="#7B5E52" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M104 82 Q111 88 118 82" stroke="#D4846E" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M111 46 Q122 38 118 52" stroke="#A1745E" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <circle cx="118" cy="52" r="2" fill="#A1745E"/>

  <!-- Heart outline (upper right) -->
  <path d="M152 68 C152 63 157 59 162 63 C167 59 172 63 172 68 C172 76 162 84 162 84 C162 84 152 76 152 68Z"
    fill="none" stroke="#F48BB0" stroke-width="2.2"/>

  <!-- ECG heartbeat line -->
  <path d="M148 92 L156 92 L160 80 L165 106 L170 86 L174 92 L184 92"
    stroke="#F48BB0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- Dashed connector -->
  <path d="M188 92 Q200 105 196 130" stroke="#A5D6D0" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
  <circle cx="191" cy="100" r="4.5" fill="#80CBC4"/>
  <circle cx="196" cy="116" r="3.5" fill="#80CBC4"/>

  <!-- Checkmark circle -->
  <circle cx="193" cy="135" r="13" fill="#4DB6AC"/>
  <path d="M186 135 L191 141 L201 128" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`

async function generate(size, outPath) {
  const buf = Buffer.from(svg(size))
  await sharp(buf)
    .resize(size, size)
    .png()
    .toFile(outPath)
  console.log(`✓ ${outPath}`)
}

await generate(192, 'public/icons/icon-192.png')
await generate(512, 'public/icons/icon-512.png')
console.log('Done!')
