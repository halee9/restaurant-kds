import { useState } from 'react';
import { ArrowLeft, ChevronRight, Phone, Flag, Camera, QrCode, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

/* ── Guide type ── */
interface GuideStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

interface Guide {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;       // border-left color
  steps: GuideStep[];
}

/* ── Guides data ── */
const guides: Guide[] = [
  {
    id: 'unclaimed-order',
    title: 'Unclaimed Order',
    subtitle: 'Customer did not pick up their order',
    icon: <AlertTriangle size={24} />,
    color: 'border-l-orange-500',
    steps: [
      {
        title: 'Check for phone number',
        description: 'Open the order in /orders screen and look for the customer phone number below the payment info.',
        icon: <Phone size={20} />,
        tip: 'If a phone number is available, call the customer after 1 hour past the expected pickup time to confirm pickup.',
      },
      {
        title: 'No phone number — wait until closing',
        description: 'If there is no phone number on the order, keep the order until the store closes for the day.',
        icon: <Clock size={20} />,
      },
      {
        title: 'Flag the order as Unclaimed',
        description: 'Go to the /orders page and click on the unclaimed order. In the order detail panel, find the FLAG section and click the "Unclaimed" button. Also click the "Evidence" button.',
        icon: <Flag size={20} />,
        tip: 'Both "Unclaimed" and "Evidence" flags must be set for proper record-keeping.',
      },
      {
        title: 'Click "Phone Upload"',
        description: 'Below the FLAG section, find the PHOTOS section and click the "Phone Upload" button.',
        icon: <Camera size={20} />,
      },
      {
        title: 'Scan QR code with your phone',
        description: 'A popup will appear with a QR code. Open your phone camera and scan the QR code.',
        icon: <QrCode size={20} />,
      },
      {
        title: 'Upload page opens on your phone',
        description: 'Your phone browser will open an upload page. Tap the camera button to take a photo.',
        icon: <Camera size={20} />,
        tip: 'Take a clear photo of the prepared food items together with the printed order ticket.',
      },
      {
        title: 'Take a photo of the order + ticket',
        description: 'Place the order ticket next to the food items and take a photo. This serves as evidence that the order was prepared and not picked up.',
        icon: <Camera size={20} />,
        tip: 'Make sure both the food and the ticket are clearly visible in the photo.',
      },
      {
        title: 'Confirm upload and finish',
        description: 'After uploading, go back to the POS order detail and verify that the photo appears in the PHOTOS section. Once confirmed, you are done.',
        icon: <CheckCircle size={20} />,
      },
    ],
  },
];

/* ── Component ── */
export default function HelpScreen() {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  if (selectedGuide) {
    return (
      <div className="h-full overflow-auto bg-background">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedGuide(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Guides</span>
          </button>

          {/* Guide header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">{selectedGuide.title}</h1>
            <p className="text-muted-foreground mt-1">{selectedGuide.subtitle}</p>
          </div>

          {/* Steps */}
          <div className="space-y-1">
            {selectedGuide.steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  {idx < selectedGuide.steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border my-1" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary">{step.icon}</span>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  {step.tip && (
                    <div className="mt-2 px-3 py-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-200">
                      <span className="font-semibold">Tip:</span> {step.tip}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Help & Guides</h1>
        <p className="text-muted-foreground mb-6">Step-by-step guides for common situations</p>

        <div className="space-y-3">
          {guides.map((guide) => (
            <button
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className={`w-full text-left p-4 rounded-lg border border-border ${guide.color} border-l-4 bg-card hover:bg-secondary/50 transition-colors flex items-center gap-4`}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {guide.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{guide.title}</h3>
                <p className="text-sm text-muted-foreground">{guide.subtitle}</p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
