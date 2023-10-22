import OpenAI from "openai";

export default class ChatAPI {
    /**
     * Creates an instance of the ChatAPI class.
     * @param {string} [apiKey] - The API key for OpenAI. Falls back to environment variable if not provided.
     */
    constructor(apiKey) {
        this.API_KEY = process.env.OPENAI_API_KEY || apiKey;
        this.openAI = new OpenAI({ apiKey: this.API_KEY });
    }

    /**
     * Fetches a response from OpenAI based on the given prompt.
     * @param {string} prompt - The user's message to be sent to OpenAI.
     * @returns {Promise<string>} The response from OpenAI.
     * @throws Will throw an error if the request to OpenAI fails.
     */
    async getResponse(prompt) {
        try {
            const response = await this.openAI.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You will be provided with verses from the Bible in three translations. Your job is to provide valuable insights about the nuances of the different translations."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 150,
                temperature: 0.4,
            });
            
            return response.choices[0].message.content;
        } catch (error) {
            console.error("Error fetching response from OpenAI:", error);
            throw new Error("Failed to fetch response from OpenAI");
        }
    }
}
