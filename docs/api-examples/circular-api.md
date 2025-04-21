# Circular API Examples

This document contains cURL commands for testing the Circular API endpoints.

## Authentication

Replace `YOUR_ADMIN_TOKEN` and `YOUR_USER_TOKEN` with actual JWT tokens for admin and user authentication respectively.

## Admin Endpoints

### Create a new circular

```bash
curl -X POST \
  http://localhost:3000/api/circulars \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -d '{
    "title": "New Gold Scheme Announcement",
    "content": "We are excited to announce our new gold savings scheme with improved benefits...",
    "startDate": "2023-07-10T00:00:00.000Z",
    "endDate": "2023-08-10T23:59:59.000Z",
    "isActive": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Circular created successfully",
  "data": {
    "id": 1,
    "title": "New Gold Scheme Announcement",
    "content": "We are excited to announce our new gold savings scheme with improved benefits...",
    "startDate": "2023-07-10T00:00:00.000Z",
    "endDate": "2023-08-10T23:59:59.000Z",
    "isActive": true,
    "is_deleted": false,
    "createdAt": "2023-07-10T09:15:22.532Z",
    "updatedAt": "2023-07-10T09:15:22.532Z"
  }
}
```

### Get all circulars (with pagination)

```bash
curl -X GET \
  'http://localhost:3000/api/circulars?page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "title": "New Gold Scheme Announcement",
        "content": "We are excited to announce our new gold savings scheme with improved benefits...",
        "startDate": "2023-07-10T00:00:00.000Z",
        "endDate": "2023-08-10T23:59:59.000Z",
        "isActive": true,
        "is_deleted": false,
        "createdAt": "2023-07-10T09:15:22.532Z",
        "updatedAt": "2023-07-10T09:15:22.532Z"
      }
    ],
    "pagination": {
      "totalItems": 1,
      "totalPages": 1,
      "currentPage": 1,
      "itemsPerPage": 10,
      "hasNext": false,
      "hasPrevious": false
    }
  }
}
```

### Get active circulars

```bash
curl -X GET \
  'http://localhost:3000/api/circulars/active/list?page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "title": "New Gold Scheme Announcement",
        "content": "We are excited to announce our new gold savings scheme with improved benefits...",
        "startDate": "2023-07-10T00:00:00.000Z",
        "endDate": "2023-08-10T23:59:59.000Z",
        "isActive": true,
        "is_deleted": false,
        "createdAt": "2023-07-10T09:15:22.532Z",
        "updatedAt": "2023-07-10T09:15:22.532Z"
      }
    ],
    "pagination": {
      "totalItems": 1,
      "totalPages": 1,
      "currentPage": 1,
      "itemsPerPage": 10,
      "hasNext": false,
      "hasPrevious": false
    }
  }
}
```

### Update a circular

```bash
curl -X PUT \
  http://localhost:3000/api/circulars/1 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -d '{
    "title": "Updated Gold Scheme Announcement",
    "content": "We are excited to announce our new gold savings scheme with even better benefits...",
    "endDate": "2023-09-10T23:59:59.000Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Circular updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Gold Scheme Announcement",
    "content": "We are excited to announce our new gold savings scheme with even better benefits...",
    "startDate": "2023-07-10T00:00:00.000Z",
    "endDate": "2023-09-10T23:59:59.000Z",
    "isActive": true,
    "is_deleted": false,
    "createdAt": "2023-07-10T09:15:22.532Z",
    "updatedAt": "2023-07-10T10:25:43.123Z"
  }
}
```

### Get a specific circular

```bash
curl -X GET \
  http://localhost:3000/api/circulars/1 \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Gold Scheme Announcement",
    "content": "We are excited to announce our new gold savings scheme with even better benefits...",
    "startDate": "2023-07-10T00:00:00.000Z",
    "endDate": "2023-09-10T23:59:59.000Z",
    "isActive": true,
    "is_deleted": false,
    "createdAt": "2023-07-10T09:15:22.532Z",
    "updatedAt": "2023-07-10T10:25:43.123Z"
  }
}
```

### Get view count for a circular

```bash
curl -X GET \
  http://localhost:3000/api/circulars/1/view-count \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 1
  }
}
```

### Get detailed view information for a circular

```bash
curl -X GET \
  'http://localhost:3000/api/circulars/1/view-details?page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "userId": "user123",
        "circularId": 1,
        "viewedAt": "2023-07-11T14:32:10.543Z",
        "createdAt": "2023-07-11T14:32:10.543Z",
        "updatedAt": "2023-07-11T14:32:10.543Z",
        "user": {
          "id": "user123",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phoneNumber": "+1234567890",
          "userId": "HS-000123"
        }
      }
    ],
    "pagination": {
      "totalItems": 1,
      "totalPages": 1,
      "currentPage": 1,
      "itemsPerPage": 10,
      "hasNext": false,
      "hasPrevious": false
    }
  }
}
```

### Delete a circular

```bash
curl -X DELETE \
  http://localhost:3000/api/circulars/1 \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

**Response:**
```json
{
  "success": true,
  "message": "Circular deleted successfully",
  "data": null
}
```

## User Endpoints

### Get user's circulars with viewed status

```bash
curl -X GET \
  'http://localhost:3000/api/circulars/my/list?page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_USER_TOKEN'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "title": "Updated Gold Scheme Announcement",
        "content": "We are excited to announce our new gold savings scheme with even better benefits...",
        "startDate": "2023-07-10T00:00:00.000Z",
        "endDate": "2023-09-10T23:59:59.000Z",
        "isActive": true,
        "is_deleted": false,
        "createdAt": "2023-07-10T09:15:22.532Z",
        "updatedAt": "2023-07-10T10:25:43.123Z",
        "viewed": false,
        "viewedAt": null
      }
    ],
    "pagination": {
      "totalItems": 1,
      "totalPages": 1,
      "currentPage": 1,
      "itemsPerPage": 10,
      "hasNext": false,
      "hasPrevious": false
    }
  }
}
```

### Mark a circular as viewed

```bash
curl -X POST \
  http://localhost:3000/api/circulars/1/view \
  -H 'Authorization: Bearer YOUR_USER_TOKEN'
```

**Response:**
```json
{
  "success": true,
  "message": "Circular marked as viewed",
  "data": {
    "id": 1,
    "userId": "user123",
    "circularId": 1,
    "viewedAt": "2023-07-11T14:32:10.543Z",
    "createdAt": "2023-07-11T14:32:10.543Z",
    "updatedAt": "2023-07-11T14:32:10.543Z"
  }
}
```

## Error Responses

### Unauthorized access

```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "details": "User ID not found in token"
  }
}
```

### Invalid pagination parameters

```json
{
  "success": false,
  "error": {
    "message": "Page must be a positive number",
    "details": "Invalid pagination parameters"
  }
}
```

### Resource not found

```json
{
  "success": false,
  "error": {
    "message": "Circular not found",
    "details": "No circular found with ID: 999"
  }
}
```

### Missing required fields

```json
{
  "success": false,
  "error": {
    "message": "Missing required fields",
    "details": "Title, content, startDate, and endDate are required"
  }
} 