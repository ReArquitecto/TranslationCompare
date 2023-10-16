import BibleAPI from "./BibleAPI.js";

class BibleNavigator {
  constructor() {
    this.apiKey = "d42753bd397e6f90fcaaa710a6dbfbdf";

    // switch between mock data and api data
    this.BibleAPI = new BibleAPI(this.apiKey);
    // this.bibleData = this.BibleAPI.LoadMockData();
    this.bibleData = this.BibleAPI.LoadBibleData();
    console.log(JSON.stringify(this.bibleData, null, 2));

    this.appContent = document.getElementById("app-content");
    this.breadcrumbElement = document.getElementById("breadcrumb");
    this.bindNavigation();

    this.bindEvents();
    this.navigateByURL();
  }

  bindNavigation() {
    window.addEventListener("popstate", () => this.navigateByURL());
  }

  navigateByURL() {
    let { book, chapter, verse } = this.getURLParams();
    book = this.formatBook(book) || null;
    const testament = this.getTestament(book);
    console.log(book, chapter, verse);
    this.redirectIfInvalid();

    book = this.unformatBook(book) || null;
    if (book && chapter && verse) {
      this.loadTranslationPage(book, chapter, verse);
    } else if (book && chapter) {
      this.loadVersesPage(book, chapter);
    } else if (book) {
      this.loadChaptersPage(book);
    } else {
      this.loadHomePage();
    }
  }

  formatBook(book) {
    if (!book) return null;
    // lowercase all characters
    // capitalize first letter of each word
    // replace space with dash
    return book
      .toLowerCase()
      .replace(/\b[a-z]/g, (char) => char.toUpperCase())
      .replace(/\s/g, "-");
  }
  unformatBook(book) {
    if (!book) return null;
    // replace dash with space
    return book.replace(/-/g, " ");
  }

  updatePath(book, chapter, verse) {
    book = this.formatBook(book) || null;
    console.log("!updatePath", book, chapter, verse);
    console.log(book, chapter, verse);
    if (book && chapter && verse) {
      window.history.pushState({}, "", `/${book}/${chapter}/${verse}`);
    } else if (book && chapter) {
      window.history.pushState({}, "", `/${book}/${chapter}`);
    } else if (book) {
      window.history.pushState({}, "", `/${book}`);
    } else {
      window.history.pushState({}, "", `/`);
    }
  }

  loadHomePage() {
    this.updateBreadcrumb();
    this.updatePath();
    this.newTestamentBooks = Object.keys(this.bibleData.NewTestament);
    this.oldTestamentBooks = Object.keys(this.bibleData.OldTestament);
    const content = `
      <div class="flex-sect">
        <div class="sect sect-grid3">
        <h1>Old Testament</h1>
        <ul>
          ${this.oldTestamentBooks
            .map(
              (book) =>
                `<li><button class="book" data-book="${book}">${book}</button></li>`
            )
            .join("")}
        </ul>
        </div>
        
        <div class="sect sect-grid3">
        <h1>New Testament</h1>
        <ul>
          ${this.newTestamentBooks
            .map(
              (book) =>
                `<li><button class="book" data-book="${book}">${book}</button></li>`
            )
            .join("")}
        </ul>
        </div>
      </div>`;
    this.appContent.innerHTML = content;
    this.updateBreadcrumb();
    // this.updatePath();
  }

  loadChaptersPage(book) {
    const testament = this.getTestament(book);
    if (!testament) {
      console.error(`Unable to determine testament for the book: ${book}`);
      return;
    }

    if (!this.bibleData || !this.bibleData[testament]) {
      console.error(
        `Bible data missing or does not contain the testament: ${testament}`
      );
      return;
    }
    this.updatePath(book);
    this.updateBreadcrumb();
    this.chapters = Object.keys(this.bibleData[testament][book].chapters);
    console.log("chapters", this.chapters);
    const content = `
      <div class="sect sect-grid">
      <h1>${book}</h1>
      <ul>
        ${this.chapters
          .map(
            (chapter) =>
              `<li><button class="chapter" data-chapter="${chapter}">${chapter}</button></li>`
          )
          .join("")}
      </ul>
      </div>`;
    this.appContent.innerHTML = content;
  }

  loadVersesPage(book, chapter) {
    const testament = this.getTestament(book);
    this.updatePath(book, chapter);
    this.updateBreadcrumb();

    const totalVerses = this.bibleData[testament][book].chapters[chapter];
    this.verses = Array.from({ length: totalVerses }, (_, i) => i + 1);

    console.log("verses", this.verses);
    const content = `
      <div class="sect sect-grid">
      <h1>${book} Chapter ${chapter}</h1>
      
      <ul>
        ${this.verses
          .map(
            (verse) =>
              `<li><button class="verse" data-verse="${verse}">${verse}</button></li>`
          )
          .join("")}
      </ul>
      </div>`;
    this.appContent.innerHTML = content;
  }

