export default function ThemeInitScript() {
  const script = `(() => {
    try {
      const key = 'studynest-theme';
      const stored = localStorage.getItem(key);
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved = stored === 'light' || stored === 'dark' ? stored : (systemDark ? 'dark' : 'light');
      const root = document.documentElement;
      root.classList.remove('theme-light', 'theme-dark');
      root.classList.add(resolved === 'dark' ? 'theme-dark' : 'theme-light');
      root.setAttribute('data-theme', resolved);
    } catch (_error) {
      const root = document.documentElement;
      root.classList.add('theme-dark');
      root.setAttribute('data-theme', 'dark');
    }
  })();`

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
