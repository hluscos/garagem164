"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

const consentKey = "garagem164-cookie-consent";
const measurementId = "G-CMRD6GMSMB";

export default function Analytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const updateAnalytics = () => {
      setEnabled(window.localStorage.getItem(consentKey) === "accepted");
    };

    const initialCheck = window.setTimeout(updateAnalytics, 0);
    window.addEventListener("cookie-consent-changed", updateAnalytics);

    return () => {
      window.clearTimeout(initialCheck);
      window.removeEventListener("cookie-consent-changed", updateAnalytics);
    };
  }, []);

  return enabled ? <GoogleAnalytics gaId={measurementId} /> : null;
}
