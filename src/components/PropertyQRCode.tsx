import { useEffect, useRef } from 'react';
import { Property } from '../types/property';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { QrCode, Printer, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import QRCode from 'qrcode';

interface PropertyQRCodeProps {
  property: Property;
}

export function PropertyQRCode({ property }: PropertyQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [property]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    // Create a URL that includes property details and GPS coordinates
    // In production, this would be your actual domain
    const propertyUrl = `${window.location.origin}/property/${property.id}`;
    
    // Enhanced data with GPS for directions
    const qrData = JSON.stringify({
      url: propertyUrl,
      id: property.id,
      title: property.title,
      location: property.location,
      price: property.price,
      coordinates: property.coordinates,
    });

    try {
      await QRCode.toCanvas(canvasRef.current, qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const qrCodeImage = canvas.toDataURL('image/png');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${property.title}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 40px;
              background: white;
            }
            .container {
              text-align: center;
              max-width: 600px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 8px;
              color: #1e293b;
            }
            .location {
              font-size: 16px;
              color: #64748b;
              margin-bottom: 8px;
            }
            .price {
              font-size: 32px;
              color: #2563eb;
              font-weight: 700;
              margin-bottom: 24px;
            }
            .qr-wrapper {
              display: inline-block;
              padding: 20px;
              background: white;
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              margin-bottom: 24px;
            }
            .instructions {
              font-size: 14px;
              color: #64748b;
              margin-top: 16px;
              line-height: 1.6;
            }
            .logo {
              font-size: 20px;
              font-weight: 700;
              color: #2563eb;
              margin-bottom: 32px;
            }
            .details {
              margin-top: 24px;
              padding: 16px;
              background: #f8fafc;
              border-radius: 8px;
              text-align: left;
            }
            .details p {
              margin: 8px 0;
              font-size: 14px;
            }
            .details strong {
              color: #1e293b;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Find that Home</div>
            <h1>${property.title}</h1>
            <div class="location">${property.location}</div>
            <div class="price">£${property.price.toLocaleString()}</div>
            
            <div class="qr-wrapper">
              <img src="${qrCodeImage}" alt="Property QR Code" />
            </div>
            
            <div class="instructions">
              <strong>Scan to view property details and get directions</strong>
              <br />
              Use your smartphone camera to scan this QR code for instant access to:
              <br />
              • Full property details and photos
              <br />
              • GPS directions from your current location
              <br />
              • Neighborhood information and amenities
              <br />
              • Contact options and booking
            </div>

            <div class="details">
              <p><strong>Property Type:</strong> ${property.type.charAt(0).toUpperCase() + property.type.slice(1)}</p>
              <p><strong>Bedrooms:</strong> ${property.bedrooms} | <strong>Bathrooms:</strong> ${property.bathrooms}</p>
              <p><strong>Size:</strong> ${property.sqft.toLocaleString()} sq ft</p>
              <p><strong>Year Built:</strong> ${property.yearBuilt}</p>
              <p><strong>Listing Type:</strong> ${property.listingType === 'rent' ? 'For Rent' : 'For Sale'}</p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for images to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast.success('Opening print dialog...');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a more detailed version for download
    const link = document.createElement('a');
    link.download = `qr-code-${property.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    toast.success('QR code downloaded');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="size-5" />
          Property QR Code
        </CardTitle>
        <CardDescription>
          Print or download this QR code for easy property access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
            <canvas ref={canvasRef} />
          </div>
          
          <div className="text-center text-sm text-muted-foreground max-w-md">
            Scan this QR code with your smartphone to view property details and get GPS directions from your current location.
          </div>

          <div className="flex gap-2 w-full">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="size-4 mr-2" />
              Print QR Code
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="size-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="mb-2">
              <strong>When scanned, users will get:</strong>
            </p>
            <ul className="space-y-1 text-muted-foreground ml-4">
              <li>• Direct link to this property listing</li>
              <li>• GPS directions from their current location</li>
              <li>• Full property details and photos</li>
              <li>• Nearby amenities and neighborhood info</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
