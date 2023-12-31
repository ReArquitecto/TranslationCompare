export default class BibleAPI {
  constructor(apiKey) {
    this.API_KEY = apiKey;
    this.BASE_URL = "https://api.scripture.api.bible/v1/";
    this.TIMEOUT = 5000; // Set a timeout of 5 seconds (adjust as needed).
    this.BibleVersionID = "de4e12af7f28f599-02"
  }

  async makeRequest(endpoint) {

    const url = `${this.BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "API-Key": this.API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status code ${response.status}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error making request:", error);
      throw error;
    }
  }

  getBooks() {
    const Bible_Books = {
      OldTestament: [
        "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"
      ],
      NewTestament: [
        "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
      ]
    }
    return Bible_Books;
  }

  async addBookData(Bible_Books) {  
    try {
      const response = await fetch(`https://api.scripture.api.bible/v1/bibles/${this.BibleVersionID}/books`, {
        headers: {
          "API-Key": this.API_KEY,
        },
      });
      const data = await response.json();
      const apiBooks = data.data;

      // Add book details to the book
      for (let bibleBookID in Bible_Books.OldTestament) {
        const apiBook = apiBooks.find(book => book.name === bibleBookID);
        if (apiBook) {

          Bible_Books.OldTestament[bibleBookID] = {
            id: apiBook.id,
            abbreviation: apiBook.abbreviation,
            name: apiBook.name,
            nameLong: apiBook.nameLong,
            chapters: {}
          };
        }
      }

      for (let bibleBookID in Bible_Books.NewTestament) {
        const apiBook = apiBooks.find(book => book.name === bibleBookID);
        if (apiBook) {
          Bible_Books.NewTestament[bibleBookID] = {
            id: apiBook.id,
            abbreviation: apiBook.abbreviation,
            name: apiBook.name,
            nameLong: apiBook.nameLong,
            chapters: {}
          };
        }
      }
  
      return Bible_Books;
    } catch (error) {
      console.error("Error fetching book data:", error);
      throw error;
    }
  }

  async getVerseCount(bookName, chapter) {
    // from local storage, get bible data
    const cachedData = localStorage.getItem("bibleData");
    if (!cachedData) {
      console.error("Bible data not found in local storage.");
      return;
    }

    const finalData = JSON.parse(cachedData);
    // Get testament
    if (finalData.OldTestament[bookName]) {
      var testament = 'OldTestament';
    }
    if (finalData.NewTestament[bookName]) {
      var testament = 'NewTestament';
    }

    const chapters = finalData[testament][bookName].chapters;
    const chapterId = chapters[chapter];
    // Check if chapter id is an integer
    if (!Number.isInteger(chapterId)) {
      // Get the book ID
      const bookId = this.getBookId(bookName, finalData);
      if (!bookId) {
        console.error(`Book ID not found for book: ${bookName}`);
        return;
      }
      // append the chapter number to the book ID
      const bibleChapterID = `${bookId}.${chapter}`;
      // Get the verses from the API
      const response = await fetch(`https://api.scripture.api.bible/v1/bibles/${this.BibleVersionID}/chapters/${bibleChapterID}/verses`, {
        headers: {
            'API-Key': this.API_KEY
        }
      });
      const data = await response.json();
      const verses = data.data;
      const verseCount = verses.length;

      // Update bible data chapter with the verse count
      finalData[testament][bookName].chapters[chapter] = verseCount;

      // Cache the updated bible data
      localStorage.setItem("bibleData", JSON.stringify(finalData));
      return verseCount;
    } else {
      return chapters[chapter];
    }
  }


  async getBibleVersions() {
    const response = await fetch('https://api.scripture.api.bible/v1/bibles', {
            headers: {
                'API-Key': this.API_KEY
            }
        });
        const data = await response.json();
        const versions = data.data;
        return versions;
  }

  getBookId(bookName, finalData) {
    // Check in Old Testament
    if (finalData.OldTestament[bookName]) {
      return finalData.OldTestament[bookName].id;
    }
  
    // Check in New Testament
    if (finalData.NewTestament[bookName]) {
      return finalData.NewTestament[bookName].id;
    }
  
    // If not found in both
    console.error(`Book ID not found for book: ${bookName}`);
    return null;
  }
  
  async getVerseSelection(bibleVersionID, chapterId, startVerseNum, endVerseNum) {
    const endpoint = `/bibles/${bibleVersionID}/chapters/${chapterId}/verses`;
    try {
        const data = await this.makeRequest(endpoint);
        const verses = data.data;

        // Filter the verses based on the provided start and end numbers
        const selectedVerses = verses.filter(verse => {
            const verseNumber = parseInt(verse.reference.split(" ")[1]);
            return verseNumber >= startVerseNum && verseNumber <= endVerseNum;
        });

        // Return only the IDs and content of the selected verses
        return selectedVerses.map(verse => ({
            id: verse.id,
            content: verse.content // Assuming the content field holds the text of the verse.
        }));

    } catch (error) {
        console.error("Error fetching selected verses:", error);
        throw error;
    }
}

  async LoadBibleData() {
    // If the data is found in localStorage, return it and exit early.
    const cachedData = localStorage.getItem("bibleData");
    if (cachedData) return JSON.parse(cachedData);

    // Create the final data structure.
    let finalData = {
      OldTestament: {},
      NewTestament: {},
      Translations: {}
    };
    
    // Load translations data.
    const translations = await this.getBibleVersions();
    for (const version of translations) {
      finalData.Translations[version.id] = [version.name, version.abbreviation, version.description, version.language];
    }

    // Load book data and categorize them into Old and New Testament.
    const books = this.getBooks();
    for (let book of books.OldTestament) {
      finalData.OldTestament[book] = {};
    }
    for (let book of books.NewTestament) {
      finalData.NewTestament[book] = {};
    }
    
    // Load book data for each book
    finalData = await this.addBookData(finalData);
    
    // Load chapter data for each book.
    for (let testament in finalData) {
      if (testament !== 'Translations') {
        for (let bookName in finalData[testament]) {
          const bookId = finalData[testament][bookName].id;
          const response = await fetch(`https://api.scripture.api.bible/v1/bibles/${this.BibleVersionID}/books/${bookId}/chapters`, {
            headers: {
              "API-Key": this.API_KEY,
            },
          });
          const data = await response.json();
          const chapters = data.data;
          for (let chapter of chapters) {
            // Add the chapter number and ID to the final data. Exclude intro chapters.
            if (chapter.number !== 'intro') {
              finalData[testament][bookName].chapters[chapter.number] = chapter.id;
            }
          }
        }
      }
    }
  
    // Cache the data in localStorage.
    localStorage.setItem("bibleData", JSON.stringify(finalData));
    return finalData;
  }

  LoadMockData() {
    return {
      OldTestament: {
         Genesis: {
          "id": "GEN",
          "abbreviation": "Gen",
          "name": "Genesis",
          "nameLong": "The First Book of Moses, called Genesis",
          "chapters" : {
            1: 31,
            2: 25,
            3: 24,
            4: 26,
            5: 32,
            6: 22,
            7: 24,
          },
        },
        Exodus: {
          "id": "EXO",
          "abbreviation": "Exo",
          "name": "Exodus",
          "nameLong": "The Second Book of Moses, called Exodus",
          "chapters" : {
            1: 22,
            2: 25,
            3: 22,
            4: 31,
            5: 23,
            6: 30,
            7: 25,
          }
        },
        Leviticus: {
          "id": "LEV",
          "abbreviation": "Lev",
          "name": "Leviticus",
          "nameLong": "The Third Book of Moses, called Leviticus",
          "chapters" : {
            1: 17,
            2: 16,
            3: 17,
            4: 35,
            5: 19,
            6: 30,
            7: 38,
          }
        },
        Numbers: {
          "id": "NUM",
          "abbreviation": "Num",
          "name": "Numbers",
          "nameLong": "The Fourth Book of Moses, called Numbers",
          "chapters" : {
            1: 54,
            2: 34,
            3: 51,
            4: 49,
            5: 31,
            6: 27,
            7: 89,
          }
        },
      },
      NewTestament: {
        Matthew: {
          "id": "MAT",
          "abbreviation": "Mat",
          "name": "Matthew",
          "nameLong": "The Gospel According to Matthew",
          "chapters" : {
            1: 25,
            2: 23,
            3: 17,
            4: 25,
            5: 48,
            6: 34,
            7: 29,
          }
        },
        Mark: {
          "id": "MRK",
          "abbreviation": "Mrk",
          "name": "Mark",
          "nameLong": "The Gospel According to Mark",
          "chapters" : {
            1: 45,
            2: 28,
            3: 35,
            4: 41,
            5: 43,
            6: 56,
            7: 37,
          }
        },
      },
      Translations: {
        "id1234": ["New International Version", "NIV", "Description of NIV", "English"],
        "id5678": ["King James Version", "KJV", "Description of KJV", "English"],
      }
    };
  }

  async populateTranslations() {
    const dropdowns = [document.getElementById('t-select-1'), document.getElementById('t-select-2'), document.getElementById('t-select-3')];

    // Check if translations are already in local storage
    const cachedTranslations = localStorage.getItem('translations');
    if (cachedTranslations) {
        const translations = JSON.parse(cachedTranslations);
        dropdowns.forEach(dropdown => {
            translations.forEach(translation => {
                const option = document.createElement('option');
                option.value = translation.id;
                option.textContent = translation.nameLong || translation.name;
                dropdown.appendChild(option);
            });
        });
        return;
    }

    try {
        // Fetch translations
        const response = await fetch('https://api.scripture.api.bible/v1/bibles', {
            headers: {
                'API-Key': this.API_KEY
            }
        });
        const data = await response.json();
        const translations = data.data;

        // Cache translations in local storage
        for (const translation of translations) {
            localStorage.setItem('translations', JSON.stringify(translations));
        }

        // Populate the dropdowns
        dropdowns.forEach(dropdown => {
            translations.forEach(translation => {
                const option = document.createElement('option');
                option.value = translation.id;
                option.textContent = translation.nameLong || translation.name;
                dropdown.appendChild(option);
            });
        });
      } catch (error) {
        console.error('Error fetching translations:', error);
        throw error;
      }
  }

  async fetchTranslationContent(bibleId, bookId, book, chapter, verse) {
    // Construct the passage ID
    const passageId = `${bookId}.${chapter}.${verse}`;

    const response = await fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/passages/${passageId}`, {
      headers: {
        'API-Key': this.API_KEY
      }
    });
    const data = await response.json();
    const passage = data.data;

    // Create the passage element
    const passageElement = document.createElement('div');
    passageElement.classList.add('passage');

    // Create the passage content
    const passageContent = document.createElement('div');
    passageContent.classList.add('passage-content');

    // If passage is undefined, verse for this translation is not available
    if (!passage) {
      passageContent.textContent = 'Verse not available for this translation.';
      passageElement.appendChild(passageContent);
      return passageElement;
    } else {
      // Otherwise, add the passage content
      passageContent.innerHTML = passage.content;
      passageElement.appendChild(passageContent);
      return passageElement;
    }
  }
}
