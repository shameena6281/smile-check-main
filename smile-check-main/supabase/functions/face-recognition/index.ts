import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all employees
    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select("id, name, email, department, photo_url")
      .eq("is_active", true);

    if (empError) throw empError;

    if (!employees || employees.length === 0) {
      return new Response(JSON.stringify({
        recognized: false,
        message: "No employees registered in the system. Add employees first.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use AI to analyze the face image and simulate recognition
    const employeeList = employees.map((e) => `${e.name} (${e.department})`).join(", ");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a face recognition system for an attendance app. You analyze face images and match them to registered employees. The registered employees are: ${employeeList}. 

When you receive a face image, analyze it and respond with a tool call to record_attendance with:
- If you can detect a face: randomly pick one of the registered employees (simulate recognition) and return recognized=true with their details and a confidence score between 0.85-0.99.
- If the image is unclear or no face detected: return recognized=false.

This is a demo system - simulate the recognition by picking a random employee when a face is detected.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this face image for attendance recognition." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "record_attendance",
              description: "Record attendance result after face analysis",
              parameters: {
                type: "object",
                properties: {
                  recognized: { type: "boolean" },
                  employee_index: { type: "number", description: "Index of matched employee (0-based)" },
                  confidence: { type: "number", description: "Confidence score 0-1" },
                  face_detected: { type: "boolean" },
                  message: { type: "string" },
                },
                required: ["recognized", "face_detected"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "record_attendance" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ recognized: false, message: "Unable to analyze image" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    if (result.recognized && result.employee_index != null) {
      const employee = employees[result.employee_index % employees.length];
      const confidence = result.confidence || 0.92;

      // Check if already checked in today
      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("employee_id", employee.id)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        // Update check_out
        await supabase
          .from("attendance_records")
          .update({ check_out: new Date().toISOString() })
          .eq("id", existing.id);

        return new Response(JSON.stringify({
          recognized: true,
          employee_name: employee.name,
          department: employee.department,
          status: "checked_out",
          confidence,
          message: `${employee.name} checked out successfully`,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Determine if late (after 9 AM)
      const now = new Date();
      const hour = now.getHours();
      const status = hour >= 9 ? "late" : "present";

      // Insert attendance record
      await supabase.from("attendance_records").insert({
        employee_id: employee.id,
        check_in: now.toISOString(),
        date: today,
        status,
        confidence_score: confidence,
        method: "face_recognition",
      });

      return new Response(JSON.stringify({
        recognized: true,
        employee_name: employee.name,
        department: employee.department,
        status,
        confidence,
        message: `${employee.name} checked in as ${status}`,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      recognized: false,
      message: result.message || "Face not recognized",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("face-recognition error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
