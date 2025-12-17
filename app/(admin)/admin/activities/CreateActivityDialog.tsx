"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSanityClient } from "@/lib/hooks/useSanityClient";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIER_OPTIONS } from "@/lib/constants/subscription";

export function CreateActivityDialog() {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    instructor: "",
    duration: 60,
    tierLevel: "basic",
  });

  const client = useSanityClient();
  const router = useRouter();

  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    setIsCreating(true);
    try {
      const newActivity = await client.create({
        _type: "activity",
        name: formData.name,
        instructor: formData.instructor,
        duration: formData.duration,
        tierLevel: formData.tierLevel,
      });
      setFormData({
        name: "",
        instructor: "",
        duration: 60,
        tierLevel: "basic",
      });
      setOpen(false);
      // Navigate to the new activity's detail page
      router.push(`/admin/activities/${newActivity._id}`);
    } catch (error) {
      console.error("Failed to create activity:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Activity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">Name *</Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Morning Yoga Flow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-instructor">Instructor *</Label>
            <Input
              id="create-instructor"
              value={formData.instructor}
              onChange={(e) =>
                setFormData({ ...formData, instructor: e.target.value })
              }
              placeholder="Instructor name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-duration">Duration (min)</Label>
              <Input
                id="create-duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: Number(e.target.value) })
                }
                min={15}
                max={180}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-tier">Tier Level</Label>
              <Select
                value={formData.tierLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, tierLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIER_OPTIONS.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !formData.name.trim()}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Activity"
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            You can add images and set the category after creating.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
