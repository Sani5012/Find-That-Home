import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from './ui/dialog';
import { mockProperties } from '../data/mockProperties';
import { PurchaseOffer, PurchaseTransaction as Transaction } from '../types/property';
import { 
  Home, DollarSign, FileText, CheckCircle2, Clock, Upload, 
  AlertCircle, TrendingUp, Shield, Calendar, ArrowRight,
  Briefcase, Building2, FileCheck, Stamp, Key, Check
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function PurchaseTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = mockProperties.find(p => p.id === id && p.listingType === 'sale');

  const [currentTab, setCurrentTab] = useState('offer');
  
  // Offer state
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [conditions, setConditions] = useState({
    subjectToSurvey: true,
    subjectToMortgage: true,
    includeFixtures: false,
  });

  // Mock transaction data
  const [transaction, setTransaction] = useState<Transaction>({
    id: 'txn-1',
    offerId: 'offer-1',
    propertyId: id || '',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    status: 'offer-accepted',
    currentStep: 3,
    totalSteps: 7,
    surveyBooked: true,
    surveyComplete: true,
    mortgageApproved: false,
    contractsExchanged: false,
    completionDate: '2025-12-15',
    documents: [
      {
        id: 'doc-1',
        name: 'Property Survey Report.pdf',
        type: 'survey',
        uploadedAt: '2025-10-28T10:00:00Z',
      },
      {
        id: 'doc-2',
        name: 'Proof of ID.pdf',
        type: 'id',
        uploadedAt: '2025-10-25T14:30:00Z',
        signedAt: '2025-10-25T14:35:00Z',
      },
    ],
    legalSteps: [
      {
        id: 'step-1',
        name: 'Offer Accepted',
        description: 'Your offer has been accepted by the seller',
        status: 'complete',
        completedAt: '2025-10-24T10:00:00Z',
      },
      {
        id: 'step-2',
        name: 'Survey Arranged',
        description: 'Property survey has been booked and completed',
        status: 'complete',
        completedAt: '2025-10-28T15:00:00Z',
      },
      {
        id: 'step-3',
        name: 'Mortgage Application',
        description: 'Submit mortgage application and await approval',
        status: 'in-progress',
      },
      {
        id: 'step-4',
        name: 'Legal Searches',
        description: 'Solicitor conducting property searches',
        status: 'pending',
      },
      {
        id: 'step-5',
        name: 'Exchange Contracts',
        description: 'Sign and exchange contracts with seller',
        status: 'pending',
      },
      {
        id: 'step-6',
        name: 'Final Checks',
        description: 'Pre-completion checks and final walkthrough',
        status: 'pending',
      },
      {
        id: 'step-7',
        name: 'Completion',
        description: 'Transfer of funds and property ownership',
        status: 'pending',
      },
    ],
  });

  const [showSigningDialog, setShowSigningDialog] = useState(false);
  const [documentToSign, setDocumentToSign] = useState('');

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="size-12 mx-auto mb-4 text-muted-foreground" />
          <h2>Property not found or not for sale</h2>
          <Button className="mt-4" onClick={() => navigate('/search')}>
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmitOffer = () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    const offer: PurchaseOffer = {
      id: `offer-${Date.now()}`,
      propertyId: property.id,
      userId: 'current-user',
      offeredPrice: parseFloat(offerAmount),
      offerDate: new Date().toISOString(),
      status: 'pending',
      message: offerMessage,
      conditions: Object.entries(conditions)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase()),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    toast.success('Offer submitted successfully!');
    setCurrentTab('progress');
  };

  const handleDocumentSign = (docName: string) => {
    setDocumentToSign(docName);
    setShowSigningDialog(true);
  };

  const confirmSignature = () => {
    toast.success(`Document "${documentToSign}" signed digitally`);
    setShowSigningDialog(false);
    setDocumentToSign('');
  };

  const progressPercentage = (transaction.currentStep / transaction.totalSteps) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/property/${id}`)} className="mb-4">
          ← Back to Property
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2">Purchase Transaction</h1>
            <p className="text-muted-foreground">{property.title}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Property Price</p>
            <p className="text-3xl text-blue-600">£{property.price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="offer">Make Offer</TabsTrigger>
          <TabsTrigger value="progress">Transaction Progress</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Make Offer Tab */}
        <TabsContent value="offer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="size-5" />
                Submit Your Offer
              </CardTitle>
              <CardDescription>
                Make an offer on this property. The seller will review and respond.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="offerAmount">Offer Amount (£)</Label>
                  <Input
                    id="offerAmount"
                    type="number"
                    placeholder={property.price.toString()}
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Asking price: £{property.price.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Quick Offer Options</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOfferAmount((property.price * 0.95).toString())}
                    >
                      95% (£{(property.price * 0.95).toLocaleString()})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOfferAmount((property.price * 0.98).toString())}
                    >
                      98% (£{(property.price * 0.98).toLocaleString()})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOfferAmount(property.price.toString())}
                    >
                      Full (£{property.price.toLocaleString()})
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offerMessage">Message to Seller (optional)</Label>
                <Textarea
                  id="offerMessage"
                  placeholder="Tell the seller why you're interested in this property..."
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <Label>Offer Conditions</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="subjectToSurvey"
                      checked={conditions.subjectToSurvey}
                      onCheckedChange={(checked) =>
                        setConditions({ ...conditions, subjectToSurvey: checked as boolean })
                      }
                    />
                    <label htmlFor="subjectToSurvey" className="text-sm cursor-pointer">
                      Subject to satisfactory survey
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="subjectToMortgage"
                      checked={conditions.subjectToMortgage}
                      onCheckedChange={(checked) =>
                        setConditions({ ...conditions, subjectToMortgage: checked as boolean })
                      }
                    />
                    <label htmlFor="subjectToMortgage" className="text-sm cursor-pointer">
                      Subject to mortgage approval
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeFixtures"
                      checked={conditions.includeFixtures}
                      onCheckedChange={(checked) =>
                        setConditions({ ...conditions, includeFixtures: checked as boolean })
                      }
                    />
                    <label htmlFor="includeFixtures" className="text-sm cursor-pointer">
                      Include all fixtures and fittings
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <Shield className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="mb-2">
                      <strong>Remote Purchase Process</strong>
                    </p>
                    <p className="text-muted-foreground">
                      Complete your property purchase entirely remotely. All legal steps, document signing,
                      and fund transfers are handled securely online through our platform.
                      No in-person solicitor visits required.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSubmitOffer} className="w-full" size="lg">
                Submit Offer
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Purchase Progress
              </CardTitle>
              <CardDescription>
                Track your property purchase from offer to completion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Step {transaction.currentStep} of {transaction.totalSteps}
                </p>
              </div>

              <Separator />

              {/* Completion Date */}
              {transaction.completionDate && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-green-600" />
                    <div>
                      <p>Expected Completion Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.completionDate).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Legal Steps */}
              <div className="space-y-4">
                <h3>Legal Process Steps</h3>
                {transaction.legalSteps.map((step, index) => (
                  <div key={step.id}>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`size-10 rounded-full flex items-center justify-center ${
                            step.status === 'complete'
                              ? 'bg-green-100 text-green-600'
                              : step.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {step.status === 'complete' ? (
                            <CheckCircle2 className="size-5" />
                          ) : step.status === 'in-progress' ? (
                            <Clock className="size-5" />
                          ) : (
                            <span className="text-sm">{index + 1}</span>
                          )}
                        </div>
                        {index < transaction.legalSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-16 ${
                              step.status === 'complete' ? 'bg-green-200' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>

                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-1">
                          <h4>{step.name}</h4>
                          <Badge
                            variant={
                              step.status === 'complete'
                                ? 'default'
                                : step.status === 'in-progress'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {step.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.completedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed: {new Date(step.completedAt).toLocaleDateString()}
                          </p>
                        )}

                        {/* Step-specific actions */}
                        {step.status === 'in-progress' && step.id === 'step-3' && (
                          <Button size="sm" className="mt-3">
                            <Briefcase className="size-4 mr-2" />
                            Complete Mortgage Application
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Milestones */}
              <Separator />
              <div>
                <h3 className="mb-4">Key Milestones</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="size-5 text-muted-foreground" />
                      <span className="text-sm">Survey Completed</span>
                    </div>
                    {transaction.surveyComplete ? (
                      <CheckCircle2 className="size-5 text-green-600" />
                    ) : (
                      <Clock className="size-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="size-5 text-muted-foreground" />
                      <span className="text-sm">Mortgage Approved</span>
                    </div>
                    {transaction.mortgageApproved ? (
                      <CheckCircle2 className="size-5 text-green-600" />
                    ) : (
                      <Clock className="size-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="size-5 text-muted-foreground" />
                      <span className="text-sm">Contracts Exchanged</span>
                    </div>
                    {transaction.contractsExchanged ? (
                      <CheckCircle2 className="size-5 text-green-600" />
                    ) : (
                      <Clock className="size-5 text-orange-600" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Legal Documents
              </CardTitle>
              <CardDescription>
                Upload, review, and digitally sign all required documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <Stamp className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="mb-1">
                      <strong>Digital Signatures</strong>
                    </p>
                    <p className="text-muted-foreground">
                      All documents can be signed digitally using our secure e-signature system.
                      Legally binding and compliant with UK property law.
                    </p>
                  </div>
                </div>
              </div>

              {/* Document List */}
              <div className="space-y-3">
                {transaction.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-blue-600" />
                      <div>
                        <p>{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        {doc.signedAt && (
                          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                            <Check className="size-3" />
                            Signed: {new Date(doc.signedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="size-4 mr-1" />
                        View
                      </Button>
                      {!doc.signedAt && (
                        <Button size="sm" onClick={() => handleDocumentSign(doc.name)}>
                          <Stamp className="size-4 mr-1" />
                          Sign
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Section */}
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="size-8 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-2">Upload Additional Documents</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop or click to browse
                </p>
                <Button variant="outline">
                  <Upload className="size-4 mr-2" />
                  Choose Files
                </Button>
              </div>

              {/* Required Documents Checklist */}
              <div>
                <h3 className="mb-3">Required Documents</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    <span>Proof of Identity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    <span>Property Survey Report</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-orange-600" />
                    <span>Mortgage Agreement in Principle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-orange-600" />
                    <span>Proof of Funds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-orange-600" />
                    <span>Solicitor Details</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Digital Signature Dialog */}
      <Dialog open={showSigningDialog} onOpenChange={setShowSigningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stamp className="size-5" />
              Digital Signature
            </DialogTitle>
            <DialogDescription>
              Sign "{documentToSign}" electronically
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border rounded-lg">
              <p className="text-sm mb-2">
                <strong>Document:</strong> {documentToSign}
              </p>
              <p className="text-sm text-muted-foreground">
                By signing this document electronically, you confirm that you have read and agree to its contents.
                Your electronic signature is legally binding.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Type your full name to sign</Label>
              <Input placeholder="Enter your full name" />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" />
              <label htmlFor="terms" className="text-sm cursor-pointer">
                I confirm that I have read and understood this document and that my electronic signature
                constitutes a legally binding agreement
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSigningDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSignature}>
              <Stamp className="size-4 mr-2" />
              Sign Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
