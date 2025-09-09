// user serializer 
import { CourseDocument } from './course.schema';

export class DetailCourseSerializer {
    private static PERMIT = ['_id', 'title', 'description', 'avgRating', 'totalRating', 'totalChapter', 'userId', 'status', 'countDetailReviews',
        'totalCertificate', 'totalFavorite', 'totalHour', 'totalOrder', 'price', 'createdAt', 'introVideo', 'introImage', 'showLanguage', 'level'];
    private static CONVERT_STRING = ['_id'];

     private static CUSTOM_HANDLERS: Record<string, (course: CourseDocument) => any> = {
        countDetailReviews: (course: CourseDocument) => {
            return {
                '0': course.reviews.filter(r => r.rating === 0).length,
                '1': course.reviews.filter(r => r.rating === 1).length,
                '2': course.reviews.filter(r => r.rating === 2).length,
                '3': course.reviews.filter(r => r.rating === 3).length,
                '4': course.reviews.filter(r => r.rating === 4).length,
                '5': course.reviews.filter(r => r.rating === 5).length,
            };
        }
    };

    static fromCourse(course: CourseDocument) {
        return this.PERMIT.reduce((obj, key) => {
            if (this.CUSTOM_HANDLERS[key]) {
                obj[key] = this.CUSTOM_HANDLERS[key](course);
            } else if (this.CONVERT_STRING.includes(key)) {
                obj[key] = String(course[key]);
            } else if (course[key] !== undefined) {
                obj[key] = course[key];
            }
            return obj;
        }, {} as Record<string, any>);
    }
}