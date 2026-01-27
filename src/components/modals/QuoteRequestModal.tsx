"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PEI_SOLAR_COMPANIES } from "../../lib/data/peiSolarCompanies";
import {
  X,
  CheckCircle2,
  Mail,
  Phone,
  User,
  MessageSquare,
} from "lucide-react";

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData?: {
    systemSizeKW: number;
    panelCount: number;
    annualProductionKWh: number;
    estimatedCost?: number;
    address?: string;
  };
  analysisType: "plan" | "improve";
}

export function QuoteRequestModal({
  isOpen,
  onClose,
  analysisData,
  analysisType,
}: QuoteRequestModalProps) {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCompanyToggle = (companyName: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyName)
        ? prev.filter((c) => c !== companyName)
        : [...prev, companyName],
    );
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === PEI_SOLAR_COMPANIES.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(PEI_SOLAR_COMPANIES.map((c) => c.name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCompanies.length === 0) {
      alert("Please select at least one company to contact");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare quote request data
      const quoteRequest = {
        ...formData,
        selectedCompanies,
        analysisData,
        analysisType,
        timestamp: new Date().toISOString(),
      };

      // TODO: Send to API endpoint that handles quote requests
      // For now, we'll simulate the request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Quote request:", quoteRequest);

      // Show success state
      setIsSubmitted(true);

      // Reset after 3 seconds and close
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: "", email: "", phone: "", message: "" });
        setSelectedCompanies([]);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Quote request failed:", error);
      alert(
        "Failed to submit quote request. Please try again or contact companies directly.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-primary/20 animate-in zoom-in-95 duration-200">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Mail className="h-7 w-7 text-primary" />
                Request Installation Quotes
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Get free quotes from certified PEI solar installers based on
                your analysis
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {isSubmitted ? (
            // Success State
            <div className="py-16 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Quote Request Sent!
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your analysis has been sent to {selectedCompanies.length}{" "}
                  {selectedCompanies.length === 1 ? "company" : "companies"}.
                  They will contact you shortly with personalized quotes.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Analysis Summary */}
              {analysisData && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-foreground text-sm">
                    Your Analysis Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">System Size</div>
                      <div className="font-bold text-foreground">
                        {analysisData.systemSizeKW} kW
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Panels</div>
                      <div className="font-bold text-foreground">
                        {analysisData.panelCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Annual Production
                      </div>
                      <div className="font-bold text-foreground">
                        {analysisData.annualProductionKWh.toLocaleString()} kWh
                      </div>
                    </div>
                    {analysisData.estimatedCost && (
                      <div>
                        <div className="text-muted-foreground">Est. Cost</div>
                        <div className="font-bold text-foreground">
                          ${analysisData.estimatedCost.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Company Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Select Companies to Contact
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedCompanies.length === PEI_SOLAR_COMPANIES.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                  {PEI_SOLAR_COMPANIES.map((company) => (
                    <div
                      key={company.name}
                      onClick={() => handleCompanyToggle(company.name)}
                      className={`
                        cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                        ${
                          selectedCompanies.includes(company.name)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`
                          mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors
                          ${
                            selectedCompanies.includes(company.name)
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }
                        `}
                        >
                          {selectedCompanies.includes(company.name) && (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground text-sm">
                            {company.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {company.address}
                          </div>
                          {company.category && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                                {company.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Selected: {selectedCompanies.length} of{" "}
                  {PEI_SOLAR_COMPANIES.length} companies
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Your Contact Information
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="John Doe"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="(902) 555-0123"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm">
                    Additional Message (Optional)
                  </Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell installers about your timeline, preferences, or any questions..."
                      className="w-full pl-10 pr-4 py-2 min-h-24 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 text-xs text-blue-800 dark:text-blue-300">
                <p className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    <strong>Privacy Notice:</strong> Your contact information
                    and analysis results will only be shared with the companies
                    you select. SolarPEI does not sell or share your data with
                    third parties.
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting || selectedCompanies.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending Request...
                    </>
                  ) : (
                    `Send Request to ${selectedCompanies.length} ${selectedCompanies.length === 1 ? "Company" : "Companies"}`
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
