import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, ArrowRight, Loader2 } from 'lucide-react';
import { groupsApi } from '@/services/api';
import type { Group } from '@/types';
import { toast } from 'sonner';
import { getStoredUser } from '@/lib/auth';

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupsApi.getAll();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Groups</h1>
            <p className="text-muted-foreground mt-2">
              Manage and track expenses across your groups
            </p>
          </div>
          <Link to="/groups/create">
            <Button size="lg" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Group
            </Button>
          </Link>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No groups yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Create a new group to start splitting expenses with friends and family
              </p>
              <Link to="/groups/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Group
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link key={group.id} to={`/groups/${group.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-foreground">
                          {group.name}
                        </CardTitle>
                        {group.description && (
                          <CardDescription className="mt-2">
                            {group.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Members */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Members ({group.members.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.members.slice(0, 3).map((member) => (
                          <Badge key={member.email} variant="secondary" className="text-xs">
                            {member.name}
                          </Badge>
                        ))}
                        {group.members.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{group.members.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Created Date */}
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(group.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        asChild
                      >
                        <span>
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
