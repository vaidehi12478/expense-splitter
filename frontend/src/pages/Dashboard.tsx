import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { groupsApi, expensesApi } from '@/services/api';
import type { Group, Expense } from '@/types';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatters';
import { getStoredUser } from '@/lib/auth';

export default function Dashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [groupsData, expensesData] = await Promise.all([
        groupsApi.getAll(),
        expensesApi.getMy()
      ]);
      setGroups(groupsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = () => {
    let totalPaid = 0;
    let totalOwed = 0;

    expenses.forEach(expense => {
      if (expense.paidBy === user?.email) {
        totalPaid += expense.amount;
      }
      
      // splits is now a Dict[email: amount] instead of array
      if (expense.splits && expense.splits[user?.email || '']) {
        totalOwed += expense.splits[user?.email || ''] || 0;
      }
    });

    const netBalance = totalPaid - totalOwed;

    return { totalPaid, totalOwed, netBalance };
  };

  const { totalPaid, totalOwed, netBalance } = calculateBalances();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your shared expenses</p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/groups/create">
              <Plus className="h-4 w-4" />
              Create Group
            </Link>
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Total Paid
              </CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalPaid)}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Total Owed
              </CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalOwed)}</CardTitle>
            </CardHeader>
          </Card>

          <Card className={`border-l-4 ${netBalance >= 0 ? 'border-l-positive' : 'border-l-negative'}`}>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Net Balance
              </CardDescription>
              <CardTitle className={`text-2xl ${netBalance >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatCurrency(netBalance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {netBalance >= 0 ? 'You are owed' : 'You owe'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Groups Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Groups</h2>
          
          {groups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No groups yet
                </h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Create your first group to start splitting expenses with friends
                </p>
                <Button asChild>
                  <Link to="/groups/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Group
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Link key={group.id} to={`/groups/${group.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{group.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {group.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
