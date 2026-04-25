"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Send, Users } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card, Input, Select, Textarea } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminSendNotificationsPage() {
  const [users, setUsers] = useState([]);
  const [target, setTarget] = useState("all");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from("user_profiles").select("id, email, full_name").order("email");
      setUsers(data || []);
    }
    load();
  }, []);

  async function send() {
    if (!title.trim() || !message.trim()) { toast.error("Title and message are required."); return; }
    setBusy(true);
    const tId = toast.loading("Sending…");
    try {
      if (target === "one") {
        if (!userId) { toast.error("Pick a user", { id: tId }); setBusy(false); return; }
        const res = await fetch("/api/admin", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "send_notification", user_id: userId, title, message }),
        });
        const d = await res.json();
        if (!res.ok) { toast.error(d.error || "Failed", { id: tId }); setBusy(false); return; }
      } else {
        // all users
        let sent = 0;
        for (const u of users) {
          const res = await fetch("/api/admin", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "send_notification", user_id: u.id, title, message }),
          });
          if (res.ok) sent++;
        }
        toast.success(`Sent to ${sent} users`, { id: tId });
      }
      if (target === "one") toast.success("Notification sent", { id: tId });
      setTitle(""); setMessage("");
    } catch { toast.error("Network error", { id: tId }); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">Send Notifications</h1>
        <p className="text-brand-navy/60 mt-1">Broadcast a message to one or all users.</p>
      </div>

      <Card>
        <div className="space-y-4">
          <Select label="Send to" value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="all">All users ({users.length})</option>
            <option value="one">Specific user</option>
          </Select>

          {target === "one" && (
            <Select label="User" value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">Select a user…</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.email} {u.full_name ? `(${u.full_name})` : ""}</option>)}
            </Select>
          )}

          <Input label="Title" placeholder="e.g. New feature released 🎉" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Message" placeholder="Your message…" value={message} onChange={(e) => setMessage(e.target.value)} />

          <div className="flex justify-end">
            <Button variant="gold" onClick={send} disabled={busy}>
              {target === "all" ? <Users size={14} /> : <Send size={14} />}
              {busy ? "Sending…" : (target === "all" ? `Send to ${users.length} users` : "Send notification")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
