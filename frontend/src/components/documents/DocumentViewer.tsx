import { Card, CardContent } from "@/components/ui/card";

interface DocumentViewerProps {
  document: {
    version: number; // Pass version as 1 or 2
  };
}

const DOCUMENT_VERSIONS: Record<number, any> = {
  1: {
    version: 1,
    timestamp: "2025-04-27T11:12:37.801246",
    filename: "GlobalFinanceInc-term.pdf",
    data: {
      "Trade ID": "TRD345679",
      CounterpartyDetails: "LEI 529900CLLNP1G0N1HF43 (Global Finance Inc.)",
      DayCountConvention: "30/360",
      DiscountCurve: "USD OIS Curve as of 2025-04-27",
      Filename: "GlobalFinanceInc-term.pdf",
      FixedRate: "3.25%",
      FloatingRateIndex: "SOFR",
      MaturityTenor: "5 years",
      NotionalAmount: "20000000 USD",
      PaymentFrequency: "Semi-Annual",
      ReferenceRateResetDates: "2025-11-10",
      StartEffectiveDate: "2025-05-10",
      Status: "Uploaded",
      "Trader ID": "TDR3344",
      UploadDate: "2025-04-27",
    },
  },
  2: {
    version: 2,
    timestamp: "2025-04-27T11:22:41.097160",
    filename: "GlobalFinanceInc-term.pdf",
    data: {
      TraderId: "TDR3344",
      Filename: "GlobalFinanceInc-term.pdf",
      UploadDate: "2025-04-27",
      Status: "validated",
      "Trade ID": "TRD345679",
      TradeId: "TRD345679",
      CounterpartyDetails: "LEI 529900CLLNP1G0N1HF43 (Global Finance Inc.)",
      DayCountConvention: "30/360",
      DiscountCurve: "USD OIS Curve as of 2025-04-27",
      FixedRate: "3.25%",
      FloatingRateIndex: "SOFR",
      MaturityTenor: "5 years",
      NotionalAmount: "20000000 USD",
      PaymentFrequency: "Semi-Annual",
      ReferenceRateResetDates: "2025-11-10",
      StartEffectiveDate: "2025-05-10",
      "Trade Id": "TRD345679",
      "Trader Id": "TDR3344",
    },
  },
};

export default function DocumentViewer({ document }: DocumentViewerProps) {
  const docData = DOCUMENT_VERSIONS[document.version];

  if (!docData) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="bg-red-50 text-red-800 p-4 rounded">
            No document found for version {document.version}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="bg-gray-100 p-2 mb-4 rounded text-black">
          <span className="font-medium">
            Document Version: {docData.version}
          </span>
          <pre className="whitespace-pre-wrap break-words mt-4">
            {JSON.stringify(docData, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
