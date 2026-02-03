import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, data } = await req.json();

    switch (type) {
      case "new_song": {
        // Notify all followers when an artist publishes a new song
        const { artist_id, song_id, song_title, artist_name } = data;

        // Get all followers of this artist
        const { data: followers, error: followersError } = await supabase
          .from("follows")
          .select("follower_id, follower:profiles!follows_follower_id_fkey(user_id)")
          .eq("artist_id", artist_id);

        if (followersError) {
          throw followersError;
        }

        // Get notification preferences and create notifications
        for (const follower of followers || []) {
          const userId = (follower.follower as any)?.user_id;
          if (!userId) continue;

          // Check user preferences
          const { data: prefs } = await supabase
            .from("notification_preferences")
            .select("new_release")
            .eq("user_id", userId)
            .single();

          if (prefs?.new_release !== false) {
            await supabase.from("notifications").insert({
              user_id: userId,
              type: "new_release",
              title: "New Release",
              message: `${artist_name} just released "${song_title}"`,
              link: `/artist/${artist_id}`,
            });
          }
        }
        break;
      }

      case "new_follower": {
        // Notify artist when someone follows them
        const { artist_id, follower_name } = data;

        // Get the artist's user_id
        const { data: artist } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("id", artist_id)
          .single();

        if (!artist?.user_id) break;

        // Check preferences
        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("new_follower")
          .eq("user_id", artist.user_id)
          .single();

        if (prefs?.new_follower !== false) {
          await supabase.from("notifications").insert({
            user_id: artist.user_id,
            type: "new_follower",
            title: "New Follower",
            message: `${follower_name} started following you`,
            link: "/dashboard",
          });
        }
        break;
      }

      case "milestone": {
        // Notify artist when they hit stream milestones
        const { artist_id, song_title, plays } = data;

        // Get the artist's user_id
        const { data: artist } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("id", artist_id)
          .single();

        if (!artist?.user_id) break;

        // Check preferences
        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("milestones")
          .eq("user_id", artist.user_id)
          .single();

        if (prefs?.milestones !== false) {
          const milestoneText = plays >= 1000000 ? `${plays / 1000000}M` : plays >= 1000 ? `${plays / 1000}K` : plays;
          
          await supabase.from("notifications").insert({
            user_id: artist.user_id,
            type: "milestone",
            title: "Milestone Reached! 🎉",
            message: `"${song_title}" just hit ${milestoneText} plays!`,
            link: "/dashboard",
          });
        }
        break;
      }

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating notification:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
