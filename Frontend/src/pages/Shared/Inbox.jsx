import api from "@/api/axios";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Mail,
  MailOpen,
  Inbox as InboxIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Calendar,
  User,
  MoveLeft,
} from "lucide-react";
import { useNotifCountStore } from "@/store/useNotifCountStore";
import { cn } from "@/lib/utils";

import Loading from "@/components/Loading";
import { toast } from "@/lib/toast";

// ─── Utility Functions ──────────────────────────────────────────────
const getTypeBadgeConfig = (type) => {
  const configs = {
    project_approval: {
      className: "bg-blue-50 text-blue-700 border border-blue-200",
      label: "Approval",
    },
    announcement: {
      className: "bg-amber-50 text-amber-700 border border-amber-200",
      label: "Announcement",
    },
  };
  return (
    configs[type] || {
      className: "bg-slate-50 text-slate-700 border border-slate-200",
      label: type,
    }
  );
};

const getStatusBadgeConfig = (status) => {
  const configs = {
    active: {
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      label: "Active",
    },
    pending: {
      className: "bg-amber-50 text-amber-700 border border-amber-200",
      label: "Pending",
    },
    rejected: {
      className: "bg-red-50 text-red-700 border border-red-200",
      label: "Rejected",
    },
  };
  return (
    configs[status] || {
      className: "bg-slate-50 text-slate-700 border border-slate-200",
      label: status,
    }
  );
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getApprovalStatusConfig = (isApproved) => {
  if (isApproved === null) {
    return {
      icon: Clock,
      className: "bg-amber-50 text-amber-700 border border-amber-200",
      label: "Pending",
    };
  }
  if (isApproved) {
    return {
      icon: CheckCircle,
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      label: "Approved",
    };
  }
  return {
    icon: XCircle,
    className: "bg-red-50 text-red-700 border border-red-200",
    label: "Rejected",
  };
};

export default function Inbox() {
  const [loadingState, setLoadingState] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);

  const { fetchUnreadCount } = useNotifCountStore();

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [filter, setFilter] = useState({
    status: null,
    type: null,
  });

  const handleSelectChange = (field, value) => {
    const updated = { ...filter, [field]: value };
    setFilter(updated);
    console.log("Filter changed:", updated);
  };

  const getMessage = async () => {
    setLoadingMessage(true);
    try {
      const params = new URLSearchParams({
        page,
        perpage: perPage,
      });

      if (filter.type) params.append("type", filter.type);
      if (filter.status) params.append("isRead", filter.status);

      const { data } = await api.get(`/notification?${params.toString()}`);
      console.log(data);

      if (data.success) {
        setNotifications(data.data.notifications);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingMessage(false);
    }
  };

  const markRead = async (id) => {
    try {
      const { data } = await api.put(`/notification/${id}/mark-read`);
      console.log(data);
    } catch (error) {
      console.error("Error marking as read:", error);
    } finally {
      await getMessage();
      await fetchUnreadCount();
    }
  };

  const fetchDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const { data } = await api.get(`/notification/${id}`);
      console.log(data.data);
      if (data.success) {
        if (!data.data.isRead) {
          await markRead(id);
        }
        setSelected(data.data);
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
      toast(error.response?.data?.message || "Failed to get message", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const approvedRequest = async (id, isApproved = true) => {
    const formData = { isApproved };
    setLoadingState(true);
    setLoadingText("Sending Response...");
    try {
      const { data } = await api.put(`/borrow-request/${id}/respond`, formData);
      console.log("mess");
      console.log(data);
      setSelected((prev) => ({
        ...prev,
        relatedBorrowRequest: {
          ...prev.relatedBorrowRequest,
          isApproved: data.data.isApproved,
        },
      }));

      toast(data?.message || "Response sent successfully", {
        type: "success",
        position: "top-center",
        duration: 5000,
      });
    } catch (error) {
      console.error(error);
      toast(
        error.response?.data?.message || "Failed to respond to the request",
        {
          type: "error",
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    getMessage();
  }, [page, perPage, filter.status, filter.type]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="h-screen pb-24 pt-5 lg:px-5 lg:py-10  flex flex-col">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
            <InboxIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Inbox
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage your notifications and messages
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <div className="flex flex-col lg:flex-row gap-6 py-1 h-full">
            {/* Left Section: Message List - Hidden on mobile when message is selected */}
            <div
              className={`lg:w-2/5 xl:w-1/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden h-[600px] lg:h-full ${
                selected ? "hidden lg:flex" : "flex"
              }`}
            >
              {/* Filters */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select
                    value={filter.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger className="flex-1 bg-white">
                      <Filter className="w-4 h-4 mr-2 text-slate-500" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Message Status</SelectLabel>
                        <SelectItem value={null}>All</SelectItem>
                        <SelectItem value="true">Read</SelectItem>
                        <SelectItem value="false">Unread</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger className="flex-1 bg-white">
                      <Filter className="w-4 h-4 mr-2 text-slate-500" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Message Type</SelectLabel>
                        <SelectItem value={null}>All</SelectItem>
                        <SelectItem value="announcement">
                          Announcement
                        </SelectItem>
                        <SelectItem value="project_approval">
                          Approval
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto">
                {loadingMessage ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600">
                      Loading messages...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-semibold text-slate-900 mb-1">
                      No notifications
                    </p>
                    <p className="text-sm text-slate-600">
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notif) => {
                      const typeBadge = getTypeBadgeConfig(notif.type);
                      const isSelected = selected?._id === notif._id;

                      return (
                        <div
                          key={notif._id}
                          onClick={() => fetchDetail(notif._id)}
                          className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${
                            isSelected
                              ? "bg-blue-50 border-l-4 border-l-blue-500"
                              : notif.isRead
                              ? "bg-white"
                              : "bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 flex-shrink-0 ${
                                notif.isRead
                                  ? "text-slate-400"
                                  : "text-blue-500"
                              }`}
                            >
                              {notif.isRead ? (
                                <MailOpen className="w-5 h-5" />
                              ) : (
                                <Mail className="w-5 h-5" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3
                                  className={`font-semibold text-sm line-clamp-1 ${
                                    notif.isRead
                                      ? "text-slate-700"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {notif.title}
                                </h3>
                                <Badge
                                  className={`text-xs font-bold whitespace-nowrap flex-shrink-0 ${typeBadge.className}`}
                                >
                                  {typeBadge.label}
                                </Badge>
                              </div>

                              <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                                {notif.message}
                              </p>

                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" />
                                {formatDateTime(notif.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="border-t border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Prev
                  </Button>
                  <span className="text-sm font-semibold text-slate-700">
                    Page {page} / {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Section: Message Detail - Hidden on mobile when no message is selected */}
            <div
              className={`flex-1 bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden flex flex-col h-[600px] lg:h-full ${
                selected ? "flex" : "hidden lg:flex"
              }`}
            >
              <div className="flex-1 overflow-y-auto p-6">
                {!selected ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Select a message
                    </h3>
                    <p className="text-slate-600 max-w-sm">
                      Choose a notification from the list to view its details
                    </p>
                  </div>
                ) : loadingDetail ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600">Loading details...</p>
                  </div>
                ) : (
                  <div className="max-w-3xl">
                    {/* Header */}
                    <div className="mb-6">
                      {/* Back button on mobile when message is selected */}
                      {selected && (
                        <div className="block lg:hidden">
                          <button
                            onClick={() => setSelected(null)}
                            className={cn(
                              "group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-1"
                            )}
                          >
                            <MoveLeft
                              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
                              aria-hidden="true"
                            />
                            <span className="whitespace-nowrap group-hover:underline">
                              Back to Messages
                            </span>
                          </button>
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h2 className="text-2xl font-bold text-slate-900 flex-1">
                          {selected.title}
                        </h2>
                        <Badge
                          className={`text-xs font-bold whitespace-nowrap ${
                            getTypeBadgeConfig(selected.type).className
                          }`}
                        >
                          {getTypeBadgeConfig(selected.type).label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(selected.createdAt)}
                      </div>
                    </div>

                    <Separator className="mb-6" />

                    {/* Message Content */}
                    <div className="mb-6">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selected.message}
                      </p>
                    </div>

                    {/* Related Project */}
                    {selected.relatedProject && (
                      <Card className="mb-6 border-slate-200 shadow-sm">
                        <CardContent>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <InboxIcon className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                Related Project
                              </p>
                              <CardTitle className="text-lg font-bold text-slate-900 mb-2">
                                {selected.relatedProject.name}
                              </CardTitle>
                              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                {selected.relatedProject.description}
                              </p>
                              <Badge
                                className={
                                  getStatusBadgeConfig(
                                    selected.relatedProject.status
                                  ).className
                                }
                              >
                                {
                                  getStatusBadgeConfig(
                                    selected.relatedProject.status
                                  ).label
                                }
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Related Borrow Request */}
                    {selected.relatedBorrowRequest && (
                      <>
                        <Card className="mb-6 border-slate-200 shadow-sm">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                  Borrow Request
                                </p>
                                <CardTitle className="text-lg font-bold text-slate-900 mb-4">
                                  Request Details
                                </CardTitle>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <User className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 mb-1">
                                    Requested By
                                  </p>
                                  <p className="font-semibold text-slate-900">
                                    {selected.relatedBorrowRequest.requestedBy
                                      .name || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 mb-1">
                                    Approved By
                                  </p>
                                  <p className="font-semibold text-slate-900">
                                    {selected.relatedBorrowRequest
                                      .isApproved === true
                                      ? selected.relatedBorrowRequest.approvedBy
                                          .name
                                      : "Pending approval"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                {(() => {
                                  const statusConfig = getApprovalStatusConfig(
                                    selected.relatedBorrowRequest.isApproved
                                  );
                                  const StatusIcon = statusConfig.icon;
                                  return (
                                    <>
                                      <StatusIcon className="w-5 h-5 text-slate-500 mt-0.5" />
                                      <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-500 mb-2">
                                          Approval Status
                                        </p>
                                        <Badge
                                          className={statusConfig.className}
                                        >
                                          {statusConfig.label}
                                        </Badge>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        {selected.relatedBorrowRequest.isApproved === null && (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              onClick={() =>
                                approvedRequest(
                                  selected.relatedBorrowRequest._id,
                                  false
                                )
                              }
                              variant="outline"
                              className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject Request
                            </Button>
                            <Button
                              onClick={() =>
                                approvedRequest(
                                  selected.relatedBorrowRequest._id
                                )
                              }
                              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve Request
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
