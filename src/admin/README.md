# Admin Portal

Professional admin dashboard for the Intentional wellness platform.

## Structure

```
admin/
├── components/       # Reusable admin components
│   └── AdminProtectedRoute.tsx
├── contexts/        # Admin-specific contexts
│   └── AdminAuthContext.tsx
├── hooks/           # Admin-specific hooks
├── layouts/         # Admin layout components
│   └── AdminLayout.tsx
├── lib/            # Admin utilities and API
│   └── adminApi.ts
└── pages/          # Admin page components
    ├── AdminLogin.tsx
    ├── AdminDashboard.tsx
    └── UsersManagement.tsx
```

## Features

- **Separate Authentication**: Uses token-based auth (not Firebase)
- **Persistent Sidebar**: Navigation stays visible across all pages
- **Dashboard**: Overview stats and metrics
- **User Management**: View, search, and manage users
- **Data Tables**: Paginated tables for all resources
- **Responsive**: Mobile-friendly with collapsible sidebar

## Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Main dashboard
- `/admin/users` - User management
- `/admin/meals` - Meals tracking overview
- `/admin/journal` - Journal entries overview
- `/admin/water` - Water tracking stats
- `/admin/analytics` - Platform analytics
- `/admin/settings` - Admin settings

## Authentication

Admin auth is completely separate from user Firebase auth:

- Tokens stored in `localStorage` as `admin_token`
- API calls automatically include admin token
- Protected routes redirect to `/admin/login` if not authenticated

## API Integration

Uses the same backend as the main app with admin-specific endpoints:

```typescript
// Example API call
const users = await adminApiService.users.getAll({ page: 1, limit: 20 });
```

## Development Notes

1. Admin endpoints need to be implemented in the backend
2. Currently using mock data for demonstration
3. Add proper role-based permissions in backend
4. Implement admin user seeding in database

## Next Steps

- [ ] Implement backend admin endpoints
- [ ] Add role-based access control
- [ ] Create admin user seeder
- [ ] Build remaining management pages
- [ ] Add charts and analytics
- [ ] Implement audit logs
