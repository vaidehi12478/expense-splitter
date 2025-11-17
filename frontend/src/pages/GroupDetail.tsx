import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, DollarSign, UserPlus, Loader2, Calculator, CheckCircle, Trash2 } from 'lucide-react';
import { groupsApi, expensesApi, settlementsApi } from '@/services/api';
import type { Group, Expense, Settlement, CalculatedSettlement } from '@/types';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getStoredUser } from '@/lib/auth';
import { ExpenseForm } from '@/components/ExpenseForm';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [calculatedSettlements, setCalculatedSettlements] = useState<CalculatedSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false);
  const [calculatingSettlements, setCalculatingSettlements] = useState(false);
  const [recordingSettlements, setRecordingSettlements] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseDetailsOpen, setExpenseDetailsOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(false);
  const user = getStoredUser();

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      const [expensesData, settlementsData] = await Promise.all([
        expensesApi.getByGroup(id),
        settlementsApi.getByGroup(id)
      ]);
      
      setExpenses(expensesData);
      setSettlements(settlementsData);
      
      // Load group from groups list or fetch separately
      const groupsData = await groupsApi.getAll();
      const currentGroup = groupsData.find(g => g.id === id);
      if (currentGroup) {
        setGroup(currentGroup);
      }
    } catch (error) {
      console.error('Error loading group data:', error);
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addMemberEmail.trim() || !addMemberEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setAddMemberLoading(true);
    
    try {
      await groupsApi.addMember(id!, addMemberEmail);
      toast.success('Member added successfully!');
      setAddMemberEmail('');
      setAddMemberOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error adding member:', error);
      const message = error.response?.data?.detail || 'Failed to add member';
      toast.error(message);
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleCalculateSettlements = async () => {
    setCalculatingSettlements(true);
    
    try {
      const calculated = await settlementsApi.calculate(id!);
      setCalculatedSettlements(calculated);
      
      if (calculated.length === 0) {
        toast.info('All expenses are balanced! No settlements needed.');
      } else {
        toast.success(`Settlements calculated! (${calculated.length} transaction${calculated.length !== 1 ? 's' : ''})`);
      }
    } catch (error: any) {
      console.error('Error calculating settlements:', error);
      const message = error.response?.data?.detail || 'Failed to calculate settlements';
      toast.error(message);
    } finally {
      setCalculatingSettlements(false);
    }
  };

  const handleRecordSettlements = async () => {
    if (calculatedSettlements.length === 0) {
      toast.error('No settlements to record');
      return;
    }

    setRecordingSettlements(true);
    
    try {
      await settlementsApi.settle(id!, calculatedSettlements);
      toast.success('Settlements recorded successfully!');
      setCalculatedSettlements([]);
      loadData();
    } catch (error: any) {
      console.error('Error recording settlements:', error);
      const message = error.response?.data?.detail || 'Failed to record settlements';
      toast.error(message);
    } finally {
      setRecordingSettlements(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    setDeletingExpense(true);
    
    try {
      await expensesApi.delete(selectedExpense.id);
      toast.success('Expense deleted successfully!');
      setExpenseDetailsOpen(false);
      setSelectedExpense(null);
      loadData();
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      const message = error.response?.data?.detail || 'Failed to delete expense';
      toast.error(message);
    } finally {
      setDeletingExpense(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Group not found</h3>
            <p className="text-muted-foreground mb-4">
              This group doesn't exist or you don't have access to it
            </p>
            <Button asChild>
              <Link to="/">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Group Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
            <p className="text-muted-foreground mt-1">{group.description}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Member</DialogTitle>
                  <DialogDescription>
                    Add a new member to this group by their email
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberEmail">Email Address</Label>
                    <Input
                      id="memberEmail"
                      type="email"
                      placeholder="friend@example.com"
                      value={addMemberEmail}
                      onChange={(e) => setAddMemberEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={addMemberLoading} className="w-full">
                    {addMemberLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Member'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={createExpenseOpen} onOpenChange={setCreateExpenseOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Expense</DialogTitle>
                  <DialogDescription>
                    Add a new expense to split among group members
                  </DialogDescription>
                </DialogHeader>
                <ExpenseForm
                  groupId={id!}
                  members={group.members.map((member) => ({
                    id: member.email,
                    name: member.name,
                    email: member.email
                  }))}
                  onSuccess={() => {
                    setCreateExpenseOpen(false);
                    loadData();
                  }}
                  onCancel={() => setCreateExpenseOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {group.members.map((member) => (
                <Badge key={member.email} variant="secondary" className="text-sm py-1.5 px-3">
                  {member.name} ({member.email})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4 mt-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {expenses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No expenses yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first expense to start splitting costs
                  </p>
                  <Button onClick={() => setCreateExpenseOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <Card 
                    key={expense.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedExpense(expense);
                      setExpenseDetailsOpen(true);
                    }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {expense.description || 'Untitled Expense'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {expense.category}
                              </p>
                            </div>
                            <span className="text-xl font-bold text-primary">
                              {formatCurrency(expense.amount)}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-muted-foreground">
                              Paid by <span className="font-medium text-foreground">{expense.paidBy}</span>
                            </p>
                            <p className="text-muted-foreground">
                              Split: <span className="font-medium text-foreground capitalize">{expense.splitType}</span>
                            </p>
                            <p className="text-muted-foreground">
                              Date: <span className="font-medium text-foreground">{formatDate(expense.date)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settlements" className="space-y-4 mt-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            <div className="flex gap-2 mb-4">
              <Button
                onClick={handleCalculateSettlements}
                disabled={calculatingSettlements || expenses.length === 0}
                variant="outline"
                className="gap-2"
              >
                {calculatingSettlements ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Calculate Settlements
                  </>
                )}
              </Button>

              {calculatedSettlements.length > 0 && (
                <Button
                  onClick={handleRecordSettlements}
                  disabled={recordingSettlements}
                  className="gap-2"
                >
                  {recordingSettlements ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Confirm & Save
                    </>
                  )}
                </Button>
              )}
            </div>

            {calculatedSettlements.length > 0 && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Calculated Settlements</CardTitle>
                  <CardDescription>
                    Review and confirm these settlements to record them
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {calculatedSettlements.map((settlement, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {settlement.paidBy}
                        </p>
                        <p className="text-sm text-muted-foreground">pays</p>
                        <p className="font-medium text-foreground">
                          {settlement.paidTo}
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(settlement.amount)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {settlements.length === 0 && calculatedSettlements.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No settlements yet
                  </h3>
                  <p className="text-muted-foreground">
                    Calculate settlements to see who owes whom
                  </p>
                </CardContent>
              </Card>
            ) : (
              settlements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Settlement History</h3>
                  {settlements.map((settlement) => (
                    <Card key={settlement.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">
                              {settlement.paidBy} → {settlement.paidTo}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(settlement.date)}
                            </p>
                          </div>
                          <span className="text-xl font-bold text-foreground">
                            {formatCurrency(settlement.amount)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            )}
          </TabsContent>
        </Tabs>

        {/* Expense Details Dialog */}
        <Dialog open={expenseDetailsOpen} onOpenChange={setExpenseDetailsOpen}>
          <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Expense Details</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto pr-4">
              {selectedExpense && (
                <div className="space-y-6">
                  {/* Amount */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-4xl font-bold text-primary">
                      {formatCurrency(selectedExpense.amount)}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    {/* Description */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                      <p className="text-foreground">{selectedExpense.description || 'N/A'}</p>
                    </div>

                    {/* Category */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                      <Badge variant="secondary">{selectedExpense.category}</Badge>
                    </div>

                    {/* Paid By */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Paid By</p>
                      <p className="text-foreground font-medium">{selectedExpense.paidBy}</p>
                    </div>

                    {/* Split Type */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Split Type</p>
                      <Badge variant="outline" className="capitalize">
                        {selectedExpense.splitType}
                      </Badge>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Date</p>
                      <p className="text-foreground">{formatDate(selectedExpense.date)}</p>
                    </div>

                    {/* Split Details */}
                    {selectedExpense.splitType === 'equal' && !selectedExpense.splits && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Split Details</p>
                        <p className="text-sm text-foreground">
                          Equally divided among <strong>ALL {group?.members.length} group members</strong>
                        </p>
                        <p className="text-sm font-medium mt-2">
                          Each person owes: <span className="text-primary">{formatCurrency(selectedExpense.amount / (group?.members.length || 1))}</span>
                        </p>
                      </div>
                    )}

                    {selectedExpense.splitType === 'equal' && selectedExpense.splits && Object.keys(selectedExpense.splits).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Split Details</p>
                        <p className="text-sm text-foreground mb-2">
                          Equally divided among <strong>{Object.keys(selectedExpense.splits).length} participating members</strong>
                        </p>
                        <div className="space-y-2">
                          {Object.keys(selectedExpense.splits).map((email) => (
                            <div key={email} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="text-sm text-foreground">{email}</span>
                              <span className="font-medium">{formatCurrency(selectedExpense.amount / Object.keys(selectedExpense.splits!).length)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedExpense.splitType === 'unequal' && selectedExpense.splits && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Split Details (Specific Amounts)</p>
                        <div className="space-y-2">
                          {Object.entries(selectedExpense.splits).map(([email, amount]) => (
                            <div key={email} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="text-sm text-foreground">{email}</span>
                              <span className="font-medium">{formatCurrency(amount as number)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedExpense.splitType === 'percentage' && selectedExpense.splits && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Split Details (By Percentage)</p>
                        <div className="space-y-2">
                          {Object.entries(selectedExpense.splits).map(([email, percentage]) => (
                            <div key={email} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="text-sm text-foreground">{email}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{percentage}%</span>
                                <span className="font-medium">{formatCurrency((selectedExpense.amount * (percentage as number)) / 100)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Created At */}
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(selectedExpense.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <div className="pt-4 border-t">
                      <Button
                        variant="destructive"
                        className="w-full gap-2"
                        onClick={handleDeleteExpense}
                        disabled={deletingExpense}
                      >
                        {deletingExpense ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Delete Expense
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
