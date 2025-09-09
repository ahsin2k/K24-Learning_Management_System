import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { useApi } from "../hooks/useAPI";
import { beFileUrl, clsx, formatDateTime } from "../utils/base.util";
import type { Course } from "./ListCourses";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

/* ===================== Helpers ===================== */
/** Sao nguyên (không 1/2), luôn làm tròn lên */
export function Stars({ value }: { value: number }) {
  const stars = Math.round(value); // 4.5 -> 5
  return (
    <span className="text-yellow-500 text-sm select-none">
      {"★".repeat(stars)}
      {"☆".repeat(5 - stars)}
    </span>
  );
}

/** Dòng sao + số 4.x màu vàng, KHÔNG có gạch ngay sau số */
function RatingInline({
  value,
  textAfter,
}: {
  value: number;
  textAfter?: string;
}) {
  const rounded = Math.round(value * 10) / 10;
  return (
    <div className="flex items-center gap-2">
      <Stars value={rounded} />
      <span className="text-yellow-500 font-semibold text-base leading-none">
        {rounded}
      </span>
      {textAfter ? (
        <span className="text-slate-600 whitespace-nowrap">{textAfter}</span>
      ) : null}
    </div>
  );
}

type DetailCourse = Course & { countDetailReviews: { [key: string]: number } };

