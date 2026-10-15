import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Download, LoaderCircle } from "lucide-react";
import { db } from "../../firebase";
import { downloadReportPdf } from "../../lib/reportPdf";

// TEMPORARY: lets every signed-in user download the report without buying it.
// Set back to false to require isPremium again.
const BYPASS_PAYWALL = true;

const DownloadReportButton = ({ user, entry, name, className = "btn-primary px-6 py-3" }) => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    try {
      if (!BYPASS_PAYWALL) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (!userSnap.exists() || !userSnap.data().isPremium) {
          toast.info("Unlock your report to download the PDF.");
          navigate("/pricing");
          return;
        }
      }
      await downloadReportPdf(entry.report, { name, createdAt: entry.createdAt });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Couldn't create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={handleDownload} disabled={busy} className={`${className} disabled:opacity-70`}>
      {busy ? (
        <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      ) : (
        <Download className="h-4 w-4" aria-hidden="true" />
      )}
      {busy ? "Preparing PDF..." : "Download PDF"}
    </button>
  );
};

export default DownloadReportButton;
