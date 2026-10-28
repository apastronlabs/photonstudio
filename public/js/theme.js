export async function initTheme() {
  try {
    const colors = await fetch('./js/colors.json').then(r => r.json());
    const root = document.documentElement;
    
    for (const [property, value] of Object.entries(colors)) {
      if (property.startsWith('--')) {
        root.style.setProperty(property, value);
      }
    }
  } catch (error) {
    console.error('Error loading theme colors:', error);
  }
}
