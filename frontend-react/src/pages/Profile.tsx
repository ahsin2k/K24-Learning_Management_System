import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/layout/Footer';
import { useApi } from '../hooks/useAPI';
import { beFileUrl, urlToFile } from '../utils/base.util';
import toast from 'react-hot-toast';
import type { Course } from './ListCourses';
import { Stars, type CourseReview } from './DetailCourse';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { t } = useTranslation('profile');
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'reviews'>('profile');
  const { getProfile, updateProfile } = useApi();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    description: "",
    website: "",
    linkedIn: "",
    youtube: "",
    facebook: "",
    avatar: null as (File | null),
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const { getTrendingCoursesByLimit, getMyReviews } = useApi();

  const [pageCourse, setPageCourse] = useState(1);
  const [pageReview, setPageReview] = useState(1);
  const pageSize = 9;
  const pageReviewSize = 3;
  const totalCoursePages = Math.ceil(courses.length / pageSize);
  const totalReviewPages = Math.ceil(reviews.length / pageReviewSize);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchCourses();
    fetchReviews();
  }, []);
  
  const fetchCourses = async () => {
    try {
      const response = await getTrendingCoursesByLimit(10);
      setCourses(response.data);
    } catch (error) {
      setCourses([]);
      console.error("Error fetching courses:", error);
    }
  };
  
  const fetchReviews = async () => {
    try {
      const response = await getMyReviews();
      setReviews(response.data);
    } catch (error) {
      setReviews([]);
      console.error("Error fetching reviews:", error);
    }
  };

  const pagedCourses = useMemo(() => {
    const start = (pageCourse - 1) * pageSize;
    return courses.slice(start, start + pageSize);
  }, [courses, pageCourse]);

  const pagedReviews = useMemo(() => {
    const start = (pageReview - 1) * pageReviewSize;
    return reviews.slice(start, start + pageReviewSize);
  }, [reviews, pageReview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // dùng optional chaining
    if (!file) return

    setFormData(prev => ({ ...prev, avatar: file }));
  };

  const loadFormData = async (user: any) => {
    const avatarFile = user?.avatar ? await urlToFile(beFileUrl(user?.avatar)) : null;
  
    setFormData(prev => ({
      ...prev,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
      description: user?.description || '',
      website: user?.website || '',
      linkedIn: user?.linkedIn || '',
      youtube: user?.youtube || '',
      facebook: user?.facebook || '',
      avatar: avatarFile,
    }));
  }

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      loadFormData(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Tạo FormData
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value instanceof File) {
        payload.append(key, value); // file
      } else if (typeof value === "string") {
        payload.append(key, value); // string
      }
    });

    try {
      const response = await updateProfile(payload);
      await loadFormData(response.data);
      toast.success(t("messages.updateSuccess"));
    } catch (error) {
      toast.error(t("messages.updateError"));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleSubmit} >
            <div className="p-8 w-full">
              <h2 className="text-2xl font-bold mb-6">{t("profileinfo", {ns: 'profile'})}</h2>
              <div className="grid grid-cols-2 gap-6 bg-white rounded-2xl shadow p-6">
                {/* First Name */}
                <div>
                  <label className="block text-gray-600 mb-1">{t("firstname", {ns: 'profile'})}</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder={t("firstname", { ns: 'profile' })}
                    className="w-full border p-2 rounded"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-gray-600 mb-1">{t("lastName", {ns: 'profile'})} </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={t("lastName", { ns: 'profile' })}
                    className="w-full border p-2 rounded"
                  />
                </div>

                {/* User name */}
                <div className="col-span-2">
                  <label className="block text-gray-600 mb-1">{t("headline", {ns: 'profile'})} </label>
                  <input
                    name="username"
                    value={formData.username}
                    disabled
                    placeholder={t("headline", { ns: 'profile' })}
                    className="w-full border p-2 rounded disabled:bg-gray-100"
                  />
                </div>

                {/* Email */}
                <div className="col-span-2">
                  <label className="block text-gray-600 mb-1">{t("email", {ns: 'profile'})} </label>
                  <input
                    name="email"
                    disabled
                    value={formData.email}
                    placeholder={t("email", { ns: 'profile' })}
                    className="w-full border p-2 rounded disabled:bg-gray-100"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-gray-600 mb-1">{t("description", {ns: 'profile'})}</label>
                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t("description", { ns: 'profile' })}
                    className="w-full border p-2 rounded"
                  />
                </div>

                {/* Image Preview */}
                <div className="col-span-2">
                  <label className="block text-gray-600 mb-2">{t("imagePreview", {ns: 'profile'})}</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex items-center justify-center bg-gray-50 mb-3">
                    {renderAvatar()}
                  </div>
                  
                  <input onChange={handleChangeFile} type="file" accept="image/*" className="hidden" id="image-upload" />
                  <label htmlFor="image-upload" className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition">
                    {t("uploadImage", {ns: 'profile'})}
                  </label>
                </div>

                {/* Links */}
                <div className="col-span-2 space-y-3">
                  <label className="block text-gray-600">{t('links')}</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-20">Website:</span>
                    <input
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-20">LinkedIn:</span>
                    <input
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/johndoe"
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-20">YouTube:</span>
                    <input
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleChange}
                      placeholder="https://youtube.com/@johndoe"
                      className="flex-1 border p-2 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-20">Facebook:</span>
                    <input
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/johndoe"
                      className="flex-1 border p-2 rounded"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="col-span-2 flex justify-end mt-4">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition cursor-pointer">
                    {t("saveProfile", {ns: 'profile'})}
                  </button>
                </div>
              </div>
            </div>
          </form>
        );

      case 'courses':
        return (
          <div className="p-8 w-full">
            <h2 className="text-2xl font-bold mb-6">{t('myCourses')}</h2>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-3 gap-6">
              {pagedCourses.map((course, index) => (
                <div key={course._id} onClick={() => {window.scrollTo(0, 0); navigate(`/courses/${course._id}`)}} className="bg-white rounded-2xl shadow hover:shadow-lg cursor-pointer transition p-4">
                  <img
                    src={`https://picsum.photos/seed/course${index}/400/200`}
                    alt={course.title}
                    className="rounded-xl mb-3 w-full h-32 object-cover"
                  />
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <p className="text-sm text-gray-500">{"Ronald Richards"}</p>
                  <p className="text-yellow-500 text-sm mt-1">
                    {Array(Math.round(course.avgRating)).fill(0).map(() => '★').join('')} ({course.totalRating} {t('ratings')})
                  </p>
                </div>
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
                  onClick={() => setPageCourse(Math.max(1, pageCourse - 1))}
                  disabled={pageCourse === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalCoursePages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPageCourse(p)}
                    className={
                      "px-4 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer " +
                      (p === pageCourse ? "bg-slate-700 text-white hover:bg-slate-700" : "")
                    }
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="px-4 py-2 text-slate-600 disabled:text-slate-300 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setPageCourse(Math.min(totalCoursePages, pageCourse + 1))}
                  disabled={pageCourse === totalCoursePages}
                >
                  ›
                </button>
              </nav>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="p-8 w-full">
            <h2 className="text-2xl font-bold mb-6">{t('myReviews')}</h2>
            <div className="space-y-6">
              {pagedReviews.map((review, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
                  <p className="font-semibold mb-1">
                    {t('courseName', { ns: "course" })}: <span onClick={() => {window.scrollTo(0, 0); navigate(`/courses/${review.courseId._id}`)}} className='hover:text-blue-500 cursor-pointer'>{review.courseId.title}</span>
                  </p>
                  <p className="text-yellow-500">{Stars({ value: review.rating })}</p>
                  <p className="text-gray-600 mt-2">{review.content}</p>
                </div>
              ))}
            </div>

            {/* ---------- Pagination ---------- */}
            <div className="mt-8 flex justify-center">
              <nav
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-sm divide-x divide-slate-200"
                aria-label="Pagination"
              >
                {/* Previous */}
                <button
                  className="px-4 py-2 text-slate-600 disabled:text-slate-300 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setPageReview(Math.max(1, pageReview - 1))}
                  disabled={pageReview === 1}
                >
                  ‹
                </button>

                {(() => {
                  const pages: (number | string)[] = [];
                  const start = Math.max(1, pageReview - 2);
                  const end = Math.min(totalReviewPages, pageReview + 2);

                  // Trang đầu
                  if (start > 1) {
                    pages.push(1);
                    if (start > 2) pages.push("...");
                  }

                  // Các trang giữa
                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }

                  // Trang cuối
                  if (end < totalReviewPages) {
                    if (end < totalReviewPages - 1) pages.push("...");
                    pages.push(totalReviewPages);
                  }

                  return pages.map((p, idx) =>
                    typeof p === "number" ? (
                      <button
                        key={idx}
                        onClick={() => setPageReview(p)}
                        className={
                          "px-4 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer " +
                          (p === pageReview ? "bg-slate-700 text-white hover:bg-slate-700" : "")
                        }
                      >
                        {p}
                      </button>
                    ) : (
                      <span
                        key={idx}
                        className="px-3 py-2 text-slate-400 select-none"
                      >
                        {p}
                      </span>
                    )
                  );
                })()}

                {/* Next */}
                <button
                  className="px-4 py-2 text-slate-600 disabled:text-slate-300 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setPageReview(Math.min(totalReviewPages, pageReview + 1))}
                  disabled={pageReview === totalReviewPages}
                >
                  ›
                </button>
              </nav>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderAvatar = () => {
    return formData.avatar ? (
      <img
        src={URL.createObjectURL(formData.avatar)}
        alt="preview"
        className="w-16 h-16 rounded-full object-cover"
      />
    ) : (
      <div
        className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium cursor-pointer"
      >
        {formData?.username?.charAt(0)?.toUpperCase() || "B"}
      </div>);
  }

  return (
    <>
      {/* Wrapper: min-h-screen */}
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Main */}
        <main className="flex-1 pb-4 flex h-full">
          {/* Sidebar */}
          <aside className="w-72 bg-white border-r shadow-sm p-6">
            <div className="flex flex-col items-center mb-8">
              {renderAvatar()}
              <p className="font-semibold text-lg">{formData?.username || "N/A"} </p>
              <button className="mt-2 text-blue-600 text-sm">{t('shareProfile')}</button>
            </div>

            <nav className="space-y-2">
              <button
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                {t('profile')}
              </button>
              <button
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'courses'
                    ? 'bg-blue-600 text-white shadow'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('courses')}
              >
                {t('myCourses')}
              </button>
              <button
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'reviews'
                    ? 'bg-blue-600 text-white shadow'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                {t('myReviews')}
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1">{renderContent()}</div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}