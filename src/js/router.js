export function navigate(navigationFunctions = {}) {
  const params = new URLSearchParams(window.location.search);

  const book = params.get('name');
  const chapter = params.get('chapter');
  const verse = params.get('verse');

  if (book && chapter && verse && navigationFunctions.loadVersePage) {
    navigationFunctions.loadVersePage(book, chapter, verse);
  } else if (book && chapter && navigationFunctions.loadChapterPage) {
    navigationFunctions.loadChapterPage(book, chapter);
  } else if (book && navigationFunctions.loadBookPage) {
    navigationFunctions.loadBookPage(book);
  } else if (navigationFunctions.loadHomePage) {
    navigationFunctions.loadHomePage();
  }
}

window.onpopstate = () => navigate();
navigate();
