// used in script.js and navigation-smooth-scroll.js,
export const getHeaderOffset = () => {
  const stickyHost = document.querySelector('site-header');
  const innerHeader = document.querySelector('.header');
  return stickyHost?.offsetHeight || innerHeader?.offsetHeight || 0;
};
