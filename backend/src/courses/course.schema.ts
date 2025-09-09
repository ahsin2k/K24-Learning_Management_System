import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { User } from '../users/users.schema';
import { ReviewDocument } from '../reviews/review.schema';

export type CourseDocument = Course & Document & Partial<{ reviews: ReviewDocument[] }>;

@Schema()
export class Course {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: 5.0 })
  avgRating: number;

  @Prop({ default: 0 })
  totalRating: number;

  @Prop({ default: 0 })
  totalChapter: number;

  @Prop({ default: 0 })
  totalCertificate: number;

  @Prop({ default: 0 })
  totalFavorite: number;

  @Prop({ default: 0 })
  totalOrder: number;

  @Prop({ default: 0 })
  totalHour: number;

  @Prop({ default: 100 })
  price: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' , required: true })
  userId: User;

  @Prop()
  level: string;

  @Prop()
  introVideo: string;

  @Prop()
  introImage: string;

  @Prop()
  showLanguage: string;

  @Prop({ default: 'draft' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'courseId',
});

CourseSchema.set('toObject', { virtuals: true });
CourseSchema.set('toJSON', { virtuals: true });