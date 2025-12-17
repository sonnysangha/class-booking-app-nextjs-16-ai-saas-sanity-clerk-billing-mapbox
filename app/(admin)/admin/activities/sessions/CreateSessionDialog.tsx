"use client";

import { Suspense, useState } from "react";
import { useSanityClient } from "@/lib/hooks/useSanityClient";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VenuePicker } from "@/components/admin/VenuePicker";

interface CreateSessionDialogProps {
  activityId: string;
  onCreated: () => void;
}

export function CreateSessionDialog({
  activityId,
  onCreated,
}: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    venueId: "",
    startTime: "",
    maxCapacity: 20,
  });

  const client = useSanityClient();

  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now.toISOString().slice(0, 16);
  };

  const handleCreate = async () => {
    if (!formData.venueId || !formData.startTime) return;

    setIsCreating(true);
    try {
      await client.create({
        _type: "classSession",
        activity: {
          _type: "reference",
          _ref: activityId,
        },
        venue: {
          _type: "reference",
          _ref: formData.venueId,
        },
        startTime: new Date(formData.startTime).toISOString(),
        maxCapacity: formData.maxCapacity,
        status: "scheduled",
      });
      setFormData({ venueId: "", startTime: "", maxCapacity: 20 });
      setOpen(false);
      onCreated();
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule New Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Venue *</Label>
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <VenuePicker
                value={formData.venueId}
                onChange={(value) =>
                  setFormData({ ...formData, venueId: value })
                }
              />
            </Suspense>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-startTime">Date & Time *</Label>
              <Input
                id="session-startTime"
                type="datetime-local"
                value={formData.startTime || getDefaultDateTime()}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-capacity">Capacity</Label>
              <Input
                id="session-capacity"
                type="number"
                value={formData.maxCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxCapacity: Number(e.target.value),
                  })
                }
                min={1}
                max={100}
              />
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !formData.venueId || !formData.startTime}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Schedule Session"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

