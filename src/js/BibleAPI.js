export default class BibleAPI {
  constructor(apiKey) {
    this.API_KEY = apiKey;
    this.BASE_URL = "https://api.scripture.api.bible/v1/";
    this.TIMEOUT = 5000; // Set a timeout of 5 seconds (adjust as needed).
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

  async getBooks(bibleVersionID) {
    const endpoint = `/bibles/${bibleVersionID}/books`;
    const data = await this.makeRequest(endpoint);
    return data.map(({ name, id }) => ({ name, id }));
  }

  async getChapters(bibleVersionID, bibleBookID) {
    const endpoint = `/bibles/${bibleVersionID}/books/${bibleBookID}/chapters`;
    const data = await this.makeRequest(endpoint);
    return data.map(({ number, id }) => ({ number, id }));
  }

  async getVerses(bibleVersionID, bibleChapterID) {
    const endpoint = `/bibles/${bibleVersionID}/chapters/${bibleChapterID}/verses`;
    const data = await this.makeRequest(endpoint);
    return data.map(({ id }) => ({ id }));
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

  async LoadBibleData(bibleVersionID) {
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
          finalData[bookName][chapterNumber] = verses.map((verse) => verse.id);
        }
      }

      return finalData;
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      return {}; // Return an empty object or handle the error as needed.
    }
  }

  LoadMockData() {
    return {
      OldTestament: {
        Genesis: {
          1: 31,
          2: 25,
          3: 24,
          4: 26,
          5: 32,
          6: 22,
          7: 24,
        },
        Exodus: {
          1: 22,
          2: 25,
          3: 22,
          4: 31,
          5: 23,
          6: 30,
          7: 25,
        },
        Leviticus: {
          1: 17,
          2: 16,
          3: 17,
          4: 35,
          5: 19,
          6: 30,
          7: 38,
        },
        Numbers: {
          1: 54,
          2: 34,
          3: 51,
          4: 49,
          5: 31,
          6: 27,
          7: 89,
        },
        Deuteronomy: {
          1: 46,
          2: 37,
          3: 29,
          4: 49,
          5: 33,
          6: 25,
          7: 26,
        },
        Joshua: {
          1: 18,
          2: 24,
          3: 17,
          4: 24,
          5: 15,
          6: 27,
          7: 26,
        },
        Judges: {
          1: 36,
          2: 23,
          3: 31,
          4: 24,
          5: 31,
          6: 40,
          7: 25,
        },
        Ruth: {
          1: 22,
          2: 23,
          3: 18,
          4: 22,
        },
        "1 Samuel": {
          1: 28,
          2: 36,
          3: 21,
          4: 22,
          5: 12,
          6: 21,
          7: 17,
        },
        "2 Samuel": {
          1: 27,
          2: 32,
          3: 39,
          4: 12,
          5: 25,
          6: 23,
          7: 29,
        },
        "1 Kings": {
          1: 53,
          2: 46,
          3: 28,
          4: 34,
          5: 18,
          6: 38,
          7: 51,
        },
        "2 Kings": {
          1: 18,
          2: 25,
          3: 27,
          4: 44,
          5: 27,
          6: 33,
          7: 20,
        },
      },
      NewTestament: {
        Matthew: {
          1: 25,
          2: 23,
          3: 17,
          4: 25,
          5: 48,
          6: 34,
          7: 29,
        },
        Mark: {
          1: 45,
          2: 28,
          3: 35,
          4: 41,
          5: 43,
          6: 56,
          7: 37,
        },
        Luke: {
          1: 80,
          2: 52,
          3: 38,
          4: 44,
          5: 39,
          6: 49,
          7: 50,
        },
        John: {
          1: 51,
          2: 25,
          3: 36,
          4: 54,
          5: 47,
          6: 71,
          7: 53,
        },
        Acts: {
          1: 26,
          2: 47,
          3: 26,
          4: 37,
          5: 42,
          6: 15,
          7: 60,
        },
        Romans: {
          1: 32,
          2: 29,
          3: 31,
          4: 25,
          5: 21,
          6: 23,
          7: 25,
        },
      },
      Translations: ["NIV", "KJV", "ESV", "NLT", "MSG"],
    };
  }
}
