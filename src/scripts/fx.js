// The site's .fx buttons: each pill is sized to its own label (--x = label width + the 8px gap, which also
// gives the words the same margin the icon has on its side), and a row learns how far its open button
// reaches (--sx), so the buttons before it slide aside by exactly that much.
// measured with canvas text metrics, in the label's own font: works even inside a hidden panel
const ctx = document.createElement('canvas').getContext('2d');
const fit = () => {
  for (const b of document.querySelectorAll('.fx')) {
    const t = b.querySelector('.fx-t');
    if (!t) continue;
    const cs = getComputedStyle(t);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    b.style.setProperty('--x', Math.ceil(ctx.measureText(t.textContent).width + 8) + 'px');
  }
};
fit();
document.fonts?.ready.then(fit);
const reach = (e) => {
  const b = e.target.closest?.('.fx'), row = b?.closest('.fx-row');
  if (b && row) row.style.setProperty('--sx', b.style.getPropertyValue('--x'));
};
addEventListener('pointerover', reach);
addEventListener('focusin', reach);
