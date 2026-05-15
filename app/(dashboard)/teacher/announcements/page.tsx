"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  sendAnnouncementAction,
  getRecipientsCountAction,
  searchGuardiansAction,
  getAnnouncementHistoryAction,
} from "@/actions/announcement-actions";
import { createClient } from "@/lib/supabase/client";
import { schoolConfig } from "@/lib/env";
import type { ActionResponse } from "@/types";

export default function TeacherAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendTo, setSendTo] = useState<"class" | "individual">("class");
  const [classId, setClassId] = useState("");
  const [selectedGuardian, setSelectedGuardian] = useState<{
    id: string;
    full_name: string;
    student_name: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [sendSMS, setSendSMS] = useState(true);
  const [recipientCount, setRecipientCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [detailDialog, setDetailDialog] = useState<any>(null);
  const supabase = createClient() as any;

  useEffect(() => {
    async function fetchCount() {
      const { count } = await getRecipientsCountAction({
        sendTo,
        classId: sendTo === "class" ? classId : undefined,
        guardianId: selectedGuardian?.id,
      });
      setRecipientCount(count);
    }
    fetchCount();
  }, [sendTo, classId, selectedGuardian]);

  useEffect(() => {
    if (!searchQuery || sendTo !== "individual") return;
    const timer = setTimeout(async () => {
      const result = await searchGuardiansAction(searchQuery);
      setSearchResults(result.success ? result.data?.guardians || [] : []);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, sendTo]);

  useEffect(() => {
    async function fetchMyClass() {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const { data: cls } = await supabase.from("classes").select("id").eq("class_teacher_id", user.id).limit(1).single();
      if (cls) setClassId(cls.id);
    }
    fetchMyClass();
    getAnnouncementHistoryAction().then((res) => setHistory(res.announcements));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendWhatsApp && !sendSMS) {
      setResultMessage("Select at least one channel");
      return;
    }
    setIsSending(true);
    setResultMessage("");

    const result: ActionResponse<{ sent: number; failed: number; total: number }> =
      await sendAnnouncementAction({
        title,
        message,
        sendTo,
        classId: classId || undefined,
        guardianId: selectedGuardian?.id,
        sendWhatsApp,
        sendSMS,
      });

    if (result.success) {
      setResultMessage(
        result.data!.failed > 0
          ? `${result.data!.sent} sent — ${result.data!.failed} failed`
          : `Sent to ${result.data!.sent} parents successfully`
      );
      getAnnouncementHistoryAction().then((res) => setHistory(res.announcements));
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
        <p className="text-sm text-slate-500">Send messages to parents of your class.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-lg mb-4">Send Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Class Meeting Notice"
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
                placeholder="Type your message..."
                className="mt-1.5 min-h-[100px]"
                maxLength={500}
                required
              />
              <div className="flex justify-between mt-1 text-xs">
                <span className={isOverLimit ? "text-red-500 font-medium" : "text-slate-500"}>
                  {charCount}/160
                </span>
                <span className="text-slate-400">Keep under 160 for SMS</span>
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
                  <RadioGroupItem value="class" id="to-class" />
                  <Label htmlFor="to-class" className="font-normal cursor-pointer">
                    My Class Only
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="individual" id="to-individual" />
                  <Label htmlFor="to-individual" className="font-normal cursor-pointer">
                    Individual Parent
                  </Label>
                </div>
              </RadioGroup>
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
                      placeholder="Search parent or student..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  )}
                  {searchResults.length > 0 && !selectedGuardian && (
                    <div className="bg-white border rounded-lg shadow-md max-w-sm max-h-40 overflow-y-auto">
                      {searchResults.map((g: any) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            setSelectedGuardian({
                              id: g.id,
                              full_name: g.full_name,
                              student_name: g.students?.full_name ?? "Unknown",
                            });
                            setSearchResults([]);
                            setSearchQuery("");
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b last:border-0"
                        >
                          <p className="font-medium">{g.full_name}</p>
                          <p className="text-xs text-slate-500">{g.students?.full_name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                  <Label htmlFor="ch-wa" className="font-normal cursor-pointer">WhatsApp</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="ch-sms"
                    checked={sendSMS}
                    onCheckedChange={(v) => setSendSMS(!!v)}
                  />
                  <Label htmlFor="ch-sms" className="font-normal cursor-pointer">SMS</Label>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <Label className="text-xs uppercase text-slate-500">Preview</Label>
              <div className="bg-white border rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap font-mono mt-2">
                {previewMessage || <span className="text-slate-400">Your message preview...</span>}
              </div>
            </div>

            <div className="text-sm text-slate-600">
              This will be sent to <span className="font-semibold">{recipientCount}</span> parent{recipientCount !== 1 ? "s" : ""}
            </div>

            {resultMessage && (
              <div className={`text-sm font-medium px-4 py-3 rounded-lg ${
                resultMessage.includes("failed") ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
              }`}>
                {resultMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {isSending ? "Sending..." : "Send Announcement"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-semibold text-lg">My Message History</h2>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(a.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{a.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {a.target === "class" ? "My Class" : "Individual"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{a.recipient_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{detailDialog?.title}</DialogTitle>
            <DialogDescription>
              Sent {detailDialog
                ? new Date(detailDialog.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-slate-50 rounded-lg p-4 text-sm whitespace-pre-wrap">
            {detailDialog?.body}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
