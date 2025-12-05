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



export const TopviewVideo = pgTable("topviewVideos", {
  id: uuid("id").primaryKey().defaultRandom(),
  avatarId: varchar("avatar_id"),
  avatarMeta: json("avatar_meta"),
  productUrl: varchar("product_url"),
  productName: varchar("product_name"),
  fileIds: json("file_ids"),
  script: varchar("script", { length: 5000 }),
  voiceId: varchar("voice_id"),
  language: varchar("language", { length: 50 }),
  captionStyleId: varchar("caption_style_id"),
  aspectRatio: varchar("aspect_ratio"),
  videoLength: varchar("video_length"),
  taskId: varchar("task_id"),
  status: varchar("status").default("pending"),
  videoUrl: varchar("video_url"),
  videoCoverUrl: varchar("video_cover_url"),
  duration: varchar("duration"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});


