import BibleAPI from "./BibleAPI.js";
import ChatAPI from "./ChatAPI.js";

class BibleNavigator {
  constructor() {
    this.BibleAPIKey = "d42753bd397e6f90fcaaa710a6dbfbdf";
    this.BibleAPI = new BibleAPI(this.BibleAPIKey);
    this.ChatAPIKey = "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";
    // this.ChatAPI = new ChatAPI(this.ChatAPIKey);
    this.appContent = document.getElementById("app-content");
    this.isChatEnabled = true;
    this.breadcrumbElement = document.getElementById("breadcrumb");
    this.init();
  }

  async init() {
    // If on home page, show loading page
    if (window.location.pathname === '/') {
      this.loadLoadingPage();
    }

    // switch to mock data for testing
    // this.bibleData = this.BibleAPI.LoadMockData();
    this.bibleData = await this.BibleAPI.LoadBibleData();
    this.removeAnimation();

    this.bindNavigation();
    this.bindEvents();
    this.navigateByURL();
  }

  removeAnimation() {
    // remove animation css property from sect-grid3 class
    const sectGrid3 = document.querySelectorAll('.sect-grid3');
    sectGrid3.forEach(sect => {
      sect.style.animation = 'none';
    });
  }

  bindNavigation() {
    window.addEventListener("popstate", () => this.navigateByURL());
    //log a list of the active history events
    if (window.history && window.history.state) {
      // console.log("active history state: ", window.history.state);
    }
    
  }

