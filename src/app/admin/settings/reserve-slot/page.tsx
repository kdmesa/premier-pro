"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Plus, Trash2, Edit, X, Check } from "lucide-react";
import { format, addDays, isBefore, isAfter, parseISO } from 'date-fns';
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

interface TimeSlot {
  id: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  createdAt: string;
}

export default function ReserveSlotPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<TimeSlot, 'id' | 'createdAt'>>({ 
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    reason: ''
  });

  // Load slots from localStorage on component mount
  useEffect(() => {
    const savedSlots = localStorage.getItem('reservedSlots');
    if (savedSlots) {
      setSlots(JSON.parse(savedSlots));
    }
  }, []);

  // Save slots to localStorage whenever they change
  useEffect(() => {
    if (slots.length > 0) {
      localStorage.setItem('reservedSlots', JSON.stringify(slots));
    }
  }, [slots]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeChange = (name: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name: 'startDate' | 'endDate', date: Date | undefined) => {
    if (!date) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: format(date, 'yyyy-MM-dd')
    }));
  };

  const validateForm = (): boolean => {
    const { startDate, endDate, startTime, endTime, reason } = formData;
    
    if (!startDate || !endDate || !startTime || !endTime) {
      toast.error('Please fill in all required fields');
      return false;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (isAfter(startDateTime, endDateTime)) {
      toast.error('End date/time must be after start date/time');
      return false;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the reservation');
      return false;
    }

    return true;
  };

  const handleAddSlot = () => {
    if (!validateForm()) return;

    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    setSlots(prev => [newSlot, ...prev]);
    resetForm();
    toast.success('Time slot reserved successfully');
  };

  const handleUpdateSlot = () => {
    if (!editingId || !validateForm()) return;

    setSlots(prev =>
      prev.map(slot =>
        slot.id === editingId
          ? { ...slot, ...formData }
          : slot
      )
    );

    setEditingId(null);
    resetForm();
    toast.success('Time slot updated successfully');
  };

  const handleEdit = (slot: TimeSlot) => {
    setEditingId(slot.id);
    setFormData({
      startDate: slot.startDate,
      endDate: slot.endDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason: slot.reason
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      setSlots(prev => prev.filter(slot => slot.id !== id));
      toast.success('Time slot deleted');
    }
  };

  const resetForm = () => {
    setFormData({
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '17:00',
      reason: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const isActive = (slot: TimeSlot) => {
    const now = new Date();
    const start = new Date(`${slot.startDate}T${slot.startTime}`);
    const end = new Date(`${slot.endDate}T${slot.endTime}`);
    return isAfter(now, start) && isBefore(now, end);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Reserve Slot</CardTitle>
            </div>
            {!isAdding && !editingId && (
              <Button onClick={() => setIsAdding(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Time Slot
              </Button>
            )}
          </div>
          <CardDescription>
            Manage reserved time slots and availability
          </CardDescription>
        </CardHeader>

        {(isAdding || editingId) && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <div className="w-full">
                  <DatePicker
                    date={formData.startDate ? new Date(formData.startDate) : undefined}
                    onSelect={(date) => handleDateChange('startDate', date)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <div className="w-full">
                  <DatePicker
                    date={formData.endDate ? new Date(formData.endDate) : undefined}
                    onSelect={(date) => handleDateChange('endDate', date)}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <TimePicker
                  value={formData.startTime}
                  onChange={(value) => handleTimeChange('startTime', value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <TimePicker
                  value={formData.endTime}
                  onChange={(value) => handleTimeChange('endTime', value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Reservation</Label>
              <Input
                id="reason"
                name="reason"
                placeholder="E.g., Maintenance, Holiday, etc."
                value={formData.reason}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button 
                onClick={editingId ? handleUpdateSlot : handleAddSlot}
                disabled={!formData.reason.trim()}
              >
                {editingId ? 'Update' : 'Add'} Time Slot
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reserved Time Slots</CardTitle>
          <CardDescription>
            {slots.length === 0 
              ? 'No time slots have been reserved yet.' 
              : `Showing ${slots.length} reserved time slot${slots.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="mx-auto h-12 w-12 mb-2 opacity-20" />
              <p>No time slots reserved yet. Click "Add Time Slot" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {slots
                .sort((a, b) => 
                  new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                )
                .map(slot => (
                <div 
                  key={slot.id} 
                  className={`border rounded-lg p-4 ${isActive(slot) ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">
                        {formatDateTime(slot.startDate, slot.startTime)} - {formatDateTime(slot.endDate, slot.endTime)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {slot.reason}
                      </p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isActive(slot) 
                            ? 'bg-green-100 text-green-800' 
                            : isBefore(new Date(), new Date(`${slot.startDate}T${slot.startTime}`))
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isActive(slot) 
                            ? 'Active Now' 
                            : isBefore(new Date(), new Date(`${slot.startDate}T${slot.startTime}`))
                              ? 'Upcoming'
                              : 'Expired'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(slot)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
