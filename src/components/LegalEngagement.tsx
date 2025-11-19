import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  FileText, CheckCircle2, Clock, DollarSign, Upload, CreditCard,
  Shield, Users, Home, ArrowRight, Check, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { propertyStore } from '../services/platformData';
import { Property } from '../types/property';

export function LegalEngagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setProperty(null);
      setLoading(false);
      return;
    }

    const loadProperty = async () => {
      setLoading(true);
      try {
        const fetched = await propertyStore.getById(id);
        setProperty(fetched);
      } catch (error) {
        console.error('Failed to load property', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);
  
  // Application state
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationStatus, setApplicationStatus] = useState<'pending' | 'in-progress' | 'approved' | 'rejected'>('in-progress');
  
  // Step 1: Offer Details
  const [offerAmount, setOfferAmount] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [leaseTerm, setLeaseTerm] = useState('12');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerAccepted, setOfferAccepted] = useState(false);
  
  // Step 2: Personal Information
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationalInsurance, setNationalInsurance] = useState('');
  
  // Step 3: Employment & Financial
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [employmentLength, setEmploymentLength] = useState('');
  
  // Step 4: Credit Check & References
  const [creditCheckConsent, setCreditCheckConsent] = useState(false);
  const [creditCheckComplete, setCreditCheckComplete] = useState(false);
  const [reference1Name, setReference1Name] = useState('');
  const [reference1Contact, setReference1Contact] = useState('');
  const [reference2Name, setReference2Name] = useState('');
  const [reference2Contact, setReference2Contact] = useState('');
  const [referencesComplete, setReferencesComplete] = useState(false);
  
  // Step 5: Documents
  const [idUploaded, setIdUploaded] = useState(false);
  const [proofOfIncomeUploaded, setProofOfIncomeUploaded] = useState(false);
  const [proofOfAddressUploaded, setProofOfAddressUploaded] = useState(false);
  
  // Step 6: Deposit & First Month
  const [depositPaid, setDepositPaid] = useState(false);
  const [firstMonthPaid, setFirstMonthPaid] = useState(false);
  const [directDebitSetup, setDirectDebitSetup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bank-transfer' | 'card'>('bank-transfer');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2>Property not found</h2>
        <Button onClick={() => navigate('/search')} className="mt-4">
          Back to Search
        </Button>
      </div>
    );
  }

  const isRental = property.listingType === 'rent';
  const totalSteps = isRental ? 6 : 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const depositAmount = property.price * 1.5; // 6 weeks deposit typical in UK

  const handleSubmitOffer = () => {
    if (!offerAmount || !moveInDate || !leaseTerm) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Simulate offer submission
    setTimeout(() => {
      setOfferAccepted(true);
      toast.success('Offer accepted by landlord! Proceeding to application.');
      setCurrentStep(2);
    }, 1500);
  };

  const handlePersonalInfo = () => {
    if (!fullName || !email || !phone || !currentAddress || !dateOfBirth) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Personal information saved');
    setCurrentStep(3);
  };

  const handleEmploymentInfo = () => {
    if (!employmentStatus || !annualIncome) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Employment information saved');
    setCurrentStep(4);
  };

  const handleCreditCheckAndReferences = () => {
    if (!creditCheckConsent) {
      toast.error('You must consent to a credit check');
      return;
    }
    if (!reference1Name || !reference1Contact) {
      toast.error('Please provide at least one reference');
      return;
    }
    
    // Simulate credit check
    toast.info('Running credit check...');
    setTimeout(() => {
      setCreditCheckComplete(true);
      setReferencesComplete(true);
      toast.success('Credit check completed and references contacted');
      setCurrentStep(5);
    }, 2000);
  };

  const handleDocuments = () => {
    if (!idUploaded || !proofOfIncomeUploaded || !proofOfAddressUploaded) {
      toast.error('Please upload all required documents');
      return;
    }
    toast.success('All documents received');
    setCurrentStep(6);
  };

  const handlePayments = () => {
    if (!depositPaid || !firstMonthPaid || !directDebitSetup) {
      toast.error('Please complete all payment steps');
      return;
    }
    
    setApplicationStatus('approved');
    toast.success('Application approved! Welcome to your new home!');
  };

  const simulateFileUpload = (setUploadFunction: (value: boolean) => void) => {
    toast.info('Uploading file...');
    setTimeout(() => {
      setUploadFunction(true);
      toast.success('File uploaded successfully');
    }, 1500);
  };

  const simulatePayment = (setPaymentFunction: (value: boolean) => void, paymentType: string) => {
    toast.info(`Processing ${paymentType} payment...`);
    setTimeout(() => {
      setPaymentFunction(true);
      toast.success(`${paymentType} payment successful`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(`/property/${id}`)} className="mb-4">
          ← Back to Property
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl mb-2">
            {isRental ? 'Rental Application Process' : 'Purchase Process'}
          </h1>
          <p className="text-gray-600">{property.title}</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>Step {currentStep} of {totalSteps}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between mt-6">
              {[
                { num: 1, label: 'Offer' },
                { num: 2, label: 'Personal Info' },
                { num: 3, label: 'Employment' },
                { num: 4, label: 'Credit Check' },
                { num: 5, label: 'Documents' },
                { num: 6, label: 'Payment' }
              ].slice(0, totalSteps).map((step) => (
                <div key={step.num} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      currentStep > step.num ? 'bg-green-500 text-white' :
                      currentStep === step.num ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.num ? <Check className="h-5 w-5" /> : step.num}
                  </div>
                  <span className="text-xs text-center">{step.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Step 1: Make Offer */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Make Your Offer</CardTitle>
                  <CardDescription>Submit your rental offer to the landlord</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Offered Monthly Rent (£) *</Label>
                    <Input
                      type="number"
                      placeholder={property.price.toString()}
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Advertised rent: £{property.price.toLocaleString()}/month
                    </p>
                  </div>

                  <div>
                    <Label>Desired Move-in Date *</Label>
                    <Input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Lease Term (months) *</Label>
                    <Select value={leaseTerm} onValueChange={setLeaseTerm}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="18">18 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Message to Landlord (Optional)</Label>
                    <Textarea
                      placeholder="Tell the landlord why you're a great tenant..."
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleSubmitOffer} className="w-full">
                    Submit Offer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Personal Information</CardTitle>
                  <CardDescription>Provide your personal details for the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Smith"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Email Address *</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Phone Number *</Label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XXX XXXXXX"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Current Address *</Label>
                    <Textarea
                      value={currentAddress}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                      placeholder="Street, City, Postcode"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>National Insurance Number</Label>
                      <Input
                        value={nationalInsurance}
                        onChange={(e) => setNationalInsurance(e.target.value)}
                        placeholder="AB 12 34 56 C"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button onClick={handlePersonalInfo} className="w-full">
                    Continue to Employment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Employment & Financial */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Employment & Financial Information</CardTitle>
                  <CardDescription>Help us verify your income and employment status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Employment Status *</Label>
                    <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed Full-time</SelectItem>
                        <SelectItem value="employed-part">Employed Part-time</SelectItem>
                        <SelectItem value="self-employed">Self-employed</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(employmentStatus === 'employed' || employmentStatus === 'employed-part' || employmentStatus === 'self-employed') && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Employer Name *</Label>
                          <Input
                            value={employerName}
                            onChange={(e) => setEmployerName(e.target.value)}
                            placeholder="Company name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Job Title *</Label>
                          <Input
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="Your position"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Length of Employment</Label>
                        <Input
                          value={employmentLength}
                          onChange={(e) => setEmploymentLength(e.target.value)}
                          placeholder="e.g., 2 years"
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Annual Gross Income (£) *</Label>
                    <Input
                      type="number"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(e.target.value)}
                      placeholder="e.g., 35000"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Before tax. You'll need to provide proof in the next steps.
                    </p>
                  </div>

                  <Button onClick={handleEmploymentInfo} className="w-full">
                    Continue to Credit Check
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Credit Check & References */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 4: Credit Check & References</CardTitle>
                  <CardDescription>We need to verify your credit history and contact references</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Credit Check */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={creditCheckConsent}
                        onCheckedChange={(checked) => setCreditCheckConsent(checked as boolean)}
                        className="mt-1"
                      />
                      <div>
                        <Label className="cursor-pointer">
                          I consent to a credit check *
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          We'll use Experian to run a soft credit check. This won't affect your credit score.
                          The landlord will use this to assess your application.
                        </p>
                      </div>
                    </div>

                    {creditCheckComplete && (
                      <div className="mt-3 p-3 bg-green-50 rounded flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Credit check completed</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* References */}
                  <div>
                    <h4 className="mb-3">Provide References</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Please provide at least one reference (previous landlord or employer)
                    </p>

                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 space-y-3">
                        <h5 className="text-sm">Reference 1 *</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={reference1Name}
                              onChange={(e) => setReference1Name(e.target.value)}
                              placeholder="Full name"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Contact (Email or Phone)</Label>
                            <Input
                              value={reference1Contact}
                              onChange={(e) => setReference1Contact(e.target.value)}
                              placeholder="email@example.com"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 space-y-3">
                        <h5 className="text-sm">Reference 2 (Optional)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={reference2Name}
                              onChange={(e) => setReference2Name(e.target.value)}
                              placeholder="Full name"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Contact (Email or Phone)</Label>
                            <Input
                              value={reference2Contact}
                              onChange={(e) => setReference2Contact(e.target.value)}
                              placeholder="email@example.com"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {referencesComplete && (
                      <div className="mt-3 p-3 bg-green-50 rounded flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">References contacted</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleCreditCheckAndReferences} 
                    className="w-full"
                    disabled={creditCheckComplete && referencesComplete}
                  >
                    {creditCheckComplete && referencesComplete ? 'Verified' : 'Run Credit Check & Contact References'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 5: Upload Documents</CardTitle>
                  <CardDescription>Please provide the following documents to verify your identity and income</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Label>Photo ID (Passport or Driver's License) *</Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Clear photo or scan of your passport or driving license
                        </p>
                      </div>
                      {idUploaded ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Uploaded
                        </Badge>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => simulateFileUpload(setIdUploaded)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Label>Proof of Income *</Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Last 3 months' payslips or tax returns if self-employed
                        </p>
                      </div>
                      {proofOfIncomeUploaded ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Uploaded
                        </Badge>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => simulateFileUpload(setProofOfIncomeUploaded)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Label>Proof of Address *</Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Recent utility bill or bank statement (within 3 months)
                        </p>
                      </div>
                      {proofOfAddressUploaded ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Uploaded
                        </Badge>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => simulateFileUpload(setProofOfAddressUploaded)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handleDocuments} 
                    className="w-full"
                    disabled={!idUploaded || !proofOfIncomeUploaded || !proofOfAddressUploaded}
                  >
                    Continue to Payment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Deposit & Payment */}
            {currentStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 6: Deposit & First Month's Rent</CardTitle>
                  <CardDescription>Complete your payments to secure the property</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Deposit */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Label>Security Deposit</Label>
                        <p className="text-sm mt-1">£{depositAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Held by independent deposit protection scheme (TDS/DPS)
                        </p>
                      </div>
                      {depositPaid ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>

                    {!depositPaid && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Payment Method</Label>
                          <Select value={paymentMethod} onValueChange={(v: 'bank-transfer' | 'card') => setPaymentMethod(v)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                              <SelectItem value="card">Credit/Debit Card</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {paymentMethod === 'card' && (
                          <div className="space-y-3">
                            <Input placeholder="Card Number" />
                            <div className="grid grid-cols-2 gap-3">
                              <Input placeholder="MM/YY" />
                              <Input placeholder="CVV" />
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'bank-transfer' && (
                          <div className="p-3 bg-gray-50 rounded text-sm">
                            <p className="mb-2">Bank Details:</p>
                            <p>Sort Code: 12-34-56</p>
                            <p>Account: 12345678</p>
                            <p>Reference: DEP-{id}</p>
                          </div>
                        )}

                        <Button 
                          onClick={() => simulatePayment(setDepositPaid, 'Deposit')}
                          className="w-full"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Pay Deposit (£{depositAmount.toLocaleString()})
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* First Month Rent */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Label>First Month's Rent</Label>
                        <p className="text-sm mt-1">£{property.price.toLocaleString()}</p>
                      </div>
                      {firstMonthPaid ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>

                    {!firstMonthPaid && depositPaid && (
                      <Button 
                        onClick={() => simulatePayment(setFirstMonthPaid, 'First month rent')}
                        className="w-full"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay First Month (£{property.price.toLocaleString()})
                      </Button>
                    )}
                  </div>

                  {/* Direct Debit Setup */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Label>Direct Debit for Future Payments</Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Set up automatic monthly payments for subsequent rent
                        </p>
                      </div>
                      {directDebitSetup ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Setup
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>

                    {!directDebitSetup && firstMonthPaid && (
                      <div className="space-y-3">
                        <Input placeholder="Bank Name" />
                        <Input placeholder="Account Holder Name" />
                        <Input placeholder="Sort Code" />
                        <Input placeholder="Account Number" />
                        <Button 
                          onClick={() => {
                            setDirectDebitSetup(true);
                            toast.success('Direct Debit setup successfully');
                          }}
                          className="w-full"
                        >
                          Setup Direct Debit
                        </Button>
                      </div>
                    )}
                  </div>

                  {depositPaid && firstMonthPaid && directDebitSetup && (
                    <Button 
                      onClick={handlePayments}
                      className="w-full"
                      size="lg"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Complete Application
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Application Approved */}
            {applicationStatus === 'approved' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl mb-2">Application Approved!</h2>
                  <p className="text-gray-600 mb-6">
                    Congratulations! Your application has been approved and all payments have been processed.
                    You'll receive your tenancy agreement via email within 24 hours.
                  </p>
                  <div className="space-y-3">
                    <Button onClick={() => navigate(`/property/${id}`)} className="w-full">
                      View Property Details
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/profile')} className="w-full">
                      Go to My Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500">Property</Label>
                  <p className="text-sm">{property.title}</p>
                  <p className="text-xs text-gray-600">{property.location}</p>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs text-gray-500">Monthly Rent</Label>
                  <p>£{property.price.toLocaleString()}</p>
                </div>

                {offerAmount && (
                  <div>
                    <Label className="text-xs text-gray-500">Your Offer</Label>
                    <p>£{parseFloat(offerAmount).toLocaleString()}</p>
                  </div>
                )}

                {moveInDate && (
                  <div>
                    <Label className="text-xs text-gray-500">Move-in Date</Label>
                    <p className="text-sm">{moveInDate}</p>
                  </div>
                )}

                {leaseTerm && (
                  <div>
                    <Label className="text-xs text-gray-500">Lease Term</Label>
                    <p className="text-sm">{leaseTerm} months</p>
                  </div>
                )}

                <Separator />

                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">Checklist</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {offerAccepted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={offerAccepted ? 'text-green-700' : ''}>Offer Accepted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentStep > 2 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={currentStep > 2 ? 'text-green-700' : ''}>Personal Info</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentStep > 3 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={currentStep > 3 ? 'text-green-700' : ''}>Employment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {creditCheckComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={creditCheckComplete ? 'text-green-700' : ''}>Credit Check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {idUploaded && proofOfIncomeUploaded && proofOfAddressUploaded ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={idUploaded && proofOfIncomeUploaded && proofOfAddressUploaded ? 'text-green-700' : ''}>Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {depositPaid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={depositPaid ? 'text-green-700' : ''}>Deposit Paid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {firstMonthPaid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={firstMonthPaid ? 'text-green-700' : ''}>First Month Paid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {directDebitSetup ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={directDebitSetup ? 'text-green-700' : ''}>Direct Debit Setup</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-blue-900 mb-1">Secure Process</p>
                      <p className="text-xs text-blue-700">
                        All payments are processed securely. Your deposit is protected by a government-approved scheme.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
