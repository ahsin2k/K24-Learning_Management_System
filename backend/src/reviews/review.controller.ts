import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewSerializer } from './review.serialize';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { ReviewDto } from './dto/review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(
    private reviewService: ReviewService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/my-reviews')
  async getListReviews(@Request() req) {
    const userId = req.user._id;
    const reviews = await this.reviewService.getListReviews(userId);
    return reviews.map(review => ReviewSerializer.fromReview(review));
  }

  @Get('/course/:courseId')
  async getCourseReviews(@Param('courseId') courseId: string) {
    const reviews = await this.reviewService.getCourseReviews(courseId);
    return reviews.map(review => ReviewSerializer.fromReview(review));
  }

  @Post('/course/:courseId')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Param('courseId') courseId: string,
    @Request() req,
    @Body() body: ReviewDto
  ) {
    const userId = req.user._id;
    const { rating, content } = body;
    const newReview = await this.reviewService.createReview(userId, courseId, rating, content);
    return ReviewSerializer.fromReview(newReview);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Param('id') id: string,
    @Request() req,
    @Body() body: ReviewDto
  ) {
    const userId = req.user._id;
    const { rating, content } = body;
    const updatedReview = await this.reviewService.updateReview(id, userId, rating, content);
    return ReviewSerializer.fromReview(updatedReview);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Param('id') id: string,
    @Request() req
  ) {
    const userId = req.user._id;
    const result = await this.reviewService.deleteReview(id, userId);
    return { success: result };
  }
}