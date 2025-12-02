import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, Trophy, Calendar, Target, TrendingUp, ListTodo } from "lucide-react";
import { format } from "date-fns";
import DailyTaskManager from "@/admin/components/DailyTaskManager";

interface Challenge {
  id: number;
  name: string;
  description: string;
  type: string;
  goal: number;
  duration: number;
  startDate: string;
  endDate: string;
  participantCount: number;
  creatorId: string;
  imageUrl?: string;
  createdAt: string;
}

interface CreateChallengeData {
  name: string;
  description: string;
  type: string;
  goal: number;
  duration: number;
  startDate: string;
  imageUrl?: string;
}

const CHALLENGE_TYPES = [
  { value: 'water', label: 'Water Intake', icon: '💧', description: 'Track daily water consumption' },
  { value: 'meals', label: 'Meal Logging', icon: '🍽️', description: 'Log meals consistently' },
  { value: 'streak', label: 'Streak Challenge', icon: '🔥', description: 'Maintain daily habits' },
  { value: 'steps', label: 'Steps Goal', icon: '👟', description: 'Daily step count target' },
  { value: 'workout', label: 'Workout Days', icon: '💪', description: 'Complete workout sessions' },
  { value: 'meditation', label: 'Mindfulness', icon: '🧘', description: 'Daily meditation practice' },
  { value: 'custom', label: 'Custom Goal', icon: '🎯', description: 'Custom challenge type' }
];

const CHALLENGE_TEMPLATES = [
  {
    name: "30-Day Water Challenge",
    description: "Drink 8 glasses of water daily for 30 days and stay hydrated!",
    type: "water",
    goal: 8,
    duration: 30
  },
  {
    name: "21-Day Meal Prep Challenge",
    description: "Log all your meals for 21 days to build healthy eating habits.",
    type: "meals",
    goal: 3,
    duration: 21
  },
  {
    name: "7-Day Consistency Streak",
    description: "Build a 7-day streak of healthy habits.",
    type: "streak",
    goal: 7,
    duration: 7
  },
  {
    name: "New Year Transformation",
    description: "Complete 90 days of consistent healthy habits to transform your lifestyle.",
    type: "custom",
    goal: 90,
    duration: 90
  }
];

