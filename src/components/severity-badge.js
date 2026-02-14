import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES = {
  Low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  Medium: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  High: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

export function SeverityBadge({ severity, className }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border text-xs font-normal",
        SEVERITY_STYLES[severity] || "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      {severity || "—"}
    </Badge>
  );
}
