"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { useFormStatus } from "react-dom";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  sendAnnouncementAction,
  getRecipientsCountAction,
  searchGuardiansAction,
  getAnnouncementHistoryAction,
} from "@/actions/announcement-actions";
import { schoolConfig } from "@/lib/env";
import type { ActionResponse } from "@/types";

function SubmitButton({
  isSending,
  progress,
  total,
}: {
  isSending: boolean;
  progress: { sent: number; failed: number };
  total: number;
}) {
  const { pending } = useFormStatus();

  if (progress.sent > 0 || progress.failed > 0) {
    return (
      <div className="text-sm text-green-600 font-medium">
        {progress.failed > 0 ? (
          <span className="text-amber-600">
            Sent to {progress.sent}/{total} — {progress.failed} failed
          </span>
        ) : (
          <span>Sent to {progress.sent}/{total} successfully</span>
        )}
      </div>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending || isSending}
      className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
    >
      {pending || isSending
        ? `Sending... (${progress.sent + progress.failed}/${total || "?"})`
        : "Send Announcement"}
    </button>
  );
}

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState("send");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendTo, setSendTo] = useState<"everyone" | "class" | "individual">("everyone");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGuardian, setSelectedGuardian] = useState<{
    id: string;
    full_name: string;
    student_name: string;
    phone: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [sendSMS, setSendSMS] = useState(true);
  const [recipientCount, setRecipientCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, failed: 0 });
  const [resultMessage, setResultMessage] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [detailDialog, setDetailDialog] = useState<any>(null);

  const fetchRecipients = useCallback(async () => {
    const { count } = await getRecipientsCountAction({
      sendTo,
      classId: selectedClass || undefined,
      guardianId: selectedGuardian?.id,
    });
    setRecipientCount(count);
  }, [sendTo, selectedClass, selectedGuardian]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  useEffect(() => {
    if (sendTo !== "individual") {
      setSelectedGuardian(null);
      setSearchResults([]);
    }
  }, [sendTo]);

  useEffect(() => {
    if (sendTo === "class" && !classes.length) {
      fetch("/api/classes")
        .then((r) => r.json())
        .then((d) => setClasses(d.classes || []))
        .catch(() => {});
    }
  }, [sendTo, classes.length]);

  useEffect(() => {
    if (activeTab === "history") {
      getAnnouncementHistoryAction().then((res) => setHistory(res.announcements));
    }
  }, [activeTab]);

  useEffect(() => {
    if (!searchQuery || sendTo !== "individual") return;
    const timer = setTimeout(async () => {
      const { guardians } = await searchGuardiansAction(searchQuery);
      setSearchResults(guardians);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, sendTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendWhatsApp && !sendSMS) {
      setResultMessage("Select at least one channel");
      return;
    }
    setIsSending(true);
    setProgress({ sent: 0, failed: 0 });
    setResultMessage("");

    const result: ActionResponse<{ sent: number; failed: number; total: number }> =
      await sendAnnouncementAction({
        title,
        message,
        sendTo,
        classId: selectedClass || undefined,
        guardianId: selectedGuardian?.id,
        sendWhatsApp,
        sendSMS,
      });

    if (result.success && result.data) {
      setProgress({ sent: result.data.sent, failed: result.data.failed });
      setResultMessage(
        result.data.failed > 0
          ? `${result.data.sent} sent — ${result.data.failed} failed`
          : `Sent to ${result.data.sent} parents successfully`
      );
      if (activeTab === "history") {
        getAnnouncementHistoryAction().then((res) => setHistory(res.announcements));
      }
    } else {
      setResultMessage(result.message);
    }

    setIsSending(false);
  };

  const previewMessage = `${schoolConfig.name}: ${message}`;
  const charCount = message.length;
  const isOverLimit = charCount > 160;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-sm text-slate-500">Broadcast messages to parents and students.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="send">Send Announcement</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title (internal reference)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Term 2 Fee Reminder"
                  className="mt-1.5"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message to parents here..."
                  className="mt-1.5 min-h-[120px]"
                  maxLength={500}
                  required
                />
                <div className="flex justify-between mt-1 text-xs">
                  <span className={isOverLimit ? "text-red-500 font-medium" : "text-slate-500"}>
                    {charCount}/160 characters
                    {isOverLimit && " — SMS may be split into multiple messages"}
                  </span>
                  <span className="text-slate-400">
                    Keep under 160 for best SMS delivery
                  </span>
                </div>
              </div>

              <div>
                <Label>Send To</Label>
                <RadioGroup
                  value={sendTo}
                  onValueChange={(v) => setSendTo(v as any)}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="everyone" id="to-everyone" />
                    <Label htmlFor="to-everyone" className="font-normal cursor-pointer">
                      Everyone (all parents)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="class" id="to-class" />
                    <Label htmlFor="to-class" className="font-normal cursor-pointer">
                      Specific Class
                    </Label>
                  </div>
                  {sendTo === "class" && (
                    <div className="ml-6">
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full max-w-xs border rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Select a class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="individual" id="to-individual" />
                    <Label htmlFor="to-individual" className="font-normal cursor-pointer">
                      Individual Parent
                    </Label>
                  </div>
                  {sendTo === "individual" && (
                    <div className="ml-6 space-y-2">
                      {selectedGuardian ? (
                        <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm max-w-sm">
                          <div>
                            <p className="font-medium">{selectedGuardian.full_name}</p>
                            <p className="text-xs text-slate-500">{selectedGuardian.student_name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGuardian(null);
                              setSearchQuery("");
                            }}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        <Input
                          placeholder="Search by parent name, student name, or phone..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="max-w-sm"
                        />
                      )}
                      {searchResults.length > 0 && !selectedGuardian && (
                        <div className="bg-white border rounded-lg shadow-md max-w-sm max-h-48 overflow-y-auto">
                          {searchResults.map((g: any) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => {
                                setSelectedGuardian({
                                  id: g.id,
                                  full_name: g.full_name,
                                  student_name: g.students?.full_name ?? "Unknown",
                                  phone: g.whatsapp_number || g.phone,
                                });
                                setSearchResults([]);
                                setSearchQuery("");
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b last:border-0"
                            >
                              <p className="font-medium">{g.full_name}</p>
                              <p className="text-xs text-slate-500">
                                {g.students?.full_name} — {g.relationship}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </RadioGroup>
              </div>

              <div>
                <Label>Channels</Label>
                <div className="flex gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="ch-wa"
                      checked={sendWhatsApp}
                      onCheckedChange={(v) => setSendWhatsApp(!!v)}
                    />
                    <Label htmlFor="ch-wa" className="font-normal cursor-pointer">
                      WhatsApp
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="ch-sms"
                      checked={sendSMS}
                      onCheckedChange={(v) => setSendSMS(!!v)}
                    />
                    <Label htmlFor="ch-sms" className="font-normal cursor-pointer">
                      SMS
                    </Label>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <Label className="text-xs uppercase text-slate-500">Preview</Label>
                <div className="bg-white border rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {previewMessage || <span className="text-slate-400">Your message preview will appear here...</span>}
                </div>
              </div>

              <div className="text-sm text-slate-600">
                This will be sent to{" "}
                <span className="font-semibold">{recipientCount}</span> parent
                {recipientCount !== 1 ? "s" : ""}
              </div>

              {resultMessage && (
                <div className={`text-sm font-medium px-4 py-3 rounded-lg ${
                  resultMessage.includes("failed") ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                }`}>
                  {resultMessage}
                </div>
              )}

              <SubmitButton
                isSending={isSending}
                progress={progress}
                total={recipientCount}
              />
            </form>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No announcements sent yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Sent To</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Sent By</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(a.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {a.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {a.target === "all"
                              ? "Everyone"
                              : a.target === "class"
                                ? a.classes?.name ?? "Class"
                                : a.guardians?.full_name ?? "Individual"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{a.recipient_count}</TableCell>
                        <TableCell className="text-sm text-green-600">
                          {a.delivered_count}
                        </TableCell>
                        <TableCell className="text-sm text-red-500">
                          {a.failed_count}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {a.profiles?.full_name ?? "Unknown"}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => setDetailDialog(a)}
                            className="text-xs text-slate-500 hover:text-slate-900 underline"
                          >
                            View
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{detailDialog?.title}</DialogTitle>
            <DialogDescription>
              Sent on {detailDialog
                ? new Date(detailDialog.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 text-sm whitespace-pre-wrap">
              {detailDialog?.body}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Sent To</p>
                <p className="font-medium">
                  {detailDialog?.target === "all"
                    ? "Everyone"
                    : detailDialog?.target === "class"
                      ? detailDialog?.classes?.name ?? "Class"
                      : detailDialog?.guardians?.full_name ?? "Individual"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Channels</p>
                <p className="font-medium">
                  {(detailDialog?.channels || []).join(", ")}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Total Recipients</p>
                <p className="font-medium">{detailDialog?.recipient_count}</p>
              </div>
              <div>
                <p className="text-slate-500">Delivered / Failed</p>
                <p className="font-medium">
                  <span className="text-green-600">{detailDialog?.delivered_count}</span>
                  {" / "}
                  <span className="text-red-500">{detailDialog?.failed_count}</span>
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialog(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
