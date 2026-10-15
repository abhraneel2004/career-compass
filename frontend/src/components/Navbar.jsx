import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { Menu, UserRound, X } from "lucide-react";
import { toast } from "react-toastify";
import { auth } from "../firebase";
import { useAuthUser } from "../hooks/useAuth";
import Logo from "./Logo";

const links = [
  { to: "/quiz", label: "Career quiz", protected: true },
  { to: "/resume-generation", label: "Resume builder", protected: true },
  { to: "/jobkey", label: "JobKey matcher", protected: true },
  { to: "/pricing", label: "Pricing" },
];

const CareerCompassNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      toast.error(`Couldn't log out: ${error.message}`);
    }
  };

  // Signed-out users go to /login instead of a page that needs an account
  const handleProtectedRoute = (e, link) => {
    if (link.protected && !user) {
      e.preventDefault();
      toast.info("Sign in to continue.");
      navigate("/login");
    }
  };

  const linkClass = ({ isActive }) =>
    `transition-colors ${isActive ? "font-semibold text-ink" : "text-ink-soft hover:text-ink"}`;

  const accountButtons = user ? (
    <>
      <button onClick={handleLogout} className="px-2 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink">
        Log out
      </button>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `btn-outline py-1.5 pl-1.5 pr-4 text-sm ${isActive ? "border-accent-bright bg-peach hover:bg-peach" : ""}`
        }
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-peach text-accent">
            <UserRound className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        My profile
      </NavLink>
    </>
  ) : (
    <>
      <Link to="/login" className="btn-outline px-4 py-2 text-sm">
        Log in
      </Link>
      <Link to="/login" state={{ mode: "signup" }} className="btn-primary px-4 py-2 text-sm">
        Sign up
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" aria-label="Career Compass home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-8 text-[15px] md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={(e) => handleProtectedRoute(e, link)} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">{accountButtons}</div>

        <button
          className="rounded-full p-2 text-ink md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-line bg-white px-4 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={(e) => handleProtectedRoute(e, link)}
                className={(state) => `rounded-lg px-2 py-2.5 ${linkClass(state)}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 flex gap-3">{accountButtons}</div>
        </div>
      )}
    </header>
  );
};

export default CareerCompassNavbar;
