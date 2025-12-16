import type { StructureResolver } from "sanity/structure";
import {
  CalendarIcon,
  HomeIcon,
  TagIcon,
  BoltIcon,
  ClipboardIcon,
  UserIcon,
} from "@sanity/icons";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("FitPass Studio")
    .items([
      // Classes Section
      S.listItem()
        .title("Classes")
        .icon(BoltIcon)
        .child(
          S.list()
            .title("Classes")
            .items([
              S.documentTypeListItem("activity")
                .title("Activities")
                .icon(BoltIcon),
              S.documentTypeListItem("classSession")
                .title("Sessions")
                .icon(CalendarIcon),
              S.documentTypeListItem("category")
                .title("Categories")
                .icon(TagIcon),
            ])
        ),

      S.divider(),

      // Venues
      S.documentTypeListItem("venue").title("Venues").icon(HomeIcon),

      S.divider(),

      // Users & Bookings
      S.listItem()
        .title("Users & Bookings")
        .icon(UserIcon)
        .child(
          S.list()
            .title("Users & Bookings")
            .items([
              S.documentTypeListItem("userProfile")
                .title("Users")
                .icon(UserIcon),
              S.documentTypeListItem("booking")
                .title("Bookings")
                .icon(ClipboardIcon),
            ])
        ),
    ]);
