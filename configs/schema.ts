import { pgTable, serial, varchar, timestamp, integer, json, boolean, uuid } from 'drizzle-orm/pg-core';

export const Users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull().unique(),
  image_url: varchar('image_url').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  stripe_customer_id: varchar('stripe_customer_id'),
  stripe_subscription_id: varchar('stripe_subscription_id'),
  stripe_price_id: varchar('stripe_price_id'),
  subscription_status: varchar('subscription_status').default('inactive'),
  subscription_active: boolean('subscription_active').notNull().default(false),
  plan_tier: varchar('plan_tier').default('free'),
  current_period_start: timestamp('current_period_start'),
  current_period_end: timestamp('current_period_end'),
  credits_allowed: integer('credits_allowed').default(0),
  credits_used: integer('credits_used').default(0),
  credit_reset_day: integer('credit_reset_day'),
  next_credit_reset: timestamp('next_credit_reset'), 
  carryover: integer('carryover').default(0),
  carryover_expiry: timestamp('carryover_expiry'), 
});



// TopView workflow tracking - tracks each step in the video generation process
export const TopviewTasks = pgTable("topview_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(), // Clerk user ID
  
  // Step 1: Background Removal
  productImageFileId: varchar("product_image_file_id"),
  bgRemovalTaskId: varchar("bg_removal_task_id"),
  bgRemovedImageFileId: varchar("bg_removed_image_file_id"),
  bgRemovedImageUrl: varchar("bg_removed_image_url"),
  
  // Step 2: Image Replacement
  templateImageFileId: varchar("template_image_file_id"),
  avatarId: varchar("avatar_id"), // Optional: use saved avatar instead of template
  replaceProductTaskId: varchar("replace_product_task_id"),
  generateImageMode: varchar("generate_image_mode"), // "auto" or "manual"
  imageEditPrompt: varchar("image_edit_prompt", { length: 1000 }),
  location: json("location"), // Manual mode coordinates
  replaceProductResults: json("replace_product_results"), // Array of generated images
  selectedImageId: varchar("selected_image_id"), // User's chosen image from results
  
  // Step 3: Video Generation
  videoTaskId: varchar("video_task_id"),
  script: varchar("script", { length: 5000 }),
  voiceId: varchar("voice_id"),
  captionStyleId: varchar("caption_style_id"),
  mode: varchar("mode"), // "pro" or "standard"
  finishedVideoUrl: varchar("finished_video_url"),
  
  // Overall status tracking
  currentStep: integer("current_step").default(1), // 1, 2, or 3
  status: varchar("status").default("in_progress"), // in_progress, completed, failed
  errorMessage: varchar("error_message", { length: 1000 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Updated TopView Video table with user tracking
export const TopviewVideo = pgTable("topview_videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskTableId: uuid("task_table_id"), 
  aiavatarId: varchar("aiavatar_id"),
  aiavatarName: varchar("aiavatar_name"),
  gender: varchar("gender"),
  productName: varchar("product_name"),
  taskId: varchar("task_id"), // Final video generation task ID
  status: varchar("status").default("pending"),
  videoUrl: varchar("video_url"),
  videoCoverUrl: varchar("video_cover_url"),
  duration: varchar("duration"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
