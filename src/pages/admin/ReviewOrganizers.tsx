import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2,
  Mail,
  Phone,
  Globe,
  FileText,
  Loader2
} from "lucide-react";

interface Organizer {
  id: string;
  user_id: string;
  organization_name: string;
  organization_type: string;
  registration_number: string | null;
  website_url: string | null;
  description: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
}

interface Auditor {
  id: string;
  user_id: string;
  full_name: string;
  organization_name: string | null;
  certification_number: string | null;
  expertise_areas: string[];
  contact_email: string;
  contact_phone: string;
  description: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
}

const ReviewOrganizers = () => {
  const { toast } = useToast();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [selectedAuditor, setSelectedAuditor] = useState<Auditor | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showAuditorRejectDialog, setShowAuditorRejectDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchOrganizers = async () => {
    try {
      const { data, error } = await supabase
        .from("organizers")
        .select(`
          *,
          profiles!organizers_user_id_fkey (
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching organizers:", error);
        toast({
          title: "加载失败",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setOrganizers(data as any || []);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchAuditors = async () => {
    try {
      const { data, error } = await supabase
        .from("auditors")
        .select(`
          *,
          profiles!auditors_user_id_fkey (
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching auditors:", error);
        toast({
          title: "加载失败",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setAuditors(data as any || []);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchOrganizers(), fetchAuditors()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleApprove = async (organizer: Organizer) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: updateError } = await supabase
        .from("organizers")
        .update({
          status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", organizer.id);

      if (updateError) throw updateError;

      // Add organizer role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: organizer.user_id,
          role: "organizer",
        });

      if (roleError && !roleError.message.includes("duplicate")) {
        throw roleError;
      }

      toast({
        title: "审核通过",
        description: `${organizer.organization_name} 已成为认证发起人`,
      });

      fetchOrganizers();
    } catch (error: any) {
      console.error("Error approving:", error);
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrganizer) return;
    
    if (!rejectionReason.trim()) {
      toast({
        title: "请输入拒绝原因",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("organizers")
        .update({
          status: "rejected",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq("id", selectedOrganizer.id);

      if (error) throw error;

      toast({
        title: "已拒绝申请",
        description: `已拒绝 ${selectedOrganizer.organization_name} 的申请`,
      });

      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedOrganizer(null);
      fetchOrganizers();
    } catch (error: any) {
      console.error("Error rejecting:", error);
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveAuditor = async (auditor: Auditor) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: updateError } = await supabase
        .from("auditors")
        .update({
          status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", auditor.id);

      if (updateError) throw updateError;

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: auditor.user_id,
          role: "auditor",
        });

      if (roleError && !roleError.message.includes("duplicate")) {
        throw roleError;
      }

      toast({
        title: "审核通过",
        description: `${auditor.full_name} 已成为认证审计员`,
      });

      fetchAuditors();
    } catch (error: any) {
      console.error("Error approving:", error);
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectAuditor = async () => {
    if (!selectedAuditor) return;
    
    if (!rejectionReason.trim()) {
      toast({
        title: "请输入拒绝原因",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("auditors")
        .update({
          status: "rejected",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq("id", selectedAuditor.id);

      if (error) throw error;

      toast({
        title: "已拒绝申请",
        description: `已拒绝 ${selectedAuditor.full_name} 的申请`,
      });

      setShowAuditorRejectDialog(false);
      setRejectionReason("");
      setSelectedAuditor(null);
      fetchAuditors();
    } catch (error: any) {
      console.error("Error rejecting:", error);
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (organizer: Organizer) => {
    setSelectedOrganizer(organizer);
    setShowRejectDialog(true);
  };

  const openAuditorRejectDialog = (auditor: Auditor) => {
    setSelectedAuditor(auditor);
    setShowAuditorRejectDialog(true);
  };

  const renderOrganizerCard = (organizer: Organizer) => (
    <Card key={organizer.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-primary" />
              {organizer.organization_name}
            </CardTitle>
            <CardDescription>
              {organizer.organization_type}
            </CardDescription>
          </div>
          {organizer.status === "pending" && (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              待审核
            </Badge>
          )}
          {organizer.status === "approved" && (
            <Badge className="gap-1 bg-green-500">
              <CheckCircle2 className="w-3 h-3" />
              已通过
            </Badge>
          )}
          {organizer.status === "rejected" && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="w-3 h-3" />
              已拒绝
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>{organizer.contact_email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{organizer.contact_phone}</span>
          </div>
          {organizer.website_url && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="w-4 h-4" />
              <a 
                href={organizer.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                {organizer.website_url}
              </a>
            </div>
          )}
          {organizer.registration_number && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>注册号：{organizer.registration_number}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t">
          <div className="text-sm font-medium mb-1">机构描述</div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {organizer.description}
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          申请时间：{new Date(organizer.created_at).toLocaleString('zh-CN')}
        </div>

        {organizer.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleApprove(organizer)}
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              通过
            </Button>
            <Button
              onClick={() => openRejectDialog(organizer)}
              disabled={processing}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              拒绝
            </Button>
          </div>
        )}

        {organizer.status === "rejected" && organizer.rejection_reason && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="text-sm font-medium text-destructive mb-1">拒绝原因</div>
            <p className="text-sm text-muted-foreground">{organizer.rejection_reason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAuditorCard = (auditor: Auditor) => (
    <Card key={auditor.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              {auditor.full_name}
            </CardTitle>
            <CardDescription>
              {auditor.organization_name || "独立审计员"}
            </CardDescription>
          </div>
          {auditor.status === "pending" && (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              待审核
            </Badge>
          )}
          {auditor.status === "approved" && (
            <Badge className="gap-1 bg-green-500">
              <CheckCircle2 className="w-3 h-3" />
              已通过
            </Badge>
          )}
          {auditor.status === "rejected" && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="w-3 h-3" />
              已拒绝
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>{auditor.contact_email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{auditor.contact_phone}</span>
          </div>
          {auditor.certification_number && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>认证编号：{auditor.certification_number}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t">
          <div className="text-sm font-medium mb-2">专业领域</div>
          <div className="flex flex-wrap gap-2">
            {auditor.expertise_areas?.map((area, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{area}</Badge>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="text-sm font-medium mb-1">个人简介</div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {auditor.description}
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          申请时间：{new Date(auditor.created_at).toLocaleString('zh-CN')}
        </div>

        {auditor.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleApproveAuditor(auditor)}
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              通过
            </Button>
            <Button
              onClick={() => openAuditorRejectDialog(auditor)}
              disabled={processing}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              拒绝
            </Button>
          </div>
        )}

        {auditor.status === "rejected" && auditor.rejection_reason && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="text-sm font-medium text-destructive mb-1">拒绝原因</div>
            <p className="text-sm text-muted-foreground">{auditor.rejection_reason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingOrganizers = organizers.filter(o => o.status === "pending");
  const approvedOrganizers = organizers.filter(o => o.status === "approved");
  const rejectedOrganizers = organizers.filter(o => o.status === "rejected");

  const pendingAuditors = auditors.filter(a => a.status === "pending");
  const approvedAuditors = auditors.filter(a => a.status === "approved");
  const rejectedAuditors = auditors.filter(a => a.status === "rejected");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">认证审核</h2>
        <p className="text-muted-foreground">
          审核NGO组织和审计员的认证申请
        </p>
      </div>

      <Tabs defaultValue="organizers" className="w-full">
        <TabsList>
          <TabsTrigger value="organizers">
            NGO机构 ({pendingOrganizers.length} 待审核)
          </TabsTrigger>
          <TabsTrigger value="auditors">
            审计员 ({pendingAuditors.length} 待审核)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizers" className="space-y-4 mt-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList>
              <TabsTrigger value="pending">
                待审核 ({pendingOrganizers.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                已通过 ({approvedOrganizers.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                已拒绝 ({rejectedOrganizers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingOrganizers.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    暂无待审核的NGO申请
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingOrganizers.map(renderOrganizerCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-6">
              {approvedOrganizers.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    暂无已通过的NGO
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {approvedOrganizers.map(renderOrganizerCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-6">
              {rejectedOrganizers.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    暂无被拒绝的NGO申请
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {rejectedOrganizers.map(renderOrganizerCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="auditors" className="space-y-4 mt-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList>
              <TabsTrigger value="pending">
                待审核 ({pendingAuditors.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                已通过 ({approvedAuditors.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                已拒绝 ({rejectedAuditors.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingAuditors.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    暂无待审核的审计员申请
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingAuditors.map(renderAuditorCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-6">
              {approvedAuditors.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    暂无已通过的审计员
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {approvedAuditors.map(renderAuditorCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-6">
              {rejectedAuditors.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    暂无被拒绝的审计员申请
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {rejectedAuditors.map(renderAuditorCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝NGO申请</DialogTitle>
            <DialogDescription>
              请说明拒绝 {selectedOrganizer?.organization_name} 的原因
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">拒绝原因</Label>
              <Textarea
                id="reason"
                placeholder="请详细说明拒绝的理由..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedOrganizer(null);
              }}
              disabled={processing}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              确认拒绝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAuditorRejectDialog} onOpenChange={setShowAuditorRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝审计员申请</DialogTitle>
            <DialogDescription>
              请说明拒绝 {selectedAuditor?.full_name} 的原因
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="auditor-reason">拒绝原因</Label>
              <Textarea
                id="auditor-reason"
                placeholder="请详细说明拒绝的理由..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAuditorRejectDialog(false);
                setRejectionReason("");
                setSelectedAuditor(null);
              }}
              disabled={processing}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectAuditor}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              确认拒绝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewOrganizers;
