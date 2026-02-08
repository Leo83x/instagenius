import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircleHeart, Loader2, Sparkles, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SentimentResult {
  post_id: string;
  post_caption: string;
  total_comments: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  highlights: {
    best_comment: string;
    worst_comment: string;
    common_topics: string[];
  };
}

interface SentimentSummary {
  overall_sentiment: string;
  total_analyzed: number;
  average_positive: number;
  average_negative: number;
  average_neutral: number;
  recommendations: string[];
}

const COLORS = ["hsl(142, 76%, 46%)", "hsl(0, 84%, 60%)", "hsl(45, 93%, 47%)"];

export function SentimentAnalysis() {
  const [results, setResults] = useState<SentimentResult[]>([]);
  const [summary, setSummary] = useState<SentimentSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeSentiment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-sentiment");
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResults(data.results || []);
      setSummary(data.summary || null);
      toast.success("Sentiment analysis complete!");
    } catch (error: any) {
      console.error("Error analyzing sentiment:", error);
      toast.error(error.message || "Error analyzing sentiments");
    } finally {
      setLoading(false);
    }
  };

  const pieData = summary
    ? [
      { name: "Positive", value: summary.average_positive },
      { name: "Negative", value: summary.average_negative },
      { name: "Neutral", value: summary.average_neutral },
    ]
    : [];

  const sentimentIcon = (type: string) => {
    switch (type) {
      case "positive":
      case "Very Positive":
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="p-6 shadow-smooth">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircleHeart className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-display font-bold">Sentiment Analysis</h2>
        </div>
        <Button onClick={analyzeSentiment} disabled={loading} size="sm" variant="outline">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Comments
            </>
          )}
        </Button>
      </div>

      {summary && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {sentimentIcon(summary.overall_sentiment)}
              <span className="font-semibold">Overall Sentiment: {summary.overall_sentiment}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {summary.total_analyzed} comments analyzed
            </p>
            {summary.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {summary.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {results.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Details per Post</h3>
          {results.map((result, index) => (
            <div key={index} className="p-3 border rounded-lg space-y-2">
              <p className="text-sm font-medium line-clamp-1">{result.post_caption}</p>
              <div className="flex gap-3 text-xs">
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  👍 {result.sentiment.positive}%
                </Badge>
                <Badge variant="outline" className="bg-red-500/10 text-red-600">
                  👎 {result.sentiment.negative}%
                </Badge>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                  😐 {result.sentiment.neutral}%
                </Badge>
                <span className="text-muted-foreground">{result.total_comments} comments</span>
              </div>
              {result.highlights.common_topics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {result.highlights.common_topics.map((topic, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{topic}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !loading && !summary ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Click "Analyze Comments" to classify the sentiment of your posts' comments
        </p>
      ) : null}
    </Card>
  );
}
