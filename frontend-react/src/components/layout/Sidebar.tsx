import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { faArrowLeft, faArrowRight, faBars } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isExpanded: initExpanded = true }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(initExpanded);
  const [activeItem, setActiveItem] = useState('courses');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(!isExpanded);
  };

  const menuItems = [
    {
      id: 'courses',
      label: t('sidebar.courses', { ns: 'layout' }),
      icon: <CoursesIcon />,
    },
    {
      id: 'setting',
      label: t('sidebar.settings', { ns: 'layout' }),
      icon: <SettingIcon />,
    },
  ];

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setIsExpanded(false); // đóng sidebar khi < mobile breakpoint
      }
    }

    // chạy khi load lần đầu
    handleResize();

    // lắng nghe khi resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [window.innerWidth]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <section
        className={`flex h-full flex-col bg-gray-800 sidebar-shadow absolute md:relative top-0 left-0 transition-all duration-300
          ${isExpanded ? "w-60" : "w-16"}
        `}
      >
        {/* Header */}
        <div className="flex flex-col h-full">
          {/* Logo + toggle */}
          <div className="flex items-center justify-between p-3">
            <div
              onClick={() => navigate('/')}
              className="flex items-center cursor-pointer"
            >
              <img src="logos/logo.png" alt="Byway Logo" className="h-8 w-8" />
              {isExpanded && (
                <span className="ml-2 text-white font-medium text-base">Byway</span>
              )}
            </div>
            {isExpanded && (
              <button
                className="ml-auto p-1 bg-transparent border-none cursor-pointer"
                onClick={toggleSidebar}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-white" />
              </button>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center text-white cursor-pointer transition-all duration-200 hover:bg-blue-500/10
                  ${activeItem === item.id ? "bg-blue-500/20" : ""}
                `}
                onClick={() => setActiveItem(item.id)}
              >
                <div className="p-4">{item.icon}</div>
                {isExpanded && <span>{item.label}</span>}
              </div>
            ))}
            
            {!isExpanded && (
              <button
                className="ml-3 p-1 bg-transparent border-none cursor-pointer"
                onClick={toggleSidebar}
              >
                <FontAwesomeIcon icon={faArrowRight} className="text-white" />
              </button>
            )}
          </nav>

          {/* User */}
          <div className="p-3 flex items-center">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium cursor-pointer">
              {user?.username?.charAt(0)?.toUpperCase()}
            </div>
            {isExpanded && (
              <>
                <div className="ml-2 text-white font-medium">
                  Hi, {user?.username}!
                </div>
                <button className="ml-auto p-1 bg-transparent border-none cursor-pointer">
                  <FontAwesomeIcon icon={faBars} className="text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="p-4 overflow-y-auto flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function CoursesIcon() {
  return <img src="image/icons/course.svg" alt="Courses Icon" className="w-5 h-5" />;
}

function SettingIcon() {
  return <img src="image/icons/setting.svg" alt="Setting Icon" className="w-5 h-5" />;
}
