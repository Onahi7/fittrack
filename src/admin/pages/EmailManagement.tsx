import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/admin/lib/adminApi';
import { RefreshCw, Mail, Clock, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailStats {
  pending: number;
  sent: number;
  failed: number;
  total: number;
}

interface EmailQueueItem {
  id: number;
  recipient: string;
  recipientName: string;
  subject: string;
  emailType: string;
  status: string;
  priority: number;
  scheduledFor: string;
  sentAt?: string;
  failedAt?: string;
  error?: string;
  retryCount: number;
  createdAt: string;
}

interface EmailLog {
  id: number;
  recipient: string;
  subject: string;
  emailType: string;
  status: string;
  provider: string;
  sentAt: string;
}

export default function EmailManagement() {
  const { toast } = useToast();
  const [stats, setStats] = useState<EmailStats>({ pending: 0, sent: 0, failed: 0, total: 0 });
  const [queueItems, setQueueItems] = useState<EmailQueueItem[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [testEmail, setTestEmail] = useState('hardytechabuja@gmail.com');
  const [sendingTest, setSendingTest] = useState<string | null>(null);

  const emailTemplates = [
    { id: 'daily_checkin', name: 'Daily Check-In Reminder', icon: '🌟' },
    { id: 'weekly_checkin', name: 'Weekly Check-In Reminder', icon: '📊' },
    { id: 'meal_reminder', name: 'Meal Reminder', icon: '🍽️' },
    { id: 'achievement_unlocked', name: 'Achievement Unlocked', icon: '🏆' },
    { id: 'new_challenge', name: 'New Challenge Notification', icon: '🎯' },
    { id: 'challenge_joined', name: 'Challenge Joined', icon: '🎉' },
    { id: 'challenge_starting_soon', name: 'Challenge Starting Soon', icon: '⏰' },
    { id: 'daily_task_reminder', name: 'Daily Task Reminder', icon: '📋' },
    { id: 'daily_task_created', name: 'New Daily Task Created', icon: '✨' },
    { id: 'challenge_completed', name: 'Challenge Completed', icon: '🏅' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, queueRes, logsRes] = await Promise.all([
        adminApi.get('/admin/emails/stats'),
        adminApi.get('/admin/emails/queue?limit=100'),
        adminApi.get('/admin/emails/logs?limit=100'),
      ]);

      setStats(statsRes.data);
      setQueueItems(queueRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching email data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getEmailTypeLabel = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const sendTestEmail = async (templateType: string) => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setSendingTest(templateType);
    try {
      const response = await adminApi.post('/admin/emails/send-test', {
        templateType,
        email: testEmail,
        name: 'Test User',
        challengeName: '30-Day Wellness Challenge',
        taskTitle: 'Morning Workout',
        achievementName: 'First Steps',
        mealType: 'Breakfast',
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: `Test email sent to ${testEmail}`,
        });
        await fetchData(); // Refresh data
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to send test email',
        variant: 'destructive',
      });
    } finally {
      setSendingTest(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading">Email Management</h2>
          <p className="text-muted-foreground">Monitor and manage email notifications</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.sent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test">Test Templates</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({stats.sent})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({stats.failed})</TabsTrigger>
        </TabsList>

        {/* Test Templates Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Email Templates</CardTitle>
              <CardDescription>
                Send test emails to verify templates are working correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Note: Resend free tier only allows sending to verified email addresses
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {emailTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => sendTestEmail(template.id)}
                    disabled={sendingTest === template.id || !testEmail}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.id}
                        </div>
                      </div>
                      {sendingTest === template.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Activity</CardTitle>
              <CardDescription>Latest email logs from all statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(log.status)}
                      <div className="flex-1">
                        <div className="font-medium">{log.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          To: {log.recipient}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {getEmailTypeLabel(log.emailType)} • {new Date(log.sentAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Emails</CardTitle>
              <CardDescription>Emails waiting to be sent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueItems
                  .filter((item) => item.status === 'pending')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <div className="flex-1">
                          <div className="font-medium">{item.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            To: {item.recipientName || item.recipient}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getEmailTypeLabel(item.emailType)} • Priority: {item.priority}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Scheduled: {new Date(item.scheduledFor).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                {queueItems.filter((item) => item.status === 'pending').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No pending emails
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Emails</CardTitle>
              <CardDescription>Successfully delivered emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueItems
                  .filter((item) => item.status === 'sent')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div className="flex-1">
                          <div className="font-medium">{item.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            To: {item.recipientName || item.recipient}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getEmailTypeLabel(item.emailType)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sent: {item.sentAt ? new Date(item.sentAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                {queueItems.filter((item) => item.status === 'sent').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No sent emails
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed Tab */}
        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Emails</CardTitle>
              <CardDescription>Emails that failed to send</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueItems
                  .filter((item) => item.status === 'failed')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-red-500/5"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <div className="flex-1">
                          <div className="font-medium">{item.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            To: {item.recipientName || item.recipient}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getEmailTypeLabel(item.emailType)} • Retries: {item.retryCount}
                          </div>
                          {item.error && (
                            <div className="text-xs text-red-500 mt-1">
                              Error: {item.error}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Failed: {item.failedAt ? new Date(item.failedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                {queueItems.filter((item) => item.status === 'failed').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No failed emails
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
