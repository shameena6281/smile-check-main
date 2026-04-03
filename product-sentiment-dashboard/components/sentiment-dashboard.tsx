"use client";

import { useState } from "react";
import { Product } from "@/lib/data/products";
import { analyzeSentiments, SentimentAnalysis } from "@/lib/sentiment";
import { ProductSearch } from "./product-search";
import { SentimentCards } from "./sentiment-cards";
import { SentimentChart } from "./sentiment-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface SentimentDashboardProps { }

export function SentimentDashboard({ }: SentimentDashboardProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!selectedProduct) return;

    setIsLoading(true);

    setTimeout(() => {
      const sentimentAnalysis = analyzeSentiments(selectedProduct.reviews);
      setAnalysis(sentimentAnalysis);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Product Sentiment Analyzer
          </h1>
          <p className="text-lg text-muted-foreground">
            Analyze customer reviews and understand product sentiment
          </p>
        </div>

        {/* Selection Card */}
        <Card className="border-2 bg-white">
          <CardHeader>
            <CardTitle className="text-foreground">Select a Product</CardTitle>
            <CardDescription>
              Choose a product to analyze customer reviews and sentiment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProductSearch
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              isLoading={isLoading}
            />
            <Button
              onClick={handleAnalyze}
              disabled={!selectedProduct || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                "Analyze Reviews"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {analysis && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Product Info */}
            <div className="rounded-lg p-6 border-2 bg-white">
              <h2 className="text-2xl font-semibold mb-2 text-foreground">
                {selectedProduct?.name}
              </h2>
              <p className="text-muted-foreground">
                Analyzed {analysis.total} customer reviews
              </p>
            </div>

            {/* Sentiment Cards */}
            <SentimentCards analysis={analysis} isLoading={isLoading} />

            {/* Chart */}
            <SentimentChart analysis={analysis} isLoading={isLoading} />

            {/* Summary Card */}
            <Card className="border-2 bg-white">
              <CardHeader>
                <CardTitle className="text-foreground">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <span className="text-muted-foreground">Sentiment Score</span>
                    <span className="text-xl font-semibold text-foreground">
                      {(
                        (analysis.positive / analysis.total) * 100 -
                        (analysis.negative / analysis.total) * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b">
                    <span className="text-muted-foreground">Total Reviews</span>
                    <span className="text-xl font-semibold text-foreground">
                      {analysis.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Overall Sentiment
                    </span>
                    <span
                      className={`text-lg font-semibold px-3 py-1 rounded-full ${analysis.positive > analysis.negative
                          ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400"
                          : analysis.negative > analysis.positive
                            ? "bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-400"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400"
                        }`}
                    >
                      {analysis.positive > analysis.negative
                        ? "Positive"
                        : analysis.negative > analysis.positive
                          ? "Negative"
                          : "Neutral"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !isLoading && (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-12">
              <div className="text-center space-y-3">
                <div className="text-4xl">📊</div>
                <h3 className="text-lg font-semibold text-foreground">
                  No Analysis Yet
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Select a product and click "Analyze Reviews" to see sentiment
                  breakdown and visualizations
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
