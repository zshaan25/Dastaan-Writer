import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument, PostStatus, PostTone, PostType } from './schemas/post.schema';
import { GeneratePostDto } from './dto/generate-post.dto';
import { RefinePostDto, RefinementAction } from './dto/refine-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostGeneratorAiService } from './post-generator-ai.service';
import { UsersService } from '../users/users.service';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly postGeneratorAiService: PostGeneratorAiService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ConversationsService))
    private readonly conversationsService: ConversationsService,
  ) {}

  async generatePost(userId: string, dto: GeneratePostDto): Promise<PostDocument> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    let conversationContext = '';
    let conversationObjId: Types.ObjectId | undefined;

    if (dto.conversationId) {
      if (!Types.ObjectId.isValid(dto.conversationId)) {
        throw new BadRequestException('Invalid conversation ID');
      }
      conversationObjId = new Types.ObjectId(dto.conversationId);

      // Check if a canonical post already exists for this conversation
      const existingPost = await this.postModel.findOne({
        userId: new Types.ObjectId(userId),
        conversationId: conversationObjId,
      }).exec();

      if (existingPost) {
        this.logger.log(`Reusing canonical post ${existingPost._id} for conversation ${dto.conversationId}`);
        return existingPost;
      }

      try {
        const conv = await this.conversationsService.getConversationById(userId, dto.conversationId);
        const historyText = conv.messages
          .slice(-10)
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join('\n');

        const contextText = conv.collectedContext
          ? `Collected Context: ${JSON.stringify(conv.collectedContext)}`
          : '';

        conversationContext = `${contextText}\n\nConversation History:\n${historyText}`;
      } catch (err: any) {
        this.logger.warn(`Could not load conversation ${dto.conversationId} for post generation: ${err.message}`);
      }
    }

    const generated = await this.postGeneratorAiService.generateStructuredPost({
      postType: dto.postType,
      tone: dto.tone || (user.preferredTone as PostTone),
      conversationContext,
      profileContext: user,
      customInstructions: dto.customInstructions,
    });

    const newPost = new this.postModel({
      userId: new Types.ObjectId(userId),
      conversationId: conversationObjId,
      postType: generated.postType,
      tone: generated.tone,
      status: PostStatus.DRAFT,
      hook: generated.hook,
      body: generated.body,
      cta: generated.cta,
      hashtags: generated.hashtags,
      mentions: generated.mentions,
      versions: [],
    });

    const saved = await newPost.save();

    // Link back to conversation if attached
    if (dto.conversationId) {
      try {
        await this.conversationsService.updateStatus(userId, dto.conversationId, 'DRAFT_GENERATED' as any);
      } catch (e) {
        // non-blocking
      }
    }

    return saved;
  }

  async generatePostForConversation(
    userId: string,
    conversationId: string,
    conversationContextText: string,
    userProfile: any,
    postType?: string,
    tone?: string,
  ): Promise<PostDocument> {
    const conversationObjId = new Types.ObjectId(conversationId);

    // Look for existing post for this conversation
    let existingPost = await this.postModel.findOne({
      userId: new Types.ObjectId(userId),
      conversationId: conversationObjId,
    }).exec();

    const targetType = (postType as PostType) || PostType.ACHIEVEMENT;
    const targetTone = (tone as PostTone) || (userProfile?.preferredTone as PostTone) || PostTone.PROFESSIONAL;

    const generated = await this.postGeneratorAiService.generateStructuredPost({
      postType: targetType,
      tone: targetTone,
      conversationContext: conversationContextText,
      profileContext: userProfile,
    });

    if (existingPost) {
      existingPost.hook = generated.hook;
      existingPost.body = generated.body;
      existingPost.cta = generated.cta;
      existingPost.hashtags = generated.hashtags;
      existingPost.mentions = generated.mentions;
      existingPost.postType = generated.postType;
      existingPost.tone = generated.tone;
      existingPost.status = PostStatus.DRAFT;
      return existingPost.save();
    }

    const newPost = new this.postModel({
      userId: new Types.ObjectId(userId),
      conversationId: conversationObjId,
      postType: generated.postType,
      tone: generated.tone,
      status: PostStatus.DRAFT,
      hook: generated.hook,
      body: generated.body,
      cta: generated.cta,
      hashtags: generated.hashtags,
      mentions: generated.mentions,
      versions: [],
    });

    return newPost.save();
  }

  async refinePost(userId: string, dto: RefinePostDto): Promise<PostDocument> {
    const post = await this.getPostById(userId, dto.postId);
    const user = await this.usersService.findById(userId);

    // Establish current working version (prefer manual user edits if provided)
    const workingVersion = {
      postType: post.postType,
      tone: dto.newTone || post.tone,
      hook: dto.workingVersion?.hook || post.hook,
      body: dto.workingVersion?.body || post.body,
      cta: dto.workingVersion?.cta !== undefined ? dto.workingVersion.cta : post.cta,
      hashtags: dto.workingVersion?.hashtags || post.hashtags,
      mentions: dto.workingVersion?.mentions || post.mentions,
    };

    if (dto.refinementAction === RefinementAction.CREATE_ALTERNATIVES) {
      const versions = await this.postGeneratorAiService.generateAlternativeVersions({
        currentPost: {
          ...workingVersion,
          cta: workingVersion.cta || '',
        },
        profileContext: user,
      });

      post.versions = versions;
      return post.save();
    }

    const refined = await this.postGeneratorAiService.refineStructuredPost({
      currentVersion: workingVersion,
      action: dto.refinementAction,
      newTone: dto.newTone,
      instructions: dto.instructions,
      profileContext: user,
    });

    post.hook = refined.hook;
    post.body = refined.body;
    post.cta = refined.cta;
    post.hashtags = refined.hashtags;
    post.mentions = refined.mentions;
    post.tone = refined.tone;
    post.status = PostStatus.READY_FOR_REVIEW;

    return post.save();
  }

  async generateAlternatives(userId: string, postId: string): Promise<PostDocument> {
    return this.refinePost(userId, {
      postId,
      refinementAction: RefinementAction.CREATE_ALTERNATIVES,
    });
  }

  async getPosts(userId: string): Promise<PostDocument[]> {
    return this.postModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getPostById(userId: string, id: string): Promise<PostDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid post ID');
    }

    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to access this post');
    }

    return post;
  }

  async getPostByConversationId(userId: string, conversationId: string): Promise<PostDocument | null> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException('Invalid conversation ID');
    }

    return this.postModel.findOne({
      userId: new Types.ObjectId(userId),
      conversationId: new Types.ObjectId(conversationId),
    }).exec();
  }

  async updatePost(userId: string, id: string, dto: UpdatePostDto): Promise<PostDocument> {
    const post = await this.getPostById(userId, id);

    if (dto.hook !== undefined) post.hook = dto.hook;
    if (dto.body !== undefined) post.body = dto.body;
    if (dto.cta !== undefined) post.cta = dto.cta;
    if (dto.hashtags !== undefined) post.hashtags = dto.hashtags;
    if (dto.mentions !== undefined) post.mentions = dto.mentions;
    if (dto.postType !== undefined) post.postType = dto.postType;
    if (dto.tone !== undefined) post.tone = dto.tone;
    if (dto.status !== undefined) {
      post.status = dto.status;
    } else {
      post.status = PostStatus.EDITED;
    }

    return post.save();
  }

  async approvePost(userId: string, id: string): Promise<PostDocument> {
    const post = await this.getPostById(userId, id);
    post.status = PostStatus.APPROVED;
    return post.save();
  }

  async deletePost(userId: string, id: string): Promise<{ success: boolean }> {
    const post = await this.getPostById(userId, id);
    await post.deleteOne();
    return { success: true };
  }
}
