import api from "@/api/axios";
import Loading from "@/components/Loading";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, MailOpen } from "lucide-react";
import { useNotifCountStore } from "@/store/useNotifCountStore";

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
      console.error("Error fetching detail:", err);
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
    } catch (err) {
      console.error("Error fetching detail:", err);
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
      console.log(data);
      setSelected((prev) => ({
        ...prev,
        relatedBorrowRequest: {
          ...prev.relatedBorrowRequest,
          isApproved: data.data.isApproved,
        },
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    getMessage();
  }, [page, perPage, filter.status, filter.type]);

  console.log("total: " + total + " " + 0 / perPage);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="p-4 sm:p-6 h-[calc(100vh-4rem)] flex flex-col">
      <Loading status={loadingState} fullscreen text={loadingText} />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Inbox</h1>
      <div className="flex flex-col sm:flex-row gap-4 flex-1 overflow-hidden">
        {/* Left Section: Inbox list */}
        <div className="sm:w-1/3 border rounded-lg bg-background shadow-sm flex flex-col h-full">
          <div className="p-3 border-b flex flex-col sm:flex-row sm:items-center gap-2">
            <Select
              value={filter.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger className="w-[180px]">
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

            {/* Type Filter */}
            <Select
              value={filter.type}
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Message Type</SelectLabel>
                  <SelectItem value={null}>All</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="project_approval">Approval</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* 📨 Message List */}
          <div className="flex-1 overflow-y-auto">
            {loadingMessage ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-20">
                No notifications found
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => fetchDetail(notif._id)}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/60 ${
                    selected?._id === notif._id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {notif.isRead ? (
                        <MailOpen className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Mail className="h-4 w-4 text-primary" />
                      )}
                      <p className="font-medium line-clamp-1">{notif.title}</p>
                    </div>
                    <Badge
                      className={`${
                        notif.type == "project_approval"
                          ? "bg-sky-600"
                          : "bg-yellow-600"
                      }`}
                    >
                      {notif.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* 📄 Pagination pinned at bottom */}
          <div className="border-t flex justify-between items-center p-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Right Section: Detail */}
        <div className="flex-1 border rounded-lg bg-background shadow-sm overflow-y-auto p-4">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a message to view details
            </div>
          ) : loadingDetail ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">{selected.title}</h2>
                <Badge
                  className={`${
                    selected.type == "project_approval"
                      ? "bg-sky-600"
                      : "bg-yellow-600"
                  }`}
                >
                  {selected.type}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {new Date(selected.createdAt).toLocaleString()}
              </p>
              <Separator className="mb-4" />

              <p className="text-base mb-6 leading-relaxed">
                {selected.message}
              </p>

              {selected.relatedProject && (
                <Card className="mb-2 space-y-2">
                  <CardContent>
                    <CardTitle className="text-lg">
                      Project: {selected.relatedProject.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selected.relatedProject.description}
                    </p>
                    <Badge
                      className={`mt-2 ${
                        selected.relatedProject.status == "active"
                          ? "bg-teal-500"
                          : "bg-red-500"
                      }`}
                    >
                      {selected.relatedProject.status}
                    </Badge>
                  </CardContent>
                </Card>
              )}
              {selected.relatedBorrowRequest && (
                <>
                  <Card>
                    <CardContent className="text-sm space-y-1">
                      <CardTitle className="text-lg">Borrow Request</CardTitle>
                      <p>
                        <span className="font-medium">Requested By:</span>{" "}
                        {selected.relatedBorrowRequest.requestedBy.name}
                      </p>
                      <p>
                        <span className="font-medium">Approved By:</span>{" "}
                        {selected.relatedBorrowRequest.isApproved === true
                          ? selected.relatedBorrowRequest.approvedBy.name
                          : "---"}
                      </p>
                      <p>
                        <span className="font-medium">Approval Status:</span>{" "}
                        {selected.relatedBorrowRequest.isApproved === null
                          ? "Pending"
                          : selected.relatedBorrowRequest.isApproved
                          ? "Approved"
                          : "Rejected"}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end space-x-2 mt-5">
                    <Button
                      onClick={() =>
                        approvedRequest(
                          selected.relatedBorrowRequest._id,
                          false
                        )
                      }
                      className="bg-rose-600 hover:bg-rose-700 flex items-center justify-center gap-2 cursor-pointer"
                      disabled={
                        selected.relatedBorrowRequest.isApproved !== null
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() =>
                        approvedRequest(selected.relatedBorrowRequest._id)
                      }
                      className="bg-primer flex items-center justify-center gap-2 cursor-pointer"
                      disabled={
                        selected.relatedBorrowRequest.isApproved !== null
                      }
                    >
                      Approve
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
