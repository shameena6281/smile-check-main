"use client";

import { SentimentAnalysis } from "@/lib/sentiment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SentimentChartProps {
  analysis: SentimentAnalysis;
  isLoading?: boolean;
}

export function SentimentChart({
  analysis,
  isLoading = false,
}: SentimentChartProps) {
  const chartData = [
    {
      name: "Sentiment Distribution",
      Positive: analysis.positive,
      Negative: analysis.negative,
      Neutral: analysis.neutral,
    },
  ];

  const colors = {
    Positive: "#10b981",
    Negative: "#ef4444",
    Neutral: "#9ca3af",
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Positive" fill={colors.Positive} />
            <Bar dataKey="Negative" fill={colors.Negative} />
            <Bar dataKey="Neutral" fill={colors.Neutral} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
