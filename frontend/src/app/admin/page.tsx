"use client";

import { useEffect, useState, Fragment } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Search, Printer, Eye, ChevronDown, ChevronUp, Trash2, Download } from "lucide-react";
import api from "@/lib/api";

interface SubmittedForm {
  id: string;
  event_title: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  passport_number: string;
  age: string;
  profession: string;
  division: string;
  district: string;
  business_type: string;
  business_name: string;
  business_certificate_number: string;
  passport_images: string | string[];
  business_certificate_images: string | string[];
  additional_message: string;
  status: string;
  admin_notes: string;
  created_at: string;
}

function parseJsonField(field: string | string[] | null): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function SubmissionDetail({ submission, onClose }: { submission: SubmittedForm; onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const passportImages = parseJsonField(submission.passport_images);
  const certificateImages = parseJsonField(submission.business_certificate_images);

  const downloadImages = async (urls: string[], prefix: string) => {
    for (let i = 0; i < urls.length; i++) {
      try {
        const response = await fetch(urls[i]);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prefix}_${i + 1}.${blob.type.split('/')[1] || 'jpg'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error(`Failed to download ${prefix}_${i + 1}:`, err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{submission.event_title}</h2>
              <p className="text-muted-foreground text-sm">Registration Details</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>

          <div className="print:max-w-2xl print:mx-auto print:bg-white print:p-8">
            <div className="border-b border-border pb-4 mb-6">
              <h1 className="text-xl font-bold text-center text-primary">{submission.event_title}</h1>
              <p className="text-center text-muted-foreground text-sm mt-1">Registration Confirmation</p>
            </div>

            <Card className="p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary"></span>
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{submission.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{submission.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{submission.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{submission.whatsapp_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Passport Number</p>
                  <p className="font-medium">{submission.passport_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{submission.age || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profession</p>
                  <p className="font-medium">{submission.profession || "N/A"}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-secondary"></span>
                Location
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Division</p>
                  <p className="font-medium">{submission.division || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">District</p>
                  <p className="font-medium">{submission.district || "N/A"}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary"></span>
                Business Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Business Type</p>
                  <p className="font-medium capitalize">{submission.business_type || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="font-medium">{submission.business_name || "N/A"}</p>
                </div>
                {submission.business_certificate_number && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Business/TIN Number</p>
                    <p className="font-medium">{submission.business_certificate_number}</p>
                  </div>
                )}
              </div>
            </Card>

            {passportImages.length > 0 && (
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="w-1 h-5 bg-secondary"></span>
                    Passport Images
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImages(passportImages, `${submission.full_name}_passport`)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download All ({passportImages.length})
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {passportImages.map((img, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden relative group">
                      <img src={img} alt={`Passport ${index + 1}`} className="w-full h-full object-cover" />
                      <a
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-6 h-6 text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {certificateImages.length > 0 && (
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary"></span>
                    Business Documents
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImages(certificateImages, `${submission.full_name}_certificate`)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download All ({certificateImages.length})
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {certificateImages.map((img, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden relative group">
                      <img src={img} alt={`Document ${index + 1}`} className="w-full h-full object-cover" />
                      <a
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-6 h-6 text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {submission.additional_message && (
              <Card className="p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-secondary"></span>
                  Additional Message
                </h3>
                <p className="font-medium">{submission.additional_message}</p>
              </Card>
            )}

            <div className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
              <p>Submitted on: {formatDate(submission.created_at)}</p>
              <p className="mt-1">Registration ID: {submission.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [submissions, setSubmissions] = useState<SubmittedForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmittedForm | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/event-registrations", {
        params: { page: pagination.page, limit: pagination.limit, search: searchQuery || undefined }
      });
      setSubmissions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch event registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [pagination.page]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSubmissions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this registration?")) return;
    try {
      await api.delete(`/admin/event-registrations/${id}`);
      fetchSubmissions();
    } catch (error) {
      console.error("Failed to delete registration:", error);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/admin/event-registrations/${id}`, { status });
      fetchSubmissions();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    contacted: "bg-blue-100 text-blue-800",
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Event Registrations</h1>
            <p className="text-muted-foreground">Manage and view submitted event registration forms</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, or passport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-6 py-4 font-semibold text-sm">Name</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Email</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Business</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Location</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Submitted</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <Fragment key={submission.id}>
                    <tr className="border-b border-border hover:bg-muted/30 cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {submission.full_name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium">{submission.full_name}</p>
                            <p className="text-sm text-muted-foreground">{submission.passport_number || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{submission.email}</p>
                        <p className="text-sm text-muted-foreground">{submission.phone || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{submission.business_name || "N/A"}</p>
                        <p className="text-sm text-muted-foreground capitalize">{submission.business_type || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{submission.district || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">{submission.division || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[submission.status] || "bg-gray-100 text-gray-800"}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{formatDate(submission.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRow(submission.id)}
                          >
                            {expandedRows.has(submission.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(submission.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(submission.id) && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-muted/20">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Age</p>
                                <p className="font-medium">{submission.age || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Profession</p>
                                <p className="font-medium">{submission.profession || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Business/TIN No.</p>
                                <p className="font-medium">{submission.business_certificate_number || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Documents</p>
                                <p className="font-medium">
                                  {parseJsonField(submission.passport_images).length + parseJsonField(submission.business_certificate_images).length} files
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-sm text-muted-foreground">Update Status:</span>
                              {["pending", "approved", "contacted", "rejected"].map((s) => (
                                <Button
                                  key={s}
                                  variant={submission.status === s ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleStatusUpdate(submission.id, s)}
                                  className="capitalize"
                                >
                                  {s}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {submissions.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No event registrations found</p>
            </div>
          )}
        </Card>

        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {submissions.length} of {pagination.total} registrations
          </p>
          {pagination.pages > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedSubmission && (
        <SubmissionDetail submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />
      )}
    </div>
  );
}
