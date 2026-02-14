"use client";

import dynamic from "next/dynamic";

const IssuesMapClient = dynamic(
  () => import("./IssuesMapClient"),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        Loading map…
      </div>
    ),
  }
);

export default function IssuesMap(props) {
  return <IssuesMapClient {...props} />;
}
