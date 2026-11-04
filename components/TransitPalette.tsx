import { useLayoutEffect, useState } from 'react';

const colors = [
  { name: '兰台青', value: '#24b89c' },
  { name: '海盐蓝', value: '#3c84ee' },
  { name: '暮山紫', value: '#a36ae7' },
  { name: '落日橙', value: '#eb873b' },
  { name: '蔷薇粉', value: '#e4618f' }
];

const storageKey = 'shuttle-appearance';
const defaults = { color: colors[0].value, brightness: 60, light: false };

function loadAppearance() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    return {
      color: /^#[0-9a-f]{6}$/i.test(saved.color) ? saved.color : defaults.color,
      brightness: Number.isFinite(saved.brightness) && saved.brightness >= 0 && saved.brightness <= 100
        ? saved.brightness : defaults.brightness,
      light: saved.light === true
    };
  } catch {
    return defaults;
  }
}

export function TransitPalette() {
  const [appearance, setAppearance] = useState(loadAppearance);
  const { color, brightness, light } = appearance;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--palette-color', color);
    root.style.setProperty('--palette-brightness', `${brightness}%`);
    root.dataset.transitMode = light ? 'light' : 'dark';
    try {
      localStorage.setItem(storageKey, JSON.stringify(appearance));
    } catch {
      // The palette still works when storage is unavailable.
    }
  }, [appearance, color, brightness, light]);

  return (
    <details className="transit-palette">
      <summary><span className="transit-palette-dot" aria-hidden="true" />配色</summary>
      <div className="transit-palette-controls">
        <div className="transit-swatches" role="group" aria-label="预设配色">
          {colors.map(preset => (
            <button
              key={preset.value}
              type="button"
              aria-label={preset.name}
              title={preset.name}
              aria-pressed={color === preset.value}
              style={{ backgroundColor: preset.value }}
              onClick={() => setAppearance(current => ({ ...current, color: preset.value }))}
            />
          ))}
        </div>
        <label className="transit-palette-row">
          <span>自定义颜色</span>
          <input type="color" value={color}
            onInput={event => {
              const value = event.currentTarget.value;
              setAppearance(current => ({ ...current, color: value }));
            }}
            onChange={event => {
              const value = event.currentTarget.value;
              setAppearance(current => ({ ...current, color: value }));
            }}
          />
        </label>
        <label className="transit-palette-row">
          <span>颜色亮度</span>
          <input type="range" min="0" max="100" value={brightness}
            onChange={event => {
              const value = event.currentTarget.valueAsNumber;
              setAppearance(current => ({ ...current, brightness: value }));
            }}
          />
          <output>{brightness}%</output>
        </label>
        <div className="transit-palette-row">
          <div className="transit-palette-mode" role="group" aria-label="界面明暗">
            <button type="button" aria-pressed={!light}
              onClick={() => setAppearance(current => ({ ...current, light: false }))}>深色</button>
            <button type="button" aria-pressed={light}
              onClick={() => setAppearance(current => ({ ...current, light: true }))}>浅色</button>
          </div>
          <button className="transit-palette-reset" type="button" onClick={() => setAppearance(defaults)}>恢复默认</button>
        </div>
      </div>
    </details>
  );
}
