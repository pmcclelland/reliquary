import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useTheme,
  type ThemePreference,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({
  variant = "icon",
  side = "bottom",
  align = "end",
}: {
  variant?: "icon" | "row";
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];
  const Icon = mounted ? current.icon : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "row" ? (
          <Button
            variant="ghost"
            className="h-10 w-full justify-start px-2 text-muted hover:text-fg"
            aria-label="Appearance"
          >
            <Icon className="size-4" />
            {mounted ? current.label : "System"}
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label="Appearance">
            <Icon className="size-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="min-w-40">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            className="min-h-10"
            onSelect={() => setTheme(opt.value)}
          >
            <opt.icon className="size-3.5" />
            {opt.label}
            <Check
              className={cn(
                "ml-auto size-3.5",
                mounted && theme === opt.value ? "opacity-100" : "opacity-0",
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
