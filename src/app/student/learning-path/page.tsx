"use client";

import { useEffect, useState } from 'react';
import StudentLayout from '@/components/student/StudentLayout';
import {
  Target,
  CheckCircle2,
  Circle,
  Lock,
  TrendingUp,
  Award,
  BookOpen,
  ChevronRight,
  Lightbulb
} from 'lucide-react';

interface LearningStage {
  id: string;
  title: string;
  slug: string;
  goal: string;
  skills: string[];
  basicTargets: Array<{
    title: string;
    description: string;
    completed: boolean;
  }>;
  advancedTargets: Array<{
    title: string;
    description: string;
    completed: boolean;
  }>;
  reflectionPrompt?: string;
  order: number;
  isActive: boolean;
  progress: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export default function LearningPathPage() {
  const [stages, setStages] = useState<LearningStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<LearningStage | null>(null);

  useEffect(() => {
    fetchLearningPath();
  }, []);

  const fetchLearningPath = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/roadmap/stages');
      
      if (!response.ok) {
        throw new Error('Failed to fetch learning path');
      }

      const data = await response.json();
      
      // Transform data and calculate progress
      const transformedStages: LearningStage[] = data.stages?.map((stage: {
        id: string;
        title: string;
        slug: string;
        goal: string;
        skills: string[];
        basicTargets: Array<{ title: string; description: string; completed: boolean }>;
        advancedTargets: Array<{ title: string; description: string; completed: boolean }>;
        reflectionPrompt?: string;
        order: number;
        isActive: boolean;
      }, index: number) => {
        const basicCompleted = stage.basicTargets?.filter((t: { completed: boolean }) => t.completed).length || 0;
        const advancedCompleted = stage.advancedTargets?.filter((t: { completed: boolean }) => t.completed).length || 0;
        const totalTargets = (stage.basicTargets?.length || 0) + (stage.advancedTargets?.length || 0);
        const completedTargets = basicCompleted + advancedCompleted;
        
        const progress = totalTargets > 0 ? Math.round((completedTargets / totalTargets) * 100) : 0;
        const isCompleted = progress === 100;
        
        // First stage is always unlocked, others unlock when previous is completed
        const isUnlocked = index === 0 || (index > 0 && data.stages[index - 1]?.progress === 100);

        return {
          ...stage,
          progress,
          isCompleted,
          isUnlocked
        };
      }) || [];

      setStages(transformedStages);
      
      // Auto-select first unlocked incomplete stage
      const firstIncomplete = transformedStages.find(s => s.isUnlocked && !s.isCompleted);
      if (firstIncomplete) {
        setSelectedStage(firstIncomplete);
      } else if (transformedStages.length > 0) {
        setSelectedStage(transformedStages[0]);
      }

    } catch (error) {
      console.error('Error fetching learning path:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStageStatus = (stage: LearningStage) => {
    if (!stage.isUnlocked) return 'locked';
    if (stage.isCompleted) return 'completed';
    if (stage.progress > 0) return 'in-progress';
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'available': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'locked': return 'bg-gray-50 text-gray-400 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress': return <Circle className="w-5 h-5 text-blue-600 fill-blue-200" />;
      case 'available': return <Circle className="w-5 h-5 text-gray-400" />;
      case 'locked': return <Lock className="w-5 h-5 text-gray-400" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <StudentLayout loading={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading learning path...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Learning Path</h1>
            </div>
            <p className="text-gray-600">
              Jalur pembelajaran Web Development yang terstruktur - dari dasar hingga mahir
            </p>
          </div>

          {/* Overall Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Overall Progress</h2>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                {stages.filter(s => s.isCompleted).length} / {stages.length} Stages Completed
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${stages.length > 0 ? Math.round((stages.filter(s => s.isCompleted).length / stages.length) * 100) : 0}%`
              }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Keep learning!</span>
            <span className="font-medium">
              {stages.length > 0 ? Math.round((stages.filter(s => s.isCompleted).length / stages.length) * 100) : 0}% Complete
            </span>
          </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
                <h3 className="text-white font-semibold">Learning Stages</h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                {stages.map((stage) => {
                  const status = getStageStatus(stage);
                  const isSelected = selectedStage?.id === stage.id;

                  return (
                    <button
                      key={stage.id}
                      onClick={() => stage.isUnlocked && setSelectedStage(stage)}
                      disabled={!stage.isUnlocked}
                      className={`w-full p-4 text-left transition-all hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      } ${!stage.isUnlocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium mb-1 ${
                            !stage.isUnlocked ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {stage.title}
                          </h4>
                          
                          {stage.isUnlocked && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  stage.isCompleted ? 'bg-green-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${stage.progress}%` }}
                              />
                            </div>
                          )}
                          
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${getStatusColor(status)}`}>
                            {status === 'locked' && '🔒 Locked'}
                            {status === 'available' && '📚 Available'}
                            {status === 'in-progress' && `⚡ ${stage.progress}%`}
                            {status === 'completed' && '✅ Completed'}
                          </span>
                        </div>

                        {isSelected && (
                          <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stage Details */}
          <div className="lg:col-span-2">
            {selectedStage ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Stage Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedStage.title}</h2>
                      <p className="text-blue-100">{selectedStage.goal}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{selectedStage.progress}%</div>
                      <div className="text-sm text-blue-100">Progress</div>
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedStage.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Targets */}
                <div className="p-6 space-y-6">
                  {/* Basic Targets */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Basic Targets
                    </h3>
                    <div className="space-y-3">
                      {selectedStage.basicTargets.map((target, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            target.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {target.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium mb-1 ${
                                target.completed ? 'text-green-900' : 'text-gray-900'
                              }`}>
                                {target.title}
                              </h4>
                              <p className="text-sm text-gray-600">{target.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Targets */}
                  {selectedStage.advancedTargets.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        Advanced Targets (Bonus)
                      </h3>
                      <div className="space-y-3">
                        {selectedStage.advancedTargets.map((target, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              target.completed
                                ? 'bg-purple-50 border-purple-200'
                                : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {target.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-medium mb-1 ${
                                  target.completed ? 'text-purple-900' : 'text-gray-900'
                                }`}>
                                  {target.title}
                                </h4>
                                <p className="text-sm text-gray-600">{target.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reflection Prompt */}
                  {selectedStage.reflectionPrompt && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-medium text-yellow-900 mb-1">Reflection</h4>
                          <p className="text-sm text-yellow-800">{selectedStage.reflectionPrompt}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Stage</h3>
                <p className="text-gray-600">Choose a learning stage to view details and track your progress</p>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}