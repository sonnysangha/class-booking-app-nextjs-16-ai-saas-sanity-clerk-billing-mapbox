"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useDocuments } from "@sanity/sdk-react";
import { Bolt, Home, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function DocumentCount({
  documentType,
}: {
  documentType: "activity" | "venue" | "classSession";
}) {
  const { data } = useDocuments({ documentType });
  return <span>{data?.length ?? 0}</span>;
}

function DocumentCountSkeleton() {
  return <Skeleton className="h-8 w-12" />;
}

const sections = [
  {
    title: "Activities",
    description: "Class templates and their scheduled sessions",
    href: "/admin/activities",
    icon: Bolt,
    documentType: "activity" as const,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Venues",
    description: "Locations where classes are held",
    href: "/admin/venues",
    icon: Home,
    documentType: "venue" as const,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Sessions",
    description: "Scheduled class instances (manage via Activities)",
    href: "/admin/activities",
    icon: Calendar,
    documentType: "classSession" as const,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your fitness classes, venues, and schedules.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.documentType} href={section.href}>
              <Card className="group h-full transition-all hover:border-primary hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {section.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${section.bgColor}`}>
                    <Icon className={`h-4 w-4 ${section.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Suspense fallback={<DocumentCountSkeleton />}>
                      <DocumentCount documentType={section.documentType} />
                    </Suspense>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Manage <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <h2 className="font-semibold">Quick Tips</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>
            1. Add <strong>Venues</strong> where classes will be held
          </li>
          <li>
            2. Create <strong>Activities</strong> (class templates like yoga, HIIT)
          </li>
          <li>
            3. <strong>Schedule sessions</strong> for each activity by expanding it
          </li>
        </ul>
      </div>
    </div>
  );
}
