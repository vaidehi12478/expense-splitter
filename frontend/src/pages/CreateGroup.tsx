import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { groupsApi } from '@/services/api';

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addEmailField = () => {
    setMemberEmails([...memberEmails, '']);
  };

  const removeEmailField = (index: number) => {
    setMemberEmails(memberEmails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const updated = [...memberEmails];
    updated[index] = value;
    setMemberEmails(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (name.length < 2 || name.length > 50) {
      toast.error('Group name must be between 2 and 50 characters');
      return;
    }

    const validEmails = memberEmails
      .map(e => e.trim())
      .filter(e => e && e.includes('@'));

    setLoading(true);

    try {
      // Create group (without initial members - user auto-added by backend)
      const group = await groupsApi.create(name, description);
      
      // Add members if any provided
      if (validEmails.length > 0) {
        await groupsApi.addMembers(group.id, validEmails);
      }
      
      toast.success('Group created successfully!');
      navigate(`/groups/${group.id}`);
    } catch (error: any) {
      console.error('Error creating group:', error);
      const message = error.response?.data?.detail || 'Failed to create group';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Group</CardTitle>
            <CardDescription>
              Set up a group to start splitting expenses with friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  placeholder="Trip to Paris, Roommates, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your group..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/200 characters
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Member Emails *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEmailField}
                    className="gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Add Email
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {memberEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="friend@example.com"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                      />
                      {memberEmails.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEmailField(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add email addresses of people you want to split expenses with
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Group'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
