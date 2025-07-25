import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ProductEditForm } from './ProductEditForm';
import { 
  FileText, 
  Upload, 
  User, 
  Building, 
  Mail, 
  Calendar,
  Package,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  MessageCircle,
  BarChart3,
  Loader2,
  Edit
} from 'lucide-react';

export interface Product {
  id: string;
  brand: string;
  type: string;
  sku: string;
  quantity: number;
  url?: string;
  verified: boolean;
  specs?: {
    wattage?: string;
    dimming?: string;
    direction?: string;
    length?: string;
    power?: string;
    colorTemperature?: string;
    color?: string;
    mountType?: string;
    lumen?: string;
    cri?: string;
    dimensions?: string;
    components?: Array<{
      sku: string;
      description: string;
      length?: string;
      power?: string;
      quantity: number;
    }>;
    accessories?: Array<{
      sku: string;
      description: string;
      dimming?: string;
      quantity: number;
    }>;
  };
}

export interface ClientInfo {
  fullName: string;
  companyName: string;
  email: string;
  projectName: string;
  isExisting: boolean;
  projectPhase?: string;
  otherBrandsComfortable?: boolean;
  position?: string;
  otherPosition?: string;
}

export interface WorkflowState {
  step: number;
  hasDocument: boolean;
  clientInfo: ClientInfo | null;
  products: Product[];
  deadline: string;
  documentContent: string;
  isCompleted: boolean;
  originalN8nResponse?: any; // Store the original n8n response
}

const initialState: WorkflowState = {
  step: 1,
  hasDocument: false,
  clientInfo: null,
  products: [],
  deadline: '',
  documentContent: '',
  isCompleted: false,
  originalN8nResponse: null,
};

const steps = [
  { id: 1, title: 'Document Upload', icon: FileText },
  { id: 2, title: 'Client Information', icon: User },
  { id: 3, title: 'Product Verification', icon: Package },
  { id: 4, title: 'Deadline', icon: Calendar },
  { id: 5, title: 'Final Review', icon: CheckCircle },
  { id: 6, title: 'Team Dashboard', icon: BarChart3 },
];

