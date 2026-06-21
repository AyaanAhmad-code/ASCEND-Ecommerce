import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useAuth } from "../../auth/hook/useAuth";

const tokens = {
  surface: "#fbf9f6",
  surfaceLow: "#f5f3f0",
  surfaceHighest: "#e4e2df",
  onSurface: "#1b1c1a",
  muted: "#4d463a",
  outline: "#7f7668",
  primaryDark: "#745a27",
  secondary: "#7A6E63",
};

const CheckoutAddress = () => {
  const navigate = useNavigate();
  const { handleUpdateAddress } = useAuth();
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart);
  const [form, setForm] = useState({
    fullName: user?.fullname || "",
    email: user?.email || "",
    contact: user?.contact || "",
    line1: user?.address?.line1 || "",
    line2: user?.address?.line2 || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    postalCode: user?.address?.postalCode || "",
    country: user?.address?.country || "India",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      fullName: user.fullname || prev.fullName,
      email: user.email || prev.email,
      contact: user.contact || prev.contact,
      line1: user.address?.line1 || prev.line1,
      line2: user.address?.line2 || prev.line2,
      city: user.address?.city || prev.city,
      state: user.address?.state || prev.state,
      postalCode: user.address?.postalCode || prev.postalCode,
      country: user.address?.country || prev.country || "India",
    }));
  }, [user]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateForm = () => {
    const requiredFields = ["fullName", "line1", "city", "state", "postalCode", "country"];
    const missing = requiredFields.filter((field) => !form[field]?.trim());

    if (missing.length) {
      setError("Please fill all required address fields.");
      return false;
    }
    return true;
  };

  const saveAddress = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await handleUpdateAddress({
        fullName: form.fullName,
        email: form.email,
        contact: form.contact,
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
      });
      setSuccessMsg("Address saved successfully!");
      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOnly = async (e) => {
    e.preventDefault();
    await saveAddress();
  };

  const handleContinueToPayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await handleUpdateAddress({
        fullName: form.fullName,
        email: form.email,
        contact: form.contact,
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
      });
      navigate("/cart?checkout=payment");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save address. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: tokens.surface, fontFamily: "'Inter', sans-serif" }}
      >
        <main className="max-w-4xl mx-auto px-6 md:px-10 lg:px-16 pt-16">
          <div className="space-y-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: tokens.muted }}>
                Shipping Address
              </p>
              <h1
                className="font-light leading-tight mt-3"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem, 5vw, 3.2rem)", color: tokens.onSurface }}
              >
                Add your delivery address
              </h1>
              <p className="mt-4 text-sm" style={{ color: tokens.muted }}>
                We need your shipping information before we can process payment.
              </p>
            </div>

            <form
              className="grid gap-5"
              style={{ backgroundColor: tokens.surfaceLow, padding: "2rem", borderRadius: "1rem" }}
            >
              {error && (
                <div className="px-4 py-3 rounded" style={{ backgroundColor: "#fde8e2", color: "#91211f" }}>
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="px-4 py-3 rounded" style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}>
                  ✓ {successMsg}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="space-y-2 text-sm text-[#333]">
                  <span>Full name</span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="w-full border border-[#c6c2bd] rounded px-4 py-3"
                    placeholder="John Doe"
                  />
                </label>

                <label className="space-y-2 text-sm text-[#333]">
                  <span>Email address</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full border border-[#c6c2bd] rounded px-4 py-3"
                    placeholder="john@example.com"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="space-y-2 text-sm text-[#333]">
                  <span>Phone</span>
                  <input
                    type="tel"
                    value={form.contact}
                    onChange={(e) => updateField("contact", e.target.value)}
                    className="w-full border border-[#c6c2bd] rounded px-4 py-3"
                    placeholder="+91 98765 43210"
                  />
                </label>
                <label className="space-y-2 text-sm text-[#333]">
                  <span>Country</span>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="w-full border border-[#c6c2bd] rounded px-4 py-3"
                    placeholder="India"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm text-[#333]">
                <span>Address line 1</span>
                <input
                  type="text"
                  value={form.line1}
                  onChange={(e) => updateField("line1", e.target.value)}
                  className="w-full border border-[#c6c2bd] rounded px-4 py-3"
                  placeholder="Street address, P.O. box"
                />
              </label>

              <label className="space-y-2 text-sm text-[#333]">
                <span>Address line 2</span>
                <input
                  type="text"
                  value={form.line2}
                  onChange={(e) => updateField("line2", e.target.value)}
                  className="w-full border border-[#c6c2bd] rounded px-4 py-3"
                  placeholder="Apartment, suite, unit, building, floor"
                />
              </label>

              <div className="grid sm:grid-cols-3 gap-4">
                <label className="space-y-2 text-sm text-[#333]">
                  <span>City</span>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full border border-[#c6c2bd] rounded px-4 py-3"
                    placeholder="City"
                  />
                </label>
                <label className="space-y-2 text-sm text-[#333]">
                  <span>State</span>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="w-full border border-[#c6c2bd] rounded px-4 py-3"
                    placeholder="State"
                  />
                </label>
                <label className="space-y-2 text-sm text-[#333]">
                  <span>Postal code</span>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    className="w-full border border-[#c6c2bd] rounded px-4 py-3"
                    placeholder="Postal code"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
                  <button
                    type="button"
                    onClick={handleSaveOnly}
                    disabled={loading}
                    className="w-full sm:w-auto py-4 px-8 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 disabled:opacity-60"
                    style={{
                      backgroundColor: tokens.secondary,
                      color: "#fff",
                      border: `1px solid ${tokens.secondary}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.currentTarget.style.opacity = "0.9";
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.currentTarget.style.opacity = "1";
                    }}
                  >
                    {loading ? "Saving..." : "Save Address"}
                  </button>

                  {cart.items && cart.items.length > 0 && (
                    <button
                      type="button"
                      onClick={handleContinueToPayment}
                      disabled={loading}
                      className="w-full sm:w-auto py-4 px-8 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 disabled:opacity-60"
                      style={{ backgroundColor: tokens.primaryDark, color: "#fff" }}
                      onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.opacity = "0.9";
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) e.currentTarget.style.opacity = "1";
                      }}
                    >
                      {loading ? "Processing..." : "Continue to Payment"}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="w-full sm:w-auto py-4 px-8 text-[11px] uppercase tracking-[0.25em] font-medium"
                  style={{ backgroundColor: "transparent", border: `1px solid ${tokens.outline}`, color: tokens.onSurface }}
                  onClick={() => navigate("/cart")}
                  disabled={loading}
                >
                  Back to Cart
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default CheckoutAddress;
