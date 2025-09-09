import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { fakeCourses } from './course.seeder';
import { Course } from '../../courses/course.schema';
import { User } from '../../users/users.schema';
import { fakeReviews } from './review.seeder';
import { Review } from 'src/reviews/review.schema';

@Injectable()
export class CourseSeederService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

  async run() {

    await this.reviewModel.collection.drop().catch(err => {
      if (err.code === 26) {
        console.log('Collection reviews không tồn tại, bỏ qua.');
      } else {
        throw err;
      }
    });

    
    await this.courseModel.collection.drop().catch(err => {
      if (err.code === 26) {
        console.log('Collection courses không tồn tại, bỏ qua.');
      } else {
        throw err;
      }
    });
    const allUsers = await this.userModel.find({ role: 'user' });

    const courses = await fakeCourses(allUsers, 60); // tạo 60 khóa học
    
    await this.courseModel.deleteMany({});
    await this.courseModel.insertMany(courses);

    const allCourses = await this.courseModel.find();
    const reviews = await fakeReviews(allCourses, allUsers);

    await this.reviewModel.deleteMany({});
    await this.reviewModel.insertMany(reviews);

    console.log('Seeded courses:', courses);
    console.log('Seeded reviews:', reviews);
  }
}
