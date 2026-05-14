const COMPONENTS = [
  'site-header',
  'hero-section',
  'code-frase-section',
  'about-section',
  'skills-section',
  'languages-section',
  'projects-section',
  'contact-section',
  'site-footer',
];

const loadComponent = async (componentName) => {
  const mountPoint = document.querySelector(componentName);

  if (!mountPoint) {
    return;
  }

  const response = await fetch(`./sections/${componentName}/${componentName}.html`);

  if (!response.ok) {
    throw new Error(`Kon component ${componentName} niet laden (${response.status})`);
  }

  mountPoint.innerHTML = await response.text();
};

export const loadComponents = async () => {
  const results = await Promise.allSettled(
    COMPONENTS.map((componentName) => loadComponent(componentName))
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Component laden mislukt: ${COMPONENTS[index]}`, result.reason);
    }
  });

  document.dispatchEvent(
    new CustomEvent('componentsLoaded', {
      detail: { root: document },
    })
  );
};
