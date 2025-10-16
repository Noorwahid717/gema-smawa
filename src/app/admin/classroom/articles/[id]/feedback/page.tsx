"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  MessageCircle, 
  Star,
  User,
  TrendingUp,
  BarChart3,
  Award
} from "lucide-react";

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string;
  challenge: string;
  timestamp: string;
  studentName: string;
  studentClass: string;
  timeAgo: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  views: number;
  totalFeedback: number;
  averageRating: number;
}

export default function AdminArticleFeedbackPage() {
  const params = useParams();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticleAndFeedback = useCallback(async () => {
    try {
      // Fetch article details
      const articleResponse = await fetch(`/api/classroom/articles/${articleId}`);
      if (articleResponse.ok) {
        const articleData = await articleResponse.json();
        if (articleData.success) {
          setArticle(articleData.data);
        }
      }

      // Fetch feedback
      const feedbackResponse = await fetch(`/api/classroom/feedback?articleId=${articleId}`);
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        if (feedbackData.success) {
          setFeedback(feedbackData.data.feedback || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    if (articleId) {
      fetchArticleAndFeedback();
    }
  }, [articleId, fetchArticleAndFeedback]);

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 stars
    feedback.forEach(item => {
      distribution[item.rating - 1]++;
    });
    return distribution;
  };

  const getAverageRating = () => {
    if (feedback.length === 0) return 0;
    const total = feedback.reduce((sum, item) => sum + item.rating, 0);
    return (total / feedback.length).toFixed(1);
  };

  const getChallengeStats = () => {
    const challenges: { [key: string]: number } = {};
    feedback.forEach(item => {
      if (item.challenge) {
        challenges[item.challenge] = (challenges[item.challenge] || 0) + 1;
      }
    });
    return Object.entries(challenges)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Artikel tidak ditemukan.'}</p>
          <Link 
            href="/admin/classroom/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Articles
          </Link>
        </div>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();
  const challengeStats = getChallengeStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/classroom/articles"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Articles
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-800">Article Feedback</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Article Info */}
        <div className="bg-white rounded-lg shadow-sm border mb-8 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{article.title}</h2>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {article.views} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {feedback.length} feedback
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {getAverageRating()} rating
                </span>
              </div>
            </div>
            <Link
              href={`/classroom/articles/${article.slug}`}
              target="_blank"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              View Article
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Statistics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Rating Distribution */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Rating Distribution</h3>
              </div>
              
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = ratingDistribution[rating - 1];
                  const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
                  
                  const widthClass = percentage === 0 ? 'w-0' :
                    percentage <= 5 ? 'w-1' :
                    percentage <= 10 ? 'w-2' :
                    percentage <= 15 ? 'w-3' :
                    percentage <= 20 ? 'w-4' :
                    percentage <= 25 ? 'w-5' :
                    percentage <= 30 ? 'w-6' :
                    percentage <= 40 ? 'w-8' :
                    percentage <= 50 ? 'w-1/2' :
                    percentage <= 60 ? 'w-3/5' :
                    percentage <= 70 ? 'w-2/3' :
                    percentage <= 80 ? 'w-4/5' :
                    percentage <= 90 ? 'w-5/6' : 'w-full';

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                        <div className={`bg-yellow-400 h-2 rounded-full transition-all duration-300 ${widthClass}`}></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Average Rating:</span>
                  <span className="font-bold text-lg text-yellow-600">{getAverageRating()}/5</span>
                </div>
              </div>
            </div>

            {/* Challenge Stats */}
            {challengeStats.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-800">Most Challenging Parts</h3>
                </div>
                
                <div className="space-y-3">
                  {challengeStats.map(([challenge, count]) => (
                    <div key={challenge} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate flex-1">{challenge}</span>
                      <span className="text-sm font-medium text-orange-600 ml-2">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feedback List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-800">Student Feedback ({feedback.length})</h3>
                </div>
              </div>

              <div className="p-6">
                {feedback.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-500 mb-2">No Feedback Yet</h4>
                    <p className="text-gray-400">Students haven&apos;t provided feedback for this article.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {feedback.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-blue-600">
                                {item.studentName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {item.studentName}
                                {item.studentClass && (
                                  <span className="text-sm text-gray-500 ml-2">- {item.studentClass}</span>
                                )}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${
                                        i < item.rating 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {item.timeAgo}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {item.comment && (
                          <div className="mb-3">
                            <p className="text-gray-700 leading-relaxed">&ldquo;{item.comment}&rdquo;</p>
                          </div>
                        )}

                        {item.challenge && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Award className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">Most Challenging Part:</span>
                            </div>
                            <p className="text-sm text-orange-700">{item.challenge}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}