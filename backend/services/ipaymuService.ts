import { loadSync } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

// Load environment variables
loadSync({ export: true });

const IPAYMU_API_KEY = Deno.env.get("IPAYMU_API_KEY")!;
const IPAYMU_VA = Deno.env.get("IPAYMU_VA")!;
const IPAYMU_BASE_URL = "https://sandbox.ipaymu.com/api/v2/payment"; // Use sandbox for development

interface IpaymuPaymentRequest {
  order_id: string;
  amount: number;
  payment_type: "dp" | "full";
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  returnUrl: string;
  notifyUrl: string;
}

interface IpaymuResponse {
  Status: number;
  Message?: string;
  Data?: IpaymuPaymentData;
}

interface IpaymuPaymentData {
  SessionID: string;
  Url: string;
  Via: string;
  Channel: string;
  PaymentNo: string;
  PaymentName: string;
  Total: number;
  Fee: number;
  Expired: string;
}

export async function createIpaymuPayment(
  data: IpaymuPaymentRequest
): Promise<IpaymuPaymentData> {
  const product = [
    `${data.payment_type === "dp" ? "DP" : "Pelunasan"} Pembayaran Proyek`,
  ];
  const qty = ["1"];
  const price = [data.amount];

  const body = `product[]=${product[0]}&qty[]=${qty[0]}&price[]=${
    price[0]
  }&returnUrl=${encodeURIComponent(
    data.returnUrl
  )}&cancelUrl=${encodeURIComponent(
    data.returnUrl
  )}&notifyUrl=${encodeURIComponent(
    data.notifyUrl
  )}&buyerName=${encodeURIComponent(
    data.buyer_name
  )}&buyerEmail=${encodeURIComponent(
    data.buyer_email
  )}&buyerPhone=${encodeURIComponent(data.buyer_phone)}&referenceId=${
    data.order_id
  }`;

  const stringToSign = `POST:${IPAYMU_BASE_URL}:${IPAYMU_VA}:${IPAYMU_API_KEY}:${body}`;
  const signature = await crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(stringToSign))
    .then((hashBuffer) =>
      Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );

  const iPaymuResponse = await fetch(IPAYMU_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      signature: signature,
      va: IPAYMU_VA,
      timestamp: Date.now().toString(),
    },
    body: body,
  });

  const responseText = await iPaymuResponse.text();
  let iPaymuData: IpaymuResponse;

  try {
    iPaymuData = JSON.parse(responseText);
  } catch (_parseError) {
    console.error("Failed to parse iPaymu response:", responseText);
    throw new Error(`Invalid response from iPaymu: ${responseText}`);
  }

  if (iPaymuData.Status !== 200) {
    throw new Error(
      `iPaymu API error: ${iPaymuData.Message || "Unknown error"}`
    );
  }

  if (!iPaymuData.Data) {
    throw new Error("No data returned from iPaymu API");
  }

  return iPaymuData.Data;
}

// Helper function to check payment status
export async function checkIpaymuPaymentStatus(
  sessionId: string
): Promise<IpaymuResponse> {
  const body = `account=${IPAYMU_VA}&id=${sessionId}`;
  const stringToSign = `POST:https://sandbox.ipaymu.com/api/v2/history:${IPAYMU_VA}:${IPAYMU_API_KEY}:${body}`;

  const signature = await crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(stringToSign))
    .then((hashBuffer) =>
      Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );

  const response = await fetch("https://sandbox.ipaymu.com/api/v2/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      signature: signature,
      va: IPAYMU_VA,
      timestamp: Date.now().toString(),
    },
    body: body,
  });

  const responseText = await response.text();

  try {
    return JSON.parse(responseText) as IpaymuResponse;
  } catch (_parseError) {
    console.error("Failed to parse payment status response:", responseText);
    throw new Error(`Invalid response from iPaymu: ${responseText}`);
  }
}
