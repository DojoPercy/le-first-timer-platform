"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { MessageSquare, Download, Send, Users, FileText, AlertCircle } from "lucide-react";
import { defaultMessageTemplates } from "@/lib/utils/arkesel-sms";

interface MessageTemplate {
  name: string;
  type: 'welcome' | 'reminder' | 'followup' | 'custom';
  content: string;
  variables: string[];
}

export default function CommunicationHub() {
  const [activeTab, setActiveTab] = useState("sms");
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [reportFormat, setReportFormat] = useState<"pdf" | "csv">("pdf");
  const [reportType, setReportType] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportWeek, setReportWeek] = useState(Math.ceil(new Date().getDate() / 7));
  const [includeFirstTimers, setIncludeFirstTimers] = useState(true);
  const [includeFollowups, setIncludeFollowups] = useState(true);
  const [messageVariables, setMessageVariables] = useState<Record<string, string>>({});
  const [smsBalance, setSmsBalance] = useState<string | null>(null);

  const handleTemplateSelect = (templateName: string) => {
    const template = defaultMessageTemplates.find(t => t.name === templateName);
    if (template) {
      setSelectedTemplate(template);
      setCustomMessage(template.content);
      
      // Initialize variables object
      const vars: Record<string, string> = {};
      template.variables.forEach(variable => {
        vars[variable] = "";
      });
      setMessageVariables(vars);
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    setMessageVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const previewMessage = () => {
    if (!customMessage) return "";
    
    let preview = customMessage;
    Object.entries(messageVariables).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    });
    
    return preview;
  };

  const handleSendSMS = async () => {
    if (!phoneNumbers.trim()) {
      toast.error("Please enter at least one phone number");
      return;
    }

    if (!customMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    // Check if all template variables are filled
    if (selectedTemplate) {
      const missingVars = selectedTemplate.variables.filter(variable => !messageVariables[variable]);
      if (missingVars.length > 0) {
        toast.error(`Please fill in all template variables: ${missingVars.join(", ")}`);
        return;
      }
    }

    setIsSendingSMS(true);
    
    try {
      const phones = phoneNumbers.split(',').map(p => p.trim()).filter(p => p);
      const message = previewMessage();

      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_bulk',
          recipients: phones,
          message: message,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Message sent to ${phones.length} recipients`);
        setPhoneNumbers("");
        setCustomMessage("");
        setSelectedTemplate(null);
        setMessageVariables({});
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSendingSMS(false);
    }
  };

  const getPeriodString = () => {
    if (reportType === "weekly") {
      const monthName = new Date(reportYear, reportMonth - 1).toLocaleDateString("en-US", {
        month: "long",
      });
      return `Week ${reportWeek}, ${monthName} ${reportYear}`;
    }
    if (reportType === "monthly") {
      const monthName = new Date(reportYear, reportMonth - 1).toLocaleDateString("en-US", { month: "long" });
      return `${monthName} ${reportYear}`;
    }
    return `${reportYear}`;
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const periodString = getPeriodString();

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: periodString,
          reportType,
          year: reportYear,
          month: reportType === "monthly" || reportType === "weekly" ? reportMonth : undefined,
          week: reportType === "weekly" ? reportWeek : undefined,
          includeFirstTimers,
          includeFollowups,
          format: reportFormat,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      if (reportFormat === 'pdf') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `telepastoring-report-${periodString.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `telepastoring-report-${periodString.replace(/\s+/g, '-').toLowerCase()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast.success(`${reportFormat.toUpperCase()} report generated successfully!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const checkSMSBalance = async () => {
    try {
      const response = await fetch('/api/sms?action=balance');
      const result = await response.json();
      
      if (result.success) {
        setSmsBalance(result.data.data?.balance || 'Unknown');
      }
    } catch (error) {
      console.error('Failed to check SMS balance:', error);
    }
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'reminder': return 'bg-blue-100 text-blue-800';
      case 'followup': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Communication Hub
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Send bulk SMS messages and generate department reports
          </p>
        </div>
        
        {smsBalance && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">SMS Balance:</span>
            <Badge variant="outline">{smsBalance}</Badge>
            <Button variant="outline" size="sm" onClick={checkSMSBalance}>
              Refresh
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Bulk SMS
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Message Composition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Message Composition
                </CardTitle>
                <CardDescription>
                  Create your message using templates or custom text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>Message Template</Label>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template or write custom" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultMessageTemplates.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          <div className="flex items-center gap-2">
                            <Badge className={getTemplateTypeColor(template.type)}>
                              {template.type}
                            </Badge>
                            {template.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message Content</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={6}
                  />
                </div>

                {/* Template Variables */}
                {selectedTemplate && selectedTemplate.variables.length > 0 && (
                  <div className="space-y-3">
                    <Label>Template Variables</Label>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Fill in these variables to personalize your message
                      </AlertDescription>
                    </Alert>
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable} className="space-y-1">
                        <Label htmlFor={variable} className="text-sm">
                          {variable.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <Input
                          id={variable}
                          placeholder={`Enter ${variable}`}
                          value={messageVariables[variable] || ""}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Preview */}
                {customMessage && (
                  <div className="space-y-2">
                    <Label>Message Preview</Label>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {previewMessage()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recipients & Sending */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recipients
                </CardTitle>
                <CardDescription>
                  Add phone numbers for bulk messaging
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phones">Phone Numbers</Label>
                  <Textarea
                    id="phones"
                    placeholder="Enter phone numbers separated by commas&#10;Example: 233241234567, 233202345678, 233273456789"
                    value={phoneNumbers}
                    onChange={(e) => setPhoneNumbers(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-slate-500">
                    Format: Country code + number (e.g., 233241234567)
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includeFirstTimers" />
                    <Label htmlFor="includeFirstTimers" className="text-sm">
                      Include all first timers from this week
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includeCallers" />
                    <Label htmlFor="includeCallers" className="text-sm">
                      Include all assigned callers
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={handleSendSMS}
                  disabled={isSendingSMS || !phoneNumbers.trim() || !customMessage.trim()}
                  className="w-full"
                >
                  {isSendingSMS ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Bulk SMS
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Generate Department Report
              </CardTitle>
              <CardDescription>
                Create comprehensive PDF or CSV reports for leadership review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type Selection */}
              <div
                className={`grid gap-4 ${reportType === "weekly" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}
              >
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={(value: "weekly" | "monthly" | "yearly") => setReportType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                      <SelectItem value="yearly">Yearly Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={reportYear.toString()} onValueChange={(value) => setReportYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {(reportType === "monthly" || reportType === "weekly") && (
                  <div className="space-y-2">
                    <Label htmlFor="reportMonth">Month</Label>
                    <Select
                      value={reportMonth.toString()}
                      onValueChange={(value) => setReportMonth(parseInt(value))}
                    >
                      <SelectTrigger id="reportMonth">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="2">February</SelectItem>
                        <SelectItem value="3">March</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">June</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="8">August</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {reportType === "weekly" && (
                  <div className="space-y-2">
                    <Label htmlFor="reportWeek">Week of month</Label>
                    <Select
                      value={reportWeek.toString()}
                      onValueChange={(value) => setReportWeek(parseInt(value))}
                    >
                      <SelectTrigger id="reportWeek">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Week 1 (days 1–7)</SelectItem>
                        <SelectItem value="2">Week 2 (days 8–14)</SelectItem>
                        <SelectItem value="3">Week 3 (days 15–21)</SelectItem>
                        <SelectItem value="4">Week 4 (days 22–28)</SelectItem>
                        <SelectItem value="5">Week 5 (remaining days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Report Format */}
              <div className="space-y-2">
                <Label htmlFor="format">Report Format</Label>
                <Select value={reportFormat} onValueChange={(value: "pdf" | "csv") => setReportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report (Recommended)</SelectItem>
                    <SelectItem value="csv">CSV Data Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Report Contents</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeFirstTimers"
                      checked={includeFirstTimers}
                      onCheckedChange={(checked) => setIncludeFirstTimers(checked as boolean)}
                    />
                    <Label htmlFor="includeFirstTimers" className="text-sm">
                      Include First Timer Statistics and Analytics
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeFollowups"
                      checked={includeFollowups}
                      onCheckedChange={(checked) => setIncludeFollowups(checked as boolean)}
                    />
                    <Label htmlFor="includeFollowups" className="text-sm">
                      Include Follow-up Data and Caller Performance
                    </Label>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-medium text-slate-900 mb-2">Report Preview</h4>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-medium text-slate-800">Period: {getPeriodString()}</p>
                  <p className="font-medium text-slate-800">Format: {reportFormat.toUpperCase()}</p>
                  <p>• Executive Summary with key metrics</p>
                  <p>• Top performing cells and inviters</p>
                  <p>• Caller performance and accountability</p>
                  <p>• Conversion rates and trends</p>
                  <p>• Recommendations and observations</p>
                </div>
              </div>

              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="w-full"
                size="lg"
              >
                {isGeneratingReport ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate {reportFormat.toUpperCase()} Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
