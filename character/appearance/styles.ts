// Also rendered into the print preview, so standalone HTML exports retain their theme.
export const SHEET_APPEARANCE_STYLES = `
.sheet-appearance { --sheet-primary:#3D3D3D; --sheet-secondary:#858585; background:#F5F4F1; color:#292929; min-height:100vh; }
.sheet-appearance .a4-page { background:#fff; color:#292929; }
.sheet-appearance .a4-page .bg-gray-800 { background-color:#3D3D3D; }
.sheet-appearance .a4-page input, .sheet-appearance .a4-page textarea { color:#292929; }
.sheet-appearance .a4-page :is(.text-gray-800,.text-gray-700) { color:#292929; }
.sheet-appearance .a4-page :is(.border-gray-300,.border-gray-400,.border-gray-800) { border-color:#858585; }
.sheet-appearance .profession-choice > :first-child { color:var(--sheet-primary); font-weight:600; }
.sheet-appearance .a4-page .sheet-level-frame, .sheet-appearance .a4-page .sheet-profession-features { border-color:var(--sheet-secondary); }
.sheet-appearance .sheet-tab[data-state=active] { color:var(--sheet-primary); border-bottom:2px solid var(--sheet-primary); }
.sheet-appearance .sheet-main-action { background:var(--sheet-primary); color:#fff; border-color:var(--sheet-primary); }
.sheet-appearance .sheet-main-action:hover { filter:brightness(1.08); }
.sheet-domain-band { position:absolute; bottom:0; left:0; right:0; display:flex; }
.sheet-domain-band > span:first-child { width:60%; border-top:3px solid var(--sheet-primary); }
.sheet-domain-band > span:last-child { width:40%; border-top:3px solid var(--sheet-secondary); }
.domain-badge { display:inline-flex; align-items:center; gap:2px; padding:1px 3px; border:1px solid var(--domain-color); border-radius:3px; background:#fff; color:var(--domain-color); font-size:9px; line-height:13px; white-space:nowrap; }
.print-all-pages .sheet-appearance.sheet-print-mono { --sheet-primary:#303030!important; --sheet-secondary:#707070!important; }
.print-all-pages .sheet-appearance.sheet-print-mono .domain-badge-primary { --domain-color:#303030!important; }
.print-all-pages .sheet-appearance.sheet-print-mono .domain-badge-secondary { --domain-color:#707070!important; }
.print-all-pages .sheet-appearance.sheet-print-mono .a4-page img { filter:grayscale(1); }
@media print {
 .sheet-appearance { min-height:0; background:#fff!important; color:#292929!important; }
 .sheet-appearance.sheet-print-mono { --sheet-primary:#303030!important; --sheet-secondary:#707070!important; }
 .sheet-appearance.sheet-print-mono .domain-badge-primary { --domain-color:#303030!important; }
 .sheet-appearance.sheet-print-mono .domain-badge-secondary { --domain-color:#707070!important; }
 .sheet-appearance.sheet-print-mono .a4-page img { filter:grayscale(1)!important; }
 .sheet-appearance .a4-page { background:#fff!important; color:#292929!important; }
 .sheet-appearance .a4-page :is(.text-gray-800,.text-gray-700) { color:#292929!important; }
 .sheet-appearance .a4-page .bg-gray-800, .sheet-appearance .a4-page .bg-gray-700 { background:#fff!important; color:#292929!important; }
 .sheet-appearance .a4-page .bg-gray-800 *, .sheet-appearance .a4-page .bg-gray-700 * { color:#292929!important; }
 .sheet-appearance .a4-page .profession-choice > :first-child { color:var(--sheet-primary)!important; }
 .sheet-appearance .sheet-level-frame, .sheet-appearance .sheet-profession-features { border-color:var(--sheet-secondary)!important; }
 .sheet-appearance .a4-page .domain-badge { color:var(--domain-color)!important; background:#fff!important; border-color:var(--domain-color)!important; }
 .sheet-appearance .a4-page .domain-badge * { color:inherit!important; }
 .sheet-appearance .a4-page input, .sheet-appearance .a4-page textarea, .sheet-appearance .a4-page select { color:#292929!important; border-color:#858585!important; }
 .sheet-appearance .a4-page input[type=checkbox] { appearance:auto!important; accent-color:#303030; }
 .sheet-appearance .a4-page [role=checkbox][data-state=checked] { background:#fff!important; color:#292929!important; border-color:#292929!important; }
 .sheet-appearance .a4-page .bg-gray-800:is(.sheet-filled-mark,.cursor-pointer) { border:4px solid #292929!important; }
 .sheet-appearance .sheet-header { border-bottom:1px solid #858585; }
 .sheet-appearance .tabs-container, .sheet-appearance [role=switch] { display:none!important; }
}
`
