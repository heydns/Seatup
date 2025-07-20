import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Event {
  ID_event: number;
  Event: string | null;
  Date: string | null;
  Organization: string | null;
  Sport: string | null;
  Competition: string | null;
  Location: string | null;
  Adress: string | null;
  Access: string | null;
  Link: string | null;
  Original_Price: string | null;
  Our_Price: string | null;
}

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Event")
        .select("*")
        .order("ID_event", { ascending: true });

      if (error) {
        throw error;
      }

      return data as Event[];
    },
  });
};