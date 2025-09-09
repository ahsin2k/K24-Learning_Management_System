import axios from "axios";
import { useAuth } from "./useAuth";
import { useTranslation } from "react-i18next";

export const useApi = () => {
  const { token } = useAuth();
  const { i18n } = useTranslation();

  const api = axios.create({
    baseURL: `${import.meta.env.VITE_BE_DOMAIN}`,
    params: { lang: i18n.language },
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });

  const updateProfile = (formData: FormData) => {
    return api.patch('/users/profile', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  const getProfile = () => {
    return api.get('/users/profile');
  };

  const getAllCourses = () => {
    return api.get('/courses/all');
  };

  const getListPublishedCourses = () => {
    return api.get('/courses/published');
  };

  const getCourseById = (id: string) => {
    return api.get(`/courses/${id}`);
  };

  const createCourse = (formData: FormData) => {
    return api.post('/courses/create', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  const updateCourse = (id: string, formData: FormData) => {
    return api.patch(`/courses/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const deleteCourse = (id: string) => {
    return api.delete(`/courses/${id}`);
  };

  const getTrendingCourses = () => {
    return api.get('/courses/trending');
  };

  const getTrendingCoursesByLimit = (limit: number) => {
    return api.get('/courses/trending', { params: { limit } });
  };

  const getTopInstructors = (limit: number) => {
    return api.get('/instructors/top', { params: { limit } });
  };

  const getCourseReviews = (courseId: string) => {
    return api.get(`/reviews/course/${courseId}`);
  };

  const getMyReviews = () => {
    return api.get(`/reviews/my-reviews`);
  };

  const deleteReview = (id: string) => {
    return api.delete(`/reviews/${id}`);
  };

  const updateReview = (id: string, rating: number, content: string) => {
    return api.patch(`/reviews/${id}`, { rating, content });
  }

  const createReview = (courseId: string, rating: number, content: string) => {
    return api.post(`/reviews/course/${courseId}`, { rating, content });
  };

  return { 
    api, 
    updateProfile, 
    getProfile, 
    getAllCourses, 
    getListPublishedCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getTrendingCourses,
    getTrendingCoursesByLimit,
    getTopInstructors,
    getCourseReviews,
    createReview,
    updateReview,
    deleteReview,
    getMyReviews
  };
};