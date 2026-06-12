"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Teste() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log("SESSION:", data.session);
    });
  }, []);

  return <div>Teste</div>;
}