import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../hooks/useAPI";
import type { Course } from "../ListCourses";
import { useNavigate } from "react-router-dom";
import { AdminCourseCard } from "../../components/admin/AdminCourseCard";

export default function Dashboard() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { getAllCourses, deleteCourse } = useApi();
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async () => {
    if (!deleteCourseId) return;
    try {
      await deleteCourse(deleteCourseId);
      setDeleteCourseId(null);
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getAllCourses();
      setCourses(response.data);
    } catch (error) {
      setCourses([]);
      console.error("Error fetching courses:", error);
    }
  };
  
  const totalPages = Math.ceil(courses.length / pageSize);
  const pagedCourses = useMemo(() => {
    const start = (page - 1) * pageSize;
    return courses.slice(start, start + pageSize);
  }, [courses, page]);

  return (
    // CHỪA CHỖ CHO SIDEBAR: ml-60 = 15rem (khớp w-60 của Sidebar)
    <div className="ml-10 px-4 md:px-6 lg:px-8 py-6 max-w-[1600px]">
      {/* Header: title + actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          {t("title", { ns: "adminDashboard", defaultValue: "Courses" })}
        </h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/course/create")}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
          >
            {t("add_course", { ns: "adminDashboard", defaultValue: "Add Course" })}
          </button>
          <button
            type="button"
            aria-label={t("more", { ns: "adminDashboard", defaultValue: "More" })}
            className="px-2 py-2 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            ⋯
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-600">
          {courses.length} {t("results", { ns: "dashboard" })}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {pagedCourses.map((c) => (
          <AdminCourseCard key={c._id} course={c} onDelete={(id) => setDeleteCourseId(id)} />
        ))}
      </div>

      {/* ---------- Pagination ---------- */}
      <div className="mt-8 flex justify-center">
        <nav
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-sm divide-x divide-slate-200"
          aria-label="Pagination"
        >
          <button
            className="px-4 py-2 text-slate-600 disabled:text-slate-300 hover:bg-slate-50 cursor-pointer"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={
                "px-4 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer " +
                (p === page ? "bg-slate-700 text-white hover:bg-slate-700" : "")
              }
            >
              {p}
            </button>
          ))}
          <button
            className="px-4 py-2 text-slate-600 disabled:text-slate-300 hover:bg-slate-50 cursor-pointer"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            ›
          </button>
        </nav>
      </div>

      {/* Modal confirm delete */}
      {deleteCourseId && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 border border-2">
            <h2 className="text-lg font-semibold mb-4">
              {t("confirm_delete_title", { ns: "adminDashboard" })}
            </h2>
            <p className="mb-6">
              {t("confirm_delete_message", { ns: "adminDashboard" })}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDeleteCourseId(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition cursor-pointer"
              >
                {t("cancel", { ns: "adminDashboard" })}
              </button>
              <button
                type="button"
                onClick={handleDeleteCourse}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition ml-2 cursor-pointer"
              >
                {t("confirm", { ns: "adminDashboard" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
