export default class BibleAPI {
  constructor() {
      this.API_KEY = 'd42753bd397e6f90fcaaa710a6dbfbdf';
  }

  async makeRequest(url) {
      return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.withCredentials = false;

          xhr.onreadystatechange = function() {
              if (this.readyState === this.DONE) {
                  if (this.status === 200) {
                      resolve(JSON.parse(this.responseText).data);
                  } else {
                      reject(new Error(this.statusText));
                  }
              }
          };

          xhr.open('GET', url);
          xhr.setRequestHeader('api-key', this.API_KEY);

          xhr.onerror = () => reject(new Error(xhr.statusText));

          xhr.send();
      });
  }

  async getBooks(bibleVersionID) {
      const url = `https://v2.api.bible/bibles/${bibleVersionID}/books`;
      const data = await this.makeRequest(url);
      return data.map(({ name, id }) => ({ name, id }));
  }

  async getChapters(bibleVersionID, bibleBookID) {
      const url = `https://v2.api.bible/bibles/${bibleVersionID}/books/${bibleBookID}/chapters`;
      const data = await this.makeRequest(url);
      return data.map(({ number, id }) => ({ number, id }));
  }

  async getVerses(bibleVersionID, bibleChapterID) {
      const url = `https://v2.api.bible/bibles/${bibleVersionID}/chapters/${bibleChapterID}/verses`;
      const data = await this.makeRequest(url);
      return data.map(({ id }) => ({ id }));
  }

  async getBibleVersions() {
      const url = 'https://v2.api.bible/bibles';
      const data = await this.makeRequest(url);
      return data.map(({ name, id, abbreviation, description, language }) => ({
          name, 
          id, 
          abbreviation, 
          description, 
          language: language.name
      }));
  }

  async getAllData(bibleVersionID) {
      const finalData = {};

      try {
          const books = await this.getBooks(bibleVersionID);
          
          for (let book of books) {
              const bookName = book.name;
              finalData[bookName] = {};

              const chapters = await this.getChapters(bibleVersionID, book.id);
              
              for (let chapter of chapters) {
                  const chapterNumber = chapter.number;

                  const verses = await this.getVerses(bibleVersionID, chapter.id);
                  finalData[bookName][chapterNumber] = verses.map(verse => verse.id);
              }
          }

          return finalData;
      } catch (error) {
          console.error("Error fetching Bible data:", error);
          throw error;
      }
  }
}
