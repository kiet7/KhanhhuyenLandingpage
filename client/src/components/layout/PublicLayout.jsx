import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";
import { getProfile } from "../../api/profile";

export default function PublicLayout() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet context={{ profile }} />
      </main>
      <Footer profile={profile} />
      <FloatingContact profile={profile} />
    </div>
  );
}
