'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, ChevronDown, Plus, X, Trash2, Columns } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';

type Column = {
  id: string;
  header: string;
  accessor: string;
  type: 'text' | 'date' | 'tags' | 'status';
};

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: Date;
  tags: string[];
  status: LeadStatus;
  [key: string]: any; // For dynamic columns
};

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '(123) 456-7890',
    email: 'john@example.com',
    createdAt: new Date('2023-11-28'),
    tags: ['Premium', 'VIP'],
    status: 'new',
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '(234) 567-8901',
    email: 'jane@example.com',
    createdAt: new Date('2023-11-27'),
    tags: ['Standard'],
    status: 'contacted',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    phone: '(345) 678-9012',
    email: 'bob@example.com',
    createdAt: new Date('2023-11-26'),
    tags: ['VIP'],
    status: 'qualified'
  }
];

const STORAGE_KEY = 'excel_leads';
const COLUMNS_KEY = 'excel_columns';

const defaultColumns: Column[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
  { id: 'phone', header: 'Phone', accessor: 'phone', type: 'text' },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
  { id: 'createdAt', header: 'Created At', accessor: 'createdAt', type: 'date' },
  { id: 'tags', header: 'Tags', accessor: 'tags', type: 'tags' },
  { id: 'status', header: 'Status', accessor: 'status', type: 'status' },
];

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).map((lead: any) => ({
        ...lead,
        createdAt: new Date(lead.createdAt)
      })) : mockLeads;
    }
    return mockLeads;
  });
  
  const [columns, setColumns] = useState<Column[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(COLUMNS_KEY);
      return saved ? JSON.parse(saved) : defaultColumns;
    }
    return defaultColumns;
  });
  
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editingTag, setEditingTag] = useState<{leadId: string; tagIndex: number | null; value: string} | null>(null);
  const [showTagInputs, setShowTagInputs] = useState<{[key: string]: boolean}>({});
  const [newTagInputs, setNewTagInputs] = useState<{[key: string]: string}>({});
  const [customStatuses, setCustomStatuses] = useState<LeadStatus[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [showStatusInput, setShowStatusInput] = useState(false);

  // Load custom statuses from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStatuses = localStorage.getItem('customStatuses');
      if (savedStatuses) {
        setCustomStatuses(JSON.parse(savedStatuses));
      }
    }
  }, []);

  // Save to localStorage whenever leads, columns, or customStatuses change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
      localStorage.setItem(COLUMNS_KEY, JSON.stringify(columns));
      localStorage.setItem('customStatuses', JSON.stringify(customStatuses));
    }
  }, [leads, columns, customStatuses]);

  const updateLeadField = (leadId: string, field: string, value: any) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, [field]: value } : lead
    ));
  };

  const handleAddTag = (leadId: string) => {
    const newTag = newTagInputs[leadId]?.trim();
    if (!newTag) return;

    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const updatedTags = [...(lead.tags || []), newTag];
        return { ...lead, tags: updatedTags };
      }
      return lead;
    }));

    // Clear the input and hide it
    setNewTagInputs(prev => ({
      ...prev,
      [leadId]: ''
    }));
    setShowTagInputs(prev => ({
      ...prev,
      [leadId]: false
    }));
  };

  const toggleTagInput = (leadId: string) => {
    setShowTagInputs(prev => ({
      ...prev,
      [leadId]: !prev[leadId]
    }));
  };

  const handleUpdateTag = (leadId: string, tagIndex: number, newValue: string) => {
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const updatedTags = [...lead.tags];
        updatedTags[tagIndex] = newValue;
        return { ...lead, tags: updatedTags };
      }
      return lead;
    }));
    setEditingTag(null);
  };

  const handleRemoveTag = (leadId: string, tagIndex: number) => {
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const updatedTags = [...lead.tags];
        updatedTags.splice(tagIndex, 1);
        return { ...lead, tags: updatedTags };
      }
      return lead;
    }));
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    updateLeadField(leadId, 'status', status);
  };

  const addStatus = () => {
    if (newStatus.trim() && !['new', 'contacted', 'qualified', 'lost', ...customStatuses].includes(newStatus.trim().toLowerCase() as LeadStatus)) {
      const status = newStatus.trim().toLowerCase() as LeadStatus;
      setCustomStatuses(prev => [...prev, status]);
      setNewStatus('');
      setShowStatusInput(false);
    }
  };

  const removeStatus = (statusToRemove: LeadStatus) => {
    // Don't allow removing the 'new' status as it's our fallback
    if (statusToRemove === 'new') {
      return;
    }
    
    // Remove from custom statuses if it's a custom status
    if (customStatuses.includes(statusToRemove)) {
      setCustomStatuses(prev => prev.filter(s => s !== statusToRemove));
    }
    
    // Update any leads with the removed status to 'new'
    setLeads(leads.map(lead => 
      lead.status === statusToRemove ? { ...lead, status: 'new' } : lead
    ));
  };

  const allStatuses = useMemo(() => {
    const defaultStatuses = ['new'] as LeadStatus[];
    const additionalDefaultStatuses = ['contacted', 'qualified', 'lost'] as LeadStatus[];
    
    // Combine default statuses with custom ones, removing any duplicates
    return Array.from(new Set([
      ...defaultStatuses,
      ...additionalDefaultStatuses.filter(s => !customStatuses.includes(s)),
      ...customStatuses
    ] as LeadStatus[]));
  }, [customStatuses]);

  const filteredLeads = useMemo(() => {
    // If a status is selected, only filter by status
    if (leadStatusFilter !== 'all') {
      return leads.filter(lead => lead.status === leadStatusFilter);
    }
    
    // Otherwise, apply all other filters
    return leads.filter(lead => {
      const matchesSearch = 
        searchTerm === '' ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesTag = tagFilter === 'all' || lead.tags.includes(tagFilter);
      
      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [leads, searchTerm, statusFilter, tagFilter, leadStatusFilter]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    leads.forEach(lead => {
      lead.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [leads]);

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Created At', 'Tags', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => 
        [
          `"${lead.name}"`,
          `"${lead.phone}"`,
          `"${lead.email}"`,
          `"${format(lead.createdAt, 'yyyy-MM-dd')}"`,
          `"${lead.tags.join(', ')}"`,
          `"${lead.status}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addNewColumn = () => {
    if (!newColumnName.trim()) return;
    const newColumn = {
      id: newColumnName.toLowerCase().replace(/\s+/g, '_'),
      header: newColumnName,
      accessor: newColumnName.toLowerCase().replace(/\s+/g, '_'),
      type: 'text' as const
    };
    
    setColumns([...columns, newColumn]);
    setNewColumnName('');
    setIsAddingColumn(false);
    
    // Add the new column to all leads
    setLeads(leads.map(lead => ({
      ...lead,
      [newColumn.accessor]: ''
    })));
  };

  const removeColumn = (columnId: string) => {
    if (['name', 'email', 'phone', 'createdAt', 'tags', 'status'].includes(columnId)) {
      return; // Prevent removing default columns
    }
    setColumns(columns.filter(col => col.id !== columnId));
  };

  const addNewRow = () => {
    const newLead: Lead = {
      id: uuidv4(),
      name: '',
      phone: '',
      email: '',
      createdAt: new Date(),
      tags: [],
      status: 'new',
    };
    
    // Initialize all custom columns with empty values
    columns.forEach(col => {
      if (!['name', 'email', 'phone', 'createdAt', 'tags', 'status'].includes(col.id)) {
        newLead[col.id] = '';
      }
    });
    
    setLeads([newLead, ...leads]);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Search leads..."
                className="pl-10 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative w-full sm:w-48">
              <select
                className="flex h-10 w-full rounded-md border border-cyan-500/20 bg-white/5 text-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            
            <div className="relative w-full sm:w-48">
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-cyan-500/20 bg-white/5 text-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              >
                <option value="all">All Statuses</option>
                {allStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button onClick={addNewRow} className="flex items-center gap-2 text-white">
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
            
            <Button onClick={exportToCSV} variant="outline" className="ml-2 text-white">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="glass-card border-cyan-500/20 rounded-lg overflow-hidden">
        <div className="glass px-6 py-3 border-b border-cyan-500/20">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-cyan-300">Leads</h3>
            <div className="flex items-center gap-2">
              {isAddingColumn && (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Column name"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNewColumn()}
                    className="h-8 text-sm w-48"
                  />
                  <Button 
                    onClick={addNewColumn} 
                    disabled={!newColumnName.trim()}
                    className="h-8 px-3 text-sm text-white"
                  >
                    Add
                  </Button>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 h-8 text-white"
                onClick={() => setIsAddingColumn(!isAddingColumn)}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>{isAddingColumn ? 'Cancel' : 'Add Column'}</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-white/5">
              <TableRow className="border-b border-cyan-500/20">
                {columns.map((column) => (
                  <TableHead 
                    key={column.id}
                    className="text-xs font-medium text-cyan-400 uppercase tracking-wider relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{column.header}</span>
                      {!['name', 'email', 'phone', 'createdAt', 'tags', 'status'].includes(column.id) && (
                        <button 
                          onClick={() => removeColumn(column.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-pink-400 ml-2"
                          title="Remove column"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead, index) => (
                  <TableRow 
                    key={lead.id} 
                    className={`${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/15 border-b border-cyan-500/10`}
                  >
                    {columns.map((column) => {
                      const value = lead[column.accessor];
                      
                      return (
                        <TableCell 
                          key={`${lead.id}-${column.id}`}
                          className="px-4 py-3 text-sm text-gray-200 align-top"
                        >
                          {column.type === 'status' ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="focus:outline-none w-full text-left">
                                <div 
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer border ${
                                    value === 'new' 
                                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30' 
                                      : value === 'contacted' 
                                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30' 
                                        : value === 'qualified' 
                                          ? 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30' 
                                          : value === 'lost'
                                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/30 hover:bg-pink-500/30'
                                            : 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
                                  }`}
                                >
                                  {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-48">
                                {allStatuses.map((status) => (
                                  <div key={status} className="flex items-center group">
                                    <DropdownMenuItem 
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        updateLeadField(lead.id, column.accessor, status);
                                      }}
                                      className="flex-1 cursor-pointer"
                                    >
                                      <span className="capitalize">{status}</span>
                                    </DropdownMenuItem>
                                    {status !== 'new' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeStatus(status);
                                        }}
                                        className="mr-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-pink-400"
                                        title="Remove status"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <div className="border-t border-gray-100 my-1"></div>
                                {showStatusInput ? (
                                  <div className="px-2 py-1 flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={newStatus}
                                      onChange={(e) => setNewStatus(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          addStatus();
                                        } else if (e.key === 'Escape') {
                                          setShowStatusInput(false);
                                          setNewStatus('');
                                        }
                                      }}
                                      className="text-sm px-2 py-1 border border-cyan-500/30 bg-white/5 text-gray-200 rounded flex-1 min-w-0"
                                      placeholder="New status"
                                      autoFocus
                                    />
                                    <button
                                      onClick={addStatus}
                                      className="text-cyan-400 hover:text-cyan-300 p-1"
                                      title="Add status"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <DropdownMenuItem 
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setShowStatusInput(true);
                                    }}
                                    className="text-cyan-400 hover:bg-cyan-500/10 cursor-pointer"
                                  >
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Add Status
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : column.type === 'tags' ? (
                            <div className="grid grid-cols-2 gap-1 w-full max-w-[200px] min-h-[32px]">
                              {(Array.isArray(value) ? value : []).map((tag: string, tagIndex: number) => (
                                editingTag?.leadId === lead.id && editingTag.tagIndex === tagIndex ? (
                                  <input
                                    key={tagIndex}
                                    type="text"
                                    className="text-xs px-2 py-0.5 rounded border border-cyan-500/30 bg-white/5 text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:outline-none w-24"
                                    value={editingTag.value}
                                    onChange={(e) => setEditingTag({...editingTag, value: e.target.value})}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateTag(lead.id, tagIndex, editingTag.value);
                                      } else if (e.key === 'Escape') {
                                        setEditingTag(null);
                                      }
                                    }}
                                    onBlur={() => handleUpdateTag(lead.id, tagIndex, editingTag.value)}
                                    autoFocus
                                  />
                                ) : (
                                  <div 
                                    key={`${lead.id}-${tagIndex}`}
                                    className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 group truncate"
                                  >
                                    <span 
                                      className="cursor-text"
                                      onClick={() => setEditingTag({leadId: lead.id, tagIndex, value: tag})}
                                    >
                                      {tag}
                                    </span>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveTag(lead.id, tagIndex);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 text-cyan-400 hover:text-pink-400 ml-1"
                                      title="Remove tag"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                )
                              ))}
                              {showTagInputs[lead.id] ? (
                                <div className="col-span-2 flex items-center gap-1">
                                  <input
                                    type="text"
                                    className="text-xs px-2 py-0.5 rounded border border-dashed border-cyan-500/30 bg-white/5 text-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none w-24"
                                    placeholder="Add tag"
                                    value={newTagInputs[lead.id] || ''}
                                    onChange={(e) => setNewTagInputs(prev => ({
                                      ...prev,
                                      [lead.id]: e.target.value
                                    }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddTag(lead.id);
                                      } else if (e.key === 'Escape') {
                                        toggleTagInput(lead.id);
                                      }
                                    }}
                                    onBlur={() => {
                                      if ((newTagInputs[lead.id] || '').trim()) {
                                        handleAddTag(lead.id);
                                      } else {
                                        toggleTagInput(lead.id);
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTagInput(lead.id);
                                  }}
                                  className="flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-cyan-500/30 text-gray-400 hover:border-cyan-500 hover:text-cyan-400"
                                  title="Add tag"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ) : column.type === 'date' ? (
                            <div className="whitespace-nowrap">
                              {value ? format(new Date(value), 'MMM d, yyyy') : ''}
                            </div>
                          ) : (
                            <input
                              type="text"
                              className="w-full p-1 border border-transparent bg-transparent text-gray-200 rounded hover:border-cyan-500/30 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none"
                              value={value || ''}
                              onChange={(e) => updateLeadField(lead.id, column.accessor, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="px-2 py-3">
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this row?')) {
                            setLeads(leads.filter(l => l.id !== lead.id));
                          }
                        }}
                        className="text-gray-400 hover:text-pink-400"
                        title="Delete row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="px-6 py-8 text-center text-sm text-gray-400">
                    No leads found. Click "Add Row" to create a new one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
