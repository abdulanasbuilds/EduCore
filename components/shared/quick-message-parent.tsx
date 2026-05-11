"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sendQuickMessageAction } from "@/actions/announcement-actions";

interface QuickMessageParentProps {
  guardian: {
    id: string;
    full_name: string;
    phone: string;
    whatsapp_number: string | null;
    relationship: string;
  };
  studentName: string;
  trigger?: React.ReactNode;
}

export function QuickMessageParent({
  guardian,
  studentName,
  trigger,
}: QuickMessageParentProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    `This is regarding ${studentName}. `
  );
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    setResult(null);

    const res = await sendQuickMessageAction(
      guardian.id,
      message,
      studentName
    );

    setResult({ success: res.success, message: res.message });
    if (res.success) {
      setTimeout(() => {
        setOpen(false);
        setResult(null);
        setMessage(`This is regarding ${studentName}. `);
      }, 2000);
    }

    setIsSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild onClick={() => setOpen(true)}>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Message Parent</DialogTitle>
          <DialogDescription>
            Send a direct message to {guardian.full_name} ({guardian.relationship})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm">
            <p className="font-medium text-slate-700">{guardian.full_name}</p>
            <p className="text-slate-500 text-xs">
              {guardian.whatsapp_number || guardian.phone}
            </p>
          </div>
          <div>
            <Label htmlFor="quick-message">Message</Label>
            <Textarea
              id="quick-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5 min-h-[120px]"
              placeholder="Type your message..."
            />
          </div>
          {result && (
            <div
              className={`text-sm font-medium px-4 py-3 rounded-lg flex items-center gap-2 ${
                result.success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {result.success && (
                <span className="text-lg">✓</span>
              )}
              {result.message}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !message.trim()}
          >
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
