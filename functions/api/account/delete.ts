interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return errorResponse("Account deletion is not configured yet. Please contact support.", 503);
  }

  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return errorResponse("Please sign in again before deleting your account.", 401);

  let body: { confirmation?: unknown };
  try {
    body = await request.json() as { confirmation?: unknown };
  } catch {
    return errorResponse("Invalid request.", 400);
  }
  if (body.confirmation !== "DELETE") return errorResponse("Deletion confirmation is required.", 400);

  const baseUrl = env.SUPABASE_URL.replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = { apikey: serviceKey, Authorization: "Bearer " + serviceKey };

  try {
    // Verify the caller's access token with Supabase Auth; never trust a user id from the browser.
    const identityResponse = await fetch(baseUrl + "/auth/v1/user", {
      headers: { apikey: serviceKey, Authorization: "Bearer " + token }
    });
    if (!identityResponse.ok) return errorResponse("Your session is invalid or has expired. Please sign in again.", 401);
    const user = await identityResponse.json() as { id?: string };
    if (!user.id) return errorResponse("Could not verify your account.", 401);

    // Remove the user's avatar objects through the Storage API before deleting the Auth user.
    const listResponse = await fetch(baseUrl + "/storage/v1/object/list/baybble-avatars", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: user.id, limit: 100, offset: 0, sortBy: { column: "name", order: "asc" } })
    });
    if (!listResponse.ok) return errorResponse("Could not prepare your profile files for deletion. Please try again.", 502);
    const files = await listResponse.json() as Array<{ name?: string }>;
    const paths = (Array.isArray(files) ? files : [])
      .filter((file) => typeof file.name === "string")
      .map((file) => user.id + "/" + file.name);

    if (paths.length) {
      const removeResponse = await fetch(baseUrl + "/storage/v1/object/baybble-avatars", {
        method: "DELETE",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: paths })
      });
      if (!removeResponse.ok) return errorResponse("Could not remove your profile picture. Your account has not been deleted; please try again.", 502);
    }

    const deleteResponse = await fetch(baseUrl + "/auth/v1/admin/users/" + encodeURIComponent(user.id), {
      method: "DELETE",
      headers
    });
    if (!deleteResponse.ok) {
      const detail = await deleteResponse.text();
      console.error("Baybble account deletion failed:", deleteResponse.status, detail.slice(0, 500));
      return errorResponse("Baybble could not delete your account right now. Please try again.", 502);
    }

    // Conversation and message rows are removed by their user foreign-key cascade.
    return Response.json({ success: true }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("Baybble account deletion error:", error);
    return errorResponse("Baybble could not delete your account right now. Please try again.", 502);
  }
};
