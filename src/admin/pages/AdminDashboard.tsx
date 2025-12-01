import { useEffect, useState } from 'react';
import { adminApiService } from '../lib/adminApi';
import { Users, UtensilsCrossed, BookOpen, Droplet, TrendingUp, Activity, Plus, Crown, Calendar, Target, Clock, Dumbbell, Utensils, Moon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import DailyTaskManager from '@/admin/components/DailyTaskManager';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMeals: number;
  totalJournals: number;
  totalWaterGlasses: number;
  userGrowth: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMeals: 0,
    totalJournals: 0,
    totalWaterGlasses: 0,
    userGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [creatingChallenge, setCreatingChallenge] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    name: '',
    description: '',
    type: 'dynamic',
    goal: 100,
    duration: 30,
    startDate: new Date().toISOString().split('T')[0],
    imageUrl: '',
    isPremiumChallenge: false,
    requiresSubscription: false,
    subscriptionTier: 'basic',
    gift30Days: false,
    hasDynamicTasks: true,
  });
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [currentTask, setCurrentTask] = useState({
    taskType: 'exercise',
    title: '',
    description: '',
    targetValue: 30,
    targetUnit: 'minutes',
    exerciseType: 'cardio',
    mealType: 'breakfast',
    fastingType: '16:8',
    isRequired: true,
    points: 1,
    dayOfChallenge: null as number | null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    try {
      setCreatingChallenge(true);
      await api.challenges.createAdminChallenge({
        ...challengeForm,
        goal: Number(challengeForm.goal),
        duration: Number(challengeForm.duration),
        dailyTasks: challengeForm.hasDynamicTasks ? dailyTasks : undefined,
      });
      
      toast({
        title: "Challenge Created!",
        description: challengeForm.isPremiumChallenge 
          ? "Premium challenge with dynamic tasks created successfully!"
          : `Challenge created with ${dailyTasks.length} daily tasks.`,
      });
      
      setChallengeDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create challenge:', error);
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingChallenge(false);
    }
  };

  const resetForm = () => {
    setChallengeForm({
      name: '',
      description: '',
      type: 'dynamic',
      goal: 100,
      duration: 30,
      startDate: new Date().toISOString().split('T')[0],
      imageUrl: '',
      isPremiumChallenge: false,
      requiresSubscription: false,
      subscriptionTier: 'basic',
      gift30Days: false,
      hasDynamicTasks: true,
    });
    setDailyTasks([]);
  };

  const addTask = () => {
    if (!currentTask.title) return;
    setDailyTasks([...dailyTasks, { ...currentTask, id: Date.now() }]);
    setCurrentTask({
      taskType: 'exercise',
      title: '',
      description: '',
      targetValue: 30,
      targetUnit: 'minutes',
      exerciseType: 'cardio',
      mealType: 'breakfast',
      fastingType: '16:8',
      isRequired: true,
      points: 1,
      dayOfChallenge: null,
    });
  };

  const removeTask = (index: number) => {
    setDailyTasks(dailyTasks.filter((_, i) => i !== index));
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      change: `+${stats.userGrowth}%`,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Total Meals Logged',
      value: stats.totalMeals,
      icon: UtensilsCrossed,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Journal Entries',
      value: stats.totalJournals,
      icon: BookOpen,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Water Glasses',
      value: stats.totalWaterGlasses,
      icon: Droplet,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'Growth Rate',
      value: `${stats.userGrowth}%`,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-3xl p-6 border border-border animate-pulse">
              <div className="h-20 bg-secondary/50 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your wellness platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-card rounded-3xl p-6 shadow-card border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.change && (
                  <span className="text-sm font-semibold text-green-500">{stat.change}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Premium Challenge Management */}
      <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold">Premium Challenge Management</h2>
          </div>
          <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Dynamic Challenge</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Challenge Name</Label>
                    <Input
                      id="name"
                      value={challengeForm.name}
                      onChange={(e) => setChallengeForm({...challengeForm, name: e.target.value})}
                      placeholder="30-Day Wellness Challenge"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={challengeForm.description}
                      onChange={(e) => setChallengeForm({...challengeForm, description: e.target.value})}
                      placeholder="Complete daily wellness tasks for 30 days"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Challenge Type</Label>
                      <Select value={challengeForm.type} onValueChange={(value) => setChallengeForm({...challengeForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dynamic">Dynamic Tasks</SelectItem>
                          <SelectItem value="water">Water Only</SelectItem>
                          <SelectItem value="meals">Meals Only</SelectItem>
                          <SelectItem value="streak">Streak Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="goal">Total Points Goal</Label>
                      <Input
                        id="goal"
                        type="number"
                        value={challengeForm.goal}
                        onChange={(e) => setChallengeForm({...challengeForm, goal: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (Days)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={challengeForm.duration}
                        onChange={(e) => setChallengeForm({...challengeForm, duration: Number(e.target.value)})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={challengeForm.startDate}
                        onChange={(e) => setChallengeForm({...challengeForm, startDate: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                    <Input
                      id="imageUrl"
                      value={challengeForm.imageUrl}
                      onChange={(e) => setChallengeForm({...challengeForm, imageUrl: e.target.value})}
                      placeholder="https://example.com/challenge-image.jpg"
                    />
                  </div>

                  {/* Access Control */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Premium Challenge</span>
                      </div>
                      <Switch
                        checked={challengeForm.isPremiumChallenge}
                        onCheckedChange={(checked) => setChallengeForm({...challengeForm, isPremiumChallenge: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Requires Subscription</span>
                      </div>
                      <Switch
                        checked={challengeForm.requiresSubscription}
                        onCheckedChange={(checked) => setChallengeForm({...challengeForm, requiresSubscription: checked})}
                      />
                    </div>

                    {challengeForm.requiresSubscription && (
                      <div>
                        <Label>Required Subscription Tier</Label>
                        <Select value={challengeForm.subscriptionTier} onValueChange={(value) => setChallengeForm({...challengeForm, subscriptionTier: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Gift 30 Days Access</span>
                      </div>
                      <Switch
                        checked={challengeForm.gift30Days}
                        onCheckedChange={(checked) => setChallengeForm({...challengeForm, gift30Days: checked})}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Daily Tasks */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Daily Tasks</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTask}
                      disabled={!currentTask.title}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Task
                    </Button>
                  </div>

                  {/* Task Form */}
                  <div className="p-4 border rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Task Type</Label>
                        <Select value={currentTask.taskType} onValueChange={(value) => setCurrentTask({...currentTask, taskType: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exercise">🏃 Exercise</SelectItem>
                            <SelectItem value="meal">🍽️ Meal</SelectItem>
                            <SelectItem value="fasting">⏰ Fasting</SelectItem>
                            <SelectItem value="sleep">😴 Sleep</SelectItem>
                            <SelectItem value="water">💧 Water</SelectItem>
                            <SelectItem value="custom">🎯 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={currentTask.title}
                          onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                          placeholder="Task name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        value={currentTask.description}
                        onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                        placeholder="Task description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Target Value</Label>
                        <Input
                          type="number"
                          value={currentTask.targetValue}
                          onChange={(e) => setCurrentTask({...currentTask, targetValue: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Select value={currentTask.targetUnit} onValueChange={(value) => setCurrentTask({...currentTask, targetUnit: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="reps">Reps</SelectItem>
                            <SelectItem value="glasses">Glasses</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="calories">Calories</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Task-specific fields */}
                    {currentTask.taskType === 'exercise' && (
                      <div>
                        <Label>Exercise Type</Label>
                        <Select value={currentTask.exerciseType} onValueChange={(value) => setCurrentTask({...currentTask, exerciseType: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cardio">Cardio</SelectItem>
                            <SelectItem value="strength">Strength</SelectItem>
                            <SelectItem value="yoga">Yoga</SelectItem>
                            <SelectItem value="running">Running</SelectItem>
                            <SelectItem value="walking">Walking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {currentTask.taskType === 'meal' && (
                      <div>
                        <Label>Meal Type</Label>
                        <Select value={currentTask.mealType} onValueChange={(value) => setCurrentTask({...currentTask, mealType: value})}>
                          <SelectTrigger>
                            <SelectValue />
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

                    {currentTask.taskType === 'fasting' && (
                      <div>
                        <Label>Fasting Type</Label>
                        <Select value={currentTask.fastingType} onValueChange={(value) => setCurrentTask({...currentTask, fastingType: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16:8">16:8</SelectItem>
                            <SelectItem value="18:6">18:6</SelectItem>
                            <SelectItem value="20:4">20:4</SelectItem>
                            <SelectItem value="24h">24 Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={currentTask.points}
                          onChange={(e) => setCurrentTask({...currentTask, points: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Specific Day (Optional)</Label>
                        <Input
                          type="number"
                          placeholder="All days"
                          value={currentTask.dayOfChallenge || ''}
                          onChange={(e) => setCurrentTask({...currentTask, dayOfChallenge: e.target.value ? Number(e.target.value) : null})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {dailyTasks.map((task, index) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.taskType} • {task.targetValue} {task.targetUnit} • {task.points} pts
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setChallengeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateChallenge}
                  disabled={creatingChallenge || !challengeForm.name || !challengeForm.description}
                >
                  {creatingChallenge ? "Creating..." : "Create Challenge"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/20">
            <Crown className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="font-semibold mb-1">Premium Challenges</h3>
            <p className="text-sm text-muted-foreground">Create challenges that grant premium access when users join</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
            <Target className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Banner System</h3>
            <p className="text-sm text-muted-foreground">Automatic banners show to non-participants every 5 minutes</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
            <Activity className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-semibold mb-1">Auto-Grant Access</h3>
            <p className="text-sm text-muted-foreground">Premium access is automatically granted when users join premium challenges</p>
          </div>
        </div>
      </div>

      {/* Daily Task Management */}
      <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Daily Task Management</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            Create and monitor daily tasks for active challenges. Track user engagement and completion rates in real-time.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
              <Dumbbell className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold mb-1">Exercise Tasks</h3>
              <p className="text-sm text-muted-foreground">Cardio, strength, yoga, running</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
              <Utensils className="w-8 h-8 text-orange-500 mb-2" />
              <h3 className="font-semibold mb-1">Meal Tasks</h3>
              <p className="text-sm text-muted-foreground">Breakfast, lunch, dinner, snacks</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20">
              <Clock className="w-8 h-8 text-indigo-500 mb-2" />
              <h3 className="font-semibold mb-1">Fasting Tasks</h3>
              <p className="text-sm text-muted-foreground">16:8, 18:6, 24h fasting</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-500/20">
              <Moon className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold mb-1">Sleep Tasks</h3>
              <p className="text-sm text-muted-foreground">Sleep duration and quality</p>
            </div>
          </div>
        </div>
        
        {/* Daily Task Manager Component */}
        <DailyTaskManager challengeId={1} />
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-muted-foreground">
          Activity feed coming soon...
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