  loadTranslationPage(book, chapter, verse) {
    this.updatePath(book, chapter, verse);
    this.updateBreadcrumb();
    const content = `
      <div class="sect sect-translation">
        <h1>${book} Chapter ${chapter}:${verse}</h1>
        <div class="translations">
          <div class="">
            <select id="t-select-1"></select>
            <div id="t-content-1"></div>
          </div>
          <div class="">
            <select id="t-select-2"></select>
            <div id="t-content-2"></div>
          </div>
          <div class="">
            <select id="t-select-3"></select>
            <div id="t-content-3"></div>
          </div>
        </div>
      </div>`;
    this.appContent.innerHTML = content;
    this.BibleAPI.populateTranslations();
    this.attachTranslationEventListeners(book, chapter, verse);
  }

  loadPageNotFound() {
    this.appContent.innerHTML = "<h1>Page not found</h1>";
  }

  attachTranslationEventListeners(book, chapter, verse) {
    const dropdowns = ['t-select-1', 't-select-2', 't-select-3'].map(id => document.getElementById(id));
    const contentDivs = ['t-content-1', 't-content-2', 't-content-3'].map(id => document.getElementById(id));

    dropdowns.forEach((dropdown, index) => {
        dropdown.addEventListener('change', async () => {
            const bibleId = dropdown.value;
            const content = await this.BibleAPI.fetchVerseContent(bibleId, book, chapter, verse);
            contentDivs[index].innerHTML = content;

            // Update local storage to save the selected dropdown values
            const selectedBibleIds = dropdowns.map(dropdown => dropdown.value);
            localStorage.setItem('selectedBibleIds', JSON.stringify(selectedBibleIds));
        });
    });
}

  updateBreadcrumb() {
    console.log("updateBreadcrumb!!!!!!!!");
    let { book, chapter, verse } = this.getURLParams();
    const parts = [book, chapter, verse].filter(Boolean);
    book = this.formatBook(book) || null;
    parts.unshift("Home");
    const breadcrumb = parts
      .map(
        (part, index) =>
          `<li><a href="#" data-index="${index}">${part}</a></li>`
      )
      .join("");
    this.breadcrumbElement.innerHTML = breadcrumb;
  }

  bindEvents() {
    this.breadcrumbElement.addEventListener("click", (e) =>
      this.handleBreadcrumbClick(e)
    );
    this.appContent.addEventListener("click", (e) =>
      this.handleContentClick(e)
    );
  }

  getTestament(book) {
    if (this.bibleData.OldTestament[book]) {
      return "OldTestament";
    } else if (this.bibleData.NewTestament[book]) {
      return "NewTestament";
    } else {
      return null;
    }
  }

  getURLParams() {
    const pathSegments = window.location.pathname.split("/").filter(Boolean); // split by "/" and remove any empty parts

    return {
      book: pathSegments[0] || null,
      chapter: pathSegments[1] || null,
      verse: pathSegments[2] || null,
    };
  }

  redirectIfInvalid() {
    let { book, chapter, verse } = this.getURLParams();
    const testament = this.getTestament(book);

    // Redirect to home page if the book, chapter, or verse does not exist.
    if (!book) {
      this.loadHomePage();
      console.log("book not found");
    } else if (book && !testament) {
      this.loadHomePage();
      console.log("book not found");
    } else if (book && chapter && !this.bibleData[testament][book][chapter]) {
      this.loadChaptersPage(book);
      console.log("chapter not found");
    } else if (
      book &&
      chapter &&
      verse &&
      !this.bibleData[testament][book][chapter][verse]
    ) {
      this.loadVersesPage(book, chapter);
      console.log("verse not found");
    }
  }

  handleContentClick(e) {
    let { book, chapter, verse } = this.getURLParams();
    book = this.unformatBook(book) || null;

    if (e.target.classList.contains("book")) {
      const selectedBook = e.target.dataset.book;
      this.loadChaptersPage(selectedBook);
    } else if (e.target.classList.contains("chapter")) {
      const selectedChapter = e.target.dataset.chapter;
      this.loadVersesPage(book, selectedChapter);
    } else if (e.target.classList.contains("verse")) {
      console.log("verse selected!");
      const selectedVerse = e.target.dataset.verse;
      console.log(selectedVerse);
      this.loadTranslationPage(book, chapter, selectedVerse);
    }
  }

  handleBreadcrumbClick(e) {
    e.preventDefault();
    const index = e.target.dataset.index;
    const parts = [null, null, null];
    let { book, chapter, verse } = this.getURLParams();
    book = this.unformatBook(book) || null;

    parts[index] = null;
    if (index == 0) {
      this.loadHomePage();
    } else if (index == 1) {
      this.loadChaptersPage(book);
    } else if (index == 2) {
      this.loadVersesPage(book, chapter);
    } else if (index == 3) {
      this.loadTranslationPage(book, chapter, verse);
    }
  }
}
export default BibleNavigator;
