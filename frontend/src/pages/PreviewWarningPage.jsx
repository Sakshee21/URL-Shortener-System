import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getContinueRedirectUrl, getUrlPreview } from "../services/api";

export default function PreviewWarningPage() {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreview = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getUrlPreview(shortCode);
        setPreview(response);
      } catch (err) {
        setError(err.message || "Unable to load link preview");
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [shortCode]);

  const handleContinue = () => {
    window.location.href = preview?.continue_url || getContinueRedirectUrl(shortCode);
  };

  const riskBadgeClass =
    preview?.risk_level === "high"
      ? "bg-red-100 text-red-700"
      : preview?.risk_level === "suspicious"
        ? "bg-amber-100 text-amber-700"
        : "bg-green-100 text-green-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-slate-600 hover:text-slate-900"
        >
          Go back
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Security Check</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review this destination before you continue.
          </p>

          {isLoading && (
            <div className="mt-6 animate-pulse space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="h-4 w-40 rounded-full bg-slate-200" />
              <div className="h-3 w-3/4 rounded-full bg-slate-200" />
              <div className="h-24 rounded-xl bg-slate-200" />
            </div>
          )}

          {!isLoading && error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!isLoading && preview && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${riskBadgeClass}`}>
                  {preview.risk_level}
                </span>
                <span className="text-sm text-slate-600">Risk score: {preview.risk_score}</span>
                <span className="text-sm text-slate-600">Domain: {preview.domain}</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Destination URL</p>
                <p className="mt-1 break-all text-sm text-slate-800">{preview.original_url}</p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  {preview.favicon_url ? (
                    <img src={preview.favicon_url} alt="favicon" className="h-8 w-8 rounded" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-slate-200" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">
                      {preview.page_title || "No page title available"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {preview.page_description || "No description metadata available."}
                    </p>
                  </div>
                </div>
                {preview.preview_image_url && (
                  <img
                    src={preview.preview_image_url}
                    alt="preview"
                    className="mt-4 max-h-56 w-full rounded-lg object-cover"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleContinue}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Continue to site
                </button>
                <Link
                  to="/"
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Go back
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
