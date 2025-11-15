import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Home, 
  PiggyBank,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner';

interface AffordabilityResult {
  maxPropertyPrice: number;
  maxMonthlyRent: number;
  monthlyMortgagePayment: number;
  recommendedDownPayment: number;
  affordableRange: {
    min: number;
    max: number;
  };
}

interface AffordabilityCalculatorProps {
  onAffordabilityUpdate?: (result: AffordabilityResult) => void;
}

export function AffordabilityCalculator({ onAffordabilityUpdate }: AffordabilityCalculatorProps) {
  const { user, updateUserProfile } = useUser();
  
  // Income settings
  const [income, setIncome] = useState(user?.income || 0);
  const [incomeType, setIncomeType] = useState<'monthly' | 'yearly'>(user?.incomeType || 'monthly');
  
  // Additional financial details
  const [monthlyDebts, setMonthlyDebts] = useState(user?.monthlyDebts || 0);
  const [savings, setSavings] = useState(user?.savings || 0);
  const [creditScore, setCreditScore] = useState<'excellent' | 'good' | 'fair' | 'poor'>(
    user?.creditScore || 'good'
  );
  
  // Property preferences
  const [propertyType, setPropertyType] = useState<'buy' | 'rent'>(user?.preferredPropertyType || 'rent');
  const [downPaymentPercent, setDownPaymentPercent] = useState([20]);
  
  // Calculated results
  const [affordabilityResult, setAffordabilityResult] = useState<AffordabilityResult | null>(null);

  // Calculate affordability when inputs change
  useEffect(() => {
    calculateAffordability();
  }, [income, incomeType, monthlyDebts, savings, creditScore, propertyType, downPaymentPercent]);

  const calculateAffordability = () => {
    if (income <= 0) {
      setAffordabilityResult(null);
      return;
    }

    // Convert to monthly income
    const monthlyIncome = incomeType === 'yearly' ? income / 12 : income;

    // Calculate debt-to-income ratio (DTI)
    // Recommended DTI is 28% for housing, 36% total
    const maxHousingExpense = monthlyIncome * 0.28;
    const maxTotalDebt = monthlyIncome * 0.36;
    const availableForHousing = Math.max(0, maxTotalDebt - monthlyDebts);

    // Interest rate based on credit score
    const interestRates = {
      excellent: 0.055, // 5.5%
      good: 0.065,      // 6.5%
      fair: 0.075,      // 7.5%
      poor: 0.085       // 8.5%
    };
    const annualRate = interestRates[creditScore];
    const monthlyRate = annualRate / 12;
    const loanTermMonths = 30 * 12; // 30-year mortgage

    if (propertyType === 'buy') {
      // Calculate maximum mortgage payment (excluding property tax and insurance)
      const maxMortgagePayment = Math.min(maxHousingExpense * 0.75, availableForHousing * 0.75);
      
      // Calculate maximum loan amount using mortgage formula
      // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
      // Solving for P: P = M * [ (1 + i)^n – 1 ] / [ i(1 + i)^n ]
      const maxLoanAmount = maxMortgagePayment * 
        ((Math.pow(1 + monthlyRate, loanTermMonths) - 1) / 
        (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)));

      // Calculate maximum property price based on down payment
      const downPaymentFraction = downPaymentPercent[0] / 100;
      const maxPropertyPrice = maxLoanAmount / (1 - downPaymentFraction);
      const recommendedDownPayment = maxPropertyPrice * downPaymentFraction;

      const result: AffordabilityResult = {
        maxPropertyPrice: Math.floor(maxPropertyPrice),
        maxMonthlyRent: 0,
        monthlyMortgagePayment: Math.floor(maxMortgagePayment),
        recommendedDownPayment: Math.floor(recommendedDownPayment),
        affordableRange: {
          min: Math.floor(maxPropertyPrice * 0.5), // 50% of max
          max: Math.floor(maxPropertyPrice)
        }
      };

      setAffordabilityResult(result);
      if (onAffordabilityUpdate) {
        onAffordabilityUpdate(result);
      }
    } else {
      // For rent: use 30% rule (rent should be max 30% of income)
      const maxMonthlyRent = Math.min(monthlyIncome * 0.3, availableForHousing);

      const result: AffordabilityResult = {
        maxPropertyPrice: 0,
        maxMonthlyRent: Math.floor(maxMonthlyRent),
        monthlyMortgagePayment: 0,
        recommendedDownPayment: 0,
        affordableRange: {
          min: Math.floor(maxMonthlyRent * 0.5), // 50% of max
          max: Math.floor(maxMonthlyRent)
        }
      };

      setAffordabilityResult(result);
      if (onAffordabilityUpdate) {
        onAffordabilityUpdate(result);
      }
    }
  };

  const handleSaveProfile = () => {
    const monthlyIncome = incomeType === 'yearly' ? income / 12 : income;
    
    updateUserProfile({
      income,
      incomeType,
      monthlyDebts,
      savings,
      creditScore,
      preferredPropertyType: propertyType,
      affordabilityResult,
      monthlyIncome
    });

    toast.success('Affordability profile saved successfully!');
  };

  const getCreditScoreColor = (score: string) => {
    switch (score) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-300';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'fair': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'poor': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const monthlyIncome = incomeType === 'yearly' ? income / 12 : income;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            AI Affordability Calculator
          </CardTitle>
          <p className="text-sm text-gray-600">
            Get personalized property recommendations based on your financial profile
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Income Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <h3 className="text-base">Income Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income">Your Income</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="Enter your income"
                  value={income || ''}
                  onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incomeType">Income Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={incomeType === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setIncomeType('monthly')}
                    className="flex-1"
                  >
                    Monthly
                  </Button>
                  <Button
                    type="button"
                    variant={incomeType === 'yearly' ? 'default' : 'outline'}
                    onClick={() => setIncomeType('yearly')}
                    className="flex-1"
                  >
                    Yearly
                  </Button>
                </div>
              </div>
            </div>

            {income > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Monthly Income:</strong> £{monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            )}
          </div>

          {/* Property Type */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-purple-600" />
              <h3 className="text-base">Property Interest</h3>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant={propertyType === 'rent' ? 'default' : 'outline'}
                onClick={() => setPropertyType('rent')}
                className="flex-1"
              >
                Looking to Rent
              </Button>
              <Button
                type="button"
                variant={propertyType === 'buy' ? 'default' : 'outline'}
                onClick={() => setPropertyType('buy')}
                className="flex-1"
              >
                Looking to Buy
              </Button>
            </div>
          </div>

          {/* Additional Financial Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-orange-600" />
              <h3 className="text-base">Financial Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyDebts">Monthly Debts/Obligations</Label>
                <Input
                  id="monthlyDebts"
                  type="number"
                  placeholder="£0"
                  value={monthlyDebts || ''}
                  onChange={(e) => setMonthlyDebts(parseFloat(e.target.value) || 0)}
                />
              </div>

              {propertyType === 'buy' && (
                <div className="space-y-2">
                  <Label htmlFor="savings">Available Savings</Label>
                  <Input
                    id="savings"
                    type="number"
                    placeholder="£0"
                    value={savings || ''}
                    onChange={(e) => setSavings(parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Credit Score Range</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['excellent', 'good', 'fair', 'poor'] as const).map((score) => (
                  <Button
                    key={score}
                    type="button"
                    variant={creditScore === score ? 'default' : 'outline'}
                    onClick={() => setCreditScore(score)}
                    className="capitalize"
                  >
                    {score}
                  </Button>
                ))}
              </div>
            </div>

            {propertyType === 'buy' && (
              <div className="space-y-2">
                <Label>Down Payment: {downPaymentPercent[0]}%</Label>
                <Slider
                  value={downPaymentPercent}
                  onValueChange={setDownPaymentPercent}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Recommended minimum: 20% to avoid PMI (Private Mortgage Insurance)
                </p>
              </div>
            )}
          </div>

          {/* Results */}
          {affordabilityResult && income > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h3 className="text-base">Your Affordability Results</h3>
              </div>

              {propertyType === 'buy' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Maximum Property Price</p>
                      <p className="text-2xl text-green-700">
                        £{affordabilityResult.maxPropertyPrice.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Recommended Down Payment</p>
                      <p className="text-2xl text-blue-700">
                        £{affordabilityResult.recommendedDownPayment.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Monthly Mortgage Payment</p>
                      <p className="text-2xl text-purple-700">
                        £{affordabilityResult.monthlyMortgagePayment.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Affordable Range</p>
                      <p className="text-lg text-orange-700">
                        £{affordabilityResult.affordableRange.min.toLocaleString()} - 
                        £{affordabilityResult.affordableRange.max.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Maximum Monthly Rent</p>
                      <p className="text-2xl text-green-700">
                        £{affordabilityResult.maxMonthlyRent.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Recommended Range</p>
                      <p className="text-lg text-blue-700">
                        £{affordabilityResult.affordableRange.min.toLocaleString()} - 
                        £{affordabilityResult.affordableRange.max.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex gap-3">
                <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="mb-2">
                    <strong>AI Recommendation:</strong> Based on your financial profile, we recommend looking at properties within your affordable range to maintain healthy finances.
                  </p>
                  <p>
                    These calculations follow the 28/36 rule: housing costs should not exceed 28% of gross income, and total debt should not exceed 36%.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSaveProfile} className="flex-1">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Affordability Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
