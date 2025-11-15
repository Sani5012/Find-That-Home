import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Home, Target, Users, Award, Shield, FileText } from 'lucide-react';

export function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">About Us</TabsTrigger>
              <TabsTrigger value="terms">Terms of Use</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="cookies">Cookies</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <Home className="h-8 w-8 text-blue-600" />
                      <h1>About HomeAI</h1>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      HomeAI is revolutionizing the way people find their perfect home. Using artificial intelligence and machine learning, we match buyers and renters with properties that truly fit their lifestyle, preferences, and budget.
                    </p>
                    <p>
                      Founded in 2023, we've helped thousands of families find their dream homes by combining cutting-edge technology with deep market insights and personalized service.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Target className="h-6 w-6 text-blue-600" />
                        <CardTitle>Our Mission</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        To make home searching intuitive, transparent, and personalized. We believe everyone deserves to find a home that matches not just their budget, but their lifestyle and dreams.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Award className="h-6 w-6 text-blue-600" />
                        <CardTitle>Our Vision</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        To become the most trusted and innovative real estate platform, powered by AI technology that understands and anticipates the needs of home seekers.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Users className="h-6 w-6 text-blue-600" />
                      <CardTitle>What Makes Us Different</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 text-sm">1</span>
                        </div>
                        <div>
                          <strong>AI-Powered Search:</strong> Describe your ideal home in plain language and let our AI find the perfect matches.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 text-sm">2</span>
                        </div>
                        <div>
                          <strong>Lifestyle Matching:</strong> We consider commute times, neighborhood vibes, and nearby amenities to find homes that fit your life.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 text-sm">3</span>
                        </div>
                        <div>
                          <strong>Financial Transparency:</strong> Built-in affordability calculators help you understand exactly what you can afford.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 text-sm">4</span>
                        </div>
                        <div>
                          <strong>Market Intelligence:</strong> Access real-time market data, price trends, and investment insights.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 text-sm">5</span>
                        </div>
                        <div>
                          <strong>End-to-End Support:</strong> From search to closing, we guide you through every step of the process.
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="terms">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <CardTitle>Terms of Use</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none space-y-4">
                  <section>
                    <h3>1. Acceptance of Terms</h3>
                    <p>
                      By accessing and using HomeAI's platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
                    </p>
                  </section>

                  <section>
                    <h3>2. Use License</h3>
                    <p>
                      Permission is granted to temporarily access the materials on HomeAI's platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                    </p>
                  </section>

                  <section>
                    <h3>3. User Accounts</h3>
                    <p>
                      You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                    </p>
                  </section>

                  <section>
                    <h3>4. Property Listings</h3>
                    <p>
                      Property information is provided by third parties and HomeAI makes no guarantees about the accuracy, completeness, or timeliness of such information. All property details should be verified independently.
                    </p>
                  </section>

                  <section>
                    <h3>5. Disclaimer</h3>
                    <p>
                      The materials on HomeAI's platform are provided on an 'as is' basis. HomeAI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                  </section>

                  <section>
                    <h3>6. Limitations</h3>
                    <p>
                      In no event shall HomeAI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on HomeAI's platform.
                    </p>
                  </section>

                  <section>
                    <h3>7. Modifications</h3>
                    <p>
                      HomeAI may revise these terms of service at any time without notice. By using this platform you are agreeing to be bound by the then current version of these terms of service.
                    </p>
                  </section>

                  <p className="text-sm text-gray-500 mt-6">
                    Last updated: October 28, 2025
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <CardTitle>Privacy Policy</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none space-y-4">
                  <section>
                    <h3>1. Information We Collect</h3>
                    <p>
                      We collect information you provide directly to us, such as when you create an account, search for properties, or contact us for support. This may include your name, email address, phone number, and property preferences.
                    </p>
                  </section>

                  <section>
                    <h3>2. How We Use Your Information</h3>
                    <p>We use the information we collect to:</p>
                    <ul>
                      <li>Provide, maintain, and improve our services</li>
                      <li>Match you with relevant property listings</li>
                      <li>Send you alerts about new properties and market updates</li>
                      <li>Communicate with you about our services</li>
                      <li>Personalize your experience on our platform</li>
                    </ul>
                  </section>

                  <section>
                    <h3>3. Information Sharing</h3>
                    <p>
                      We do not sell your personal information. We may share your information with service providers who perform services on our behalf, such as property agents and legal professionals, only when necessary to provide our services.
                    </p>
                  </section>

                  <section>
                    <h3>4. Data Security</h3>
                    <p>
                      We use industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. All data is encrypted both in transit and at rest.
                    </p>
                  </section>

                  <section>
                    <h3>5. Your Rights</h3>
                    <p>You have the right to:</p>
                    <ul>
                      <li>Access your personal information</li>
                      <li>Correct inaccurate data</li>
                      <li>Request deletion of your data</li>
                      <li>Opt-out of marketing communications</li>
                      <li>Export your data</li>
                    </ul>
                  </section>

                  <section>
                    <h3>6. Cookies and Tracking</h3>
                    <p>
                      We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                    </p>
                  </section>

                  <section>
                    <h3>7. Children's Privacy</h3>
                    <p>
                      Our service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18.
                    </p>
                  </section>

                  <section>
                    <h3>8. Changes to This Policy</h3>
                    <p>
                      We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
                    </p>
                  </section>

                  <p className="text-sm text-gray-500 mt-6">
                    Last updated: October 28, 2025
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cookies">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <CardTitle>Cookie Policy</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none space-y-4">
                  <section>
                    <h3>What Are Cookies</h3>
                    <p>
                      Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                    </p>
                  </section>

                  <section>
                    <h3>How We Use Cookies</h3>
                    <p>We use cookies for the following purposes:</p>
                    <ul>
                      <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off in our systems.</li>
                      <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
                      <li><strong>Functionality Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization.</li>
                      <li><strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners to build a profile of your interests.</li>
                    </ul>
                  </section>

                  <section>
                    <h3>Types of Cookies We Use</h3>
                    <div className="space-y-3">
                      <div>
                        <strong>Session Cookies:</strong>
                        <p>Temporary cookies that expire when you close your browser.</p>
                      </div>
                      <div>
                        <strong>Persistent Cookies:</strong>
                        <p>Cookies that remain on your device for a set period or until you delete them.</p>
                      </div>
                      <div>
                        <strong>First-Party Cookies:</strong>
                        <p>Cookies set by HomeAI directly.</p>
                      </div>
                      <div>
                        <strong>Third-Party Cookies:</strong>
                        <p>Cookies set by third-party services we use, such as analytics providers.</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3>Managing Cookies</h3>
                    <p>
                      You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit our site.
                    </p>
                  </section>

                  <section>
                    <h3>Cookie List</h3>
                    <p>Our website uses the following cookies:</p>
                    <ul>
                      <li><strong>session_id:</strong> Essential - Maintains your session</li>
                      <li><strong>user_preferences:</strong> Functionality - Stores your preferences</li>
                      <li><strong>analytics:</strong> Performance - Tracks site usage</li>
                      <li><strong>alerts:</strong> Functionality - Manages your alert settings</li>
                    </ul>
                  </section>

                  <section>
                    <h3>Contact Us</h3>
                    <p>
                      If you have any questions about our use of cookies, please contact us at privacy@homeai.com.
                    </p>
                  </section>

                  <p className="text-sm text-gray-500 mt-6">
                    Last updated: October 28, 2025
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
