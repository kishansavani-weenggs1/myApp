export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export const Constants = {
  PASSWORD_SALT: 10,
  INACTIVE: 0,
  ACTIVE: 1,
  SYSTEM: {
    ID: 0,
  },
  MAX_ALLOWED_IMAGES: 10,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 Mb
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50 Mb
  REDIS_DATA_EXPIRY_TIME: 30 * 60, // 30 minutes
};

export const REDIS = {
  DATA_EXPIRY_TIME: 30 * 60, // 30 minutes,
  CACHE_KEY: {
    POSTS: "posts",
  },
};

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,

  // Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,

  // Server Error
  INTERNAL_SERVER_ERROR: 500,
};

export const SOCKET_EVENT = {
  POST: {
    CREATED: "POST_CREATED",
    UPDATED: "POST_UPDATED",
    DELETED: "POST_DELETED",
  },
  COMMENT: {
    CREATED: "COMMENT_CREATED",
    UPDATED: "COMMENT_UPDATED",
    DELETED: "COMMENT_DELETED",
  },
  MESSAGE: {
    CREATED: "MESSAGE_CREATED",
    UPDATED: "MESSAGE_UPDATED",
    DELETED: "MESSAGE_DELETED",
  },
};

export enum MessageStatus {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
}

export enum FileTypesForPosts {
  MAIN_IMAGE = "MAIN_IMAGE",
  MAIN_VIDEO = "MAIN_VIDEO",
  OTHER_IMAGES = "OTHER_IMAGES",
}

export const RESPONSE = {
  CLIENT_ERROR: "ClientErrorResponse",
  SERVER_ERROR: "ServerErrorResponse",
  VALIDATION_ERROR: "ValidationErrorResponse",
};
