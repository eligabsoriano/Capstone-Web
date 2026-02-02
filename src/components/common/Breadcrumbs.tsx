import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Route to label mappings
const routeLabels: Record<string, string> = {
  // Admin routes
  admin: "Dashboard",
  officers: "Loan Officers",
  admins: "Admins",
  applications: "Applications",
  workload: "Officer Workload",
  products: "Loan Products",
  "audit-logs": "Audit Logs",
  settings: "Settings",
  // Loan Officer routes
  officer: "Dashboard",
  payments: "Payments",
  documents: "Documents",
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Home" }];
  }

  const breadcrumbs: BreadcrumbItem[] = [];

  // Build breadcrumb path
  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip ID-like segments (ObjectId format or numeric)
    if (/^[0-9a-f]{24}$/i.test(segment) || /^\d+$/.test(segment)) {
      continue;
    }

    const label =
      routeLabels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);

    // Last item doesn't have a link
    if (i === segments.length - 1) {
      breadcrumbs.push({ label });
    } else {
      breadcrumbs.push({ label, href: currentPath });
    }
  }

  return breadcrumbs;
}

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const location = useLocation();
  const breadcrumbs = generateBreadcrumbs(location.pathname);

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on root pages
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center text-sm text-muted-foreground",
        className,
      )}
    >
      <ol className="flex items-center gap-1">
        {/* Home icon */}
        <li>
          <Link
            to={location.pathname.startsWith("/admin") ? "/admin" : "/officer"}
            className="hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {breadcrumbs.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="flex items-center gap-1"
          >
            <ChevronRight className="h-4 w-4" />
            {item.href ? (
              <Link
                to={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
