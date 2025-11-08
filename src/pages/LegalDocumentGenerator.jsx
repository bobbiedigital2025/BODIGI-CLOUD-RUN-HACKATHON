import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  FileText,
  Download,
  Edit,
  Save,
  Sparkles,
  Loader2,
  Eye,
  CheckCircle,
  Plus,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function LegalDocumentGenerator() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    document_type: "terms_of_service",
    business_name: "",
    business_type: "saas",
    business_description: "",
    target_audience: "",
    jurisdiction: "United States",
    company_address: "",
    contact_email: "",
    website_url: "",
    collects_personal_data: true,
    uses_cookies: true,
    has_payment_processing: false,
    refund_policy_days: 30,
    additional_clauses: []
  });

  const [editedContent, setEditedContent] = useState("");

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['legal-documents'],
    queryFn: () => base44.entities.LegalDocument.list('-created_date', 50),
    initialData: []
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => base44.entities.Brand.list('-updated_date', 1),
    initialData: []
  });

  const createDocMutation = useMutation({
    mutationFn: (docData) => base44.entities.LegalDocument.create(docData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
    }
  });

  const updateDocMutation = useMutation({
    mutationFn: ({ id, docData }) => base44.entities.LegalDocument.update(id, docData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id) => base44.entities.LegalDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
    }
  });

  // Auto-fill from brand data
  React.useEffect(() => {
    if (brands.length > 0 && !formData.business_name) {
      const brand = brands[0];
      setFormData(prev => ({
        ...prev,
        business_name: brand.name || "",
        business_description: brand.problems_solved?.join(', ') || "",
        target_audience: brand.target_audience || ""
      }));
    }
  }, [brands]);

  const documentTypes = [
    { value: "terms_of_service", label: "Terms of Service", icon: FileText },
    { value: "privacy_policy", label: "Privacy Policy", icon: Shield },
    { value: "nda", label: "Non-Disclosure Agreement (NDA)", icon: Shield },
    { value: "service_agreement", label: "Service Agreement", icon: FileText },
    { value: "refund_policy", label: "Refund Policy", icon: FileText },
    { value: "cookie_policy", label: "Cookie Policy", icon: FileText },
    { value: "disclaimer", label: "Legal Disclaimer", icon: Shield }
  ];

  const businessTypes = [
    { value: "saas", label: "SaaS (Software as a Service)" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "marketplace", label: "Marketplace" },
    { value: "service", label: "Service Business" },
    { value: "consulting", label: "Consulting" },
    { value: "mobile_app", label: "Mobile App" },
    { value: "web_app", label: "Web Application" },
    { value: "other", label: "Other" }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const docType = documentTypes.find(d => d.value === formData.document_type);
      
      const prompt = `You are a legal document expert. Generate a comprehensive, legally sound ${docType.label} document for the following business:

Business Information:
- Business Name: ${formData.business_name}
- Business Type: ${formData.business_type}
- Description: ${formData.business_description}
- Target Audience: ${formData.target_audience}
- Jurisdiction: ${formData.jurisdiction}
- Company Address: ${formData.company_address}
- Contact Email: ${formData.contact_email}
- Website: ${formData.website_url}
- Collects Personal Data: ${formData.collects_personal_data ? 'Yes' : 'No'}
- Uses Cookies: ${formData.uses_cookies ? 'Yes' : 'No'}
- Has Payment Processing: ${formData.has_payment_processing ? 'Yes' : 'No'}
- Refund Policy: ${formData.refund_policy_days} days

Generate a professional ${docType.label} with:
1. Proper legal structure and sections
2. Clear, understandable language
3. Industry-specific clauses for ${formData.business_type}
4. Compliance with ${formData.jurisdiction} laws
5. Modern web/app business considerations

Format the document in HTML with proper headings (<h2>, <h3>), paragraphs (<p>), and lists (<ul>, <ol>).
Include a last updated date at the top.
Make it comprehensive but readable.

Return ONLY the HTML content, no markdown code blocks.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });

      const documentContent = typeof response === 'string' ? response : JSON.stringify(response);

      const newDoc = await createDocMutation.mutateAsync({
        ...formData,
        document_content: documentContent,
        last_edited_date: new Date().toISOString(),
        status: 'draft'
      });

      setSelectedDoc(newDoc);
      setEditedContent(documentContent);
      setStep(3);
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!selectedDoc) return;

    await updateDocMutation.mutateAsync({
      id: selectedDoc.id,
      docData: {
        document_content: editedContent,
        last_edited_date: new Date().toISOString(),
        version: (selectedDoc.version || 1) + 1
      }
    });

    setIsEditing(false);
    alert('Document saved successfully!');
  };

  const handleFinalize = async () => {
    if (!selectedDoc) return;

    await updateDocMutation.mutateAsync({
      id: selectedDoc.id,
      docData: {
        status: 'finalized',
        last_edited_date: new Date().toISOString()
      }
    });

    alert('Document finalized! You can now download it.');
  };

  const handleDownload = (doc) => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${documentTypes.find(d => d.value === doc.document_type)?.label} - ${doc.business_name}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
    h1 { color: #1a1a1a; border-bottom: 3px solid #fbbf24; padding-bottom: 10px; }
    h2 { color: #2d3748; margin-top: 30px; }
    h3 { color: #4a5568; }
    p { margin: 15px 0; }
    ul, ol { margin: 15px 0; padding-left: 30px; }
    .header { background: #f7fafc; padding: 20px; border-left: 4px solid #fbbf24; margin-bottom: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${documentTypes.find(d => d.value === doc.document_type)?.label}</h1>
    <p><strong>${doc.business_name}</strong></p>
    <p>Last Updated: ${new Date(doc.last_edited_date || doc.created_date).toLocaleDateString()}</p>
    <p>Version: ${doc.version || 1}</p>
  </div>
  ${doc.document_content}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.business_name.replace(/\s+/g, '_')}_${doc.document_type}_v${doc.version || 1}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocMutation.mutateAsync(id);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-900/30 to-green-900/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center glow-gold">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-yellow-400">Legal Document Generator</h1>
              <p className="text-lg text-gray-300">
                AI-powered legal documents tailored to your business
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Documents */}
      {documents.length > 0 && step === 1 && (
        <Card className="border-2 border-green-500/30 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-green-400">Your Legal Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="bg-gray-800 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-white">
                          {documentTypes.find(d => d.value === doc.document_type)?.label}
                        </h3>
                        <p className="text-sm text-gray-400">{doc.business_name}</p>
                      </div>
                      <Badge className={`
                        ${doc.status === 'finalized' ? 'bg-green-600' : ''}
                        ${doc.status === 'reviewed' ? 'bg-blue-600' : ''}
                        ${doc.status === 'draft' ? 'bg-yellow-600' : ''}
                        text-white
                      `}>
                        {doc.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      <p>Version {doc.version || 1}</p>
                      <p>Updated: {new Date(doc.last_edited_date || doc.created_date).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setEditedContent(doc.document_content);
                          setShowPreview(true);
                        }}
                        className="border-green-500/30 text-green-400"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setEditedContent(doc.document_content);
                          setIsEditing(true);
                          setStep(3);
                        }}
                        className="border-blue-500/30 text-blue-400"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(doc)}
                        className="border-yellow-500/30 text-yellow-400"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(doc.id)}
                        className="border-red-500/30 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Document Type Selection */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-yellow-500/30 bg-gray-900">
            <CardHeader>
              <CardTitle className="text-yellow-400">Step 1: Choose Document Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentTypes.map((type) => (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all ${
                      formData.document_type === type.value
                        ? 'border-2 border-yellow-500 bg-yellow-500/10'
                        : 'border border-gray-700 hover:border-yellow-500/50'
                    }`}
                    onClick={() => setFormData({ ...formData, document_type: type.value })}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <type.icon className="w-6 h-6 text-yellow-400" />
                        <h3 className="font-bold text-white">{type.label}</h3>
                      </div>
                      {formData.document_type === type.value && (
                        <CheckCircle className="w-5 h-5 text-green-400 mt-2" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => setStep(2)}
                className="mt-6 gold-gradient text-black hover:opacity-90"
                size="lg"
              >
                Next: Business Information
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Business Information */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-yellow-500/30 bg-gray-900">
            <CardHeader>
              <CardTitle className="text-yellow-400">Step 2: Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Business Name *</label>
                  <Input
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="Your Company Name"
                    className="bg-gray-800 border-yellow-500/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Business Type *</label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value) => setFormData({ ...formData, business_type: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-yellow-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400 mb-2 block">Business Description *</label>
                  <Textarea
                    value={formData.business_description}
                    onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                    placeholder="Describe what your business does..."
                    className="bg-gray-800 border-yellow-500/30 h-24"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Target Audience</label>
                  <Input
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder="e.g., Small businesses, Developers, etc."
                    className="bg-gray-800 border-yellow-500/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Jurisdiction</label>
                  <Input
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    placeholder="e.g., United States, United Kingdom"
                    className="bg-gray-800 border-yellow-500/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Company Address</label>
                  <Input
                    value={formData.company_address}
                    onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                    placeholder="123 Main St, City, State, ZIP"
                    className="bg-gray-800 border-yellow-500/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Contact Email *</label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="legal@yourcompany.com"
                    className="bg-gray-800 border-yellow-500/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Website URL</label>
                  <Input
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="bg-gray-800 border-yellow-500/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Refund Policy (Days)</label>
                  <Input
                    type="number"
                    value={formData.refund_policy_days}
                    onChange={(e) => setFormData({ ...formData, refund_policy_days: parseInt(e.target.value) })}
                    className="bg-gray-800 border-yellow-500/30"
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="font-bold text-yellow-400">Additional Options</h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Collects Personal Data</span>
                  <Switch
                    checked={formData.collects_personal_data}
                    onCheckedChange={(checked) => setFormData({ ...formData, collects_personal_data: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Uses Cookies</span>
                  <Switch
                    checked={formData.uses_cookies}
                    onCheckedChange={(checked) => setFormData({ ...formData, uses_cookies: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Has Payment Processing</span>
                  <Switch
                    checked={formData.has_payment_processing}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_payment_processing: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="border-gray-600"
                >
                  Back
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!formData.business_name || !formData.contact_email || isGenerating}
                  className="gold-gradient text-black hover:opacity-90 flex-1"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Document
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Review & Edit */}
      {step === 3 && selectedDoc && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-green-500/30 bg-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-400">Step 3: Review & Edit</CardTitle>
                <Badge className={`
                  ${selectedDoc.status === 'finalized' ? 'bg-green-600' : ''}
                  ${selectedDoc.status === 'reviewed' ? 'bg-blue-600' : ''}
                  ${selectedDoc.status === 'draft' ? 'bg-yellow-600' : ''}
                  text-white
                `}>
                  {selectedDoc.status} - v{selectedDoc.version || 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <ReactQuill
                      theme="snow"
                      value={editedContent}
                      onChange={setEditedContent}
                      modules={quillModules}
                      className="text-white"
                      style={{ height: '500px', marginBottom: '50px' }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEdits}
                      className="green-gradient text-white hover:opacity-90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div 
                    className="bg-white text-black p-8 rounded-lg overflow-auto max-h-[600px]"
                    dangerouslySetInnerHTML={{ __html: editedContent }}
                  />

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setStep(1);
                        setSelectedDoc(null);
                      }}
                      variant="outline"
                      className="border-gray-600"
                    >
                      Back to Documents
                    </Button>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-blue-500/30 text-blue-400"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Document
                    </Button>
                    <Button
                      onClick={() => handleDownload(selectedDoc)}
                      variant="outline"
                      className="border-yellow-500/30 text-yellow-400"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    {selectedDoc.status !== 'finalized' && (
                      <Button
                        onClick={handleFinalize}
                        className="green-gradient text-white hover:opacity-90"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finalize Document
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto bg-gray-900 border-green-500/30">
          <DialogHeader>
            <DialogTitle className="text-green-400">
              {selectedDoc && documentTypes.find(d => d.value === selectedDoc.document_type)?.label}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedDoc?.business_name} - Version {selectedDoc?.version || 1}
            </DialogDescription>
          </DialogHeader>
          <div 
            className="bg-white text-black p-8 rounded-lg"
            dangerouslySetInnerHTML={{ __html: editedContent }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}