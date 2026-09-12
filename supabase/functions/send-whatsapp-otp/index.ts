import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: insertError } = await supabase.from("otp_codes").insert({
      phone,
      code,
      expires_at: expiresAt,
      verified: false,
    });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to send OTP via WhatsApp using CallMeBot API (free WhatsApp messaging)
    // The user needs to get an API key from https://www.callmebot.com/blog/free-api-whatsapp-messages/
    const whatsappApiKey = Deno.env.get("WHATSAPP_API_KEY");
    const whatsappApiUrl = Deno.env.get("WHATSAPP_API_URL");

    let sentViaWhatsApp = false;

    if (whatsappApiKey && whatsappApiUrl) {
      try {
        const message = `Your AURA AI verification code is: ${code}. This code expires in 10 minutes. Do not share it with anyone.`;
        const sendUrl = `${whatsappApiUrl}?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}&apikey=${whatsappApiKey}`;
        await fetch(sendUrl);
        sentViaWhatsApp = true;
      } catch (sendErr) {
        // If WhatsApp sending fails, the OTP is still stored in DB
      }
    }

    // Also try Twilio WhatsApp if configured
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioWhatsAppFrom = Deno.env.get("TWILIO_WHATSAPP_FROM");

    if (!sentViaWhatsApp && twilioAccountSid && twilioAuthToken && twilioWhatsAppFrom) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const body = new URLSearchParams();
        body.append("From", `whatsapp:${twilioWhatsAppFrom}`);
        body.append("To", `whatsapp:${phone}`);
        body.append("Body", `Your AURA AI verification code is: ${code}. This code expires in 10 minutes.`);

        await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });
        sentViaWhatsApp = true;
      } catch (sendErr) {
        // Fallback - OTP still stored in DB
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentViaWhatsApp,
        message: sentViaWhatsApp
          ? "OTP sent to your WhatsApp"
          : "OTP generated. Configure WhatsApp API key to send via WhatsApp.",
        code: sentViaWhatsApp ? undefined : code,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
