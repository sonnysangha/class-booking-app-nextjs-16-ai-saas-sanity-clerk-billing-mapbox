"use client";

import { useState } from "react";
import { useSanityClient } from "@/lib/hooks/useSanityClient";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AddressSearch,
  type AddressResult,
} from "@/components/app/maps/AddressSearch";

export function CreateVenueDialog() {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [address, setAddress] = useState<AddressResult | null>(null);

  const client = useSanityClient();

  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    setIsCreating(true);
    try {
      await client.create({
        _type: "venue",
        name: formData.name,
        description: formData.description || undefined,
        address: address
          ? {
              fullAddress: address.address,
              street: address.street,
              city: address.city,
              postcode: address.postcode,
              country: address.country,
              lat: address.lat,
              lng: address.lng,
            }
          : undefined,
      });
      setFormData({ name: "", description: "" });
      setAddress(null);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create venue:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Venue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Venue</DialogTitle>
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
              placeholder="e.g., Downtown Fitness Center"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-description">Description</Label>
            <Textarea
              id="create-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the venue"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <AddressSearch
              value={address}
              onChange={setAddress}
              placeholder="Search for venue address..."
            />
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
              "Create Venue"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
