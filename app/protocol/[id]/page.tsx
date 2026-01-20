"use client";

import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { mockProtocols } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function ProtocolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const protocol = mockProtocols.find((p) => p.id === params.id);

  if (!protocol) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">Protocol not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Protocol Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange/20 to-brand-orange/5">
                  <span className="text-3xl font-bold text-brand-orange">
                    {protocol.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {protocol.name}
                  </h1>
                  {protocol.url && (
                    <a
                      href={protocol.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-brand-orange hover:underline"
                    >
                      <span>{protocol.url}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              <Badge variant="secondary">{protocol.category}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {protocol.description && (
              <p className="text-gray-600">{protocol.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {protocol.chains.map((chain) => (
                <Badge key={chain} variant="outline">
                  {chain}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Ethos Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ethos Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-brand-orange">
                  {protocol.ethos.score.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">
                  Based on {protocol.ethos.reviewCount} reviews
                </p>
                {protocol.ethos.sentiment && (
                  <p className="text-sm text-gray-600">
                    Sentiment: {(protocol.ethos.sentiment * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stock Metric */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {protocol.metrics.stock.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-gray-900">
                  {formatCurrency(protocol.metrics.stock.value)}
                </p>
                <p className="text-sm text-gray-600">
                  {protocol.metrics.stock.unit}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Flow Metric */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {protocol.metrics.flow.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-gray-900">
                  {formatCurrency(protocol.metrics.flow.value)}
                </p>
                <p className="text-sm text-gray-600">
                  {protocol.metrics.flow.unit}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle>Stock-Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                This protocol shows a {protocol.ethos.score >= 8 ? "strong" : "moderate"} social
                credibility rating with an Ethos score of {protocol.ethos.score.toFixed(1)}.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-brand-cream p-4">
                  <h3 className="font-semibold text-gray-900">Stock (Capital)</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    The {protocol.metrics.stock.label.toLowerCase()} of{" "}
                    {formatCurrency(protocol.metrics.stock.value)} represents the
                    accumulated trust and capital commitment in this protocol.
                  </p>
                </div>
                <div className="rounded-lg bg-brand-cream p-4">
                  <h3 className="font-semibold text-gray-900">Flow (Activity)</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    The {protocol.metrics.flow.label.toLowerCase()} of{" "}
                    {formatCurrency(protocol.metrics.flow.value)} shows the ongoing
                    activity and willingness to pay for using this protocol.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
