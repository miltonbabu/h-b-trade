"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import { Upload, CheckCircle2, X, Image } from "lucide-react";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  passportNumber: string;
  age: string;
  profession: string;
  division: string;
  district: string;
  businessType: "business" | "company" | "individual" | "";
  businessName: string;
  businessCertificateNumber: string;
  passportImages: { file: File; preview: string; id: string }[];
  businessCertificateImages: { file: File; preview: string; id: string }[];
  additionalMessage: string;
}

const BANGLADESH_DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Khulna",
  "Rajshahi",
  "Barisal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const BANGLADESH_DISTRICTS: Record<string, string[]> = {
  "Dhaka": ["Dhaka", "Gazipur", "Kishoreganj", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
  "Chattogram": ["Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cox's Bazar", "Cumilla", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati"],
  "Khulna": ["Bagerhat", "Chuadanga", "D Jessore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
  "Rajshahi": ["Bogura", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Nawabganj", "Pabna", "Rajshahi", "Sirajganj"],
  "Rangpur": ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"],
  "Sylhet": ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  "Barisal": ["Barguna", "Barisal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
  "Mymensingh": ["Jamalpur", "Mymensingh", "Netrakona", "Sherpur"],
};

const MAX_IMAGES = 4;

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  
  const result = await response.json();
  return result.secure_url || "";
}

export default function SignupForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    passportNumber: "",
    age: "",
    profession: "",
    division: "",
    district: "",
    businessType: "",
    businessName: "",
    businessCertificateNumber: "",
    passportImages: [],
    businessCertificateImages: [],
    additionalMessage: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileAdd = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "passportImages" | "businessCertificateImages") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = formData[fieldName];
    if (currentImages.length >= MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images`);
      return;
    }

    const remainingSlots = MAX_IMAGES - currentImages.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const newImages = await Promise.all(
      filesToAdd.map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          return null;
        }

        const preview = URL.createObjectURL(file);
        return { file, preview, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) };
      })
    );

    const validImages = newImages.filter((img): img is { file: File; preview: string; id: string } => img !== null);

    setFormData((prev) => ({
      ...prev,
      [fieldName]: [...prev[fieldName], ...validImages],
    }));

    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  const handleFileRemove = (index: number, fieldName: "passportImages" | "businessCertificateImages") => {
    setFormData((prev) => {
      const images = [...prev[fieldName]];
      const removed = images.splice(index, 1)[0];
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return {
        ...prev,
        [fieldName]: images,
      };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.passportNumber.trim()) newErrors.passportNumber = "Passport number is required";
    if (!formData.age) newErrors.age = "Age is required";
    if (!formData.profession.trim()) newErrors.profession = "Profession is required";
    if (!formData.division) newErrors.division = "Division is required";
    if (!formData.district) newErrors.district = "District is required";
    if (!formData.businessType) newErrors.businessType = "Business type is required";
    if (!formData.businessName.trim()) newErrors.businessName = "Business/Company name is required";
    if (formData.passportImages.length === 0) newErrors.passportImages = "At least one passport image is required";

    if (formData.businessType === "business" || formData.businessType === "company") {
      if (!formData.businessCertificateNumber.trim() && formData.businessCertificateImages.length === 0) {
        newErrors.businessCertificate = "Please provide either Business Certificate Number or upload Business Certificate documents";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const passportUrls = await Promise.all(
        formData.passportImages.map((img) => uploadToCloudinary(img.file))
      );

      const certificateUrls = await Promise.all(
        formData.businessCertificateImages.map((img) => uploadToCloudinary(img.file))
      );

      const submissionData = {
        ...formData,
        passportImages: passportUrls.filter(Boolean),
        businessCertificateImages: certificateUrls.filter(Boolean),
        event_title: "2026 CIAAF Zhengzhou",
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/event-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      setSubmitSuccess(true);
      toast.success("Registration submitted successfully!");

      setTimeout(() => {
        formData.passportImages.forEach((img) => URL.revokeObjectURL(img.preview));
        formData.businessCertificateImages.forEach((img) => URL.revokeObjectURL(img.preview));
        
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          whatsappNumber: "",
          passportNumber: "",
          age: "",
          profession: "",
          division: "",
          district: "",
          businessType: "",
          businessName: "",
          businessCertificateNumber: "",
          passportImages: [],
          businessCertificateImages: [],
          additionalMessage: "",
        });
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const districts = formData.division ? BANGLADESH_DISTRICTS[formData.division] || [] : [];

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 animate-fade-in">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6 animate-scale-in" />
          <h2 className="text-2xl font-bold mb-3">Registration Successful!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for registering for the 2026 CIAAF (Zhengzhou). We have received your application and will contact you soon with further details.
          </p>
          <Button onClick={() => setSubmitSuccess(false)} className="bg-primary hover:bg-primary/90">
            Submit Another Registration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      <Card className="p-8 border border-border/50 shadow-lg rounded-xl bg-gradient-to-br from-card to-background animate-slide-in-left stagger-1">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">1</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Personal Information</h2>
            <p className="text-sm text-muted-foreground">Basic details about yourself</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Full Name *</label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`h-12 border-2 ${errors.fullName ? "border-destructive" : "border-border focus:border-primary"}`}
              />
              {errors.fullName && <p className="text-destructive text-xs">{errors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Email Address *</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className={`h-12 border-2 ${errors.email ? "border-destructive" : "border-border focus:border-primary"}`}
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Phone Number *</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+880 1XXXXXXXXX"
                className={`h-12 border-2 ${errors.phone ? "border-destructive" : "border-border focus:border-primary"}`}
              />
              {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold">WhatsApp Number</label>
              <div className="relative">
                <Input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  placeholder="+880 1XXXXXXXXX"
                  className="h-12 border-2 border-border focus:border-primary pr-24"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      whatsappNumber: prev.phone,
                    }));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                >
                  Same as phone
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Optional - Click "Same as phone" to auto-fill</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Passport Number *</label>
              <Input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                placeholder="e.g., AB123456"
                className={`h-12 border-2 ${errors.passportNumber ? "border-destructive" : "border-border focus:border-primary"}`}
              />
              {errors.passportNumber && <p className="text-destructive text-xs">{errors.passportNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Age *</label>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Enter your age"
                min="18"
                max="120"
                className={`h-12 border-2 ${errors.age ? "border-destructive" : "border-border focus:border-primary"}`}
              />
              {errors.age && <p className="text-destructive text-xs">{errors.age}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Profession *</label>
              <Input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                placeholder="e.g., Business Owner, Manager"
                className={`h-12 border-2 ${errors.profession ? "border-destructive" : "border-border focus:border-primary"}`}
              />
              {errors.profession && <p className="text-destructive text-xs">{errors.profession}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold">Passport Images * (Max {MAX_IMAGES})</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileAdd(e, "passportImages")}
                className="hidden"
                id="passportImages"
              />
              <label
                htmlFor="passportImages"
                className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  formData.passportImages.length > 0
                    ? "border-secondary bg-secondary/5"
                    : "border-border hover:border-secondary hover:bg-muted/50"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-center">
                  {formData.passportImages.length > 0 
                    ? `${formData.passportImages.length} image(s) selected - Click to add more` 
                    : "Click to upload passport images"}
                </span>
              </label>
            </div>
            
            {formData.passportImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.passportImages.map((img, index) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border-2 border-border group hover:border-primary transition-colors">
                    <img src={img.preview} alt={`Passport ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleFileRemove(index, "passportImages")}
                      className="absolute top-2 right-2 w-7 h-7 bg-destructive/90 hover:bg-destructive rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {errors.passportImages && <p className="text-destructive text-xs">{errors.passportImages}</p>}
          </div>
        </div>
      </Card>

      <Card className="p-8 border border-border/50 shadow-lg rounded-xl bg-gradient-to-br from-card to-background animate-slide-in-left stagger-2">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <span className="text-secondary font-bold">2</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Location (Bangladesh)</h2>
            <p className="text-sm text-muted-foreground">Your current address</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Division *</label>
              <Select value={formData.division} onValueChange={(value) => handleSelectChange("division", value)}>
                <SelectTrigger className={`h-12 border-2 ${errors.division ? "border-destructive" : "border-border"}`}>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <SelectItem key={div} value={div}>{div}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.division && <p className="text-destructive text-xs">{errors.division}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold">District *</label>
              <Select value={formData.district} onValueChange={(value) => handleSelectChange("district", value)} disabled={!formData.division}>
                <SelectTrigger className={`h-12 border-2 ${errors.district ? "border-destructive" : "border-border"}`}>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((dist) => (
                    <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.district && <p className="text-destructive text-xs">{errors.district}</p>}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 border border-border/50 shadow-lg rounded-xl bg-gradient-to-br from-card to-background animate-slide-in-left stagger-3">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">3</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Business Information</h2>
            <p className="text-sm text-muted-foreground">Company or business details</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Business Type *</label>
            <Select value={formData.businessType} onValueChange={(value) => handleSelectChange("businessType", value)}>
              <SelectTrigger className={`h-12 border-2 ${errors.businessType ? "border-destructive" : "border-border"}`}>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
            {errors.businessType && <p className="text-destructive text-xs">{errors.businessType}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold">Business/Company Name *</label>
            <Input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              placeholder="Enter business or company name"
              className={`h-12 border-2 ${errors.businessName ? "border-destructive" : "border-border focus:border-primary"}`}
            />
            {errors.businessName && <p className="text-destructive text-xs">{errors.businessName}</p>}
          </div>

          {(formData.businessType === "business" || formData.businessType === "company") && (
            <div className="space-y-6 p-6 rounded-xl border-2 border-secondary/20 bg-secondary/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <span className="text-secondary text-sm font-bold">!</span>
                </div>
                <span className="text-sm font-medium text-secondary">Business Documents (Required)</span>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Business/TIN Number (Optional)</label>
                <Input
                  type="text"
                  name="businessCertificateNumber"
                  value={formData.businessCertificateNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Business Certificate or TIN number"
                  className="h-12 border-2 border-border focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">* Optional if uploading documents below</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold">Business Certificate/TIN/License (Max {MAX_IMAGES})</label>
                <p className="text-xs text-muted-foreground">Upload business certificate, TIN certificate, or trade license documents</p>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => handleFileAdd(e, "businessCertificateImages")}
                    className="hidden"
                    id="businessCertificateImages"
                  />
                  <label
                    htmlFor="businessCertificateImages"
                    className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      formData.businessCertificateImages.length > 0
                        ? "border-secondary bg-secondary/5"
                        : "border-border hover:border-secondary hover:bg-muted/50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-secondary" />
                    </div>
                    <span className="text-sm font-medium text-center">
                      {formData.businessCertificateImages.length > 0 
                        ? `${formData.businessCertificateImages.length} document(s) selected - Click to add more` 
                        : "Click to upload business documents"}
                    </span>
                  </label>
                </div>
                
                {formData.businessCertificateImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.businessCertificateImages.map((img, index) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border-2 border-border group hover:border-secondary transition-colors">
                        <img src={img.preview} alt={`Document ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleFileRemove(index, "businessCertificateImages")}
                          className="absolute top-2 right-2 w-7 h-7 bg-destructive/90 hover:bg-destructive rounded-full flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {errors.businessCertificate && <p className="text-destructive text-xs">{errors.businessCertificate}</p>}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-8 border border-border/50 shadow-lg rounded-xl bg-gradient-to-br from-card to-background animate-slide-in-left stagger-4">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <span className="text-secondary font-bold">4</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Additional Information</h2>
            <p className="text-sm text-muted-foreground">Any extra details you'd like to share</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Message / Additional Notes</label>
            <Textarea
              name="additionalMessage"
              value={formData.additionalMessage}
              onChange={handleInputChange}
              placeholder="Any additional information you would like to share about your participation..."
              rows={5}
              className="border-2 border-border focus:border-primary resize-none"
            />
            <p className="text-xs text-muted-foreground">Optional - Maximum 500 characters</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-center pt-6 animate-slide-in-left stagger-5">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-16 py-4 bg-primary hover:bg-primary/90 text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </span>
          ) : "Submit Registration"}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        * Required fields - Your information is secure and encrypted
      </p>
    </form>
  );
}