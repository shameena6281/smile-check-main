import { SentimentDashboard } from "@/components/sentiment-dashboard";

export const metadata = {
  title: "Product Sentiment Analyzer",
  description:
    "Analyze customer reviews and understand product sentiment using AI-powered classification",
};

export default function Home() {
  return <SentimentDashboard />;
}
