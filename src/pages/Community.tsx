import { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Plus, ThumbsUp, ThumbsDown, Loader2, MessageCircle, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { PageHeader, EmptyState } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { timeAgo } from '@/lib/constants';
import type { CommunityPost, CommunityComment } from '@/lib/types';

const CATEGORIES = ['general', 'technology', 'career', 'academics', 'events', 'help'];

export function Community() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', tags: '' });
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('community_posts')
      .select('*, profiles!inner(id, full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50);
    setPosts((data as unknown as CommunityPost[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!session) return;
    try {
      await supabase.from('community_posts').insert({
        user_id: session.user.id,
        title: form.title,
        content: form.content,
        category: form.category,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
      });
      toast({ title: 'Post created! +10 XP' });
      setCreateOpen(false);
      setForm({ title: '', content: '', category: 'general', tags: '' });
      load();
    } catch (err) {
      toast({ title: 'Failed', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const openPost = async (post: CommunityPost) => {
    setSelectedPost(post);
    const { data } = await supabase
      .from('community_comments')
      .select('*, profiles!inner(id, full_name, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    setComments((data as unknown as CommunityComment[]) || []);
  };

  const addComment = async () => {
    if (!session || !selectedPost || !newComment) return;
    await supabase.from('community_comments').insert({
      post_id: selectedPost.id,
      user_id: session.user.id,
      content: newComment,
    });
    await supabase.from('community_posts').update({ comment_count: selectedPost.comment_count + 1 }).eq('id', selectedPost.id);
    setNewComment('');
    openPost({ ...selectedPost, comment_count: selectedPost.comment_count + 1 });
  };

  const vote = async (post: CommunityPost, type: 'up' | 'down') => {
    const field = type === 'up' ? 'upvotes' : 'downvotes';
    await supabase.from('community_posts').update({ [field]: post[field] + 1 }).eq('id', post.id);
    load();
  };

  return (
    <div>
      <PageHeader title="Community Forum" description="Discuss, ask, and share with the community.">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New Post</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Post</DialogTitle>
              <DialogDescription>Share your thoughts, questions, or updates.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tech, help" /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!form.title || !form.content}>Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No posts yet" description="Be the first to start a discussion." />
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${selectedPost?.id === post.id ? 'border-primary ring-1 ring-primary' : ''}`}
                onClick={() => openPost(post)}
              >
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{post.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                    <span className="text-xs text-muted-foreground">{post.profiles?.full_name}</span>
                    <Badge variant="outline" className="text-xs capitalize">{post.category}</Badge>
                    <span className="ml-auto text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
                  </div>
                  <h3 className="mb-1 font-semibold">{post.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary" onClick={(e) => { e.stopPropagation(); vote(post, 'up'); }}><ThumbsUp className="h-3.5 w-3.5" />{post.upvotes}</button>
                    <button className="flex items-center gap-1 hover:text-destructive" onClick={(e) => { e.stopPropagation(); vote(post, 'down'); }}><ThumbsDown className="h-3.5 w-3.5" />{post.downvotes}</button>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.comment_count}</span>
                    {post.tags && post.tags.length > 0 && (
                      <div className="ml-auto flex gap-1">
                        {post.tags.slice(0, 2).map((t, i) => <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div>
          {selectedPost ? (
            <Card>
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{selectedPost.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedPost.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(selectedPost.created_at)}</p>
                  </div>
                </div>
                <h2 className="mb-2 text-lg font-bold">{selectedPost.title}</h2>
                <p className="mb-3 text-sm">{selectedPost.content}</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="capitalize">{selectedPost.category}</Badge>
                  {selectedPost.tags?.map((t, i) => <Badge key={i} variant="outline">{t}</Badge>)}
                </div>
                <div className="mb-4 flex gap-3 border-t pt-3">
                  <Button size="sm" variant="ghost" onClick={() => vote(selectedPost, 'up')}><ThumbsUp className="h-4 w-4" />{selectedPost.upvotes}</Button>
                  <Button size="sm" variant="ghost" onClick={() => vote(selectedPost, 'down')}><ThumbsDown className="h-4 w-4" />{selectedPost.downvotes}</Button>
                </div>
                <div className="border-t pt-4">
                  <h3 className="mb-3 font-semibold">Comments ({comments.length})</h3>
                  {comments.length === 0 ? (
                    <p className="mb-4 text-sm text-muted-foreground">No comments yet.</p>
                  ) : (
                    <div className="mb-4 space-y-3">
                      {comments.map((c) => (
                        <div key={c.id} className="rounded-lg border p-3">
                          <div className="mb-1 flex items-center gap-2">
                            <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{c.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                            <span className="text-xs font-medium">{c.profiles?.full_name}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                          </div>
                          <p className="text-sm">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {session && (
                    <div className="flex gap-2">
                      <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." />
                      <Button onClick={addComment} disabled={!newComment}>Post</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed py-20 text-center">
              <p className="text-sm text-muted-foreground">Select a post to view and comment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
