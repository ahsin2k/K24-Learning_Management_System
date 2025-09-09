import {
  faBell,
  faCartShopping,
  faHeart,
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

export default function UserHeader() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const userDdRef = useRef<HTMLDivElement | null>(null);
  const langDdRef = useRef<HTMLDivElement | null>(null);

  // đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDdRef.current && !userDdRef.current.contains(e.target as Node)) {
        setIsUserOpen(false);
      }
      if (langDdRef.current && !langDdRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // LIVE SEARCH
  useEffect(() => {
    const id = setTimeout(() => {
      const q = searchText.trim();
      navigate(q ? `/courses?search=${encodeURIComponent(q)}` : "/courses", {
        replace: true,
      });
    }, 300);
    return () => clearTimeout(id);
  }, [searchText]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsUserOpen(false);
    toast.success(t("account.logout_success", { ns: "layout" }));
  };

  const handleChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    Cookies.set("lang", lang);
    setIsLangOpen(false);
  };

  return (
    <>
      {/* Header */}
      <header className="py-2 border-b border-slate-200">
        <div className="flex items-center w-full h-full px-4 md:px-20">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex w-32 flex-shrink-0 items-center cursor-pointer"
          >
            <img src="logos/logo.png" alt="Byway Logo" className="h-8 w-8 mr-2" />
            <span className="text-slate-700 font-medium text-base">Byway</span>
          </div>

          {/* Nav + Search (Desktop) */}
          <div className="hidden lg:flex ml-20 items-center gap-3">
            <button className="text-slate-700 text-sm font-medium hover:text-slate-900">
              {t("header.categories", { ns: "layout" })}
            </button>

            {/* SEARCH */}
            <form
              className="flex items-center gap-2.5 px-2.5 py-2 border border-slate-700 rounded-lg w-[622px] h-10"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="text-slate-700 text-sm font-medium focus:outline-none w-[90%]"
                placeholder={t("header.search", {
                  ns: "layout",
                  defaultValue: "Search Courses",
                })}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm rounded hover:bg-slate-100 cursor-pointer"
              >
                🔍
              </button>
            </form>

            <button className="text-slate-700 text-sm font-medium hover:text-slate-900 whitespace-nowrap cursor-pointer">
              {t("header.teach", { ns: "layout" })}
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 lg:gap-6 ml-auto">
            {isLoggedIn ? (
              <>
                <FontAwesomeIcon
                  icon={faHeart}
                  className="w-6 h-6 text-slate-700 cursor-pointer"
                />
                <FontAwesomeIcon
                  icon={faCartShopping}
                  className="w-6 h-6 text-slate-700 cursor-pointer"
                />
                <FontAwesomeIcon
                  icon={faBell}
                  className="w-6 h-6 text-slate-700 cursor-pointer"
                />

                {/* Avatar + dropdown */}
                <div className="relative" ref={userDdRef}>
                  <div
                    onClick={() => setIsUserOpen((v) => !v)}
                    className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium cursor-pointer"
                  >
                    {user?.username?.charAt(0)?.toUpperCase()}
                  </div>

                  {isUserOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                      <ul className="py-2 text-sm text-slate-700">
                        <li
                          onClick={() => navigate("/profile")}
                          className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                        >
                          {t("account.profile", { ns: "layout" })}
                        </li>
                        {user?.role === "admin" && (
                          <li
                            onClick={() => navigate("/admin/dashboard")}
                            className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                          >
                            {t("account.manager_courses", { ns: "layout" })}
                          </li>
                        )}
                        <li className="px-4 py-2 hover:bg-slate-100 cursor-pointer">
                          {t("account.settings", { ns: "layout" })}
                        </li>
                        <li
                          onClick={handleLogout}
                          className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-red-600"
                        >
                          {t("account.logout", { ns: "layout" })}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faCartShopping}
                  className="w-6 h-6 text-slate-700 md:ml-20 mr-2 cursor-pointer"
                />
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="cursor-pointer px-2.5 py-2.5 border border-slate-700 text-slate-700 text-sm font-medium hover:bg-slate-700 hover:text-white"
                  >
                    {t("header.login", { ns: "layout" })}
                  </button>
                  <button
                    onClick={() => navigate("/sign_up")}
                    className="cursor-pointer px-2.5 py-2.5 bg-slate-700 text-white text-sm font-medium hover:bg-white hover:text-slate-700 hover:border hover:border-slate-700"
                  >
                    {t("header.sign_up", { ns: "layout" })}
                  </button>
                </div>
              </>
            )}

            {/* Language desktop */}
            <div className="relative hidden lg:block" ref={langDdRef}>
              <button
                onClick={() => setIsLangOpen((v) => !v)}
                className="px-2 py-1 border border-slate-700 rounded text-sm hover:bg-slate-100"
              >
                {i18n.language.toUpperCase()}
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-30 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  <ul className="py-1 text-sm text-slate-700">
                    <li
                      onClick={() => handleChangeLanguage("en")}
                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                    >
                      {t("header.en", { ns: "layout" })}
                    </li>
                    <li
                      onClick={() => handleChangeLanguage("vi")}
                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                    >
                      {t("header.vi", { ns: "layout" })}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Hamburger menu button (mobile) */}
            <button
              className="lg:hidden p-2 text-slate-700"
              onClick={() => setIsMenuOpen(true)}
            >
              <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Offcanvas menu (Mobile) */}
      {isMenuOpen && (
        <div className="fixed top-0 left-0 right-0 z-50">
          {/* Menu panel */}
          <div className="w-full bg-white shadow-lg p-4 animate-slide-down">
            {/* Close button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="mb-4 text-slate-700"
            >
              <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
            </button>

            {/* Nav items */}
            <button className="block w-full text-left text-slate-700 text-sm font-medium mb-3">
              {t("header.categories", { ns: "layout" })}
            </button>

            {/* Search box */}
            <form
              className="flex items-center gap-2 px-2.5 py-2 border border-slate-700 rounded-lg w-full h-10 mb-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="text-slate-700 text-sm focus:outline-none w-full"
                placeholder={t("header.search", {
                  ns: "layout",
                  defaultValue: "Search Courses",
                })}
              />
              <button type="submit" className="text-slate-700">
                🔍
              </button>
            </form>

            <button className="block w-full text-left text-slate-700 text-sm font-medium mb-3">
              {t("header.teach", { ns: "layout" })}
            </button>

            {/* Language Switch */}
            <div className="mt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleChangeLanguage("en")}
                  className="px-2 py-1 border text-sm cursor-pointer"
                >
                  EN
                </button>
                <button
                  onClick={() => handleChangeLanguage("vi")}
                  className="px-2 py-1 border text-sm cursor-pointer"
                >
                  VI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Main Area */}
      <main className="p-4">
        <Outlet />
      </main>

      {/* Tailwind custom animation */}
      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
