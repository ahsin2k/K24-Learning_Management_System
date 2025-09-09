import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';
import { Course } from '../courses/course.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async getListReviews(userId: string): Promise<ReviewDocument[]> {
    return this.reviewModel.find({ userId }).sort({ createdAt: -1 }).populate('courseId', 'title').populate('userId', 'firstName lastName avatar').exec();
  }

  async getCourseReviews(courseId: string): Promise<ReviewDocument[]> {
    return this.reviewModel.find({ courseId }).sort({ createdAt: -1 }).populate('courseId', 'title').populate('userId', 'firstName lastName avatar').exec();
  }

  async findByField(field: string, value: any) {
    return this.reviewModel.findOne({ [field]: value }).exec();
  }

  async createReview(userId: string, courseId: string, rating: number, content: string): Promise<ReviewDocument> {
    const newReview = new this.reviewModel({
      userId,
      courseId,
      rating,
      content,
    });
    const course = await this.courseModel.findById(courseId);

    if (course) {
      const totalRating = course.totalRating + 1;
      const totalScore = course.avgRating * course.totalRating + rating;
      const avgRating = totalScore / totalRating;
      course.avgRating = avgRating;
      course.totalRating = totalRating;
      await course.save();
    }
    
    await newReview.save();
    
    return newReview;
  }

  async updateReview(id: string, userId: string, rating: number, content: string): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new Error('Review not found');
    }
    if (review.userId.toString() !== userId) {
      throw new Error('Not authorized to update this review');
    }
    const course = await this.courseModel.findById(review.courseId);
    if (course) {
      const totalScore = course.avgRating * course.totalRating - review.rating + rating;
      const avgRating = totalScore / course.totalRating;
      course.avgRating = avgRating;
      await course.save();
    }
    review.rating = rating;
    review.content = content;
    await review.save();
    return review;
  }

  async deleteReview(id: string, userId: string): Promise<boolean> {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new Error('Review not found');
    }
    if (review.userId.toString() !== userId) {
      throw new Error('Not authorized to delete this review');
    }
    const course = await this.courseModel.findById(review.courseId);
    if (course) {
      const totalRating = course.totalRating - 1;
      if (totalRating <= 0) {
        course.avgRating = 5.0;
        course.totalRating = 0;
      } else {
        const totalScore = course.avgRating * course.totalRating - review.rating;
        const avgRating = totalScore / totalRating;
        course.avgRating = avgRating;
        course.totalRating = totalRating;
      }
      await course.save();
    }
    await this.reviewModel.deleteOne({ _id: id });
    return true;
  }
}
