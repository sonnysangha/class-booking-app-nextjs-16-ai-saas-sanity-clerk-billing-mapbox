"use client";

import {
  useDocument,
  useEditDocument,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  AddressSearch,
  type AddressResult,
} from "@/components/app/maps/AddressSearch";
import { VenueSessions } from "./VenueSessions";
import type { Venue } from "@/sanity.types";

type VenueAddress = Venue["address"];

interface VenueDetailsProps {
  documentId: string;
}

export function VenueDetails({ documentId }: VenueDetailsProps) {
  const handle: DocumentHandle = { documentType: "venue", documentId };

  const { data: name } = useDocument({ ...handle, path: "name" });
  const { data: description } = useDocument({ ...handle, path: "description" });
  const { data: address } = useDocument({ ...handle, path: "address" });

  const editName = useEditDocument({ ...handle, path: "name" });
  const editDescription = useEditDocument({ ...handle, path: "description" });
  const editAddress = useEditDocument({ ...handle, path: "address" });

  // Convert Sanity address to AddressResult format
  const venueAddress = address as VenueAddress | undefined;
  const addressValue: AddressResult | null = venueAddress?.fullAddress
    ? {
        address: venueAddress.fullAddress,
        lat: venueAddress.lat ?? 0,
        lng: venueAddress.lng ?? 0,
        street: venueAddress.street,
        city: venueAddress.city,
        postcode: venueAddress.postcode,
        country: venueAddress.country,
      }
    : null;

  const handleAddressChange = (newAddress: AddressResult | null) => {
    if (newAddress) {
      editAddress({
        fullAddress: newAddress.address,
        street: newAddress.street,
        city: newAddress.city,
        postcode: newAddress.postcode,
        country: newAddress.country,
        lat: newAddress.lat,
        lng: newAddress.lng,
      });
    } else {
      editAddress(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={typeof name === "string" ? name : ""}
              onChange={(e) => editName(e.target.value)}
              placeholder="Venue name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={typeof description === "string" ? description : ""}
              onChange={(e) => editDescription(e.target.value)}
              placeholder="Brief description of the venue"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <AddressSearch
              value={addressValue}
              onChange={handleAddressChange}
              placeholder="Search for venue address..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Images Card */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader {...handle} />
        </CardContent>
      </Card>

      {/* Sessions at this Venue - Full Width */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Sessions at this Venue</CardTitle>
        </CardHeader>
        <CardContent>
          <VenueSessions venueId={documentId.replace("drafts.", "")} />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteButton
            handle={handle}
            redirectTo="/admin/venues"
            referenceQuery={`*[_type == "classSession" && references($id)]{ _id }`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
