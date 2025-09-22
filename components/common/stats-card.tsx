import React from "react";
import { type Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    icon: Icon;
  };
  footer?: {
    label: string;
    detail: string;
    icon: Icon;
  };
}

export function StatsCard({ title, value, description, trend, footer }: StatsCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {trend && (
          <CardAction>
            <Badge variant="outline">
              <trend.icon />
              {trend.value}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {footer && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {footer.label} <footer.icon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {footer.detail}
          </div>
        </CardFooter>
      )}
      {description && !footer && (
        <CardFooter className="pt-0">
          <div className="text-xs text-muted-foreground">
            {description}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