  navigateByURL() {
    let { book, chapter, verse } = this.getURLParams();
    console.log(book, chapter, verse)
    const testament = this.getTestament(book);
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
    // replace space with dash
    // capitalize first letter of every word separated by dash
    // uncapitalize articles, conjunctions, and prepositions (a, an, and, as, at, but, by, for, if, in, of, on, or, the, to, nor)
    return book
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/(^\w|-\w)/g, (m) => m.toUpperCase())
      .replace(/(A-|An-|And-|As-|At-|But-|By-|For-|If-|In-|Of-|On-|Or-|-The-|To-|Nor-)/g, (m) =>
        m.toLowerCase()
      );
  }
  unformatBook(book) {
    if (!book) return null;
    // replace dash with space
    return book.replace(/-/g, " ");
  }

  updatePath(book, chapter, verse) {
    book = this.formatBook(book) || null;
    if (book && chapter && verse) {
      window.history.pushState({}, "", `/${book}/${chapter}/${verse}`);
    } else if (book && chapter) {
      window.history.pushState({}, "", `/${book}/${chapter}`);
    } else if (book) {
      window.history.pushState({}, "", `/${book}`);
    } else {
      window.history.pushState({}, "", `/`);
    }
    // console.log("State pushed", book, chapter, verse);
    // console.log("active history state: ", window.history.state);
  }

  loadLoadingPage() {
    this.updateBreadcrumb();
    this.updatePath();
    const content = `
      <div class="flex-sect">
        <div class="sect sect-grid3">
        <h1>Old Testament</h1>
          <div class="">
            <div class="spinner-box">
              <div class="pulse-container">  
                <div class="pulse-bubble pulse-bubble-1"></div>
                <div class="pulse-bubble pulse-bubble-2"></div>
                <div class="pulse-bubble pulse-bubble-3"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sect sect-grid3">
        <h1>New Testament</h1>
          <div class="">
            <div class="spinner-box">
              <div class="pulse-container">  
                <div class="pulse-bubble pulse-bubble-1"></div>
                <div class="pulse-bubble pulse-bubble-2"></div>
                <div class="pulse-bubble pulse-bubble-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    this.appContent.innerHTML = content;
  }

  async loadHomePage() {
    this.loadLoadingPage();
    this.updateBreadcrumb();
    this.updatePath();
    this.newTestamentBooks = Object.keys(this.bibleData.NewTestament);
    this.oldTestamentBooks = await Object.keys(this.bibleData.OldTestament);
    let content = `
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
      let cont = `
      <div class="flex-sect">
        <div class="sect sect-grid3">
        <h1>Old Testament</h1>
          <div class="">
            <div class="spinner-box">
              <div class="pulse-container">  
                <div class="pulse-bubble pulse-bubble-1"></div>
                <div class="pulse-bubble pulse-bubble-2"></div>
                <div class="pulse-bubble pulse-bubble-3"></div>
              </div>
            </div>
          </div>
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
  }

  loadChaptersPage(book) {
    //replace dashes with spaces
    book = this.unformatBook(book) || null;
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

  async loadVersesPage(book, chapter) {
    const testament = this.getTestament(book);
    this.updatePath(book, chapter);
    this.updateBreadcrumb();

    this.appContent.innerHTML = `
      <div class="sect sect-grid">
        <h1>${book} Chapter ${chapter}</h1>
          <div class="">
            <div class="spinner-box">
              <div class="pulse-container">  
                <div class="pulse-bubble pulse-bubble-1"></div>
                <div class="pulse-bubble pulse-bubble-2"></div>
                <div class="pulse-bubble pulse-bubble-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    // Get the total number of verses in the chapter
    console.log('book name for verse count', book, chapter, this.bibleData[testament][book].chapters[chapter])
    const countVerses = await this.BibleAPI.getVerseCount(book, chapter);

    // Make an li for each verse
    const content = `
      <div class="sect sect-grid">
      <h1>${book} Chapter ${chapter}</h1>
      
      <ul>
        ${Array.from({ length: countVerses }, (_, i) => i + 1)
          .map(
            (verse) =>
              `<li><button class="verse" data-verse="${verse}">${verse}</button></li>`
          )
          .join("")}
      </ul>
      </div>`;
    this.appContent.innerHTML = content;
  }

  async loadTranslationPage(book, chapter, verse) {
    this.updatePath(book, chapter, verse);
    this.updateBreadcrumb();
    const content = `
      <div class="sect sect-translation">
        <h1>${book} ${chapter}:${verse}</h1>
        <div class="info"><img src="/img/info.svg" alt="info icon" class="info-icon"><p>Translation Info<p></div>
        <div class="hidden gray">
          <p>Some Popular Bibles not included:
          <ul id="bibles-not-included">
            <li>- New International Version (NIV)</li>
            <li>- English Standard Version (ESV)</li>
            <li>- New Living Translation (NLT)</li>
            <li>- New King James Version (NKJV)</li>
            <li>- Christian Standard Bible (CSB)</li>
          <ul>
        </div>  
        <div class="translations">
          <div class="">
            <select id="t-select-1"></select>
            <div id="t-content-1" class="scripture-styles">Loading...</div>
          </div>
          <div class="">
            <select id="t-select-2"></select>
            <div id="t-content-2" class="scripture-styles">Loading...</div>
          </div>
          <div class="">
            <select id="t-select-3"></select>
            <div id="t-content-3" class="scripture-styles">Loading...</div>
          </div>
        </div>
        ${this.isChatEnabled ? `
        <div class="chat">
          <button class="chat-button">Compare with ChatGPT</button>
        </div>` : ''}
      </div>`;
    this.appContent.innerHTML = content;
    try {
      await this.BibleAPI.populateTranslations();
    }
    catch (error) {
      console.error('Sequence error: ', error);
    }
    await this.loadDropdownDefaultValues();
    this.attachTranslationEventListeners(book, chapter, verse);

    // Populate content for each translation
    const dropdowns = ['t-select-1', 't-select-2', 't-select-3'].map(id => document.getElementById(id));
    const contentDivs = ['t-content-1', 't-content-2', 't-content-3'].map(id => document.getElementById(id));
    dropdowns.forEach((dropdown, index) => {
        this.updateIndividualTranslation(dropdown, contentDivs[index], book, chapter, verse);
    });

    // get p with class of hidden, remove hidden class when element of class .info is clicked
    const info = document.querySelector('.info');
    const hidden = document.querySelector('.hidden');
    info.addEventListener('click', () => {
      if (hidden.classList.contains('hidden')) {
        hidden.classList.remove('hidden');
      } else {
        hidden.classList.add('hidden');
      }
    });

    // replace button with chat window when button is clicked
    const chatButton = document.querySelector('.chat-button');
    chatButton.addEventListener('click', () => {
      // get rid of chat button
      chatButton.remove();
      // add chat window from this.loadChat()
      this.loadChat();
    });
  }

  async loadChat() {
    const initalChatContent = `
      <div class="chat-window">
        <hr>
        <h2>Chat <span>(Powered by ChatGPT)</span></h2>
        <div class="chat-body">
          <div class="chat-message bot-message">
            <div class="user-circle"><img src=/img/chatgpt.svg alt="ChatGPT Logo As Profile Picture"></div>
            <div class="chat-message-bubble">
              <p>Loading Initial Response... This Chatbot disabled. The API Key was exposed on GitHub.</p>
              <div class="spinner-box">
                <div class="pulse-container">  
                  <div class="pulse-bubble pulse-bubble-1"></div>
                  <div class="pulse-bubble pulse-bubble-2"></div>
                  <div class="pulse-bubble pulse-bubble-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-footer">
          <input type="text" placeholder="Ask a question...">
          <button class="send-button" Title="Send"><img src="/img/send.svg" alt="Send"></button>`
    // Create chat window template
    let botMessage = `
      <div class="user-circle"><img src=/img/chatgpt.svg alt="ChatGPT Logo As Profile Picture"></div>
      <div class="chat-message-bubble">
        <div class="spinner-box">
          <div class="pulse-container">  
            <div class="pulse-bubble pulse-bubble-1"></div>
            <div class="pulse-bubble pulse-bubble-2"></div>
            <div class="pulse-bubble pulse-bubble-3"></div>
          </div>
        </div>
      </div>`
    let userMessage = `
      <div class="user-circle"><img src=/img/user.svg alt="User Profile Picture"></div>
      <div class="chat-message-bubble">
        <p></p>
      </div>`
    
    // Add chat window template to DOM
    const chatWindow = document.querySelector('.chat');
    chatWindow.innerHTML = initalChatContent;

    return;
    // Get the verses text and translation names from the selected translations
    const dropdowns = ['t-select-1', 't-select-2', 't-select-3'].map(id => document.getElementById(id));
    const contentDivs = ['t-content-1', 't-content-2', 't-content-3'].map(id => document.getElementById(id));
    const selectedVerses = await contentDivs.map(contentDiv => contentDiv.innerText);
    const selectedTranslations = await dropdowns.map(dropdown => dropdown.options[dropdown.selectedIndex].text);

    // Get the verse text and translation names from the selected translations
    const verseText = await selectedVerses.join(' ');
    const translationNames = await selectedTranslations.join(', ');

    

  }

  loadPageNotFound() {
    this.appContent.innerHTML = "<h1>Page not found</h1>";
  }

  async loadDropdownDefaultValues() {
    const dropdowns = ['t-select-1', 't-select-2', 't-select-3'].map(id => document.getElementById(id));

    // Change the selections to stored values if they exist
    const storedBibleIds = await JSON.parse(localStorage.getItem('storedBibleIds'));
    if (storedBibleIds) {
        dropdowns.forEach((dropdown, index) => {
            dropdown.value = storedBibleIds[index];
        });
    }

    // Change the seelections to "King James (Authorized) Version", "World English Bible", and "Douay-Rheims American 1899" if no stored values exist
    else {
        dropdowns[0].value = 'de4e12af7f28f599-02';
        dropdowns[1].value = '9879dbb7cfe39e4d-04';
        dropdowns[2].value = '179568874c45066f-01';
    }
  }

  getBookID(book) {
    const testament = this.getTestament(book);
    return this.bibleData[testament][book].id;
  }

  updateIndividualTranslation(dropdown, contentDiv, book, chapter, verse) {
    const bibleId = dropdown.value;
    const bookId = this.getBookID(book);
    this.BibleAPI.fetchTranslationContent(bibleId, bookId, book, chapter, verse)
        .then(content => {
            contentDiv.innerHTML = '';
            contentDiv.appendChild(content);
        });
  }

  async attachTranslationEventListeners(book, chapter, verse) {
    const dropdowns = ['t-select-1', 't-select-2', 't-select-3'].map(id => document.getElementById(id));
    const contentDivs = ['t-content-1', 't-content-2', 't-content-3'].map(id => document.getElementById(id));

    dropdowns.forEach((dropdown, index) => {
        dropdown.addEventListener('change', async () => {
            await this.updateIndividualTranslation(dropdown, contentDivs[index], book, chapter, verse);

            // Update local storage to save the selected dropdown values
            const selectedBibleIds = await dropdowns.map(dropdown => dropdown.value);
            localStorage.setItem('storedBibleIds', JSON.stringify(selectedBibleIds));
        });
    });
}

  updateBreadcrumb() {
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
    book = this.unformatBook(book) || null;
    if (this.bibleData.OldTestament[book]) {
      return "OldTestament";
    } else if (this.bibleData.NewTestament[book]) {
      return "NewTestament";
    } else {
      return null;
    }
  }

  getURLParams() {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);

    let book = pathSegments[0] || null;
    const chapter = pathSegments[1] || null;
    const verse = pathSegments[2] || null;

    book = this.formatBook(book) || null;

    return {
      book,
      chapter,
      verse,
    };
  }

  redirectIfInvalid() {
    let { book, chapter, verse } = this.getURLParams();
    // book = this.unformatBook(book) || null;
    const testament = this.getTestament(book);

    // Redirect to home page if the book, chapter, or verse does not exist.
    if (!book) {
      this.loadHomePage();
    } else if (book && !testament) {
      this.loadHomePage();
    } else if (book && chapter && !this.bibleData[testament][book][chapter]) {
      this.loadChaptersPage(book);
    } else if (
      book &&
      chapter &&
      verse &&
      !this.bibleData[testament][book][chapter][verse]
    ) {
      this.loadVersesPage(book, chapter);
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
      const selectedVerse = e.target.dataset.verse;
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
