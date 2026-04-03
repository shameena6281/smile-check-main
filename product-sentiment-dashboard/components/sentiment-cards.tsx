"use client";

import { SentimentAnalysis } from "@/lib/sentiment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface SentimentCardsProps {
  analysis: SentimentAnalysis;
  isLoading?: boolean;
}

export function SentimentCards({
  analysis,
  isLoading = false,
}: SentimentCardsProps) {
  const cards = [
    {
      title: "Positive",
      count: analysis.positive,
      percentage: analysis.positivePercentage.toFixed(1),
      icon: ThumbsUp,
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      textColor: "text-emerald-700 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      title: "Negative",
      count: analysis.negative,
      percentage: analysis.negativePercentage.toFixed(1),
      icon: ThumbsDown,
      bgColor: "bg-rose-50 dark:bg-rose-950",
      textColor: "text-rose-700 dark:text-rose-400",
      borderColor: "border-rose-200 dark:border-rose-800",
    },
    {
      title: "Neutral",
      count: analysis.neutral,
      percentage: analysis.neutralPercentage.toFixed(1),
      icon: Minus,
      bgColor: "bg-slate-50 dark:bg-slate-950",
      textColor: "text-slate-700 dark:text-slate-400",
      borderColor: "border-slate-200 dark:border-slate-800",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card, index) => (
          <Card
            key={index}
            className={`${card.borderColor} animate-pulse`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={`${card.borderColor} border-2 bg-white`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">
                  {card.title}
                </CardTitle>
                <div className={`${card.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${card.textColor}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">
                  {card.count}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.percentage}% of reviews
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
