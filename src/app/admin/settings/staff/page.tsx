'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  gender: 'male' | 'female' | 'other' | '';
  phone: string;
  alternatePhone: string;
  address: string;
  apartment: string;
  sendInvitation: boolean;
  image?: string;
  [key: string]: any; // Add index signature to allow any string key
  status: 'active' | 'inactive';
  lastActive?: string;
};

const StaffManagement = () => {
  // State variables
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'manager' | 'staff';
    gender: 'male' | 'female' | 'other' | '';
    phone: string;
    alternatePhone: string;
    address: string;
    apartment: string;
    sendInvitation: boolean;
    image?: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'staff',
    gender: '',
    phone: '',
    alternatePhone: '',
    address: '',
    apartment: '',
    sendInvitation: true,
    image: undefined
  });


  // Load staff data (in a real app, this would be an API call)
  useEffect(() => {
    // Simulate API call
    const fetchStaff = async () => {
      try {
        // In a real app, you would fetch this from your API
        const mockStaff: StaffMember[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'admin',
            gender: 'male',
            phone: '+1 (555) 123-4567',
            alternatePhone: '',
            address: '123 Main St, Anytown, USA',
            apartment: 'Apt 4B',
            sendInvitation: false,
            status: 'active',
            lastActive: '2023-11-28T10:30:00Z',
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            role: 'manager',
            gender: 'female',
            phone: '+1 (555) 987-6543',
            alternatePhone: '+1 (555) 555-1234',
            address: '456 Oak Ave, Somewhere, USA',
            apartment: '',
            sendInvitation: true,
            status: 'active',
            lastActive: '2023-11-28T09:15:00Z',
          },
        ];
        setStaff(mockStaff);
      } catch (error) {
        console.error('Error fetching staff:', error);
        toast({
          title: 'Error',
          description: 'Failed to load staff members.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [toast]);

  const filteredStaff = staff.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, type } = target;
    const value = type === 'checkbox' 
      ? (target as HTMLInputElement).checked 
      : target.value;
      
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would make an API call here
    const newStaff: StaffMember = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      role: formData.role as StaffMember['role'],
      gender: formData.gender as StaffMember['gender'],
      phone: formData.phone,
      alternatePhone: formData.alternatePhone,
      address: formData.address,
      apartment: formData.apartment,
      sendInvitation: formData.sendInvitation,
      image: formData.image,
      status: 'active',
      lastActive: new Date().toISOString(),
    };

    setStaff([...staff, newStaff]);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'staff',
      gender: '',
      phone: '',
      alternatePhone: '',
      address: '',
      apartment: '',
      sendInvitation: true,
      image: undefined
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: 'Success',
      description: 'Staff member added successfully!',
    });
  };

  // Handle edit staff submission
  const handleEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff) return;

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Update staff member
    const updatedStaffList = staff.map((member) =>
      member.id === currentStaff.id
        ? {
            ...member,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            role: formData.role,
            gender: formData.gender,
            phone: formData.phone,
            alternatePhone: formData.alternatePhone,
            address: formData.address,
            apartment: formData.apartment,
            sendInvitation: formData.sendInvitation,
            image: formData.image || member.image,
            name: `${formData.firstName} ${formData.lastName}`,
            status: member.status,
            lastActive: member.lastActive,
          }
        : member
    );

    setStaff(updatedStaffList);
    setIsEditDialogOpen(false);
    setCurrentStaff(null);
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'staff',
      gender: '',
      phone: '',
      alternatePhone: '',
      address: '',
      apartment: '',
      sendInvitation: true,
      image: undefined
    });
    
    const successMessage = `${formData.firstName} ${formData.lastName}'s details have been updated.`;
    
    toast({
      title: 'Success',
      description: successMessage,
    });
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      // In a real app, you would make an API call here
      const updatedStaff = staff.filter((member) => member.id !== id);
      setStaff(updatedStaff);
      
      toast({
        title: 'Success',
        description: 'Staff member deleted successfully!',
      });
    }
  };

  const openEditDialog = (member: StaffMember) => {
    setCurrentStaff(member);
    setFormData({
      firstName: member.firstName || (member.name ? member.name.split(' ')[0] : ''),
      lastName: member.lastName || (member.name ? member.name.split(' ').slice(1).join(' ') : ''),
      email: member.email,
      role: member.role,
      gender: member.gender || '',
      phone: member.phone || '',
      alternatePhone: member.alternatePhone || '',
      address: member.address || '',
      apartment: member.apartment || '',
      sendInvitation: member.sendInvitation !== undefined ? member.sendInvitation : true,
      image: member.image,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: 'active' | 'inactive') => {
    return status === 'active' ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">
        Inactive
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      staff: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <Badge variant="outline" className={roleStyles[role as keyof typeof roleStyles]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage your team members and their permissions
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-1/3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{`${member.firstName} ${member.lastName}`}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        {member.lastActive
                          ? new Date(member.lastActive).toLocaleString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(member)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteStaff(member.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No staff members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xl max-h-[90vh] flex flex-col">
            <CardHeader className="sticky top-0 bg-background z-10 border-b p-4">
              <CardTitle className="text-lg">Add New Staff Member</CardTitle>
              <CardDescription className="text-sm">
                Fill in the details below to add a new staff member.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <form onSubmit={handleAddStaff} className="space-y-6 w-full">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  <label className="cursor-pointer mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {formData.image ? (
                        <img src={formData.image} alt="Staff" className="w-full h-full object-cover" />
                      ) : (
                        <Plus className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">Click to upload photo</p>
                </div>

                {/* First Name and Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                
                {/* Gender */}
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            gender: 'male' as const
                          }));
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span>Male</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            gender: 'female' as const
                          }));
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span>Female</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            gender: 'other' as const
                          }));
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span>Other</span>
                    </label>
                  </div>
                </div>
                
                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                
                {/* Send Invitation */}
                <div className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    id="sendInvitation"
                    name="sendInvitation"
                    checked={formData.sendInvitation}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="sendInvitation" className="text-sm font-medium leading-none">
                    Send invitation email to this staff member
                  </Label>
                </div>
                
                {/* Phone Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="alternatePhone">Alternate Phone</Label>
                    <Input
                      id="alternatePhone"
                      name="alternatePhone"
                      type="tel"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                </div>
                
                {/* Address and Apartment */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="address">Address</Label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="123 Main St, City, State, ZIP"
                      required
                    />
                  </div>
                  
                  <div className="w-1/2">
                    <Label htmlFor="apartment">Apartment/Unit #</Label>
                    <Input
                      id="apartment"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      placeholder="Apt 4B"
                    />
                  </div>
                </div>
                
                {/* Role */}
                  <div className="space-y-1 pt-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Staff</Button>
                  </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Staff Dialog */}
      {isEditDialogOpen && currentStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xl max-h-[90vh] flex flex-col">
            <CardHeader className="sticky top-0 bg-background z-10 border-b p-4">
              <CardTitle className="text-lg">Edit Staff Member</CardTitle>
              <CardDescription className="text-sm">
                Update the details for {currentStaff.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <form onSubmit={handleEditStaff} className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-firstName">First Name</Label>
                      <Input
                        id="edit-firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-lastName">Last Name</Label>
                      <Input
                        id="edit-lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email Address</Label>
                      <Input
                        id="edit-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone Number</Label>
                      <Input
                        id="edit-phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-alternatePhone">Alternate Phone</Label>
                      <Input
                        id="edit-alternatePhone"
                        name="alternatePhone"
                        type="tel"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-apartment">Apartment/Unit #</Label>
                      <Input
                        id="edit-apartment"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        placeholder="Apt 4B"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <span>Male</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <span>Female</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="gender"
                          value="other"
                          checked={formData.gender === 'other'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <span>Other</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="edit-address">Address</Label>
                    <textarea
                      id="edit-address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="123 Main St, City, State, ZIP"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="edit-sendInvitation"
                      name="sendInvitation"
                      checked={formData.sendInvitation}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="edit-sendInvitation" className="text-sm font-medium leading-none">
                      Send invitation email to this staff member
                    </Label>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="edit-role">Role</Label>
                    <select
                      id="edit-role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        setCurrentStaff(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