/* Tabs dạng button, active nền xám */
function TabsButtons({
  active,
  onChange,
  labels,
}: {
  active: string;
  onChange: (next: string) => void;
  labels: string[];
}) {
  const tabs = labels;
  return (
    <div className="flex flex-wrap gap-4">
      {tabs.map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={
              "px-5 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer " +
              (isActive
                ? "bg-slate-100 text-slate-900 border-slate-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")
            }
            type="button"
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

/* Buy Card (có đường kẻ trước phần Share) */
function BuyCard({
  t,
  course,
}: {
  t: ReturnType<typeof useTranslation>["t"];
  course: Course | null;
}) {
  return (
    <aside className="h-fit">
      <div className="border border-slate-200 rounded-2xl bg-white shadow-md p-5 w-full">
        {/* Preview image */}
        <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-4">
          <img
            src={course?.introImage ? beFileUrl(course.introImage) : `https://picsum.photos/seed/course${course?._id || "default"}/400/225`}
            alt={t("preview_alt", { ns: "course", defaultValue: "Course Preview" })}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-3 mb-4">
          <div className="text-2xl font-bold text-slate-900">${course?.price}</div>
          <div className="text-slate-400 line-through">${course?.price ? (course.price * 2).toFixed(2) : "0.00"}</div>
          <div className="text-emerald-600 font-semibold">
            {t("off_percent", { ns: "course", defaultValue: "50% Off" })}
          </div>
        </div>

        {/* Buttons */}
        <button
          className="w-full py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition cursor-pointer"
          type="button"
        >
          {t("add_to_cart", { ns: "course", defaultValue: "Add To Cart" })}
        </button>
        <button
          className="w-full mt-3 py-3 rounded-lg border border-slate-300 text-slate-800 font-medium bg-white hover:bg-slate-50 transition cursor-pointer"
          type="button"
        >
          {t("buy_now", { ns: "course", defaultValue: "Buy Now" })}
        </button>

        {/* Divider */}
        <div className="my-4 border-t border-slate-200" />

        {/* Share */}
        <div>
          <div className="text-sm text-slate-600 mb-3">
            {t("share", { ns: "course", defaultValue: "Share" })}
          </div>
          <div className="flex items-center gap-3">
            {[
              "image/icons/iconfb.png",
              "image/icons/icongithub.png",
              "image/icons/icongg.png",
              "image/icons/icontwitter.png",
              "image/icons/iconmicrosoft.png",
            ].map((src, i) => (
              <a key={i} href="#" className="inline-block">
                <img
                  src={src}
                  alt="share"
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 p-1 shadow-sm hover:shadow"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* Dòng sao + thanh phần trăm cho cột trái của Reviews */
function StarRow({ stars, percent }: { stars: number; percent: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-yellow-500 text-base leading-none">
        {"★".repeat(stars)}
        {"☆".repeat(5 - stars)}
      </div>
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-yellow-400" style={{ width: `${percent}%` }} />
      </div>
      <div className="w-10 text-right text-sm text-slate-600">{percent}%</div>
    </div>
  );
}

export type CourseReview = {
  _id: string;
  userId: { _id: string, firstName: string, lastName: string, avatar: string };
  courseId: { _id: string, title: string };
  rating: number;
  content: string;
  createdAt: string;
};

/* ===================== Page ===================== */
export default function DetailCourse() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>(
    t("tab_description", { ns: "course", defaultValue: "Description" })
  );
  const [course, setCourse] = useState<DetailCourse | null>(null);
  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([]);
  const [otherCourses, setOtherCourses] = useState<Course[]>([]);
  const [countReviewsToShow, setCountReviewsToShow] = useState(3);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editText, setEditText] = useState<string>("");
  const { user } = useAuth();

  const { isLoggedIn } = useAuth();
  const { getCourseById, getCourseReviews, getTrendingCoursesByLimit, createReview, updateReview, deleteReview } = useApi();

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchCourse(id);
      fetchCourseReviews(id);
      fetchOtherCourses();
    }
  }, [id]);

  const handleShowMoreReviews = () => {
    setCountReviewsToShow((prev) => prev + 3);
  };

  const handleShowLessReviews = () => {
    setCountReviewsToShow(3);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserRating(0);
    setUserText("");

    if (!id) return;

    try {
      await createReview(id, userRating, userText);
      await fetchCourseReviews(id);
      await fetchCourse(id);
      toast.success(t("review_submitted", { ns: "course" }));
    } catch (error) {
      toast.error(t("review_submit_failed", { ns: "course" }));
    }
  };

  const handleEditClick = (review: any) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditText(review.content);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditText("");
  };

  const handleSaveEdit = async (reviewId: string) => {
    try {
      await updateReview(reviewId, editRating, editText);
      id && await fetchCourseReviews(id);
      setEditingReviewId(null);
      await fetchCourse(id!);
      toast.success(t("review_updated", { ns: "course" }));
    } catch (error) {
      toast.error(t("review_update_failed", { ns: "course" }));
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm(t("review_delete_confirm", { ns: "course" }))) return;
    try {
      await deleteReview(reviewId);
      id && await fetchCourseReviews(id);
      id && await fetchCourse(id);
      toast.success(t("review_deleted", { ns: "course" }));
    } catch (error) {
      toast.error(t("review_delete_failed", { ns: "course" }));
    }
  };

  const fetchCourse = async (id: string) => {
    try {
      const response = await getCourseById(id);
      setCourse(response.data);
    } catch (error) {
      setCourse(null);
      console.error("Error fetching course:", error);
    }
  };

  const fetchCourseReviews = async (id: string) => {
    try {
      const response = await getCourseReviews(id);
      setCourseReviews(response.data);
    } catch (error) {
      setCourseReviews([]);
      console.error("Error fetching course reviews:", error);
    }
  };

  const fetchOtherCourses = async () => {
    try {
      const response = await getTrendingCoursesByLimit(4);
      setOtherCourses(response.data);
    } catch (error) {
      setOtherCourses([]);
      console.error("Error fetching other courses:", error);
    }
  };

  /* ---------- breadcrumb title (dùng id nếu có) ---------- */
  // const courseTitle = id || t("default_course_title", { ns: "course", defaultValue: "Introduction to User Experience Design" });

  /* Testimonials data + carousel paging (3 cards / trang) */
  const TESTIMONIALS = useMemo(
    () => [
      {
        quote:
          "Byway's tech courses are top-notch! As someone who's always looking to stay ahead in the rapidly evolving tech world, I appreciate the up-to-date content and engaging multimedia.",
        name: "Jane Doe",
        role: "Designer",
        avatar: "image/avatar1.jpg",
      },
      {
        quote:
          "The instructors are fantastic. The lessons are practical and immediately applicable to my work.",
        name: "John Smith",
        role: "Developer",
        avatar: "image/avatar2.jpg",
      },
      {
        quote:
          "Clear, concise, and engaging. I gained skills that boosted my confidence in leading projects.",
        name: "Emily Johnson",
        role: "Product Manager",
        avatar: "image/avatar3.jpg",
      },
      {
        quote:
          "The real-world examples were exactly what I needed to understand difficult concepts.",
        name: "Michael Brown",
        role: "UX Researcher",
        avatar: "image/avatar1.jpg",
      },
      {
        quote:
          "Loved the course structure! It’s simple to follow and well organized.",
        name: "Sophia Lee",
        role: "Marketing Specialist",
        avatar: "image/avatar2.jpg",
      },
      {
        quote:
          "Great content and smooth delivery. Highly recommended for beginners and intermediates.",
        name: "David Kim",
        role: "Engineer",
        avatar: "image/avatar3.jpg",
      },
    ],
    []
  );

  const perPage = 3;
  const totalPages = Math.ceil(TESTIMONIALS.length / perPage);
  const [page, setPage] = useState(1);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const pageStart = (page - 1) * perPage;
  const current = TESTIMONIALS.slice(pageStart, pageStart + perPage);

  /* ---------- syllabus collapsible ---------- */
  const [openTopic, setOpenTopic] = useState<number | null>(0);
  const topics = [
    { title: t("syllabus_intro", { ns: "course", defaultValue: "Introduction to UX Design" }), lessons: 5, duration: "1 hour" },
    { title: t("syllabus_basics", { ns: "course", defaultValue: "Basics of User-Centered Design" }), lessons: 5, duration: "1 hour" },
    { title: t("syllabus_elements", { ns: "course", defaultValue: "Elements of User Experience" }), lessons: 5, duration: "1 hour" },
    { title: t("syllabus_visual", { ns: "course", defaultValue: "Visual Design Principles" }), lessons: 5, duration: "1 hour" },
  ];

  /* ---------- review form ---------- */
  const [userRating, setUserRating] = useState<number>(0);
  const [userText, setUserText] = useState("");

  return (
    <>
      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 space-y-12">

        {/* Breadcrumb (Home > Course Title) */}
        <nav className="text-sm text-slate-600 flex items-center gap-2">
          <Link to="/" className="text-blue-600 hover:underline cursor-pointer">
            {t("breadcrumb_home", { ns: "course", defaultValue: "Home" })}
          </Link>
          <span>›</span>
          <span className="text-slate-900 font-medium">
            {course?.title}
          </span>
        </nav>
        {/* <nav className="text-sm text-slate-600 flex items-center gap-2">
          <Link to="/" className="text-blue-600 hover:underline cursor-pointer">
            {t("breadcrumb_home", { ns: "course", defaultValue: "Home" })}
          </Link>
          <span>›</span>
          <span className="text-slate-900 font-medium">{courseTitle}</span>
        </nav> */}

        {/* ========== 1) Header khóa học + Buy Card ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: title + info */}
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {course?.title}
            </h1>

            {/* Khối rating */}
            <div className="flex items-center flex-wrap text-sm">
              <RatingInline
                value={course?.avgRating ? Math.round(course.avgRating * 10) / 10 : 0}
                textAfter={t("rating_count_fmt", {
                  ns: "course",
                  count: course?.totalRating || 0,
                })}
              />
              <span className="mx-3 text-slate-300">|</span>
              <span className="text-slate-600">
                {t("course_meta", {
                  ns: "course",
                  totalLectures: course?.totalChapter || 0,
                  totalHour: course?.totalHour || 0,
                })}
              </span>
            </div>

            <div className="text-sm text-slate-500">
              {t("created_by", { ns: "course", defaultValue: "Created by" })}{" "}
              <span className="font-medium text-slate-800">Praful Bhadane</span>
            </div>
          </div>

          {/* Right: Buy Card */}
          <BuyCard t={t} course={course} />
        </div>

        {/* ========== 2) Tabs dạng button + Content ========== */}
        <section>
          <TabsButtons
            active={activeTab}
            onChange={setActiveTab}
            labels={[
              t("tab_description", { ns: "course", defaultValue: "Description" }),
              t("tab_certification", { ns: "course", defaultValue: "Certification" }),
              t("tab_instructor", { ns: "course", defaultValue: "Instructor" }),
              t("tab_syllabus", { ns: "course", defaultValue: "Syllabus" }),
              ...(isLoggedIn ? [t("tab_reviews", { ns: "course", defaultValue: "Reviews" })] : [])
            ]}
          />

          <div className="mt-6">
            {activeTab === t("tab_description", { ns: "course", defaultValue: "Description" }) && (
              <p className="text-slate-700 leading-relaxed">
                {course?.description}
              </p>
            )}

            {activeTab === t("tab_certification", { ns: "course", defaultValue: "Certification" }) && (
              <p className="text-slate-700 leading-relaxed">
                {t("cert_text", {
                  ns: "course",
                  defaultValue:
                    "After finishing this course, you will receive a certificate of completion. Use it to showcase your skills to employers or clients.",
                })}
              </p>
            )}

            {activeTab === t("tab_instructor", { ns: "course", defaultValue: "Instructor" }) && (
              <div className="flex items-start gap-4">
                <img
                  src="image/giaovien.png"
                  alt={t("instructor_alt", { ns: "course", defaultValue: "Instructor" })}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-slate-900">Praful Bhadane</h4>
                  <p className="text-sm text-slate-500">
                    {t("instructor_role", { ns: "course", defaultValue: "Senior UX Designer" })}
                  </p>
                  <p className="text-slate-700 mt-2 text-sm">
                    {t("instructor_bio", {
                      ns: "course",
                      defaultValue:
                        "Praful has 10+ years of experience in UX and product design, leading design teams and mentoring thousands of students.",
                    })}
                  </p>
                </div>
              </div>
            )}

            {activeTab === t("tab_syllabus", { ns: "course", defaultValue: "Syllabus" }) && (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                {topics.map((tpc, idx) => {
                  const opened = openTopic === idx;
                  return (
                    <div key={tpc.title} className="border-b last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setOpenTopic(opened ? null : idx)}
                        className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {/* arrow ở đầu hàng */}
                          <span
                            className={
                              "inline-flex items-center justify-center w-6 h-6 rounded-full border border-slate-300 text-slate-600 transition " +
                              (opened ? "bg-slate-100 rotate-180" : "")
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </span>
                          <span className="font-medium text-slate-900">
                            {tpc.title}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-6">
                          <span>
                            {t("lessons_count", {
                              ns: "course",
                              defaultValue: "{{count}} Lessons",
                              count: tpc.lessons,
                            })}
                          </span>
                          <span>{tpc.duration}</span>
                        </div>
                      </button>

                      {opened && (
                        <div className="px-4 pb-4 text-sm text-slate-600">
                          <ul className="list-disc ml-9 space-y-1">
                            <li>{t("syllabus_item_overview", { ns: "course", defaultValue: "Overview & learning goals" })}</li>
                            <li>{t("syllabus_item_concepts", { ns: "course", defaultValue: "Key concepts and terminology" })}</li>
                            <li>{t("syllabus_item_project", { ns: "course", defaultValue: "Mini project & resources" })}</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === t("tab_reviews", { ns: "course", defaultValue: "Reviews" }) && (
              <div className="space-y-4">
                <div className="text-slate-800 font-medium">
                  {t("write_review", { ns: "course", defaultValue: "Write your review" })}
                </div>
                {/* chọn sao */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setUserRating(n)}
                      className="cursor-pointer"
                      aria-label={t("aria_rate_n", { ns: "course", defaultValue: "Rate {{n}} stars", n })}
                    >
                      <span
                        className={
                          "text-2xl " +
                          (n <= userRating ? "text-yellow-500" : "text-slate-300")
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="text-sm text-slate-600">
                    {userRating
                      ? t("rating_of_5", { ns: "course", defaultValue: "{{n}} / 5", n: userRating })
                      : t("select_rating", { ns: "course", defaultValue: "Select rating" })}
                  </span>
                </div>
                {/* nội dung */}
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  rows={4}
                  placeholder={t("review_placeholder", {
                    ns: "course",
                    defaultValue: "Share your experience with this course…",
                  })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                  onClick={handleSubmitReview}
                >
                  {t("submit_review", { ns: "course", defaultValue: "Submit Review" })}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ========== 3) Learner Reviews (cột trái rating, cột phải list) ========== */}
        <section>
          <h3 className="text-lg font-semibold mb-6">
            {t("learner_reviews", { ns: "course", defaultValue: "Learner Reviews" })}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT SUMMARY */}
            <div className="lg:col-span-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold text-slate-900">{course?.avgRating ? Math.round(course.avgRating * 10) / 10 : 0}</span>
                  <Stars value={course?.avgRating ? Math.round(course.avgRating * 10) / 10 : 0} />
                </div>
                <div className="text-sm text-slate-500">
                  {t("reviews_total_fmt", { ns: "course", count: course?.totalRating || 0 })}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <StarRow stars={5} percent={course && course.totalRating !== 0 ? Math.round(100 * (course?.countDetailReviews['5'] || 0)/ course.totalRating) : 0} />
                <StarRow stars={4} percent={course && course.totalRating !== 0 ? Math.round(100 * (course?.countDetailReviews['4'] || 0)/ course.totalRating) : 0} />
                <StarRow stars={3} percent={course && course.totalRating !== 0 ? Math.round(100 * (course?.countDetailReviews['3'] || 0)/ course.totalRating) : 0} />
                <StarRow stars={2} percent={course && course.totalRating !== 0 ? Math.round(100 * (course?.countDetailReviews['2'] || 0)/ course.totalRating) : 0} />
                <StarRow stars={1} percent={course && course.totalRating !== 0 ? Math.round(100 * (course?.countDetailReviews['1'] || 0)/ course.totalRating) : 0} />
              </div>
            </div>

            {/* RIGHT REVIEWS LIST */}
            <div className="lg:col-span-9">
              <div className="space-y-6">
                {courseReviews.slice(0, countReviewsToShow).map((review) => (
                  <div
                    key={review._id}
                    className="border-b border-slate-200 py-4 flex justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          <h4 className="font-semibold text-slate-800">{review.userId.firstName} {review.userId.lastName}</h4>
                          <span>
                            {t("reviewed_on", {
                              ns: "course",
                              date: formatDateTime(review.createdAt),
                            })}
                          </span>
                        </span>
                        <span>
                          <Stars value={review.rating} />
                        </span>
                      </div>

                      {/* Nếu đang edit review này */}
                      {editingReviewId === review._id ? (
                        <div className="mt-2">
                          {/* Rating edit */}
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className={clsx(
                                  "text-xl cursor-pointer",
                                  editRating >= star ? "text-yellow-400" : "text-gray-300"
                                )}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          {/* Text edit */}
                          <textarea
                            className="w-full border rounded-lg p-2 text-sm"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                          />

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleSaveEdit(review._id)}
                              className="px-3 py-1 bg-green-500 text-white rounded cursor-pointer"
                            >
                              {t("save", { ns: "course" })}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-400 text-white rounded cursor-pointer"
                            >
                              {t("cancel", { ns: "course" })}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-600 mt-2">{review.content}</p>
                      )}
                    </div>

                    {/* Nếu là review của user hiện tại thì cho phép Edit/Delete */}
                    {user && review.userId._id === user._id && (
                      <div className="flex flex-col gap-1 ml-4">
                        <button
                          onClick={() => handleEditClick(review)}
                          className="text-blue-500 cursor-pointer text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-500 cursor-pointer text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex mt-6">
                <button
                  type="button"
                  onClick={handleShowMoreReviews}
                  className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  {t("view_more_reviews", { ns: "course", defaultValue: "View more Reviews" })}
                </button>

                {countReviewsToShow > 3 && (
                  <button
                    type="button"
                    onClick={handleShowLessReviews}
                    className="ml-2 px-5 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                  >
                    {t("show_less_reviews", { ns: "course", defaultValue: "Show less Reviews" })}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========== 4) Testimonials (carousel 3 items / trang) + More courses ========== */}
        <section className="space-y-12">
          {/* Testimonials */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {t("what_customers_say", { ns: "course", defaultValue: "What Our Customer Say" })}{" "}
                <span className="block md:inline font-normal text-slate-500">
                  {t("about_us", { ns: "course", defaultValue: "About Us" })}
                </span>
              </h3>
              <div className="flex items-center gap-3">
                <button
                  className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                  onClick={() => {
                    setDir("prev");
                    setPage((p) => (p === 1 ? totalPages : p - 1));
                  }}
                  aria-label={t("prev", { ns: "course", defaultValue: "Previous" })}
                >
                  ‹
                </button>
                <button
                  className="w-9 h-9 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                  onClick={() => {
                    setDir("next");
                    setPage((p) => (p === totalPages ? 1 : p + 1));
                  }}
                  aria-label={t("next", { ns: "course", defaultValue: "Next" })}
                >
                  ›
                </button>
              </div>
            </div>

            {/* slider với hiệu ứng lướt theo hướng */}
            <div className="relative overflow-hidden">
              <div
                key={page}
                className={
                  "grid grid-cols-1 md:grid-cols-3 gap-6 transition-transform duration-300 " +
                  (dir === "next" ? "translate-x-0" : "translate-x-0")
                }
                style={{
                  transform:
                    dir === "next" ? "translateX(0)" : "translateX(0)",
                }}
              >
                {current.map((c, idx) => (
                  <div
                    key={idx}
                    className={
                      "border border-slate-200 rounded-xl bg-white p-6 shadow-sm " +
                      (dir === "next"
                        ? "animate-[slideInFromRight_.3s_ease]"
                        : "animate-[slideInFromLeft_.3s_ease]")
                    }
                    style={{ animation: undefined }}
                  >
                    <div className="text-3xl text-blue-500 mb-4">“</div>
                    <p className="text-slate-700 leading-relaxed min-h-[120px]">
                      {c.quote}
                    </p>
                    <div className="mt-5 pt-4 border-t border-slate-200 flex items-center gap-3">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Indicators */}
              <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-label={t("go_to_page_n", { ns: "course", defaultValue: "Go to page {{n}}", n: p })}
                    className={
                      "w-2.5 h-2.5 rounded-full cursor-pointer " +
                      (p === page ? "bg-slate-600" : "bg-slate-300")
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* More courses like this */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("more_like_this", { ns: "course", defaultValue: "More Courses Like This" })}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {otherCourses.map((otherCourse) => (
                <div
                  key={otherCourse._id}
                  onClick={() => { window.scrollTo(0, 0); navigate(`/courses/${otherCourse._id}`); }}
                  className="group border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={otherCourse.introImage ? beFileUrl(otherCourse.introImage) : `https://picsum.photos/seed/course${otherCourse._id}/400/300`}
                      alt={t("course_card_alt", { ns: "course", defaultValue: "course" })}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-slate-900 text-sm">
                      {otherCourse.title}
                    </h4>
                    <p className="text-xs text-slate-500">John Doe</p>
                    <div className="flex justify-between items-center mt-2">
                      <Stars value={otherCourse.avgRating ? Math.round(otherCourse.avgRating * 10) / 10 : 0} />
                      <span className="text-slate-900 font-semibold text-sm">
                        ${otherCourse.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer (giống Home.tsx) ===== */}
      <Footer />
    </>
  );
}
