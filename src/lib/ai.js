import connectDB from "./db";
import Issue from "@/models/Issue";

const CATEGORIES = [
  "Roads & Streets",
  "Water & Sewage",
  "Lighting",
  "Parks & Recreation",
  "Waste Management",
  "Safety",
  "Noise",
  "Other",
];

// Helper to calculate distance in meters between two lat/lng coordinates (Haversine formula)
export function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const R = 6371e3; // radius of Earth in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Internal helper to query the OpenAI-compatible AI API
async function queryAI(prompt, systemInstruction = "") {
  const baseURL = process.env.AI_API_BASE_URL || "https://integrate.api.nvidia.com/v1";
  const apiKey = process.env.AI_API_KEY;
  const modelName = process.env.AI_MODEL_NAME || "nvidia/nemotron-3-ultra-550b-a55b";

  if (!apiKey) {
    console.warn("AI API key (AI_API_KEY) not configured. Skipping AI query.");
    return null;
  }

  try {
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI API responded with status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    // Clean markdown code blocks if the model wraps JSON
    let cleaned = content.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.substring(7, cleaned.length - 3).trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.substring(3, cleaned.length - 3).trim();
    }

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Error communicating with AI endpoint:", err);
    return null;
  }
}

/**
 * Suggests category and severity for an issue report using the AI model.
 */
export async function getAISuggestions(title, description) {
  const prompt = `Classify this civic issue report.
Title: "${title}"
Description: "${description}"

Valid Categories: ${JSON.stringify(CATEGORIES)}
Valid Severities: ["Low", "Medium", "High"]

Return a JSON object exactly formatted like this:
{
  "category": "one of the valid categories matching this issue",
  "severity": "one of the valid severities based on the hazard level",
  "reason": "a 1-sentence explanation of the classification"
}`;

  const defaultVal = { category: "Other", severity: "Medium", reason: "AI not configured." };
  const aiResult = await queryAI(prompt, "You are a professional city helper AI agent. Output ONLY valid JSON.");
  return aiResult || defaultVal;
}

/**
 * Checks if the reported issue is a duplicate of a nearby issue within 100 meters.
 */
export async function checkDuplicateIssue(newTitle, newDescription, lat, lng) {
  if (lat == null || lng == null) return { isDuplicate: false, reason: "No location coordinates provided." };

  await connectDB();
  // Fetch active (unresolved) issues
  const openIssues = await Issue.find({
    status: { $in: ["Submitted", "Acknowledged", "Assigned", "In Progress"] },
    "location.lat": { $ne: null },
    "location.lng": { $ne: null },
  }).lean();

  // Find issues within 100 meters
  const nearbyIssues = openIssues.filter((issue) => {
    const dist = getDistanceInMeters(lat, lng, issue.location.lat, issue.location.lng);
    return dist <= 100;
  });

  if (nearbyIssues.length === 0) {
    return { isDuplicate: false, reason: "No active reports nearby." };
  }

  // Build duplicate comparison prompt
  const comparisons = nearbyIssues.map((issue) => ({
    id: issue._id.toString(),
    title: issue.title,
    description: issue.description,
    category: issue.category,
  }));

  const prompt = `Analyze if a newly reported issue is a duplicate of any existing nearby reports.
New Issue Title: "${newTitle}"
New Issue Description: "${newDescription}"

Existing Nearby Reports:
${JSON.stringify(comparisons, null, 2)}

Return a JSON object indicating if there is a match (duplicate probability > 80%):
{
  "isDuplicate": true or false,
  "duplicateIssueId": "the string ID of the matching issue, or null if isDuplicate is false",
  "reason": "a brief 1-sentence explanation of why it is or isn't a duplicate"
}`;

  const defaultVal = { isDuplicate: false, reason: "Duplicate detection skipped." };
  const aiResult = await queryAI(prompt, "You are a database de-duplication expert. Output ONLY valid JSON.");
  return aiResult || defaultVal;
}
