import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import adminApiService from '../lib/adminApi';
import {
  Users,
  TrendingUp,
  DollarSign,
  CreditCard,
  Edit,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface Subscription {
  id: number;
  userId: string;
  userEmail: string;
  userName: string;
  tier: 'free' | 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  amount: string;
  currency: string;
  paymentProvider: string;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  autoRenew: boolean;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  premiumCount: number;
  proCount: number;
  freeCount: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface EditFormData {
  tier?: 'free' | 'premium' | 'pro';
  status?: 'active' | 'cancelled' | 'expired' | 'past_due';
  autoRenew?: boolean;
  amount?: number;
  paymentProvider?: 'paystack' | 'opay';
  endDate?: string;
}

const SubscriptionsManagement = () => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({});
  const [createForm, setCreateForm] = useState({
    userEmail: '',
    tier: 'premium' as 'free' | 'premium' | 'pro',
    amount: 15000,
    paymentProvider: 'paystack' as 'paystack' | 'opay',
    autoRenew: true,
  });

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getAllSubscriptions(page, 50);
      setSubscriptions(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch subscriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, [fetchSubscriptions]);

  const fetchStats = async () => {
    try {
      const data = await adminApiService.getSubscriptionStats();
      setStats(data);
    } catch (error: unknown) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleView = async (subscription: Subscription) => {
    try {
      const details = await adminApiService.getSubscriptionById(subscription.id);
      setSelectedSubscription(details);
      setShowViewModal(true);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription details',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditForm({
      tier: subscription.tier,
      status: subscription.status,
      amount: parseFloat(subscription.amount),
      autoRenew: subscription.autoRenew,
      endDate: subscription.endDate ? new Date(subscription.endDate).toISOString().split('T')[0] : '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedSubscription) return;

    try {
      await adminApiService.updateSubscription(selectedSubscription.id, editForm);
      toast({
        title: 'Success',
        description: 'Subscription updated successfully',
      });
      setShowEditModal(false);
      fetchSubscriptions();
      fetchStats();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  const handleCreate = async () => {
    try {
      await adminApiService.createSubscription(createForm);
      toast({
        title: 'Success',
        description: 'Subscription created successfully',
      });
      setShowCreateModal(false);
      setCreateForm({
        userEmail: '',
        tier: 'premium',
        amount: 15000,
        paymentProvider: 'paystack',
        autoRenew: true,
      });
      fetchSubscriptions();
      fetchStats();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create subscription',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      await adminApiService.deleteSubscription(id);
      toast({
        title: 'Success',
        description: 'Subscription deleted successfully',
      });
      fetchSubscriptions();
      fetchStats();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete subscription',
        variant: 'destructive',
      });
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-purple-500';
      case 'premium':
        return 'bg-primary';
      case 'free':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-orange-500';
      case 'expired':
        return 'bg-red-500';
      case 'past_due':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeSubscriptions} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.proCount} pro users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <div className="flex gap-2">
          <Button onClick={fetchSubscriptions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Subscription
          </Button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Tier</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Provider</th>
                  <th className="text-left p-4 font-medium">End Date</th>
                  <th className="text-left p-4 font-medium">Auto Renew</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8">
                      Loading...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{sub.userName || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{sub.userEmail}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getTierBadgeColor(sub.tier)}>
                          {sub.tier.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusBadgeColor(sub.status)}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {sub.currency} {parseFloat(sub.amount).toLocaleString()}
                      </td>
                      <td className="p-4 capitalize">{sub.paymentProvider || 'N/A'}</td>
                      <td className="p-4">
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <Badge variant={sub.autoRenew ? 'default' : 'secondary'}>
                          {sub.autoRenew ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleView(sub)}
                            size="sm"
                            variant="ghost"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleEdit(sub)}
                            size="sm"
                            variant="ghost"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(sub.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          variant="outline"
        >
          Previous
        </Button>
        <span className="px-4 py-2">
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <p className="text-sm">{selectedSubscription.userName || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">{selectedSubscription.userEmail}</p>
                </div>
                <div>
                  <Label>Tier</Label>
                  <p className="text-sm">
                    <Badge className={getTierBadgeColor(selectedSubscription.tier)}>
                      {selectedSubscription.tier.toUpperCase()}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-sm">
                    <Badge className={getStatusBadgeColor(selectedSubscription.status)}>
                      {selectedSubscription.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="text-sm">
                    {selectedSubscription.currency} {parseFloat(selectedSubscription.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Payment Provider</Label>
                  <p className="text-sm capitalize">{selectedSubscription.paymentProvider || 'N/A'}</p>
                </div>
                <div>
                  <Label>Auto Renew</Label>
                  <p className="text-sm">{selectedSubscription.autoRenew ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <p className="text-sm">
                    {selectedSubscription.startDate
                      ? new Date(selectedSubscription.startDate).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label>End Date</Label>
                  <p className="text-sm">
                    {selectedSubscription.endDate
                      ? new Date(selectedSubscription.endDate).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p className="text-sm">
                    {new Date(selectedSubscription.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Updated At</Label>
                  <p className="text-sm">
                    {new Date(selectedSubscription.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update subscription details for {selectedSubscription?.userEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tier</Label>
              <Select
                value={editForm.tier}
                onValueChange={(value: 'free' | 'premium' | 'pro') => setEditForm({ ...editForm, tier: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value: 'active' | 'cancelled' | 'expired' | 'past_due') => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={editForm.endDate}
                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRenew"
                checked={editForm.autoRenew}
                onChange={(e) => setEditForm({ ...editForm, autoRenew: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="autoRenew">Auto Renew</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Subscription</DialogTitle>
            <DialogDescription>
              Create a new subscription for a user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User Email</Label>
              <Input
                type="email"
                value={createForm.userEmail}
                onChange={(e) => setCreateForm({ ...createForm, userEmail: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label>Tier</Label>
              <Select
                value={createForm.tier}
                onValueChange={(value: 'free' | 'premium' | 'pro') => {
                  const amount = value === 'premium' ? 15000 : value === 'pro' ? 45000 : 0;
                  setCreateForm({ ...createForm, tier: value, amount });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium (₦15,000)</SelectItem>
                  <SelectItem value="pro">Pro (₦45,000)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Payment Provider</Label>
              <Select
                value={createForm.paymentProvider}
                onValueChange={(value: 'paystack' | 'opay') => setCreateForm({ ...createForm, paymentProvider: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paystack">Paystack</SelectItem>
                  <SelectItem value="opay">OPay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="createAutoRenew"
                checked={createForm.autoRenew}
                onChange={(e) => setCreateForm({ ...createForm, autoRenew: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="createAutoRenew">Auto Renew</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsManagement;
