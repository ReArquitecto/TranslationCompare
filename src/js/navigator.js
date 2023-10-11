import BibleAPI from './BibleAPI.js';

class BibleNavigator {
  constructor() {

    this.appContent = document.getElementById('app-content');
    this.breadcrumbElement = document.getElementById('breadcrumb');

    this.bindNavigation();
    this.LoadBibleData();


    // Mock data for testing
    this.otbooks = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos'];
    this.ntbooks = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians'];
    this.chapters = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    this.verses = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    this.translations = ["KJV", "NIV", "ESV"];

    this.bindEvents();
    this.navigate();
  }

  bindNavigation() {
    window.addEventListener('popstate', () => this.navigate());

  }

  async LoadBibleData() {
    try {
        const api = new BibleAPI();
        const bibleVersionID = 'de4e12af7f28f599-02';

        // Call the getAllData method and get the result.
        const data = await api.getAllData(bibleVersionID);
        
        console.log(JSON.stringify(data, null, 2));  // pretty print the data

    } catch (error) {
        console.error("Error:", error);
    }
  }


  navigate() {
    console.log('navigating');
    const { book, chapter, verse } = this.getURLParams();
    console.log(book, chapter, verse);

    if (book && chapter && verse) {
      this.loadVersesPage(book, chapter, verse);
    } else if (book && chapter) {
      this.loadChaptersPage(book, chapter);
    } else if (book) {
      this.loadHomePage();
    } else {
      this.loadHomePage();
    }
  }

  updatePath(book, chapter, verse) {
    console.log(book, chapter, verse);
    if (book && chapter && verse) {
      window.history.pushState({}, "", `/${book}/${chapter}/${verse}`);
    }
    else if (book && chapter) {
      window.history.pushState({}, "", `/${book}/${chapter}`);
    }
    else if (book) {
      window.history.pushState({}, "", `/${book}`);
    }
    else {
      window.history.pushState({}, "", `/`);
    }
  }

  loadHomePage() {
    this.updateBreadcrumb()
    this.updatePath();
    const content = `
      <div class="flex-sect">
        <div class="sect sect-grid3">
        <h2>Old Testament</h2>
        <ul>
          ${this.otbooks.map(book => `<li><button class="book" data-book="${book}">${book}</button></li>`).join('')}
        </ul>
        </div>
        
        <div class="sect sect-grid3">
        <h2>New Testament</h2>
        <ul>
          ${this.ntbooks.map(book => `<li><button class="book" data-book="${book}">${book}</button></li>`).join('')}
        </ul>
        </div>
      </div>`;
    this.appContent.innerHTML = content;
  }

  loadChaptersPage(book) {
    this.updatePath(book);
    this.updateBreadcrumb();
    const content = `
      <div class="sect sect-grid">
      <h2>${book}</h2>
      <ul>
        ${this.chapters.map(chapter => `<li><button class="chapter" data-chapter="${chapter}">${chapter}</button></li>`).join('')}
      </ul>
      </div>`;
    this.appContent.innerHTML = content;
  }
  
  loadVersesPage(book, chapter) {
    this.updatePath(book, chapter);
    this.updateBreadcrumb();
    const content = `
      <div class="sect sect-grid">
      <h2>${book} Chapter ${chapter}</h2>
      <ul>
        ${this.verses.map(verse => `<li><button class="verse" data-verse="${verse}">${verse}</button></li>`).join('')}
      </ul>
      </div>`;
    this.appContent.innerHTML = content;
  }
  
  loadTranslationPage(book, chapter, verse) {
    this.updatePath(book, chapter, verse);
    this.updateBreadcrumb();
    const content = `
      <div class="sect sect-translation">
      <h2>Translations for: ${book} Chapter ${chapter}:${verse}</h2>
      <ul>
        ${this.translations.map(translation => `<li>${translation}: ${verse}</li>`).join('')}
      </ul>
      </div>`;
    this.appContent.innerHTML = content;
  }

  loadPageNotFound() {
    this.appContent.innerHTML = '<h2>Page not found</h2>';
  }
  
  updateBreadcrumb() {
    const { book, chapter, verse } = this.getURLParams();
    const parts = [book, chapter, verse].filter(Boolean);
    parts.unshift('Home');
    const breadcrumb = parts.map((part, index) => {
      return `<li><a href="#" data-index="${index}">${part}</a></li>`;
    }).join('');
    this.breadcrumbElement.innerHTML = breadcrumb;
  }
  
  bindEvents() {
    this.breadcrumbElement.addEventListener('click', e => this.handleBreadcrumbClick(e));
    this.appContent.addEventListener('click', e => this.handleContentClick(e));
  }
  
  handleBreadcrumbClick(e) {
    e.preventDefault();
    const index = e.target.dataset.index;
    const parts = [null, null, null];
    const { book, chapter, verse } = this.getURLParams();
    parts[index] = null;
    this.updatePath(...parts);
    if (index == 0) {
      this.loadHomePage();
    }
    else if (index == 1) {
      this.loadChaptersPage(book);
    }
    else if (index == 2) {
      this.loadVersesPage(book, chapter);
    }
    else if (index == 3) {
      this.loadTranslationPage(book, chapter, verse);
    }
  }

  getURLParams() {
    const pathSegments = window.location.pathname.split("/").filter(Boolean); // split by "/" and remove any empty parts

    return {
        book: pathSegments[0] || null,
        chapter: pathSegments[1] || null,
        verse: pathSegments[2] || null
    };
  }
  
  handleContentClick(e) {
    const { book, chapter, verse } = this.getURLParams();

    if (e.target.classList.contains('book')) {
        const selectedBook = e.target.dataset.book;
        this.loadChaptersPage(selectedBook);
        this.updatePath(selectedBook);
    }
    else if (e.target.classList.contains('chapter')) {
        const selectedChapter = e.target.dataset.chapter;
        this.loadVersesPage(book, selectedChapter);
        this.updatePath(book, selectedChapter);
    }
    else if (e.target.classList.contains('verse')) {
        console.log('verse selected!');
        const selectedVerse = e.target.dataset.verse;
        console.log(selectedVerse);
        this.loadTranslationPage(book, chapter, selectedVerse);
        this.updatePath(book, chapter, selectedVerse);
    }
  }
}
export default BibleNavigator;
  