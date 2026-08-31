import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

export const adminUsers = pgTable(
  "admin_users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("ADMIN"), // ADMIN or EDITOR
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("admin_users_email_idx").on(table.email)]
);

export const stationConfig = pgTable("station_config", {
  id: integer("id").primaryKey().default(1),
  stationName: text("station_name").notNull().default("Radio 90 FM"),
  tagline: text("tagline").notNull().default("Voice of Amal Jyothi"),
  streamUrl: text("stream_url")
    .notNull()
    .default("https://icecast.octosignals.com/radio90_final"),
  streamEnabled: boolean("stream_enabled").notNull().default(true),
  fallbackStreamUrl: text("fallback_stream_url")
    .notNull()
    .default("https://icecast.octosignals.com/radio90_final"),
  defaultPhone: text("default_phone").notNull().default("9496345029"),
  defaultWhatsapp: text("default_whatsapp").notNull().default("9048389090"),
  email: text("email").notNull().default("radio90@amaljyothi.ac.in"),
  website: text("website").notNull().default("https://radio90.in"),
  facebookUrl: text("facebook_url")
    .notNull()
    .default("https://www.facebook.com/fm.radio90/"),
  instagramUrl: text("instagram_url")
    .notNull()
    .default("https://www.instagram.com/radio90.fm"),
  youtubeUrl: text("youtube_url")
    .notNull()
    .default("https://youtube.com/@radio90fm13"),
  spotifyUrl: text("spotify_url")
    .notNull()
    .default("https://open.spotify.com/show/68Ii81VKFBzRWKnEo2y1Oe"),
  xUrl: text("x_url")
    .notNull()
    .default("https://twitter.com/Radio90FM_AJCE"),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),
  configVersion: integer("config_version").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const programs = pgTable(
  "programs",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    presenter: text("presenter").notNull().default(""),
    dayOfWeek: integer("day_of_week").notNull(), // 0 = Mon, 1 = Tue, ..., 6 = Sun
    startMinutes: integer("start_minutes").notNull(), // 0 to 1439
    endMinutes: integer("end_minutes").notNull(), // 0 to 1439
    phoneNumber: text("phone_number"),
    whatsappNumber: text("whatsapp_number"),
    enableCall: boolean("enable_call").notNull().default(true),
    enableWhatsapp: boolean("enable_whatsapp").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("programs_day_start_idx").on(table.dayOfWeek, table.startMinutes),
    index("programs_active_idx").on(table.isActive),
  ]
);

export const liveOverrides = pgTable(
  "live_overrides",
  {
    id: text("id").primaryKey(),
    enabled: boolean("enabled").notNull().default(false),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    presenter: text("presenter").notNull().default(""),
    phoneNumber: text("phone_number"),
    whatsappNumber: text("whatsapp_number"),
    enableCall: boolean("enable_call").notNull().default(true),
    enableWhatsapp: boolean("enable_whatsapp").notNull().default(true),
    startsAt: timestamp("starts_at").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("live_overrides_status_idx").on(
      table.enabled,
      table.startsAt,
      table.expiresAt
    ),
  ]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    adminUserId: text("admin_user_id").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("audit_logs_created_idx").on(table.createdAt)]
);

export const broadcastNotifications = pgTable(
  "broadcast_notifications",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    sentBy: text("sent_by").notNull().default("Station Admin"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("broadcast_notif_created_idx").on(table.createdAt)]
);
