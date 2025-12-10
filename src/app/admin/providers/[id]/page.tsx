"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight as ChevronRightIcon, Calendar as CalendarIcon, Search as SearchIcon, Mail, Phone, Star, User as UserIcon, UserMinus, ShieldBan, ShieldCheck, BellOff, BellRing, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROVIDERS_STORAGE_KEY = "adminProviders";
const BOOKINGS_STORAGE_KEY = "adminBookings";
const PROVIDER_SETTINGS_KEY = "adminProviderSettings"; // map id -> settings
const PROVIDER_AVATARS_KEY = "adminProviderAvatars"; // map id -> dataURL
const PROVIDER_SCHEDULES_KEY = "providerSchedules"; // map providerId -> schedule slots

type ProviderStatus = "active" | "inactive" | "suspended";

type Provider = {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  rating: number;
  completedJobs: number;
  status: ProviderStatus;
  joinedDate: string;
};

export default function ProviderProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [buttonStates, setButtonStates] = useState({
    isActive: true,
    isBlocked: false,
    isSubscribed: true
  });
  const id = params?.id;
  const { toast } = useToast();

  type Booking = {
    id: string;
    customer: { name: string; email: string; phone?: string };
    service: string;
    date: string; // YYYY-MM-DD
    time: string;
    address?: string;
    status: string;
    amount?: string;
    provider?: { id?: string; name: string } | null;
  };
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calView, setCalView] = useState<"month" | "week" | "day">("month");

  type ProviderSettings = {
    canSetOwnSchedule: boolean;
    canSetOwnSettings: boolean;
    merchantApprovalRequired: boolean;
    showUnassignedJobs: boolean;
    adminOnlyBooking: boolean; // provider can be booked by admin/staff only
    disableSameDayJobs: boolean;
    showPaymentMethod: boolean;
    hideProviderPayments: boolean;
  };
  const [settings, setSettings] = useState<ProviderSettings>({
    canSetOwnSchedule: true,
    canSetOwnSettings: true,
    merchantApprovalRequired: false,
    showUnassignedJobs: true,
    adminOnlyBooking: false,
    disableSameDayJobs: false,
    showPaymentMethod: false,
    hideProviderPayments: false,
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Schedule management state
  type TimeSlot = {
    id: string;
    date: string; // YYYY-MM-DD
    startTime: string;
    endTime: string;
  };
  const [scheduleSlots, setScheduleSlots] = useState<TimeSlot[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleType, setScheduleType] = useState<"single" | "range">("single");
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (!id || typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(PROVIDERS_STORAGE_KEY);
      if (stored) {
        const list: Provider[] = JSON.parse(stored);
        const found = list.find((p) => String(p.id) === String(id));
        if (found) setProvider(found);
      }
      const storedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (storedBookings) {
        setAllBookings(JSON.parse(storedBookings) as Booking[]);
      }
      // load provider settings
      const settingsRaw = localStorage.getItem(PROVIDER_SETTINGS_KEY);
      if (settingsRaw && typeof id === 'string') {
        const map = JSON.parse(settingsRaw) as Record<string, ProviderSettings>;
        const s = map[id];
        if (s) setSettings({ ...settings, ...s });
      }
      // load avatar
      const avatarsRaw = localStorage.getItem(PROVIDER_AVATARS_KEY);
      if (avatarsRaw && typeof id === 'string') {
        const amap = JSON.parse(avatarsRaw) as Record<string, string>;
        if (amap[id]) setAvatarUrl(amap[id]);
      }
      // load schedule slots
      const schedulesRaw = localStorage.getItem(PROVIDER_SCHEDULES_KEY);
      if (schedulesRaw && typeof id === 'string') {
        const schedMap = JSON.parse(schedulesRaw) as Record<string, TimeSlot[]>;
        if (schedMap[id]) setScheduleSlots(schedMap[id]);
      }
    } catch {}
  }, [id]);

  const persistSettings = (next: Partial<ProviderSettings>) => {
    if (!id || typeof id !== 'string') return;
    const updated: ProviderSettings = { ...settings, ...next } as ProviderSettings;
    setSettings(updated);
    try {
      const raw = localStorage.getItem(PROVIDER_SETTINGS_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, ProviderSettings>) : {};
      map[id] = updated;
      localStorage.setItem(PROVIDER_SETTINGS_KEY, JSON.stringify(map));
    } catch {}
  };

  const addScheduleSlot = () => {
    if (!startTime || !endTime || !id) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    if (scheduleType === "single" && !selectedDate) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }

    if (scheduleType === "range" && (!startDate || !endDate)) {
      toast({ title: "Error", description: "Please select start and end dates", variant: "destructive" });
      return;
    }

    const newSlots: TimeSlot[] = [];

    if (scheduleType === "single") {
      newSlots.push({
        id: `slot-${Date.now()}`,
        date: selectedDate,
        startTime,
        endTime,
      });
    } else {
      // Generate slots for date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        toast({ title: "Error", description: "Start date must be before end date", variant: "destructive" });
        return;
      }

      let currentDate = new Date(start);
      let counter = 0;
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        newSlots.push({
          id: `slot-${Date.now()}-${counter++}`,
          date: dateStr,
          startTime,
          endTime,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const updated = [...scheduleSlots, ...newSlots];
    setScheduleSlots(updated);
    try {
      const raw = localStorage.getItem(PROVIDER_SCHEDULES_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, TimeSlot[]>) : {};
      map[id] = updated;
      localStorage.setItem(PROVIDER_SCHEDULES_KEY, JSON.stringify(map));
      toast({ 
        title: "Success", 
        description: `${newSlots.length} schedule slot(s) added successfully` 
      });
      setSelectedDate("");
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
    } catch {
      toast({ title: "Error", description: "Failed to save schedule", variant: "destructive" });
    }
  };

  const removeScheduleSlot = (slotId: string) => {
    if (!id) return;
    const updated = scheduleSlots.filter(s => s.id !== slotId);
    setScheduleSlots(updated);
    try {
      const raw = localStorage.getItem(PROVIDER_SCHEDULES_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, TimeSlot[]>) : {};
      map[id] = updated;
      localStorage.setItem(PROVIDER_SCHEDULES_KEY, JSON.stringify(map));
      toast({ title: "Success", description: "Schedule slot removed" });
    } catch {}
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setSelectedDate(slot.date);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setShowEditDialog(true);
  };

  const updateScheduleSlot = () => {
    if (!editingSlot || !startTime || !endTime || !id) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const updated = scheduleSlots.map(s => 
      s.id === editingSlot.id 
        ? { ...s, startTime, endTime }
        : s
    );
    setScheduleSlots(updated);
    
    try {
      const raw = localStorage.getItem(PROVIDER_SCHEDULES_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, TimeSlot[]>) : {};
      map[id] = updated;
      localStorage.setItem(PROVIDER_SCHEDULES_KEY, JSON.stringify(map));
      toast({ title: "Success", description: "Schedule slot updated successfully" });
      setShowEditDialog(false);
      setEditingSlot(null);
      setSelectedDate("");
      setStartTime("");
      setEndTime("");
    } catch {
      toast({ title: "Error", description: "Failed to update schedule", variant: "destructive" });
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const min = m.toString().padStart(2, '0');
        const period = h >= 12 ? 'PM' : 'AM';
        times.push(`${hour12}:${min} ${period}`);
      }
    }
    return times;
  };

  const initials = useMemo(() => {
    if (!provider?.name) return "?";
    const parts = provider.name.split(" ");
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  }, [provider]);

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setAvatarUrl(dataUrl);
      try {
        const raw = localStorage.getItem(PROVIDER_AVATARS_KEY);
        const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
        if (typeof id === 'string') {
          map[id] = dataUrl;
          localStorage.setItem(PROVIDER_AVATARS_KEY, JSON.stringify(map));
        }
        toast({ title: "Image uploaded", description: "Provider image has been updated." });
      } catch {}
    };
    reader.readAsDataURL(f);
  };

  if (!provider) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Loading provider...</div>
        <Button variant="outline" onClick={() => router.push("/admin/providers")}>Back to Providers</Button>
      </div>
    );
  }

  const statusBadge = (status: ProviderStatus) => {
    const styles: Record<ProviderStatus, string> = {
      active: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
      suspended: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    };
    return (
      <Badge variant="outline" className={styles[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/providers" aria-label="Back to Providers" className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-xl font-semibold">{provider.name}</h2>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-semibold text-xl md:text-2xl overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={provider.name} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${provider.email}`} className="text-cyan-700 hover:underline">{provider.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{provider.phone}</span>
                </div>
                <div><span className="font-medium">Specialization:</span> {provider.specialization}</div>
                <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-medium">{provider.rating}</span></div>
              </div>
            </div>
            <div className="w-full md:w-[420px] flex md:justify-end">
              <div className="flex items-center gap-2 ml-auto self-end">
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 rounded-full ${buttonStates.isActive ? 'bg-slate-200 hover:bg-slate-300' : 'bg-green-100 hover:bg-green-200'} text-slate-800 dark:bg-slate-800/60 dark:text-slate-200`}
                    title={buttonStates.isActive ? 'Deactivate' : 'Activate'}
                    onClick={() => setButtonStates(prev => ({
                      ...prev,
                      isActive: !prev.isActive,
                      status: !prev.isActive ? 'active' : 'inactive' as ProviderStatus
                    }))}
                  >
                    {buttonStates.isActive ? (
                      <UserMinus className="h-5 w-5" />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                  </Button>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {buttonStates.isActive ? 'Deactivate' : 'Activate'}
                  </div>
                </div>
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 rounded-full ${buttonStates.isBlocked ? 'bg-red-100 hover:bg-red-200' : 'bg-amber-100 hover:bg-amber-200'} text-amber-800 dark:bg-amber-900/20 dark:text-amber-300`}
                    title={buttonStates.isBlocked ? 'Unblock Access' : 'Block Access'}
                    onClick={() => setButtonStates(prev => ({
                      ...prev,
                      isBlocked: !prev.isBlocked,
                      status: !prev.isBlocked ? 'suspended' : 'active' as ProviderStatus
                    }))}
                  >
                    {buttonStates.isBlocked ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : (
                      <ShieldBan className="h-5 w-5" />
                    )}
                  </Button>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {buttonStates.isBlocked ? 'Unblock Access' : 'Block Access'}
                  </div>
                </div>
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 rounded-full ${!buttonStates.isSubscribed ? 'bg-blue-100 hover:bg-blue-200' : 'bg-slate-200 hover:bg-slate-300'} text-slate-800 dark:bg-slate-800/60 dark:text-slate-200`}
                    title={buttonStates.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                    onClick={() => setButtonStates(prev => ({
                      ...prev,
                      isSubscribed: !prev.isSubscribed
                    }))}
                  >
                    {buttonStates.isSubscribed ? (
                      <BellOff className="h-5 w-5" />
                    ) : (
                      <BellRing className="h-5 w-5" />
                    )}
                  </Button>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {buttonStates.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full justify-start gap-2 bg-muted/40 p-0 h-auto rounded-none border-b border-slate-200">
          <TabsTrigger value="dashboard" className="rounded-none px-3 py-3 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Dashboard</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-none px-3 py-3 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Profile</TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-none px-3 py-3 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Schedule</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-none px-3 py-3 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Settings</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-none px-3 py-3 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Payments</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-none px-3 py-3 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Notifications</TabsTrigger>
          <TabsTrigger value="payment-processor" className="rounded-none px-3 py-3 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Payment processor</TabsTrigger>
          <TabsTrigger value="drive" className="rounded-none px-3 py-3 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">My drive</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-none px-3 py-3 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Reviews</TabsTrigger>
          <TabsTrigger value="apps" className="rounded-none px-3 py-3 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Apps & Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <div className="grid grid-cols-3 items-center">
                  <div className="flex items-center gap-2 justify-start">
                    <Button variant={calView === "month" ? "default" : "outline"} size="sm" onClick={() => setCalView("month")} className={calView === "month" ? "text-white" : ""} style={calView === "month" ? { background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' } : {}}>Month</Button>
                    <Button variant={calView === "week" ? "default" : "outline"} size="sm" onClick={() => setCalView("week")} className={calView === "week" ? "text-white" : ""} style={calView === "week" ? { background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' } : {}}>Week</Button>
                    <Button variant={calView === "day" ? "default" : "outline"} size="sm" onClick={() => setCalView("day")} className={calView === "day" ? "text-white" : ""} style={calView === "day" ? { background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' } : {}}>Day</Button>
                  </div>
                  <div className="flex items-center justify-center">
                    <CardTitle className="text-center">
                      {calView === "month" && new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(currentDate)}
                      {calView === "week" && (() => {
                        const d = new Date(currentDate);
                        const sunday = new Date(d);
                        sunday.setDate(d.getDate() - d.getDay());
                        return `Week of ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(sunday)}`;
                      })()}
                      {calView === "day" && new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(currentDate)}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())} title="Today">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentDate(d => calView === 'month' ? new Date(d.getFullYear(), d.getMonth()-1, 1) : calView === 'week' ? new Date(d.getFullYear(), d.getMonth(), d.getDate()-7) : new Date(d.getFullYear(), d.getMonth(), d.getDate()-1))}
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentDate(d => calView === 'month' ? new Date(d.getFullYear(), d.getMonth()+1, 1) : calView === 'week' ? new Date(d.getFullYear(), d.getMonth(), d.getDate()+7) : new Date(d.getFullYear(), d.getMonth(), d.getDate()+1))}
                      aria-label="Next"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  if (!provider) return null;
                  const myBookings = allBookings.filter(b => (b.provider?.id && String(b.provider.id) === String(provider.id)) || b.provider?.name === provider.name);
                  const date = currentDate;
                  const year = date.getFullYear();
                  const month = date.getMonth();
                  const first = new Date(year, month, 1);
                  const last = new Date(year, month + 1, 0);
                  const days = last.getDate();
                  const startEmpty = first.getDay();
                  const format = (y:number,m:number,day:number) => `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
                  if (calView === 'month') {
                    return (
                      <div className="grid grid-cols-7 gap-2">
                        {dayNames.map(d => (
                          <div key={d} className="text-center font-semibold text-sm text-muted-foreground py-2">{d}</div>
                        ))}
                        {Array.from({length: startEmpty}).map((_,i)=>(<div key={`empty-${i}`} className="h-20" />))}
                        {Array.from({length: days}).map((_,i)=>{
                          const day=i+1; const key=format(year,month,day);
                          const items=myBookings.filter(b=>b.date===key);
                          const today=new Date(); const isToday=today.getDate()===day && today.getMonth()===month && today.getFullYear()===year;
                          return (
                            <div key={key} className={`h-20 border rounded-lg p-1.5 ${isToday? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20':'border-border'}`}>
                              <div className="flex flex-col h-full">
                                <div className={`text-xs font-medium mb-0.5 ${isToday?'text-cyan-600 dark:text-cyan-400':''}`}>{day}</div>
                                <div className="flex-1 space-y-0.5 overflow-y-auto">
                                  {items.slice(0,2).map(b=> (
                                    <div key={b.id} className="text-[10px] px-1 py-0.5 rounded text-white" style={{background:'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)'}}>
                                      <div className="truncate font-medium">{b.time}</div>
                                      <div className="truncate">{b.service}</div>
                                    </div>
                                  ))}
                                  {items.length>2 && (
                                    <div className="text-[9px] text-muted-foreground text-center">+{items.length-2}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  if (calView === 'week') {
                    const d = new Date(currentDate);
                    const sunday = new Date(d);
                    sunday.setDate(d.getDate() - d.getDay());
                    const daysArr = Array.from({length:7}).map((_,i)=>{
                      const dayDate = new Date(sunday);
                      dayDate.setDate(sunday.getDate()+i);
                      const key = format(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
                      return { label: dayNames[i], num: dayDate.getDate(), key, isToday: (new Date()).toDateString()===dayDate.toDateString() };
                    });
                    return (
                      <div className="grid grid-cols-7 gap-2">
                        {daysArr.map(({label,num,key,isToday})=>{
                          const items=myBookings.filter(b=>b.date===key);
                          return (
                            <div key={key} className={`min-h-[140px] border rounded-lg p-2 ${isToday? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20':'border-border'}`}>
                              <div className="text-sm font-medium mb-1">
                                <span className="text-muted-foreground mr-1">{label}</span>{num}
                              </div>
                              <div className="space-y-1">
                                {items.length===0 && <div className="text-xs text-muted-foreground">No bookings</div>}
                                {items.map(b=> (
                                  <div key={b.id} className="text-xs p-1 rounded text-white" style={{background:'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)'}}>
                                    <div className="truncate font-medium">{b.time}</div>
                                    <div className="truncate">{b.service}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  const key = format(year, month, date.getDate());
                  const items = myBookings.filter(b=>b.date===key);
                  return (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">{items.length} booking(s) on this day</div>
                      {items.length===0 && <div className="text-sm text-muted-foreground">No bookings scheduled.</div>}
                      {items.map(b => (
                        <div key={b.id} className="p-3 rounded-md border">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{b.service}</div>
                            <div className="text-sm">{b.time}</div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Customer: {b.customer.name}</div>
                          {b.address && <div className="text-xs text-muted-foreground">{b.address}</div>}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="h-28 w-28 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={provider.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl text-muted-foreground">{initials}</span>
                  )}
                </div>
                <div className="flex-1">
                  <Label>Choose file</Label>
                  <div className="flex gap-2 mt-2">
                    <Input ref={fileInputRef as any} type="file" accept="image/*" className="flex-1" onChange={handleAvatarChange} />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Browse</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Image size should not be more than 300px by 300px.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input 
                    value={provider.name} 
                    onChange={(e) => setProvider({...provider, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={provider.email} 
                    onChange={(e) => setProvider({...provider, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={provider.phone} 
                    onChange={(e) => setProvider({...provider, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Specialization</Label>
                  <Input 
                    value={provider.specialization} 
                    onChange={(e) => setProvider({...provider, specialization: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Completed Jobs</Label>
                  <Input value={String(provider.completedJobs)} disabled />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input value={provider.status} readOnly />
                </div>
              </div>
              <div className="flex items-center justify-end pt-2 mt-2 border-t">
                <Button
                  className="text-white"
                  onClick={() => {
                    try {
                      const stored = localStorage.getItem(PROVIDERS_STORAGE_KEY);
                      if (stored) {
                        const list: Provider[] = JSON.parse(stored);
                        const index = list.findIndex((p) => String(p.id) === String(id));
                        if (index !== -1) {
                          list[index] = provider;
                          localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(list));
                        }
                      }
                      toast({ title: "Changes saved", description: "Provider profile updated successfully." });
                    } catch (error) {
                      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
                    }
                  }}
                  style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' }}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Schedule</CardTitle>
              <Button
                className="text-white"
                style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' }}
                onClick={() => setShowScheduleDialog(true)}
              >
                Manage Schedule
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(currentDate)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())} title="Today">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}
                      aria-label="Next"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {(() => {
                  if (!provider) return null;
                  const myBookings = allBookings.filter(b => (b.provider?.id && String(b.provider.id) === String(provider.id)) || b.provider?.name === provider.name);
                  const date = currentDate;
                  const year = date.getFullYear();
                  const month = date.getMonth();
                  const first = new Date(year, month, 1);
                  const last = new Date(year, month + 1, 0);
                  const days = last.getDate();
                  const startEmpty = first.getDay();
                  const format = (y:number,m:number,day:number) => `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
                  
                  if (calView === 'month') {
                    return (
                      <div className="grid grid-cols-7 gap-2">
                        {dayNames.map(d => (
                          <div key={d} className="text-center font-semibold text-sm text-muted-foreground py-2">{d}</div>
                        ))}
                        {Array.from({length: startEmpty}).map((_,i)=>(<div key={`empty-${i}`} className="h-20" />))}
                        {Array.from({length: days}).map((_,i)=>{
                          const day=i+1; const key=format(year,month,day);
                          const items=myBookings.filter(b=>b.date===key);
                          const slots=scheduleSlots.filter(s=>s.date===key);
                          const today=new Date(); const isToday=today.getDate()===day && today.getMonth()===month && today.getFullYear()===year;
                          return (
                            <div key={key} className={`h-20 border rounded-lg p-1.5 ${isToday? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20':'border-border'}`}>
                              <div className="flex flex-col h-full">
                                <div className={`text-xs font-medium mb-0.5 ${isToday?'text-cyan-600 dark:text-cyan-400':''}`}>{day}</div>
                                <div className="flex-1 space-y-0.5 overflow-y-auto">
                                  {slots.map(s=> (
                                    <div 
                                      key={s.id} 
                                      className="text-[10px] px-1 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-300 dark:border-green-700 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                                      onClick={() => handleEditSlot(s)}
                                    >
                                      <div className="truncate font-medium">{s.startTime} - {s.endTime}</div>
                                    </div>
                                  ))}
                                  {items.slice(0,2).map(b=> (
                                    <div key={b.id} className="text-[10px] px-1 py-0.5 rounded text-white" style={{background:'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)'}}>
                                      <div className="truncate font-medium">{b.time}</div>
                                      <div className="truncate">{b.service}</div>
                                    </div>
                                  ))}
                                  {items.length>2 && (
                                    <div className="text-[9px] text-muted-foreground text-center">+{items.length-2}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  
                  if (calView === 'week') {
                    const d = new Date(currentDate);
                    const sunday = new Date(d);
                    sunday.setDate(d.getDate() - d.getDay());
                    const daysArr = Array.from({length:7}).map((_,i)=>{
                      const dayDate = new Date(sunday);
                      dayDate.setDate(sunday.getDate()+i);
                      const key = format(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
                      return { label: dayNames[i], num: dayDate.getDate(), key, isToday: (new Date()).toDateString()===dayDate.toDateString() };
                    });
                    return (
                      <div className="grid grid-cols-7 gap-2">
                        {daysArr.map(({label,num,key,isToday})=>{
                          const items=myBookings.filter(b=>b.date===key);
                          const slots=scheduleSlots.filter(s=>s.date===key);
                          return (
                            <div key={key} className={`min-h-[140px] border rounded-lg p-2 ${isToday? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20':'border-border'}`}>
                              <div className="text-sm font-medium mb-1">
                                <span className="text-muted-foreground mr-1">{label}</span>{num}
                              </div>
                              <div className="space-y-1">
                                {slots.length===0 && items.length===0 && <div className="text-xs text-muted-foreground">No schedule</div>}
                                {slots.map(s=> (
                                  <div key={s.id} className="text-xs p-1 rounded bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-300 dark:border-green-700">
                                    <div className="truncate font-medium">{s.startTime} - {s.endTime}</div>
                                    <div className="truncate text-[10px]">Available</div>
                                  </div>
                                ))}
                                {items.map(b=> (
                                  <div key={b.id} className="text-xs p-1 rounded text-white" style={{background:'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)'}}>
                                    <div className="truncate font-medium">{b.time}</div>
                                    <div className="truncate">{b.service}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  
                  const key = format(year, month, date.getDate());
                  const items = myBookings.filter(b=>b.date===key);
                  const slots = scheduleSlots.filter(s=>s.date===key);
                  return (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">{slots.length} available slot(s), {items.length} booking(s) on this day</div>
                      {slots.length===0 && items.length===0 && <div className="text-sm text-muted-foreground">No schedule configured.</div>}
                      {slots.map(s => (
                        <div key={s.id} className="p-3 rounded-md border border-green-300 bg-green-50 dark:bg-green-900/10">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-green-700 dark:text-green-400">Available Time</div>
                            <div className="text-sm">{s.startTime} - {s.endTime}</div>
                          </div>
                        </div>
                      ))}
                      {items.map(b => (
                        <div key={b.id} className="p-3 rounded-md border">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{b.service}</div>
                            <div className="text-sm">{b.time}</div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Customer: {b.customer.name}</div>
                          {b.address && <div className="text-xs text-muted-foreground">{b.address}</div>}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full justify-start gap-2 bg-muted/40 p-0 h-auto rounded-none border-b border-slate-200">
                  <TabsTrigger value="general" className="rounded-none px-3 py-2 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">General</TabsTrigger>
                  <TabsTrigger value="industry" className="rounded-none px-3 py-2 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Industry</TabsTrigger>
                  <TabsTrigger value="forms" className="rounded-none px-3 py-2 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Forms</TabsTrigger>
                  <TabsTrigger value="block" className="rounded-none px-3 py-2 text-slate-600 data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600">Block contact</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="block mb-1">Can this provider/team set their own schedule?</Label>
                      <div className="flex items-center gap-6 text-sm">
                        <label className="flex items-center gap-2"><input type="radio" name="ownSchedule" checked={settings.canSetOwnSchedule} onChange={()=>persistSettings({canSetOwnSchedule:true})} /> Yes</label>
                        <label className="flex items-center gap-2"><input type="radio" name="ownSchedule" checked={!settings.canSetOwnSchedule} onChange={()=>persistSettings({canSetOwnSchedule:false})} /> No</label>
                      </div>
                    </div>

                    <div>
                      <Label className="block mb-1">Can this provider/team set their own settings?</Label>
                      <div className="flex items-center gap-6 text-sm">
                        <label className="flex items-center gap-2"><input type="radio" name="ownSettings" checked={settings.canSetOwnSettings} onChange={()=>persistSettings({canSetOwnSettings:true})} /> Yes</label>
                        <label className="flex items-center gap-2"><input type="radio" name="ownSettings" checked={!settings.canSetOwnSettings} onChange={()=>persistSettings({canSetOwnSettings:false})} /> No</label>
                      </div>
                    </div>

                    <div>
                      <Label className="block mb-1">Does merchant have to approve the request?</Label>
                      <div className="flex items-center gap-6 text-sm">
                        <label className="flex items-center gap-2"><input type="radio" name="merchantApproval" checked={settings.merchantApprovalRequired} onChange={()=>persistSettings({merchantApprovalRequired:true})} /> Yes</label>
                        <label className="flex items-center gap-2"><input type="radio" name="merchantApproval" checked={!settings.merchantApprovalRequired} onChange={()=>persistSettings({merchantApprovalRequired:false})} /> No</label>
                      </div>
                    </div>

                    <div>
                      <Label className="block mb-1">Show unassigned jobs to provider?</Label>
                      <div className="flex items-center gap-6 text-sm">
                        <label className="flex items-center gap-2"><input type="radio" name="showUnassigned" checked={settings.showUnassignedJobs} onChange={()=>persistSettings({showUnassignedJobs:true})} /> Yes</label>
                        <label className="flex items-center gap-2"><input type="radio" name="showUnassigned" checked={!settings.showUnassignedJobs} onChange={()=>persistSettings({showUnassignedJobs:false})} /> No</label>
                      </div>
                    </div>

                    <div>
                      <Label className="block mb-1">Turn off this provider or team from being booked by any customer but can be booked by admin/staff only?</Label>
                      <div className="flex items-center gap-6 text-sm">
                        <label className="flex items-center gap-2"><input type="radio" name="adminOnly" checked={settings.adminOnlyBooking} onChange={()=>persistSettings({adminOnlyBooking:true})} /> Yes</label>
                        <label className="flex items-center gap-2"><input type="radio" name="adminOnly" checked={!settings.adminOnlyBooking} onChange={()=>persistSettings({adminOnlyBooking:false})} /> No</label>
                      </div>
                    </div>

                    <div>
                      <Label className="block mb-1">Turn off this provider or team from being booked for same day jobs?</Label>
                      <div className="flex items-center gap-6 text-sm">
                        <label className="flex items-center gap-2"><input type="radio" name="sameDay" checked={settings.disableSameDayJobs} onChange={()=>persistSettings({disableSameDayJobs:true})} /> Yes</label>
                        <label className="flex items-center gap-2"><input type="radio" name="sameDay" checked={!settings.disableSameDayJobs} onChange={()=>persistSettings({disableSameDayJobs:false})} /> No</label>
                      </div>
                    </div>

                    <div>
                      <Label className="block mb-1">Do you want to show payment method to this provider/team?</Label>
                      <div className="flex items-center gap-6 text-sm">
                        <label className="flex items-center gap-2"><input type="radio" name="showPayment" checked={settings.showPaymentMethod} onChange={()=>persistSettings({showPaymentMethod:true})} /> Yes</label>
                        <label className="flex items-center gap-2"><input type="radio" name="showPayment" checked={!settings.showPaymentMethod} onChange={()=>persistSettings({showPaymentMethod:false})} /> No</label>
                      </div>
                    </div>

                    <div>
                      <Label className="block mb-1">Would you like to hide the provider's payment(s) from your provider/team?</Label>
                      <div className="flex items-center gap-6 text-sm">
                        <label className="flex items-center gap-2"><input type="radio" name="hidePayments" checked={settings.hideProviderPayments} onChange={()=>persistSettings({hideProviderPayments:true})} /> Yes</label>
                        <label className="flex items-center gap-2"><input type="radio" name="hidePayments" checked={!settings.hideProviderPayments} onChange={()=>persistSettings({hideProviderPayments:false})} /> No (show all)</label>
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t flex items-center justify-end">
                      <Button
                        className="text-white"
                        onClick={() => toast({ title: "Settings saved", description: "Provider settings have been updated." })}
                        style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="industry" className="pt-4">
                  <div className="text-sm text-muted-foreground">No industry-specific settings yet.</div>
                </TabsContent>

                <TabsContent value="forms" className="pt-4">
                  <div className="text-sm text-muted-foreground">No forms configured for this provider.</div>
                </TabsContent>

                <TabsContent value="block" className="pt-4">
                  <div className="space-y-3">
                    <Label className="block mb-1">Block this provider from being contacted?</Label>
                    <div className="flex items-center gap-6 text-sm">
                      <label className="flex items-center gap-2"><input type="radio" name="blockContact" /> Yes</label>
                      <label className="flex items-center gap-2"><input type="radio" name="blockContact" defaultChecked /> No</label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">No payments yet.</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">No notifications yet.</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-processor">
          <Card>
            <CardHeader>
              <CardTitle>Payment processor</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">No processor connected.</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drive">
          <Card>
            <CardHeader>
              <CardTitle>My drive</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">No files uploaded.</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">No reviews yet.</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apps">
          <Card>
            <CardHeader>
              <CardTitle>Apps & Integrations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">No integrations connected.</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Management Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Manage Provider Schedule</DialogTitle>
            <DialogDescription>
              Set available time slots for {provider?.name}. These will appear on the calendar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 overflow-y-auto max-h-[calc(85vh-180px)]">
            {/* Schedule Type Toggle */}
            <div className="space-y-2">
              <Label>Schedule Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scheduleType"
                    checked={scheduleType === "single"}
                    onChange={() => setScheduleType("single")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Single Date</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scheduleType"
                    checked={scheduleType === "range"}
                    onChange={() => setScheduleType("range")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Date Range</span>
                </label>
              </div>
            </div>

            {/* Date Fields */}
            {scheduleType === "single" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger id="startTime">
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id="endTime">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime2">Start Time</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger id="startTime2">
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {generateTimeOptions().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="endTime2">End Time</Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger id="endTime2">
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {generateTimeOptions().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={addScheduleSlot}
              className="w-full text-white"
              style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>

            <div className="space-y-2">
              <Label>Current Schedule Slots ({scheduleSlots.length})</Label>
              {scheduleSlots.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                  No schedule slots configured yet
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {scheduleSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-green-50 dark:bg-green-900/10"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{slot.date}</div>
                        <div className="text-sm text-muted-foreground">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeScheduleSlot(slot.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Slot Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Schedule Slot</DialogTitle>
            <DialogDescription>
              Update the time for {editingSlot?.date}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartTime">Start Time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="editStartTime">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editEndTime">End Time</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id="editEndTime">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditingSlot(null);
              setSelectedDate("");
              setStartTime("");
              setEndTime("");
            }}>
              Cancel
            </Button>
            <Button
              onClick={updateScheduleSlot}
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)' }}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