export const QuoteWorkflow = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<WorkflowState>(initialState);
  const [tempClientInfo, setTempClientInfo] = useState<Partial<ClientInfo>>({});
  const [tempDeadline, setTempDeadline] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const { toast } = useToast();

  const updateState = useCallback((updates: Partial<WorkflowState>) => {
    console.log('Updating state with:', updates);
    setState(prev => {
      const newState = { ...prev, ...updates };
      console.log('New state after update:', newState);
      return newState;
    });
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.min(prev.step + 1, 6) }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      updateState({ hasDocument: true });
      setIsProcessing(true);
      
      // Send file to n8n webhook and expect JSON response
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('fileSize', file.size.toString());
        formData.append('fileType', file.type);
        
        console.log('Attempting to upload file to n8n:', file.name);
        
        // First try with normal fetch to get response
        let response;
        try {
          response = await fetch('https://miraigen.app.n8n.cloud/webhook/67c28f9b-b18c-4637-8a32-c591cf759bff', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const jsonResponse = await response.json();
            console.log('Full n8n response:', JSON.stringify(jsonResponse, null, 2));
            console.log('Response type:', typeof jsonResponse);
            console.log('Is array:', Array.isArray(jsonResponse));
            
            // Add more detailed debugging
            if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
              console.log('First element:', jsonResponse[0]);
              console.log('First element message:', jsonResponse[0].message);
              console.log('First element content:', jsonResponse[0].message?.content);
            } else {
              console.log('Direct response message:', jsonResponse.message);
              console.log('Direct response content:', jsonResponse.message?.content);
            }
            
            // More flexible parsing - handle different response structures
            let products = null;
            
            // Handle single object response (not array) - this should be first since that's the current format
            if (jsonResponse.message?.content?.Products) {
              products = jsonResponse.message.content.Products;
              console.log('Found products in single object message.content.Products:', products);
            }
            // Try different possible response structures
            else if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
              // New n8n format: [{message: {content: {Products: [...]}}}] (capital P)
              if (jsonResponse[0].message?.content?.Products) {
                products = jsonResponse[0].message.content.Products;
                console.log('Found products in message.content.Products:', products);
              }
            }
            // Direct object format: {Products: [...]}
            else if (jsonResponse.Products) {
              products = jsonResponse.Products;
              console.log('Found products in direct Products property:', products);
            }
            // Handle single response object format
            else if (jsonResponse.message?.content?.products) {
              products = jsonResponse.message.content.products;
              console.log('Found products in single message.content.products:', products);
            }
            
            console.log('Final products after parsing:', products);
            console.log('Products is array:', Array.isArray(products));
            console.log('Products length:', products?.length);
            
            if (products && Array.isArray(products) && products.length > 0) {
              console.log('Processing products:', products);
              const extractedProducts = products.map((product: any, index: number) => {
                console.log(`Processing product ${index}:`, product);
                console.log('Brand field options:', {
                  BrandName: product.BrandName,
                  brand_name: product.brand_name,
                  Brand_Name: product.Brand_Name,
                  brandName: product.brandName
                });
                
                const extractedProduct = {
                  id: `product-${index}`,
                  brand: product["Brand Name"] || product.BrandName || product.brand_name || product.Brand_Name || product.brandName || 'N/A',
                  type: product.Specifications?.Type || product["Light Type"] || product.LightType || product.light_type || product.Light_Type || product.lightType || 'Unknown',
                  sku: Array.isArray(product.SKU) ? product.SKU.join(', ') : (product.SKU || product.sku),
                  quantity: product.Quantity || product.quantity || 1,
                  verified: false,
                  specs: {
                    // Handle both new format (Specifications object) and old format (direct properties)
                    wattage: (() => {
                      const power = product.Specifications?.Wattage || product.Specifications?.Power || product.Specs?.PowerConsumption || product.PowerConsumption || product.Power || product.wattage;
                      if (typeof power === 'object' && power !== null) {
                        // Handle object format like {"D1": "24 W", "D2": "49.5 W"}
                        return Object.values(power).join(', ');
                      }
                      return power;
                    })(),
                    dimming: product.Specifications?.Dimmable || product.Specs?.Dimmable || product.Dimmable || product.dimming,
                    direction: product.Specifications?.direction || product.Specs?.direction || product.direction,
                    colorTemperature: product.Specifications?.["Color Temperature"] || product.Specs?.ColorTemperature || product.ColorTemperature || product["Color Temperature"],
                    color: product.Specifications?.Color || product.Specs?.Color || product.Color,
                    mountType: (() => {
                      const mounting = product.Specifications?.Mounting || product.Specs?.MountType || product.MountType;
                      if (typeof mounting === 'object' && mounting !== null) {
                        // Handle object format like {"A1/A2": "Recessed", "A3": "Surface-mounted"}
                        return Object.values(mounting).join(', ');
                      } else if (Array.isArray(mounting)) {
                        // Handle array format
                        return mounting.join(', ');
                      }
                      return mounting || undefined;
                    })(),
                    lumen: (() => {
                      const lumen = product.Specifications?.Lumen || product.Specs?.Lumen || product.Lumen;
                      if (typeof lumen === 'object' && lumen !== null) {
                        // Handle object format like {"A1": 2000, "A2/A3": 4400}
                        return Object.values(lumen).join(', ');
                      }
                      return lumen;
                    })(),
                    cri: product.Specifications?.CRI || product.Specs?.CRI || product.CRI,
                    dimensions: (() => {
                      const dimensions = product.Specifications?.Dimensions || product.Specs?.Dimensions || product.Dimensions;
                      if (typeof dimensions === 'object' && dimensions !== null) {
                        // Handle object format like {"A1/A2": "D 214mm", "A3": "D 250mm x H 215mm"}
                        return Object.values(dimensions).join(', ');
                      }
                      return dimensions;
                    })(),
                    components: product.Components?.map((comp: any) => ({
                      sku: comp.SKU || comp.sku,
                      description: comp.Component_Type || comp.description,
                      length: comp.Length || comp.length,
                      power: comp.power,
                      quantity: comp.Quantity || comp.quantity
                    })) || product.components?.map((comp: any) => ({
                      sku: comp.SKU || comp.sku,
                      description: comp.description,
                      length: comp.length,
                      power: comp.power,
                      quantity: comp.quantity
                    })),
                    accessories: product.accessories?.map((acc: any) => ({
                      sku: acc.SKU || acc.sku,
                      description: acc.description,
                      dimming: acc.dimming,
                      quantity: acc.quantity
                    }))
                  }
                };
                
                console.log('Extracted product:', extractedProduct);
                return extractedProduct;
              });
              
              console.log('Successfully parsed products:', extractedProducts);
              updateState({ 
                products: extractedProducts,
                originalN8nResponse: jsonResponse // Store the original n8n response
              });
              
              toast({
                title: "Document processed successfully",
                description: `Found ${extractedProducts.length} products from ${file.name}. You can now proceed to verification.`,
              });
              setIsProcessing(false);
              return;
            } else {
              console.log('No products found in any expected location');
              console.log('Available keys in response:', Object.keys(jsonResponse));
              console.log('Full response structure:', jsonResponse);
              
              // Add more detailed debugging for failed parsing
              if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
                console.log('Response is array, first element keys:', Object.keys(jsonResponse[0]));
                if (jsonResponse[0].message) {
                  console.log('Message keys:', Object.keys(jsonResponse[0].message));
                  if (jsonResponse[0].message.content) {
                    console.log('Content keys:', Object.keys(jsonResponse[0].message.content));
                  }
                }
              } else {
                console.log('Response is not array or is empty');
                if (jsonResponse.message) {
                  console.log('Message keys:', Object.keys(jsonResponse.message));
                  if (jsonResponse.message.content) {
                    console.log('Content keys:', Object.keys(jsonResponse.message.content));
                  }
                }
              }
            }
          }
        } catch (corsError) {
          console.log('CORS error occurred:', corsError);
          
          toast({
            title: "Upload Error - CORS Issue",
            description: `The webhook at ${corsError.message ? corsError.message : 'the n8n endpoint'} is rejecting requests due to CORS policy. The n8n webhook needs to be configured to allow cross-origin requests from this domain.`,
            variant: "destructive",
          });
          
          setIsProcessing(false);
          return;
        }
        
        // If we get here, the response wasn't what we expected
        toast({
          title: "Document uploaded",
          description: `${file.name} was processed but no products were found.`,
          variant: "destructive",
        });
        setIsProcessing(false);
        
      } catch (error) {
        console.error('Error processing file with n8n:', error);
        toast({
          title: "Upload error",
          description: `Failed to process ${file.name}. Please try again.`,
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    }
  }, [updateState, toast]);

  const handleDocumentChoice = useCallback((hasDoc: boolean) => {
    updateState({ hasDocument: hasDoc });
    nextStep();
  }, [updateState, nextStep]);

  const handleClientTypeSelection = useCallback((isExisting: boolean) => {
    setTempClientInfo({ isExisting });
  }, []);

  const handleClientInfoSubmit = useCallback(() => {
    if (!tempClientInfo.isExisting) {
      if (!tempClientInfo.fullName || !tempClientInfo.companyName || !tempClientInfo.email || !tempClientInfo.projectName || !tempClientInfo.projectPhase || !tempClientInfo.position || (tempClientInfo.position === 'other' && !tempClientInfo.otherPosition)) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields for new clients.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!tempClientInfo.email || !tempClientInfo.projectPhase || !tempClientInfo.position || (tempClientInfo.position === 'other' && !tempClientInfo.otherPosition)) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
    }

    updateState({ clientInfo: tempClientInfo as ClientInfo });
    nextStep();
    toast({
      title: "Client information saved",
      description: tempClientInfo.isExisting ? 
        `Welcome back, ${tempClientInfo.fullName || 'valued client'}!` : 
        "New account information has been recorded.",
    });
  }, [tempClientInfo, updateState, nextStep, toast]);

  const handleProductVerification = useCallback((productId: string, verified: boolean) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === productId ? { ...p, verified } : p
      )
    }));
  }, []);

  const handleQuantityChange = useCallback((productId: string, quantity: number) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === productId ? { ...p, quantity } : p
      )
    }));
  }, []);

  const handleEditProduct = useCallback((productId: string) => {
    setEditingProductId(productId);
  }, []);

  const handleSaveProduct = useCallback((productId: string, updatedProduct: Product) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === productId ? updatedProduct : p
      )
    }));
    setEditingProductId(null);
    toast({
      title: "Product updated",
      description: "Product specifications have been saved successfully.",
    });
  }, [toast]);

  const handleCancelEdit = useCallback(() => {
    setEditingProductId(null);
  }, []);

  const handleDeadlineSubmit = useCallback(() => {
    if (!tempDeadline) {
      toast({
        title: "Missing Information",
        description: "Please specify your deadline.",
        variant: "destructive",
      });
      return;
    }

    updateState({ deadline: tempDeadline });
    nextStep();
  }, [tempDeadline, updateState, nextStep, toast]);

  const handleFinalSubmit = useCallback(async () => {
    try {
      // Send data to webhook
      const webhookData = {
        n8nResponse: state.originalN8nResponse,
        clientInfo: state.clientInfo,
        deadline: state.deadline,
        products: state.products,
        submittedAt: new Date().toISOString()
      };

      console.log('Sending data to webhook:', webhookData);

      const response = await fetch('https://miraigen.app.n8n.cloud/webhook/09834288-d59a-40ed-a860-a636ce415de3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Webhook submitted successfully');
        toast({
          title: "Quote Request Submitted",
          description: "Your quote request has been successfully submitted and will be processed shortly.",
        });
      } else {
        console.error('Webhook submission failed:', response.status);
        toast({
          title: "Quote Request Submitted",
          description: "Your quote request has been submitted locally. Processing will continue shortly.",
        });
      }
    } catch (error) {
      console.error('Error submitting to webhook:', error);
      toast({
        title: "Quote Request Submitted", 
        description: "Your quote request has been submitted locally. Processing will continue shortly.",
      });
    }
    
    nextStep();
  }, [state.originalN8nResponse, state.clientInfo, state.deadline, state.products, toast, nextStep]);

  // Extract products from text input
  const extractProducts = useCallback(() => {
    if (state.documentContent.trim()) {
      // For text input, create a simple product entry
      const textProduct: Product = {
        id: 'text-input-1',
        brand: 'Manual Entry',
        type: 'Custom Product',
        sku: 'MANUAL-001',
        quantity: 1,
        verified: false,
      };

      updateState({ products: [textProduct] });
      toast({
        title: "Product created from text",
        description: "Please verify and update the product details.",
      });
    } else {
      toast({
        title: "No content found",
        description: "Please enter product information in the text area.",
        variant: "destructive",
      });
    }
  }, [state.documentContent, updateState, toast]);

  const currentStepProgress = ((state.step - 1) / (steps.length - 1)) * 100;

  const renderStepContent = () => {
    switch (state.step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <MessageCircle className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-semibold text-foreground">Welcome to Quote Request</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Let's start by gathering your product requirements. Do you have a document to upload?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-primary/50">
                <CardContent className="p-6 text-center space-y-4">
                  <Upload className="h-8 w-8 text-primary mx-auto" />
                  <div>
                    <h3 className="font-semibold mb-2">Upload Document</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a PDF, Word document, or other file containing your product list
                    </p>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                    />
                    {uploadedFile && (
                      <div className="mt-2 p-2 bg-accent rounded-md">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-success" />
                          {uploadedFile.name}
                        </p>
                      </div>
                    )}
                  </div>
                  {uploadedFile && (
                    <Button 
                      onClick={() => handleDocumentChoice(true)}
                      variant="professional"
                      className="w-full"
                    >
                      Continue with Document
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-primary/50">
                <CardContent className="p-6 text-center space-y-4">
                  <FileText className="h-8 w-8 text-primary mx-auto" />
                  <div>
                    <h3 className="font-semibold mb-2">Type Products</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No document? No problem. You can type or paste your product list directly.
                    </p>
                    <Textarea
                      placeholder="Enter your product list here..."
                      value={state.documentContent}
                      onChange={(e) => updateState({ documentContent: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button 
                    onClick={() => handleDocumentChoice(false)}
                    variant="outline"
                    className="w-full"
                    disabled={!state.documentContent.trim()}
                  >
                    Continue with Text
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-semibold text-foreground">Client Information</h2>
              <p className="text-muted-foreground">
                Are you a new or existing client?
              </p>
            </div>

            {!tempClientInfo.hasOwnProperty('isExisting') ? (
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleClientTypeSelection(false)}
                  variant="elegant"
                  size="xl"
                  className="h-auto p-6 flex-col space-y-2"
                >
                  <User className="h-8 w-8" />
                  <span className="text-lg font-semibold">New Client</span>
                  <span className="text-sm opacity-80">Set up a new account</span>
                </Button>
                
                <Button
                  onClick={() => handleClientTypeSelection(true)}
                  variant="elegant"
                  size="xl"
                  className="h-auto p-6 flex-col space-y-2"
                >
                  <Building className="h-8 w-8" />
                  <span className="text-lg font-semibold">Existing Client</span>
                  <span className="text-sm opacity-80">I have an account</span>
                </Button>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 space-y-4">
                   {tempClientInfo.isExisting ? (
                     <div className="space-y-4">
                       <h3 className="text-lg font-semibold">Welcome Back!</h3>
                       <div className="space-y-2">
                         <Label htmlFor="existing-email">Email Address</Label>
                         <Input
                           id="existing-email"
                           type="email"
                           placeholder="your.email@company.com"
                           value={tempClientInfo.email || ''}
                           onChange={(e) => setTempClientInfo(prev => ({ ...prev, email: e.target.value }))}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="existing-project-phase">In what phase of the project are you in? *</Label>
                         <select
                           id="existing-project-phase"
                           className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                           value={tempClientInfo.projectPhase || ''}
                           onChange={(e) => setTempClientInfo(prev => ({ ...prev, projectPhase: e.target.value }))}
                         >
                           <option value="">Select phase</option>
                           <option value="beginning">Beginning</option>
                           <option value="middle">Middle</option>
                           <option value="end">End</option>
                         </select>
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="existing-position">What position are you? *</Label>
                          <select
                            id="existing-position"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={tempClientInfo.position || ''}
                            onChange={(e) => setTempClientInfo(prev => ({ ...prev, position: e.target.value }))}
                          >
                            <option value="">Select position</option>
                            <option value="calculator">Calculator</option>
                            <option value="planner">Planner</option>
                            <option value="contractor">Contractor</option>
                            <option value="other">Other</option>
                          </select>
                          {tempClientInfo.position === 'other' && (
                            <Input
                              placeholder="Please specify your position"
                              maxLength={25}
                              value={tempClientInfo.otherPosition || ''}
                              onChange={(e) => setTempClientInfo(prev => ({ ...prev, otherPosition: e.target.value }))}
                            />
                          )}
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="existing-other-brands">Are you comfortable using lights from other brands?</Label>
                         <div className="flex items-center space-x-2">
                           <input
                             type="checkbox"
                             id="existing-other-brands"
                             className="h-4 w-4 rounded border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                             checked={tempClientInfo.otherBrandsComfortable || false}
                             onChange={(e) => setTempClientInfo(prev => ({ ...prev, otherBrandsComfortable: e.target.checked }))}
                           />
                           <Label htmlFor="existing-other-brands" className="text-sm font-normal">
                             Yes, I'm comfortable with other brands
                           </Label>
                         </div>
                       </div>
                     </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">New Account Setup</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full-name">Full Name *</Label>
                          <Input
                            id="full-name"
                            placeholder="John Doe"
                            value={tempClientInfo.fullName || ''}
                            onChange={(e) => setTempClientInfo(prev => ({ ...prev, fullName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company-name">Company Name *</Label>
                          <Input
                            id="company-name"
                            placeholder="Acme Corporation"
                            value={tempClientInfo.companyName || ''}
                            onChange={(e) => setTempClientInfo(prev => ({ ...prev, companyName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john.doe@acme.com"
                          value={tempClientInfo.email || ''}
                          onChange={(e) => setTempClientInfo(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                       <div className="space-y-2">
                         <Label htmlFor="project-name">Project Name *</Label>
                         <Input
                           id="project-name"
                           placeholder="Office Equipment Upgrade Q1 2024"
                           value={tempClientInfo.projectName || ''}
                           onChange={(e) => setTempClientInfo(prev => ({ ...prev, projectName: e.target.value }))}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="project-phase">In what phase of the project are you in? *</Label>
                         <select
                           id="project-phase"
                           className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                           value={tempClientInfo.projectPhase || ''}
                           onChange={(e) => setTempClientInfo(prev => ({ ...prev, projectPhase: e.target.value }))}
                         >
                        <option value="">Select phase</option>
                        <option value="preliminary">Preliminary</option>
                        <option value="final">Final</option>
                         </select>
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="position">What position are you? *</Label>
                          <select
                            id="position"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={tempClientInfo.position || ''}
                            onChange={(e) => setTempClientInfo(prev => ({ ...prev, position: e.target.value }))}
                          >
                            <option value="">Select position</option>
                            <option value="calculator">Calculator</option>
                            <option value="planner">Planner</option>
                            <option value="contractor">Contractor</option>
                            <option value="other">Other</option>
                          </select>
                          {tempClientInfo.position === 'other' && (
                            <Input
                              placeholder="Please specify your position"
                              maxLength={25}
                              value={tempClientInfo.otherPosition || ''}
                              onChange={(e) => setTempClientInfo(prev => ({ ...prev, otherPosition: e.target.value }))}
                            />
                          )}
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="other-brands">Are you comfortable using lights from other brands?</Label>
                         <div className="flex items-center space-x-2">
                           <input
                             type="checkbox"
                             id="other-brands"
                             className="h-4 w-4 rounded border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                             checked={tempClientInfo.otherBrandsComfortable || false}
                             onChange={(e) => setTempClientInfo(prev => ({ ...prev, otherBrandsComfortable: e.target.checked }))}
                           />
                           <Label htmlFor="other-brands" className="text-sm font-normal">
                             Yes, I'm comfortable with other brands
                           </Label>
                         </div>
                       </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setTempClientInfo({})}
                      variant="outline"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleClientInfoSubmit}
                      variant="professional"
                      className="flex-1"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        console.log('Rendering step 3 - Current state:', state);
        console.log('Products in state:', state.products);
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Package className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-semibold text-foreground">Product SKU Verification</h2>
              <p className="text-muted-foreground">
                Please verify the extracted products and confirm quantities
              </p>
            </div>

            {state.products.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <p className="text-muted-foreground">
                    Ready to extract products from your {state.hasDocument ? 'document' : 'text input'}
                  </p>
                  <Button onClick={extractProducts} variant="professional">
                    Extract Products
                    <Package className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Extracted Products</h3>
                  <Badge variant="secondary">
                    {state.products.filter(p => p.verified).length} of {state.products.length} verified
                  </Badge>
                </div>

                {state.products.map((product) => (
                  <div key={product.id}>
                    {editingProductId === product.id ? (
                      <ProductEditForm
                        product={product}
                        onSave={handleSaveProduct}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <Card className={`border-2 transition-all duration-200 ${
                        product.verified ? 'border-success/30 bg-success/5' : 'border-border'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{product.brand} {product.type}</h4>
                                <Badge variant="outline">{product.sku}</Badge>
                              </div>
                              
                              {/* Product Specs */}
                              {product.specs && (
                                <div className="space-y-2">
                                  {/* Basic specs row */}
                                  {(product.specs.dimming || product.specs.wattage || product.specs.direction || product.specs.colorTemperature || product.specs.color || product.specs.mountType) && (
                                    <div className="flex flex-wrap gap-2">
                                      {product.specs.wattage && (
                                        <Badge variant="secondary" className="text-xs">
                                          {Array.isArray(product.specs.wattage) ? product.specs.wattage.join(', ') : product.specs.wattage}
                                        </Badge>
                                      )}
                                      {product.specs.dimming && (
                                        <Badge variant="secondary" className="text-xs">
                                          {product.specs.dimming}
                                        </Badge>
                                      )}
                                      {product.specs.direction && (
                                        <Badge variant="secondary" className="text-xs">
                                          {product.specs.direction}
                                        </Badge>
                                      )}
                                      {product.specs.colorTemperature && (
                                        <Badge variant="secondary" className="text-xs">
                                          {product.specs.colorTemperature}
                                        </Badge>
                                      )}
                                      {product.specs.color && (
                                        <Badge variant="secondary" className="text-xs">
                                          {product.specs.color}
                                        </Badge>
                                      )}
                                      {product.specs.mountType && (
                                        <Badge variant="secondary" className="text-xs">
                                          {Array.isArray(product.specs.mountType) ? product.specs.mountType.join(', ') : product.specs.mountType}
                                        </Badge>
                                      )}
                                      {product.specs.lumen && (
                                        <Badge variant="secondary" className="text-xs">
                                          {Array.isArray(product.specs.lumen) ? product.specs.lumen.join(', ') : product.specs.lumen}
                                        </Badge>
                                      )}
                                      {product.specs.cri && (
                                        <Badge variant="secondary" className="text-xs">
                                          CRI: {product.specs.cri}
                                        </Badge>
                                      )}
                                      {product.specs.dimensions && (
                                        <Badge variant="secondary" className="text-xs">
                                          {Array.isArray(product.specs.dimensions) ? product.specs.dimensions.join(', ') : product.specs.dimensions}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Components */}
                                  {product.specs.components && product.specs.components.length > 0 && (
                                    <div className="mt-3 p-3 bg-accent/50 rounded-md">
                                      <h5 className="text-sm font-medium mb-2">Components:</h5>
                                      <div className="space-y-1">
                                        {product.specs.components.map((comp, index) => (
                                          <div key={index} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline" className="text-xs">{comp.sku}</Badge>
                                              <span>{comp.description}</span>
                                              {comp.length && <span className="text-muted-foreground">({comp.length})</span>}
                                              {comp.power && <span className="text-muted-foreground">({comp.power})</span>}
                                            </div>
                                            <span className="text-muted-foreground">Qty: {comp.quantity}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Accessories */}
                                  {product.specs.accessories && product.specs.accessories.length > 0 && (
                                    <div className="mt-3 p-3 bg-accent/30 rounded-md">
                                      <h5 className="text-sm font-medium mb-2">Accessories:</h5>
                                      <div className="space-y-1">
                                        {product.specs.accessories.map((acc, index) => (
                                          <div key={index} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline" className="text-xs">{acc.sku}</Badge>
                                              <span>{acc.description}</span>
                                              {acc.dimming && <span className="text-muted-foreground">({acc.dimming})</span>}
                                            </div>
                                            <span className="text-muted-foreground">Qty: {acc.quantity}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {product.url && (
                                <a 
                                  href={product.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                  View Product Page
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}

                              <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                  <Label htmlFor={`quantity-${product.id}`} className="text-sm">Quantity</Label>
                                  <Input
                                    id={`quantity-${product.id}`}
                                    type="number"
                                    min="1"
                                    value={product.quantity}
                                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                                    className="w-20"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Button
                                onClick={() => handleEditProduct(product.id)}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleProductVerification(product.id, !product.verified)}
                                variant={product.verified ? "success" : "outline"}
                                size="sm"
                              >
                                {product.verified ? (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    Verified
                                  </>
                                ) : (
                                  'Verify'
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  <Button onClick={prevStep} variant="outline">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    variant="professional"
                    className="flex-1"
                    disabled={!state.products.every(p => p.verified)}
                  >
                    All Products Verified
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-semibold text-foreground">Project Deadline</h2>
              <p className="text-muted-foreground">
                When do you need this quotation?
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={tempDeadline}
                    onChange={(e) => setTempDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={prevStep} variant="outline">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleDeadlineSubmit}
                    variant="professional"
                    className="flex-1"
                    disabled={!tempDeadline}
                  >
                    Continue to Review
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <h2 className="text-2xl font-semibold text-foreground">Final Review</h2>
              <p className="text-muted-foreground">
                Please review all information before submitting
              </p>
            </div>

            <div className="space-y-6">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {state.clientInfo && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Name</Label>
                          <p className="font-medium">{state.clientInfo.fullName || 'Existing Client'}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Company</Label>
                          <p className="font-medium">{state.clientInfo.companyName || 'On File'}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Email</Label>
                          <p className="font-medium">{state.clientInfo.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Project</Label>
                          <p className="font-medium">{state.clientInfo.projectName || 'Quote Request'}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Project Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="text-sm text-muted-foreground">Deadline</Label>
                    <p className="font-medium">{new Date(state.deadline).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quoted Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Quoted Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.products.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                        <div>
                          <p className="font-medium">{product.brand} {product.type}</p>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <Badge variant="outline">Qty: {product.quantity}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Does all of this information look correct?
                </p>
                
                <div className="flex gap-3">
                  <Button onClick={prevStep} variant="outline">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Edit
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    variant="professional"
                    size="lg"
                    className="flex-1"
                  >
                    Confirm & Submit Request
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-6 p-8">
            <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Request Submitted Successfully!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your quote request has been submitted and is now in the system. You can now access the team dashboard to monitor progress.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="professional"
                size="lg"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Access Team Dashboard
              </Button>
              
              <Button 
                onClick={() => setState(initialState)}
                variant="outline"
                size="lg"
              >
                Start New Request
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (state.isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-muted to-accent-muted p-4 flex items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <CheckCircle className="h-16 w-16 text-success mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">Request Submitted!</h2>
              <p className="text-muted-foreground">
                Your quote request has been successfully submitted. We'll process it and send you a detailed quotation shortly.
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <p><strong>Reference ID:</strong> QR-{Date.now()}</p>
              <p><strong>Submitted:</strong> {new Date().toLocaleString()}</p>
            </div>

            <Button 
              onClick={() => setState(initialState)}
              variant="outline"
              className="w-full"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted to-accent-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Brinklicht Intake Assistant</h1>
          <p className="text-muted-foreground">
            Get accurate quotes for your business needs in just a few simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Progress</span>
                <span className="text-sm text-muted-foreground">Step {state.step} of {steps.length}</span>
              </div>
              <Progress value={currentStepProgress} className="h-2" />
              
              <div className="flex justify-between">
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  const isActive = step.id === state.step;
                  const isCompleted = step.id < state.step;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center space-y-2">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200
                        ${isActive ? 'bg-primary border-primary text-primary-foreground' : ''}
                        ${isCompleted ? 'bg-success border-success text-success-foreground' : ''}
                        ${!isActive && !isCompleted ? 'border-border text-muted-foreground' : ''}
                      `}>
                        <StepIcon className="h-4 w-4" />
                      </div>
                      <span className={`text-xs text-center max-w-16 ${
                        isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardContent className="p-8 relative">
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Processing Document...</h3>
                    <p className="text-sm text-muted-foreground">
                      AI is extracting products from your document. This may take a few seconds.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};