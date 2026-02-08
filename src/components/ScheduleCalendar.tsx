import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { enUS } from "date-fns/locale";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, Trash2, GripVertical } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface SavedPost {
  id: string;
  caption: string;
  image_url: string | null;
}

interface ScheduledPost {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  generated_post_id: string | null;
  generated_posts?: SavedPost;
}

const ItemType = {
  POST: "post"
};

function DraggablePost({ post }: { post: SavedPost }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.POST,
    item: { postId: post.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-lg cursor-move hover:bg-muted transition-colors ${isDragging ? "opacity-50" : ""
        }`}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{post.caption.substring(0, 50)}...</p>
        </div>
      </div>
    </div>
  );
}

function DroppableCalendarDay({
  date,
  onDrop
}: {
  date: Date;
  onDrop: (postId: string, date: Date) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType.POST,
    drop: (item: { postId: string }) => {
      onDrop(item.postId, date);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      className={`min-h-[60px] p-2 border rounded transition-colors ${isOver ? "bg-primary/10 border-primary" : ""
        }`}
    >
      <div className="text-xs font-medium mb-1">{format(date, "d", { locale: enUS })}</div>
    </div>
  );
}

function ScheduleCalendarContent() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScheduledPosts();
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("generated_posts")
        .select("id, caption, image_url")
        .eq("user_id", user.id)
        .eq("status", "draft")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setSavedPosts(data || []);
    } catch (error: any) {
      console.error("Error loading saved posts:", error);
    }
  };

  const loadScheduledPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("scheduled_posts")
        .select(`
          *,
          generated_posts (id, caption, image_url)
        `)
        .eq("user_id", user.id)
        .eq("status", "scheduled")
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      setScheduledPosts(data || []);
    } catch (error: any) {
      console.error("Error loading scheduled posts:", error);
    }
  };

  const handleDrop = async (postId: string, dropDate: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("company_profiles")
        .select("instagram_access_token")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.instagram_access_token) {
        toast.error("Connect your Instagram account first");
        return;
      }

      const scheduleData = {
        user_id: user.id,
        generated_post_id: postId,
        scheduled_date: format(dropDate, "yyyy-MM-dd"),
        scheduled_time: "12:00",
        status: "scheduled",
      };

      const { error } = await supabase
        .from("scheduled_posts")
        .insert(scheduleData);

      if (error) throw error;

      toast.success(`Post scheduled for ${format(dropDate, "dd/MM/yyyy", { locale: enUS })}`);
      loadScheduledPosts();
      loadSavedPosts();
    } catch (error: any) {
      console.error("Error scheduling post:", error);
      toast.error("Error scheduling post");
    }
  };

  const handleSchedule = async () => {
    if (!date) {
      toast.error("Select a date");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("company_profiles")
        .select("instagram_access_token")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.instagram_access_token) {
        toast.error("Connect your Instagram account first in Settings");
        setLoading(false);
        return;
      }

      const scheduleData = {
        user_id: user.id,
        scheduled_date: format(date, "yyyy-MM-dd"),
        scheduled_time: selectedTime,
        status: "scheduled",
      };

      const { error } = await supabase
        .from("scheduled_posts")
        .insert(scheduleData);

      if (error) throw error;

      toast.success("Post scheduled! It will be published automatically on Instagram.");
      setShowDialog(false);
      loadScheduledPosts();
    } catch (error: any) {
      console.error("Error scheduling post:", error);
      toast.error("Error scheduling post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Schedule removed");
      loadScheduledPosts();
      loadSavedPosts();
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      toast.error("Error removing schedule");
    }
  };

  const nextPost = scheduledPosts[0];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <h2 className="text-xl font-display font-bold mb-4">Content Calendar</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Drag saved posts to the calendar to schedule them
        </p>
        <div className="flex justify-center mb-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            components={{
              Day: ({ date: dayDate }) => (
                <DroppableCalendarDay date={dayDate} onDrop={handleDrop} />
              )
            }}
          />
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Manual Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Selected Date</Label>
                <div className="text-sm text-muted-foreground">
                  {date ? format(date, "dd/MM/yyyy") : "No date selected"}
                </div>
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSchedule}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Scheduling..." : "Confirm Schedule"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="mt-6 space-y-2 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Scheduled posts: <span className="font-semibold">{scheduledPosts.length}</span>
          </p>
          {nextPost && (
            <p className="text-sm text-muted-foreground">
              Next publication:{" "}
              <span className="font-semibold">
                {format(new Date(nextPost.scheduled_date), "dd/MM/yyyy")} at {nextPost.scheduled_time}
              </span>
            </p>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-display font-bold mb-4">Saved Posts</h2>
          <div className="space-y-2">
            {savedPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No saved posts
              </p>
            ) : (
              savedPosts.map((post) => (
                <DraggablePost key={post.id} post={post} />
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-display font-bold mb-4">Scheduled Posts</h2>
          <div className="space-y-3">
            {scheduledPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No posts scheduled
              </p>
            ) : (
              scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3 border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {format(new Date(post.scheduled_date), "dd/MM/yyyy", { locale: enUS })}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {post.scheduled_time}
                      </div>
                      {post.generated_posts && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {post.generated_posts.caption.substring(0, 40)}...
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function ScheduleCalendar() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ScheduleCalendarContent />
    </DndProvider>
  );
}