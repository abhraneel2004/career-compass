import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../firebase";

export function useAuthUser() {
  const [user, setUser] = useState(auth.currentUser);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  return user;
}

// Like useAuthUser, but also says when Firebase has finished restoring the session
export function useAuthState() {
  const [state, setState] = useState({ user: auth.currentUser, ready: false });
  useEffect(() => onAuthStateChanged(auth, (user) => setState({ user, ready: true })), []);
  return state;
}

// Opens a page that needs an account, or sends signed-out users to /login
export function useGoProtected() {
  const user = useAuthUser();
  const navigate = useNavigate();

  return (path) => {
    if (user) {
      navigate(path);
    } else {
      toast.info("Sign in to continue.");
      navigate("/login");
    }
  };
}
