import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Target, CheckCircle2, Circle, Play, Dumbbell, Utensils, Moon, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { PageTransition } from '@/components/animations/PageTransition';

interface Task {
  id: number;
  taskType: string;
  title: string;
  description?: string;
  targetValue?: number;
  targetUnit?: string;
  exerciseType?: string;
  mealType?: string;
  fastingType?: string;
  isRequired: boolean;
  points: number;
  dayOfChallenge?: number;
}

interface TaskCompletion {
  id: number;
  taskId: number;
  actualValue?: number;
  notes?: string;
  points: number;
  isCompleted: boolean;
  completedDate: string;
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  goal: number;
  duration: number;
  startDate: string;
  endDate: string;
}

const ChallengeDaily = () => {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completionData, setCompletionData] = useState({
    actualValue: '',
    notes: '',
  });
  const [currentDay, setCurrentDay] = useState(1);

  const fetchChallengeData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [challengeRes, tasksRes, completionsRes] = await Promise.all([
        api.challenges.getById(Number(id)),
        api.challenges.getTasks(Number(id), currentDay),
        api.challenges.getMyCompletions(Number(id)),
      ]);

      setChallenge(challengeRes.data);
      setTasks(tasksRes.data || []);
      setCompletions(completionsRes.data || []);
    } catch (error) {
      console.error('Error fetching challenge data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load challenge data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, currentDay]);

  useEffect(() => {
    fetchChallengeData();
  }, [fetchChallengeData]);

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    try {
      await api.challenges.completeTask(Number(id), selectedTask.id, {
        actualValue: completionData.actualValue ? Number(completionData.actualValue) : undefined,
        notes: completionData.notes || undefined,
      });

      toast({
        title: 'Task Completed!',
        description: `+${selectedTask.points} points earned`,
      });

      setSelectedTask(null);
      setCompletionData({ actualValue: '', notes: '' });
      fetchChallengeData();
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete task',
        variant: 'destructive',
      });
    }
  };

  const handleActivateFasting = async (fastingType: string) => {
    try {
      await api.challenges.activateFasting(Number(id), fastingType);
      toast({
        title: 'Fasting Timer Activated!',
        description: `Started ${fastingType} fasting timer`,
      });
      
      // Navigate to fasting timer page
      window.location.href = '/fasting-timer';
    } catch (error) {
      console.error('Error activating fasting timer:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate fasting timer',
        variant: 'destructive',
      });
    }
  };

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'exercise': return <Dumbbell className="w-5 h-5" />;
      case 'meal': return <Utensils className="w-5 h-5" />;
      case 'fasting': return <Clock className="w-5 h-5" />;
      case 'sleep': return <Moon className="w-5 h-5" />;
      case 'water': return <Droplets className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getTaskColor = (taskType: string) => {
    switch (taskType) {
      case 'exercise': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'meal': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'fasting': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'sleep': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      case 'water': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const isTaskCompleted = (taskId: number) => {
    return completions.some(c => c.taskId === taskId && c.isCompleted);
  };

  const getTotalPoints = () => {
    return completions.reduce((sum, completion) => sum + completion.points, 0);
  };

  const getProgressPercentage = () => {
    if (!challenge?.goal) return 0;
    return Math.min((getTotalPoints() / challenge.goal) * 100, 100);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-card rounded-2xl w-1/3" />
            <div className="h-32 bg-card rounded-2xl" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-card rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <Link to="/challenges">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{challenge?.name}</h1>
            <p className="text-muted-foreground">{challenge?.description}</p>
          </div>

          {/* Progress Card */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Day {currentDay} Progress</p>
                <p className="text-2xl font-bold">{getTotalPoints()} / {challenge?.goal} pts</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Challenge Progress</p>
                <p className="text-lg font-semibold">{Math.round(getProgressPercentage())}%</p>
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-3" />
          </Card>

          {/* Day Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {Array.from({ length: challenge?.duration || 30 }, (_, i) => (
              <Button
                key={i}
                variant={currentDay === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentDay(i + 1)}
                className="min-w-[60px]"
              >
                Day {i + 1}
              </Button>
            ))}
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="px-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Today's Tasks</h2>
          
          {tasks.map((task) => {
            const completed = isTaskCompleted(task.id);
            const colorClasses = getTaskColor(task.taskType);
            
            return (
              <Card key={task.id} className={`p-4 border-2 ${completed ? 'border-green-500/30 bg-green-500/5' : 'border-border'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-xl ${colorClasses}`}>
                      {getTaskIcon(task.taskType)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {task.points} pts
                        </Badge>
                        {task.isRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {task.targetValue && (
                          <span>Target: {task.targetValue} {task.targetUnit}</span>
                        )}
                        {task.exerciseType && (
                          <span>Type: {task.exerciseType}</span>
                        )}
                        {task.mealType && (
                          <span>Meal: {task.mealType}</span>
                        )}
                        {task.fastingType && (
                          <span>Fasting: {task.fastingType}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <>
                        {task.taskType === 'fasting' && task.fastingType && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateFasting(task.fastingType!)}
                            className="flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Start Timer
                          </Button>
                        )}
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedTask(task)}
                            >
                              <Circle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          </DialogTrigger>
                          
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Complete Task: {task.title}</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {task.targetValue && (
                                <div>
                                  <Label>Actual Value ({task.targetUnit})</Label>
                                  <Input
                                    type="number"
                                    value={completionData.actualValue}
                                    onChange={(e) => setCompletionData({
                                      ...completionData,
                                      actualValue: e.target.value
                                    })}
                                    placeholder={`Target: ${task.targetValue}`}
                                  />
                                </div>
                              )}
                              
                              <div>
                                <Label>Notes (Optional)</Label>
                                <Textarea
                                  value={completionData.notes}
                                  onChange={(e) => setCompletionData({
                                    ...completionData,
                                    notes: e.target.value
                                  })}
                                  placeholder="How did it go?"
                                />
                              </div>
                              
                              <Button onClick={handleCompleteTask} className="w-full">
                                Complete Task (+{task.points} points)
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          
          {tasks.length === 0 && (
            <Card className="p-8 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No tasks for today</p>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ChallengeDaily;