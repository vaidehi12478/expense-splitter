import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { expensesApi } from '@/services/api';
import type { User } from '@/types';
import { getStoredUser } from '@/lib/auth';

interface ExpenseFormProps {
  groupId: string;
  members: User[];
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Food',
  'Transport',
  'Accommodation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Other'
];

export const ExpenseForm = ({ groupId, members, onSuccess, onCancel }: ExpenseFormProps) => {
  const user = getStoredUser();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [paidBy, setPaidBy] = useState(user?.email || '');
  const [splitType, setSplitType] = useState<'equal' | 'unequal' | 'percentage'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map(m => m.email));
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleMemberToggle = (email: string) => {
    setSelectedMembers(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleCustomSplitChange = (email: string, value: string) => {
    setCustomSplits(prev => ({ ...prev, [email]: value }));
  };

  const calculateSplits = (): Record<string, number> | null => {
    const totalAmount = parseFloat(amount);
    const splits: Record<string, number> = {};
    
    if (splitType === 'equal') {
      // For equal split with selected members (not all), use value of 1
      if (selectedMembers.length === members.length) {
        // All members selected - send null for backend to handle
        return null;
      } else {
        // Subset of members - send {email: 1} format
        selectedMembers.forEach(email => {
          splits[email] = 1;
        });
        return splits;
      }
    }
    
    if (splitType === 'unequal') {
      selectedMembers.forEach(email => {
        splits[email] = parseFloat(customSplits[email] || '0');
      });
      return splits;
    }
    
    if (splitType === 'percentage') {
      selectedMembers.forEach(email => {
        splits[email] = parseFloat(customSplits[email] || '0');
      });
      return splits;
    }
    
    return null;
  };

  const validateSplits = (): boolean => {
    const totalAmount = parseFloat(amount);
    
    if (splitType === 'equal') {
      return selectedMembers.length >= 2;
    }
    
    if (splitType === 'unequal') {
      const sum = selectedMembers.reduce((acc, email) => {
        return acc + parseFloat(customSplits[email] || '0');
      }, 0);
      
      if (Math.abs(sum - totalAmount) > 0.01) {
        toast.error(`Split amounts must sum to ${totalAmount.toFixed(2)}`);
        return false;
      }
      return true;
    }
    
    if (splitType === 'percentage') {
      const sum = selectedMembers.reduce((acc, email) => {
        return acc + parseFloat(customSplits[email] || '0');
      }, 0);
      
      if (Math.abs(sum - 100) > 0.01) {
        toast.error('Split percentages must sum to 100%');
        return false;
      }
      return true;
    }
    
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    
    if (!amount || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!paidBy) {
      toast.error('Please select who paid');
      return;
    }
    
    if (selectedMembers.length < 2) {
      toast.error('Please select at least 2 members');
      return;
    }
    
    if (!validateSplits()) {
      return;
    }

    setLoading(true);

    try {
      const splits = calculateSplits();
      
      await expensesApi.create({
        groupId: groupId,
        amount: amountNum,
        description: description || undefined,
        category: category.toLowerCase(),
        paidBy: paidBy,
        splitType: splitType,
        splits: splits,
        date: new Date().toISOString().split('T')[0]
      } as any);
      
      toast.success('Expense created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating expense:', error);
      const message = error.response?.data?.detail || 'Failed to create expense';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const calculateEqualSplit = () => {
    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || selectedMembers.length === 0) return '0.00';
    return (totalAmount / selectedMembers.length).toFixed(2);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What was this expense for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paidBy">Paid By *</Label>
        <Select value={paidBy} onValueChange={setPaidBy}>
          <SelectTrigger id="paidBy">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {members.map(member => (
              <SelectItem key={member.id} value={member.email}>
                {member.name} ({member.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Split Type *</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant={splitType === 'equal' ? 'default' : 'outline'}
            onClick={() => setSplitType('equal')}
            className="w-full"
          >
            Equal
          </Button>
          <Button
            type="button"
            variant={splitType === 'unequal' ? 'default' : 'outline'}
            onClick={() => setSplitType('unequal')}
            className="w-full"
          >
            Unequal
          </Button>
          <Button
            type="button"
            variant={splitType === 'percentage' ? 'default' : 'outline'}
            onClick={() => setSplitType('percentage')}
            className="w-full"
          >
            Percentage
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Split Among Members *</Label>
        <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-lg p-3">
          {members.map(member => (
            <div key={member.id} className="flex items-center gap-3 py-2">
              <Checkbox
                id={member.id}
                checked={selectedMembers.includes(member.email)}
                onCheckedChange={() => handleMemberToggle(member.email)}
              />
              <label
                htmlFor={member.id}
                className="flex-1 text-sm font-medium cursor-pointer"
              >
                {member.name}
              </label>
              
              {selectedMembers.includes(member.email) && (
                <>
                  {splitType === 'equal' && (
                    <span className="text-sm text-muted-foreground">
                      ${calculateEqualSplit()}
                    </span>
                  )}
                  
                  {splitType === 'unequal' && (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={customSplits[member.email] || ''}
                      onChange={(e) => handleCustomSplitChange(member.email, e.target.value)}
                      className="w-24"
                    />
                  )}
                  
                  {splitType === 'percentage' && (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={customSplits[member.email] || ''}
                        onChange={(e) => handleCustomSplitChange(member.email, e.target.value)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        {splitType === 'equal' && (
          <p className="text-xs text-muted-foreground">
            Each person pays ${calculateEqualSplit()}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit} 
          disabled={loading} 
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Expense'
          )}
        </Button>
      </div>
    </div>
  );
};