export default function ChallengesManagement() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof CHALLENGE_TEMPLATES[0] | null>(null);
  const [selectedChallengeForTasks, setSelectedChallengeForTasks] = useState<Challenge | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<CreateChallengeData>({
    name: '',
    description: '',
    type: '',
    goal: 0,
    duration: 7,
    startDate: new Date().toISOString().split('T')[0],
    imageUrl: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/challenges`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setChallenges(data);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('goal', formData.goal.toString());
      formDataToSend.append('duration', formData.duration.toString());
      formDataToSend.append('startDate', formData.startDate);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.imageUrl) {
        formDataToSend.append('imageUrl', formData.imageUrl);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/challenges/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const newChallenge = await response.json();
        setChallenges([newChallenge, ...challenges]);
        setIsCreateOpen(false);
        resetForm();
        toast({
          title: "Success",
          description: "Challenge created successfully!"
        });
      } else {
        throw new Error('Failed to create challenge');
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to create challenge",
        variant: "destructive"
      });
    }
  };

  const handleUpdateChallenge = async () => {
    if (!editingChallenge) return;

    try {
      const token = localStorage.getItem('admin_token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('goal', formData.goal.toString());
      formDataToSend.append('duration', formData.duration.toString());
      formDataToSend.append('startDate', formData.startDate);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.imageUrl) {
        formDataToSend.append('imageUrl', formData.imageUrl);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/challenges/${editingChallenge.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const updatedChallenge = await response.json();
        setChallenges(challenges.map(c => c.id === updatedChallenge.id ? updatedChallenge : c));
        setIsEditOpen(false);
        setEditingChallenge(null);
        resetForm();
        toast({
          title: "Success",
          description: "Challenge updated successfully!"
        });
      } else {
        throw new Error('Failed to update challenge');
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to update challenge",
        variant: "destructive"
      });
    }
  };

  const handleDeleteChallenge = async (id: number) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/challenges/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setChallenges(challenges.filter(c => c.id !== id));
        toast({
          title: "Success",
          description: "Challenge deleted successfully"
        });
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast({
        title: "Error",
        description: "Failed to delete challenge",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '',
      goal: 0,
      duration: 7,
      startDate: new Date().toISOString().split('T')[0],
      imageUrl: ''
    });
    setSelectedTemplate(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      name: challenge.name,
      description: challenge.description,
      type: challenge.type,
      goal: challenge.goal,
      duration: challenge.duration,
      startDate: new Date(challenge.startDate).toISOString().split('T')[0],
      imageUrl: challenge.imageUrl || ''
    });
    setImagePreview(challenge.imageUrl || '');
    setIsEditOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTemplate = (template: typeof CHALLENGE_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      type: template.type,
      goal: template.goal,
      duration: template.duration
    });
  };

  const getTypeInfo = (type: string) => {
    return CHALLENGE_TYPES.find(t => t.value === type) || CHALLENGE_TYPES[0];
  };

  const getStatusBadge = (challenge: Challenge) => {
    const now = new Date();
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);

    if (now < start) {
      return <Badge variant="secondary">Upcoming</Badge>;
    } else if (now > end) {
      return <Badge variant="outline">Ended</Badge>;
    } else {
      return <Badge className="bg-green-500">Active</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Challenges Management</h1>
          <p className="text-muted-foreground">Create and manage fitness challenges for your users</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
              <DialogDescription>
                Create an engaging challenge for your users to participate in
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Quick Templates */}
              <div>
                <Label className="text-base font-semibold">Quick Templates</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {CHALLENGE_TEMPLATES.map((template, index) => (
                    <Button
                      key={index}
                      variant={selectedTemplate?.name === template.name ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col items-start text-left"
                      onClick={() => applyTemplate(template)}
                    >
                      <span className="font-semibold text-sm">{template.name}</span>
                      <span className="text-xs opacity-70">{template.duration} days • {getTypeInfo(template.type).label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Challenge Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="30-Day Water Challenge"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Challenge Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select challenge type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHALLENGE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Encourage users to stay hydrated by drinking 8 glasses of water daily..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Daily Goal</Label>
                  <Input
                    id="goal"
                    type="number"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: Number(e.target.value) })}
                    placeholder="8"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.type === 'water' && 'glasses per day'}
                    {formData.type === 'meals' && 'meals per day'}
                    {formData.type === 'steps' && 'steps per day'}
                    {formData.type === 'workout' && 'workouts per week'}
                    {formData.type === 'streak' && 'days to maintain'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Challenge Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/challenge-image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageFile">Or Upload Image</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreateChallenge} disabled={!formData.name || !formData.type}>
                Create Challenge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Challenge Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Challenge</DialogTitle>
            <DialogDescription>Update challenge details and settings</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Challenge Name *</Label>
              <Input
                id="edit-name"
                value={editingChallenge?.name || ''}
                onChange={(e) => setEditingChallenge({ ...editingChallenge!, name: e.target.value })}
                placeholder="Enter challenge name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editingChallenge?.description || ''}
                onChange={(e) => setEditingChallenge({ ...editingChallenge!, description: e.target.value })}
                placeholder="Enter challenge description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type *</Label>
                <select
                  id="edit-type"
                  className="w-full px-3 py-2 border rounded-md"
                  value={editingChallenge?.type || ''}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge!, type: e.target.value as any })}
                >
                  <option value="">Select type</option>
                  <option value="water">Water</option>
                  <option value="sleep">Sleep</option>
                  <option value="mood">Mood</option>
                  <option value="meals">Meals</option>
                  <option value="exercise">Exercise</option>
                  <option value="weight">Weight</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="steps">Steps</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tier">Tier *</Label>
                <select
                  id="edit-tier"
                  className="w-full px-3 py-2 border rounded-md"
                  value={editingChallenge?.tier || ''}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge!, tier: e.target.value as any })}
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-goal">Goal *</Label>
                <Input
                  id="edit-goal"
                  type="number"
                  value={editingChallenge?.goal || ''}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge!, goal: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (days) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editingChallenge?.duration || ''}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge!, duration: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-points">Points</Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={editingChallenge?.points || ''}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge!, points: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-badge">Badge Icon</Label>
                <Input
                  id="edit-badge"
                  value={editingChallenge?.badge || ''}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge!, badge: e.target.value })}
                  placeholder="e.g., 💧"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Start Date</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={editingChallenge?.startDate || ''}
                onChange={(e) => setEditingChallenge({ ...editingChallenge!, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Challenge Image URL (Optional)</Label>
              <Input
                id="edit-imageUrl"
                value={editingChallenge?.imageUrl || ''}
                onChange={(e) => setEditingChallenge({ ...editingChallenge!, imageUrl: e.target.value })}
                placeholder="https://example.com/challenge-image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-imageFile">Or Upload New Image</Label>
              <Input
                id="edit-imageFile"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                </div>
              )}
              {!imagePreview && editingChallenge?.imageUrl && (
                <div className="mt-2">
                  <img src={editingChallenge.imageUrl} alt="Current" className="w-32 h-32 object-cover rounded" />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingChallenge(null); setImageFile(null); setImagePreview(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateChallenge} disabled={!editingChallenge?.name || !editingChallenge?.type}>
              Update Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{challenges.length}</p>
                <p className="text-sm text-muted-foreground">Total Challenges</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {challenges.filter(c => {
                    const now = new Date();
                    const start = new Date(c.startDate);
                    const end = new Date(c.endDate);
                    return now >= start && now <= end;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Challenges</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {challenges.reduce((sum, c) => sum + c.participantCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {challenges.length > 0 ? Math.round(challenges.reduce((sum, c) => sum + c.participantCount, 0) / challenges.length) : 0}
                </p>
                <p className="text-sm text-muted-foreground">Avg. Participation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenges List */}
      <Card>
        <CardHeader>
          <CardTitle>All Challenges</CardTitle>
          <CardDescription>
            Manage all challenges created for your users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No challenges yet</h3>
              <p className="text-muted-foreground mb-4">Create your first challenge to engage your users!</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge) => {
                const typeInfo = getTypeInfo(challenge.type);
                return (
                  <div key={challenge.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <span className="text-2xl">{typeInfo.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">{challenge.name}</h3>
                          {getStatusBadge(challenge)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Goal: {challenge.goal} {typeInfo.label.toLowerCase()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {challenge.duration} days
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {challenge.participantCount} participants
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => setSelectedChallengeForTasks(challenge)}
                        className="flex items-center gap-2"
                      >
                        <ListTodo className="w-4 h-4" />
                        Manage Tasks
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditChallenge(challenge)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteChallenge(challenge.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Management Dialog */}
      {selectedChallengeForTasks && (
        <Dialog open={!!selectedChallengeForTasks} onOpenChange={() => setSelectedChallengeForTasks(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                {selectedChallengeForTasks.name} - Task Management
              </DialogTitle>
              <DialogDescription>
                Add and manage daily tasks for this challenge. Tasks can be assigned to specific days.
              </DialogDescription>
            </DialogHeader>
            <DailyTaskManager challengeId={selectedChallengeForTasks.id} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}