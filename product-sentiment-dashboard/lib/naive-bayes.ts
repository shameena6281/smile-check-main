export type Category = "positive" | "negative" | "neutral";

interface DocumentCounts {
  [category: string]: number;
}

interface WordFrequencies {
  [category: string]: {
    [word: string]: number;
  };
}

export class NaiveBayesClassifier {
  private vocabulary: Set<string>;
  private documentCounts: DocumentCounts;
  private wordFrequencies: WordFrequencies;
  private totalDocuments: number;

  constructor() {
    this.vocabulary = new Set<string>();
    this.totalDocuments = 0;
    
    // Initialize counting structures for our three categories
    this.documentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    this.wordFrequencies = {
      positive: {},
      negative: {},
      neutral: {},
    };
  }

  /**
   * Cleans and tokenizes text into an array of lowercase words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "") // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter((word) => word.length > 0); // Remove empty strings
  }

  /**
   * Trains the model with a given text and its known category
   */
  public train(text: string, category: Category): void {
    const words = this.tokenize(text);
    
    this.totalDocuments++;
    this.documentCounts[category]++;

    words.forEach((word) => {
      // Add word to general vocabulary
      this.vocabulary.add(word);

      // Increment frequency of this word for the specific category
      if (!this.wordFrequencies[category][word]) {
        this.wordFrequencies[category][word] = 0;
      }
      this.wordFrequencies[category][word]++;
    });
  }

  /**
   * Calculates the probability of a word given a category using Laplace Smoothing
   * P(word|category) = (count(word in category) + 1) / (total words in category + |Vocabulary|)
   */
  private getWordProbability(word: string, category: Category): number {
    const wordCountInCategory = this.wordFrequencies[category][word] || 0;
    
    // Calculate total words in this category
    const totalWordsInCategory = Object.values(this.wordFrequencies[category]).reduce(
      (sum, count) => sum + count,
      0
    );

    // Add 1 for Laplace smoothing (prevents probability of 0 for unknown words)
    return (wordCountInCategory + 1) / (totalWordsInCategory + this.vocabulary.size);
  }

  /**
   * Predicts the most likely category for a given text
   */
  public predict(text: string): { category: Category; confidence: number } {
    // If we haven't trained yet, default to neutral
    if (this.totalDocuments === 0) {
      return { category: "neutral", confidence: 0.5 };
    }

    const words = this.tokenize(text);
    const categories: Category[] = ["positive", "negative", "neutral"];
    let bestCategory: Category = "neutral";
    let maxLogProbability = -Infinity;
    
    // Store scores to calculate confidence later
    const scores: { [key in Category]?: number } = {};

    categories.forEach((category) => {
      // Calculate Prior Probability P(Category)
      // Using log prevents underflow when multiplying very small probabilities
      let logProbability = Math.log(
        (this.documentCounts[category] + 1) / (this.totalDocuments + categories.length)
      );

      // Add log probabilities of each word
      // P(Document|Category) = P(word1|Category) * P(word2|Category) ...
      words.forEach((word) => {
        logProbability += Math.log(this.getWordProbability(word, category));
      });

      scores[category] = logProbability;

      if (logProbability > maxLogProbability) {
        maxLogProbability = logProbability;
        bestCategory = category;
      }
    });

    // Approximate confidence score based on the difference between the top two probabilities
    // (This is a simplistic heuristic for the UI, as true probability requires normalization)
    const sortedScores = Object.values(scores).sort((a, b) => b - a);
    const difference = Math.abs(sortedScores[0] - sortedScores[1]);
    
    // Normalize difference to a 0-1 scale (roughly)
    let confidence = 0.5 + Math.min(difference / 10, 0.49);

    return {
      category: bestCategory,
      confidence: confidence,
    };
  }
}
