import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicLayout from "./components/layout/PublicLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import NotFound from "./pages/NotFound";

import AdminLayout from "./admin/components/AdminLayout";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import ManageProfile from "./admin/pages/ManageProfile";
import ManageCourses from "./admin/pages/ManageCourses";
import ContactSubmissions from "./admin/pages/ContactSubmissions";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/gioi-thieu" element={<About />} />
            <Route path="/khoa-hoc" element={<Courses />} />
            <Route path="/khoa-hoc/:slug" element={<CourseDetail />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="thong-tin" element={<ManageProfile />} />
            <Route path="khoa-hoc" element={<ManageCourses />} />
            <Route path="lien-he" element={<ContactSubmissions />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
