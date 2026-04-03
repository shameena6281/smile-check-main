import { NaiveBayesClassifier, Category } from "./naive-bayes";

export type SentimentType = Category;

export interface SentimentResult {
  type: SentimentType;
  confidence: number;
}

export interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
}

const positiveWords = [
  "excellent",
  "amazing",
  "fantastic",
  "great",
  "love",
  "best",
  "perfect",
  "wonderful",
  "outstanding",
  "incredible",
  "awesome",
  "brilliant",
  "good",
  "nice",
  "beautiful",
  "satisfied",
  "happy",
  "recommend",
  "worth",
  "quality",
  "reliable",
  "smooth",
  "fast",
  "comfortable",
  "stylish",
  "durable",
  "impressive",
  "professional",
  "useful",
  "efficient",
];

const negativeWords = [
  "terrible",
  "horrible",
  "bad",
  "awful",
  "hate",
  "worst",
  "disappointing",
  "poor",
  "broken",
  "useless",
  "cheap",
  "defective",
  "uncomfortable",
  "slow",
  "fragile",
  "waste",
  "unreliable",
  "faulty",
  "failed",
  "issue",
  "problem",
  "bug",
  "crash",
  "fail",
  "sucks",
  "garbage",
  "rubbish",
  "overpriced",
  "scam",
  "regret",
];

const negationWords = [
  "not",
  "no",
  "never",
  "barely",
  "hardly",
  "scarcely",
];

// Initialize and pre-train the Naive Bayes Classifier
const classifier = new NaiveBayesClassifier();

// Helper to pre-train the model with basic vocabulary
function initializeModel() {
  // Train positive words
  positiveWords.forEach((word) => {
    classifier.train(word, "positive");
    // Add some context sentence training
    classifier.train(`this is ${word}`, "positive");
    classifier.train(`very ${word}`, "positive");
  });

  // Train negative words
  negativeWords.forEach((word) => {
    classifier.train(word, "negative");
    // Add some context sentence training
    classifier.train(`this is ${word}`, "negative");
    classifier.train(`very ${word}`, "negative");
  });

  // Train some explicit negation handling
  classifier.train("not good", "negative");
  classifier.train("not great", "negative");
  classifier.train("not bad", "positive");
  classifier.train("not terrible", "positive");
  
  // Train neutral context
  classifier.train("it is okay", "neutral");
  classifier.train("average", "neutral");
  classifier.train("normal", "neutral");
  classifier.train("fine", "neutral");
  classifier.train("standard", "neutral");
}

// Run the initialization
initializeModel();

export function classifySentiment(text: string): SentimentResult {
  const prediction = classifier.predict(text);
  
  return {
    type: prediction.category,
    confidence: prediction.confidence,
  };
}

export function analyzeSentiments(texts: string[]): SentimentAnalysis {
  const results = texts.map(classifySentiment);

  const counts = {
    positive: results.filter((r) => r.type === "positive").length,
    negative: results.filter((r) => r.type === "negative").length,
    neutral: results.filter((r) => r.type === "neutral").length,
  };

  const total = texts.length;

  return {
    positive: counts.positive,
    negative: counts.negative,
    neutral: counts.neutral,
    total,
    positivePercentage: (counts.positive / total) * 100,
    negativePercentage: (counts.negative / total) * 100,
    neutralPercentage: (counts.neutral / total) * 100,
  };
}
