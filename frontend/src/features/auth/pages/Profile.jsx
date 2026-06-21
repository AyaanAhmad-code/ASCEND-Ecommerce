import React from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

const tokens = {
  surface: "#fbf9f6",
  surfaceLow: "#f5f3f0",
  onSurface: "#1b1c1a",
  muted: "#4d463a",
  outline: "#7f7668",
  primaryDark: "#745a27",
};

const Profile = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

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
                Account
              </p>
              <h1
                className="font-light leading-tight mt-3"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem, 5vw, 3.2rem)", color: tokens.onSurface }}
              >
                Edit profile details
              </h1>
            </div>

            <div className="grid gap-5" style={{ backgroundColor: tokens.surfaceLow, padding: "2rem", borderRadius: "1rem" }}>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium uppercase tracking-[0.18em]" style={{ color: tokens.secondary }}>
                    Full name
                  </p>
                  <p style={{ color: tokens.onSurface }}>{user?.fullname || "—"}</p>
                </div>
                <div>
                  <p className="font-medium uppercase tracking-[0.18em]" style={{ color: tokens.secondary }}>
                    Email
                  </p>
                  <p style={{ color: tokens.onSurface }}>{user?.email || "—"}</p>
                </div>
                <div>
                  <p className="font-medium uppercase tracking-[0.18em]" style={{ color: tokens.secondary }}>
                    Phone
                  </p>
                  <p style={{ color: tokens.onSurface }}>{user?.contact || "—"}</p>
                </div>
                <button
                  type="button"
                  className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300"
                  style={{ backgroundColor: tokens.primaryDark, color: "#fff" }}
                  onClick={() => navigate("/checkout/address")}
                >
                  Edit address
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;
