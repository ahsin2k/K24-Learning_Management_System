import { useTranslation } from 'react-i18next';
import Footer from '../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useAPI';
import type { Course, Instructor } from './ListCourses';
import { useEffect, useState } from 'react';
import { beFileUrl } from '../utils/base.util';

export default function Homepage() {
  const { t } = useTranslation('homepage');
  const navigate = useNavigate();
  const { getTrendingCourses, getTopInstructors } = useApi();
  const [trendingCourses, setTrendingCourses] = useState<Course[]>([]);
  const [topInstructors, setTopInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    fetchTrendingCourses();
    fetchTopInstructors();
  }, []);

  const fetchTrendingCourses = async () => {
    try {
      const response = await getTrendingCourses();
      setTrendingCourses(response.data);
    } catch (error) {
      setTrendingCourses([]);
      console.error("Error fetching trending courses:", error);
    }
  };

  const fetchTopInstructors = async () => {
    try {
      const response = await getTopInstructors(5);
      setTopInstructors(response.data);
    } catch (error) {
      setTopInstructors([]);
      console.error("Error fetching top instructors:", error);
    }
  };

  // Component Star Rating
  const StarRating = ({ rating = 5 }: { rating?: number }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.519 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.046 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.519-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );

  return (
    <>
      {/* Wrapper: min-h-screen  */}
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* main:*/}
        <main className="flex-1 pb-40">
          {/*  */}
          <div className="sr-only">{t('title', { ns: 'homepage' })}</div>

          {/* ===== HERO ===== */}
          <section className="bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-20 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
                {t("unlock_", {ns: 'homepage'})}
                  <br />
                  <span className="text-blue-600">{t("with_byway", {ns: 'homepage'})}</span>
                </h1>
                <p className="mt-4 text-gray-600 max-w-xl">
                 {t("welcome_to", {ns: 'homepage'})}
                </p>

                <div className="mt-6">
                  <button onClick={() => navigate('/courses')} className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition">
                    {t("start", {ns: 'homepage'})}
                  </button>
                </div>
              </div>

              {/* Collage avatar  */}
              <div className="w-full flex justify-end">
                <div className="relative w-72 h-72 md:w-96 md:h-96">
                  <img
                    className="absolute top-0 right-0 w-36 h-36 md:w-44 md:h-44 rounded-full ring-4 ring-white object-cover shadow-lg"
                    src="https://picsum.photos/seed/avatar1/300/300"
                    alt="Student 1"
                  />
                  <img
                    className="absolute left-6 top-20 w-28 h-28 md:w-36 md:h-36 rounded-full ring-4 ring-white object-cover shadow-lg"
                    src="https://picsum.photos/seed/avatar2/300/300"
                    alt="Student 2"
                  />
                  <img
                    className="absolute right-10 bottom-4 w-24 h-24 md:w-32 md:h-32 rounded-full ring-4 ring-white object-cover shadow-lg"
                    src="https://picsum.photos/seed/avatar3/300/300"
                    alt="Student 3"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ===== STATS ===== */}
          <section className="border-t border-b bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">250+</div>
                <div className="text-gray-600 text-sm">{t("courses", {ns: 'homepage'})}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">1000+</div>
                <div className="text-gray-600 text-sm">{t("courses", {ns: 'homepage'})}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">15+</div>
                <div className="text-gray-600 text-sm">{t("courses", {ns: 'homepage'})}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">2400+</div>
                <div className="text-gray-600 text-sm">{t("courses", {ns: 'homepage'})}</div>
              </div>
            </div>
          </section>

          {/* ===== TOP CATEGORIES ===== */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t("top_categories", {ns: 'homepage'})}</h2>
                <a href="#" className="text-blue-600 hover:underline text-sm font-medium">{t("see_all", {ns: 'homepage'})}</a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Astrology', icon: '🔭', courses: '11 Courses' },
                  { name: 'Development', icon: '💻', courses: '12 Courses' },
                  { name: 'Marketing', icon: '📈', courses: '12 Courses' },
                  { name: 'Physics', icon: '⚛️', courses: '14 Courses' }
                ].map((cat, i) => (
                  <div
                    key={i}
                    className="p-6 bg-white border rounded-xl hover:shadow-md transition cursor-pointer"
                  >
                    <div className="text-4xl mb-3">{cat.icon}</div>
                    <div className="font-semibold text-gray-900">{cat.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{cat.courses}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== TOP COURSES ===== */}
          <section className="py-6">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t("top_courses", {ns: 'homepage'})}</h2>
                <a href="#" className="text-blue-600 hover:underline text-sm font-medium">{t("see_all", {ns: 'homepage'})}</a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingCourses.map((course, i) => (
                  <article
                    key={i}
                    onClick={() => {window.scrollTo(0, 0); navigate(`/courses/${course._id}`)}}
                    className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer"
                  >
                    <div className="aspect-video bg-gray-200">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        src={course.introImage ? beFileUrl(course.introImage) : `https://picsum.photos/seed/course${course._id}/300/200`}
                        alt={course.title}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{"John Doe"}</p>
                      
                      <div className="flex items-center mb-2">
                        <StarRating rating={course.avgRating} />
                        <span className="text-xs text-gray-500 ml-1">({course.totalRating})</span>
                      </div>
                      
                      <div className="font-bold text-gray-900">{course.price}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ===== TOP INSTRUCTORS */}
          <section className="py-10">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t("top_instructors", {ns: 'homepage'})}</h2>
                <a href="#" className="text-blue-600 hover:underline text-sm font-medium">{t("see_all", {ns: 'homepage'})}</a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {topInstructors.map((inst, i) => (
                  <div
                    key={i}
                    className="bg-white border rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="mx-auto w-20 h-20 rounded-lg overflow-hidden mb-3">
                      <img
                        className="w-full h-full object-cover"
                        src={`https://picsum.photos/seed/instructor${i + 1}/300/300`}
                        alt={inst.name}
                      />
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900">{inst.name}</h4>
                      <p className="text-xs text-gray-500">{inst.position}</p>
                      <div className="flex items-center justify-center mt-2">
                        <StarRating rating={inst.avgRating} />
                        <span className="text-xs text-gray-500 ml-1">({inst.totalReviews})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== TESTIMONIALS ===== */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t("what", {ns: 'homepage'})}</h2>
                <div className="flex space-x-2">
                  <button className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    quote: "Byway's tech courses are top-notch! As someone who's always looking to stay ahead in the rapidly evolving tech world, I appreciate the up-to-date content and engaging multimedia.",
                    name: "Jane Doe",
                    role: "Designer",
                    avatar: "https://picsum.photos/seed/avatar4/100/100"
                  },
                  {
                    quote: "Byway's tech courses are top-notch! As someone who's always looking to stay ahead in the rapidly evolving tech world, I appreciate the up-to-date content and engaging multimedia.",
                    name: "Jane Doe",
                    role: "Designer",
                    avatar: "https://picsum.photos/seed/avatar5/100/100"
                  },
                  {
                    quote: "Byway's tech courses are top-notch! As someone who's always looking to stay ahead in the rapidly evolving tech world, I appreciate the up-to-date content and engaging multimedia.",
                    name: "Jane Doe",
                    role: "Designer",
                    avatar: "https://picsum.photos/seed/avatar6/100/100"
                  }
                ].map((testimonial, i) => (
                  <div
                    key={i}
                    className="p-6 bg-gray-50 rounded-xl border hover:shadow-md transition cursor-pointer"
                  >
                    <div className="text-4xl mb-4">“</div>
                    <p className="text-gray-700 mb-4 text-sm leading-relaxed">{testimonial.quote}</p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{testimonial.name}</div>
                        <div className="text-xs text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== BECOME AN INSTRUCTOR ===== */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <img
                    src="https://picsum.photos/seed/instructor/400/500"
                    alt="Instructor"
                    className="rounded-2xl w-full h-auto"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">{t("become_an_instructor", {ns: 'homepage'})}</h2>
                  <p className="text-gray-600 mb-6">
                    {t("ins", {ns: 'homepage'})}
                  </p>
                  <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium flex items-center">
                    {t("instructor", {ns: 'homepage'})}
                    <svg width="16" height="16" viewBox="0 0 24 24" className="ml-2">
                      <path d="M5 12h14l-5 5v-10z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ===== TRANSFORM YOUR LIFE ===== */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">{t("transform_your_life_through_education", {ns: 'homepage'})}</h2>
                  <p className="text-gray-600 mb-6">
                  {t("1", {ns: 'homepage'})}
                  </p>
                  <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium flex items-center">
                    {t("checkout", {ns: 'homepage'})}
                    <svg width="16" height="16" viewBox="0 0 24 24" className="ml-2">
                      <path d="M5 12h14l-5 5v-10z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
                <div>
                  <img
                    src="https://picsum.photos/seed/student/400/500"
                    alt="Student"
                    className="rounded-2xl w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}