# Video Feature Implementation Plan

## Overview

This plan outlines the implementation of a video feature for the H\&B Trade website, including:

1. A new "Explore Videos" section on the homepage showing 2 YouTube videos
2. A "View More Videos" button linking to a dedicated videos page
3. A new `/videos` page displaying all videos
4. An admin panel for managing videos (add/edit/delete)
5. Backend API endpoints for video CRUD operations

## Files to Modify/Creates

### Frontend Changes

| File Path                                | Action | Description                                 |
| ---------------------------------------- | ------ | ------------------------------------------- |
| `frontend/src/app/page.tsx`              | Modify | Add "Explore Videos" section after Services |
| `frontend/src/app/videos/page.tsx`       | Create | New page showing all videos                 |
| `frontend/src/app/admin/videos/page.tsx` | Create | Admin panel for video management            |
| `frontend/src/types/index.ts`            | Modify | Add Video type interface                    |

### Backend Changes

| File Path                  | Action | Description                    |
| -------------------------- | ------ | ------------------------------ |
| `backend/routes/admin.js`  | Modify | Add admin video CRUD endpoints |
| `backend/routes/public.js` | Modify | Add public video endpoints     |
| `database/schema.sql`      | Modify | Add videos table schema        |

## Implementation Steps

### Step 1: Database Schema

Add a `videos` table to the database with the following fields:

* `id` - UUID primary key

* `title` - Video title (required)

* `youtube_url` - YouTube video URL (required)

* `description` - Video description (optional)

* `status` - active/inactive (default: active)

* `created_at` - timestamp

* `updated_at` - timestamp

### Step 2: Backend API Endpoints

**Public Endpoints:**

* `GET /api/videos` - Get all active videos

* `GET /api/videos/featured` - Get featured videos (limit 2 for homepage)

**Admin Endpoints:**

* `GET /api/admin/videos` - Get all videos with pagination

* `POST /api/admin/videos` - Create new video

* `GET /api/admin/videos/:id` - Get single video

* `PUT /api/admin/videos/:id` - Update video

* `DELETE /api/admin/videos/:id` - Delete video

### Step 3: Frontend Components

**Homepage Section:**

* Display 2 featured videos with embedded YouTube players

* "View More Videos" button linking to `/videos`

**Videos Page:**

* Grid layout showing all videos with thumbnails

* Clickable video cards that play videos

**Admin Videos Panel:**

* Table listing all videos

* Modal for adding/editing videos

* Delete functionality

### Step 4: YouTube URL Conversion

Convert YouTube URL to embed format:

* `https://www.youtube.com/watch?v=VIDEO_ID` → `https://www.youtube.com/embed/VIDEO_ID`

## Technical Details

### Video Type Interface

```typescript
export interface Video {
  id: string;
  title: string;
  youtube_url: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
```

### Database Table Schema

```sql
CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### YouTube URL Extraction

Extract video ID from various YouTube URL formats:

* `https://www.youtube.com/watch?v=VIDEO_ID`

* `https://youtu.be/VIDEO_ID`

* `https://www.youtube.com/embed/VIDEO_ID`

## Risk Assessment

| Risk                         | Mitigation                        |
| ---------------------------- | --------------------------------- |
| Invalid YouTube URLs         | Validate URL format before saving |
| Performance with many videos | Implement pagination              |
| XSS attacks                  | Sanitize user inputs              |
| Video embedding issues       | Use YouTube's official embed API  |

## Testing Considerations

1. Test video creation with valid/invalid URLs
2. Test video display on homepage (2 videos limit)
3. Test video display on videos page
4. Test admin CRUD operations
5. Test YouTube embed functionality

## Dependencies

* No new external dependencies required

* Uses existing API patterns from products implementation

* Uses existing UI components (Card, Button, Input)

