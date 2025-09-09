import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from './course.schema';
import { Model } from 'mongoose';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(@InjectModel(Course.name) private courseModel: Model<CourseDocument>) {}

  async getListCourse(): Promise<CourseDocument[]> {
    return this.courseModel.find().sort({ createdAt: -1 }).exec();
  }

  async getListCoursePublished(): Promise<CourseDocument[]> {
    return this.courseModel.find({ status: 'public' }).sort({ createdAt: -1 }).exec();
  }

  async getTrendingCourses(limit: number): Promise<CourseDocument[]> {
    return this.courseModel.find({ avgRating: { $gt: 4.5 }, status: 'public' }).sort({ avgRating: -1 }).limit(limit).exec();
  }

  async findByField(field: string, value: any) {
    return this.courseModel.findOne({ [field]: value }).exec();
  }

  async findByIdWithReviews(value: any) {
    return this.courseModel.findOne({ _id: value }).populate('reviews').exec();
  }

  async create(courseData: Partial<CreateCourseDto>): Promise<CourseDocument> {
    const newCourse = new this.courseModel(courseData);
    return newCourse.save();
  }

  async update(id: string, courseData: Partial<UpdateCourseDto>): Promise<CourseDocument | null> {
    return this.courseModel.findByIdAndUpdate(id, courseData, { new: true }).exec();
  }

  async delete(id: string): Promise<CourseDocument | null> {
    return await this.courseModel.findByIdAndDelete(id).exec();
  }
}
