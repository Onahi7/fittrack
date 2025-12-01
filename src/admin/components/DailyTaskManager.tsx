import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, TrendingUp, Users, Target, Clock, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { adminApiService } from '@/admin/lib/adminApi';

interface Task {
  id: number;
  title: string;
  taskType: string;
  isRequired: boolean;
  totalParticipants: number;
  completedCount: number;
  engagementRate: number;
  points: number;
  createdAt: string;
  targetValue?: number;
  targetUnit?: string;
  exerciseType?: string;
  mealType?: string;
  fastingType?: string;
}

interface TaskCompletion {
  id: number;
  userId: string;
  actualValue?: number;
  notes?: string;
  points: number;
  completedDate: string;
  completionTime?: string;
  timeSpent?: number;
  userName?: string;
  userEmail?: string;
}

interface DailyTaskManagerProps {
  challengeId: number;
}

const DailyTaskManager = ({ challengeId }: DailyTaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    taskType: 'exercise',
    title: '',
    description: '',
    targetValue: '',
    targetUnit: 'minutes',
    exerciseType: '',
    mealType: '',
    fastingType: '',
    isRequired: true,
    points: '10',
    taskDate: new Date(),
  });

  useEffect(() => {
    fetchDailyTasks();
  }, [challengeId, selectedDate]);

  const fetchDailyTasks = async () => {
    try {
      setLoading(true);
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await adminApiService.challenges.getDailyTaskEngagement(challengeId, dateString);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch daily tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Task title is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await adminApiService.challenges.createDailyTask(challengeId, {
        ...formData,
        targetValue: formData.targetValue ? parseInt(formData.targetValue) : undefined,
        points: parseInt(formData.points),
        taskDate: formData.taskDate.toISOString().split('T')[0],
      });

      toast({
        title: 'Success',
        description: 'Daily task created successfully',
      });
      
      setCreateDialogOpen(false);
      setFormData({
        taskType: 'exercise',
        title: '',
        description: '',
        targetValue: '',
        targetUnit: 'minutes',
        exerciseType: '',
        mealType: '',
        fastingType: '',
        isRequired: true,
        points: '10',
        taskDate: new Date(),
      });
      
      fetchDailyTasks();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create daily task',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = async (task: Task) => {
    setSelectedTask(task);
    setDetailsLoading(true);
    
    try {
      const response = await adminApiService.challenges.getTaskCompletionDetails(task.id);
      setTaskCompletions(response.data);
    } catch (error) {
      console.error('Error fetching task details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch task details',
        variant: 'destructive',
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRefreshEngagement = async (taskId: number) => {
    try {
      await adminApiService.challenges.updateTaskEngagement(taskId);
      
      fetchDailyTasks();
      toast({
        title: 'Success',
        description: 'Engagement data refreshed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh engagement data',
        variant: 'destructive',
      });
    }
  };

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'exercise': return '🏋️';
      case 'meal': return '🍽️';
      case 'fasting': return '⏰';
      case 'sleep': return '💤';
      case 'water': return '💧';
      default: return '🎯';
    }
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    if (rate >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Task Management</h2>
          <p className="text-muted-foreground">Create and monitor daily tasks for challenge participants</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Daily Task
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Daily Task</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Task Type</Label>
                <Select 
                  value={formData.taskType} 
                  onValueChange={(value) => setFormData({...formData, taskType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exercise">🏋️ Exercise</SelectItem>
                    <SelectItem value="meal">🍽️ Meal</SelectItem>
                    <SelectItem value="fasting">⏰ Fasting</SelectItem>
                    <SelectItem value="sleep">💤 Sleep</SelectItem>
                    <SelectItem value="water">💧 Water</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Morning Cardio Workout"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the task..."
                />
              </div>
              
              {formData.taskType === 'exercise' && (
                <div>
                  <Label>Exercise Type</Label>
                  <Select 
                    value={formData.exerciseType} 
                    onValueChange={(value) => setFormData({...formData, exerciseType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="strength">Strength Training</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="walking">Walking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {formData.taskType === 'meal' && (
                <div>
                  <Label>Meal Type</Label>
                  <Select 
                    value={formData.mealType} 
                    onValueChange={(value) => setFormData({...formData, mealType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {formData.taskType === 'fasting' && (
                <div>
                  <Label>Fasting Type</Label>
                  <Select 
                    value={formData.fastingType} 
                    onValueChange={(value) => setFormData({...formData, fastingType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fasting type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:8">16:8 Intermittent</SelectItem>
                      <SelectItem value="18:6">18:6 Intermittent</SelectItem>
                      <SelectItem value="24h">24 Hour Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Value</Label>
                  <Input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                    placeholder="e.g., 30"
                  />
                </div>
                
                <div>
                  <Label>Unit</Label>
                  <Select 
                    value={formData.targetUnit} 
                    onValueChange={(value) => setFormData({...formData, targetUnit: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="reps">Reps</SelectItem>
                      <SelectItem value="calories">Calories</SelectItem>
                      <SelectItem value="glasses">Glasses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Points Reward</Label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({...formData, points: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Task Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.taskDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.taskDate ? format(formData.taskDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.taskDate}
                      onSelect={(date) => date && setFormData({...formData, taskDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button onClick={handleCreateTask} className="w-full">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-4">
        <Label>Select Date:</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {format(selectedDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-8">Loading tasks...</div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-2xl">{getTaskIcon(task.taskType)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <Badge variant={task.isRequired ? 'destructive' : 'secondary'}>
                        {task.isRequired ? 'Required' : 'Optional'}
                      </Badge>
                      <Badge variant="outline">{task.points} pts</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <Users className="w-4 h-4" />
                          Participants
                        </div>
                        <div className="font-semibold">{task.totalParticipants}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <Target className="w-4 h-4" />
                          Completed
                        </div>
                        <div className="font-semibold">{task.completedCount}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <TrendingUp className="w-4 h-4" />
                          Engagement
                        </div>
                        <div className={cn("font-semibold", getEngagementColor(task.engagementRate))}>
                          {task.engagementRate}%
                        </div>
                      </div>
                    </div>
                    
                    <Progress value={task.engagementRate} className="h-2 mb-4" />
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Created: {format(new Date(task.createdAt), "MMM d, yyyy 'at' HH:mm")}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefreshEngagement(task.id)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(task)}
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {tasks.length === 0 && (
            <Card className="p-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tasks for this date</h3>
              <p className="text-muted-foreground mb-4">Create a daily task to get started</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Task
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Task Details Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {getTaskIcon(selectedTask.taskType)} {selectedTask.title} - Completion Details
              </DialogTitle>
            </DialogHeader>
            
            {detailsLoading ? (
              <div className="text-center py-8">Loading completion details...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedTask.completedCount}</div>
                    <div className="text-sm text-muted-foreground">Completions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedTask.totalParticipants}</div>
                    <div className="text-sm text-muted-foreground">Participants</div>
                  </div>
                  <div className="text-center">
                    <div className={cn("text-2xl font-bold", getEngagementColor(selectedTask.engagementRate))}>
                      {selectedTask.engagementRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Engagement</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">User Completions</h4>
                  {taskCompletions.length > 0 ? (
                    taskCompletions.map((completion) => (
                      <Card key={completion.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{completion.userName || completion.userEmail}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(completion.completedDate), "MMM d, yyyy 'at' HH:mm")}
                            </div>
                            {completion.actualValue && (
                              <div className="text-sm">
                                Actual: {completion.actualValue} {selectedTask.targetUnit}
                              </div>
                            )}
                            {completion.notes && (
                              <div className="text-sm text-muted-foreground mt-1">
                                "{completion.notes}"
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary">+{completion.points} pts</Badge>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No completions yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DailyTaskManager;