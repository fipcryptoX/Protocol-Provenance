"use client";

import { Protocol } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Clock, MoreVertical, ExternalLink } from "lucide-react";

interface ProtocolCardProps {
  protocol: Protocol;
  onClick?: () => void;
}

export function ProtocolCard({ protocol, onClick }: ProtocolCardProps) {
  const { name, category, ethos, metrics, url, description, chains, timeframe } = protocol;

  // Calculate progress percentage based on metrics
  const stockValue = metrics.stock.value;
  const maxValue = 10_000_000_000; // 10B for normalization
  const progressPercentage = Math.min((stockValue / maxValue) * 100, 100);

  // Determine progress bar color based on flow trend
  const getProgressColor = () => {
    if (progressPercentage >= 70) return "#22c55e"; // green
    if (progressPercentage >= 40) return "#eab308"; // yellow
    return "#ef4444"; // red
  };

  // Calculate time remaining (mock data)
  const daysLeft = Math.floor(Math.random() * 12) + 2;

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Protocol Icon/Logo */}
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-brand-orange/20 to-brand-orange/5">
              <span className="text-xl font-bold text-brand-orange">
                {name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{name}</h3>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-brand-orange"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{new URL(url).hostname}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Category Badge */}
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}

        {/* Ethos Score */}
        <div className="rounded-lg bg-brand-cream p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">
              Ethos Score
            </span>
            <span className="text-lg font-bold text-brand-orange">
              {ethos.score.toFixed(1)}
            </span>
          </div>
          {ethos.reviewCount > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {ethos.reviewCount} reviews
            </p>
          )}
        </div>

        {/* Stock-Flow Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs font-medium text-gray-600">
              {metrics.stock.label}
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {formatCurrency(metrics.stock.value)}
            </p>
            <p className="text-xs text-gray-500">{metrics.stock.unit}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs font-medium text-gray-600">
              {metrics.flow.label}
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {formatCurrency(metrics.flow.value)}
            </p>
            <p className="text-xs text-gray-500">{metrics.flow.unit}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Progress</span>
            <span className="text-xs font-medium text-gray-900">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={progressPercentage} indicatorColor={getProgressColor()} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{daysLeft} days left</span>
          </div>
          {chains.length > 0 && (
            <div className="flex -space-x-2">
              {chains.slice(0, 3).map((chain, index) => (
                <div
                  key={chain}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200"
                  title={chain}
                >
                  <span className="text-xs font-medium text-gray-700">
                    {chain.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
