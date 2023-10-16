export default class BibleAPI {
  constructor(apiKey) {
    this.API_KEY = apiKey;
    this.BASE_URL = "https://api.scripture.api.bible/v1/";
    this.TIMEOUT = 5000; // Set a timeout of 5 seconds (adjust as needed).
    this.BibleVersionID = "de4e12af7f28f599-02"
  }

  async makeRequest(endpoint) {
    const url = new URL(endpoint, this.BASE_URL);

    try {
      const response = await Promise.race([
        fetch(url.toString(), {
          headers: {
            "api-key": this.API_KEY,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), this.TIMEOUT)
        ),
      ]);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error making request:", error);
      throw error;
    }
  }

  getBooks() {
    const Bible_Books = {
      OldTestament: [
        "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalm", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"
      ],
      NewTestament: [
        "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Phillipians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
      ]
    }
    return Bible_Books;
  }

  async addBookData(Bible_Books) {
    // Endpoint to fetch book details
    const endpoint = `/bibles/${this.BibleVersionID}/books`;
  
    try {
      const response = await this.makeRequest(endpoint);
      const apiBooks = response.data; // Get the 'data' field from the response.
  
      // Iterate over all books returned from the API
      for (const apiBook of apiBooks) {
        // Check if the book is in the Old Testament or New Testament
        const testament = Bible_Books.OldTestament.includes(apiBook.name) ? 'OldTestament' : 'NewTestament';
  
        if (Bible_Books[testament].includes(apiBook.name)) {
          // Add book details to the book
          Bible_Books[testament][apiBook.name] = {
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

  async getChapters(bibleBookID) {
      const endpoint = `/bibles/${this.BibleVersionID}/books/${bibleBookID}/chapters`;
      const data = await this.makeRequest(endpoint);
      // Filter out the intro or other non-numbered chapters.
      return data.data.filter(chapter => chapter.number !== 'intro').map(({ number, id }) => ({ number, id }));
  }

  async getVerses(bibleChapterID) {
      const endpoint = `/bibles/${this.BibleVersionID}/chapters/${bibleChapterID}/verses`;
      const data = await this.makeRequest(endpoint);
      return data.data.map(({ id }) => ({ id }));
  }


  async getBibleVersions() {
    const endpoint = "/bibles";
    const data = await this.makeRequest(endpoint);
    return data.map(({ name, id, abbreviation, description, language }) => ({
      name,
      id,
      abbreviation,
      description,
      language: language.name,
    }));
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

    try {
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
  
      // Load chapter and verse data for each book.
      for (let testament in finalData) {
        if (testament !== 'Translations') {
          for (let bookName in finalData[testament]) {
            const chapters = await this.getChapters(finalData[testament][bookName].id);
            for (let chapter of chapters.data) {
              const verses = await this.getVerses(chapter.id);
              finalData[testament][bookName].chapters[chapter.number] = verses.data.length;
            }
          }
        }
      }
  
      // Cache the data in localStorage.
      localStorage.setItem("bibleData", JSON.stringify(finalData));
  
      return finalData;
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      return {
        OldTestament: {},
        NewTestament: {},
        Translations: {},
      }; // Return an empty data structure or handle the error as needed.
    }
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

    try {
        const response = await fetch('https://api.scripture.api.bible/v1/bibles', {
            headers: {
                'API-Key': this.API_KEY
            }
        });
        const data = await response.json();
        const translations = data.data;

        dropdowns.forEach(dropdown => {
            translations.forEach(translation => {
                const option = document.createElement('option');
                option.value = translation.id;
                option.textContent = translation.nameLong || translation.name;
                dropdown.appendChild(option);
            });
        });

        // Change the selections to stored values if they exist
        const storedBibleIds = JSON.parse(localStorage.getItem('selectedBibleIds'));
        if (storedBibleIds) {
            dropdowns.forEach((dropdown, index) => {
                dropdown.value = storedBibleIds[index];
            });
        }
    } catch (error) {
        console.error("Error fetching Bible translations:", error);
    }
}



async fetchVerseContent(bibleId, book, chapter, verse) {

  const response = await fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/books/${book}/chapters/${chapter}/verses`);
  const data = await response.json();
  const verseData = data.data.find(v => v.reference === `${book} ${chapter}:${verse}`);
  return verseData ? verseData.content : 'Verse not found';
}

}
