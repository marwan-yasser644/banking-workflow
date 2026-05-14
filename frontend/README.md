<<<<<<< HEAD
# BankFlow - Banking Workflow System Frontend

A modern, production-grade React frontend for a banking workflow management system. Built with React, TypeScript, Vite, Tailwind CSS, and enterprise best practices.

## 🚀 Features

- **Complete Dashboard** - KPI cards, charts, and analytics
- **Loan Request Management** - Create, view, filter, and manage loan requests
- **Workflow Tracking** - Visual workflow progress tracking with approval steps
- **User Management** - System user administration with role-based access
- **Notifications** - Real-time notifications with filtering
- **Reports** - Generate and view system reports with visualizations
- **Audit Logs** - Complete activity logging and compliance tracking
- **Settings** - User preferences and account management
- **Authentication** - JWT-based auth with protected routes
- **Dark Mode** - Full dark mode support
- **Responsive Design** - Mobile-first, fully responsive UI
- **Type Safe** - Full TypeScript support

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

## 🛠️ Installation

1. **Extract the project**
```bash
unzip banking-workflow-frontend.zip
cd banking-workflow-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` if your API is running on a different URL:
```
VITE_API_URL=http://localhost:8000
```

## 🎯 Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🔐 Demo Credentials

Use these credentials to login:
- **Email**: demo@bank.com
- **Password**: demo123

## 📦 Build for Production

Build the optimized production bundle:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── app/              # Global app state (Zustand store)
├── components/       # Reusable UI components
│   ├── ui/          # shadcn-style base components
│   └── common/      # Common layout components
├── features/        # Feature-specific modules
├── layouts/         # Layout wrappers
├── pages/           # Page components
├── routes/          # Routing logic
├── services/        # API services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── constants/       # Constants and mock data
└── App.tsx          # Main app component
```

## 🔌 Backend Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000`.

### Key API Endpoints Used:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `GET /requests` - List loan requests
- `POST /requests` - Create new request
- `PUT /requests/{id}` - Update request
- `GET /dashboard/stats` - Dashboard statistics
- `GET /dashboard/time-series` - Time series data
- `GET /users` - List users
- `GET /notifications` - Get notifications
- `GET /audit-logs` - Get audit logs

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:
```javascript
colors: {
  bank: {
    navy: "#0f2d5e",
    blue: "#1a56db",
    // ... more colors
  }
}
```

### Fonts
Google Fonts are imported in `index.html`. Modify the font imports or change `tailwind.config.js`:
```javascript
fontFamily: {
  sans: ["'DM Sans'", "sans-serif"],
  display: ["'Sora'", "sans-serif"],
  mono: ["'JetBrains Mono'", "monospace"],
}
```

## 📚 Key Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Query** - Data fetching
- **Axios** - HTTP client
- **Zustand** - State management
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Radix UI** - Headless UI components
- **shadcn/ui** - Component library

## 🔒 Security Features

- JWT token management
- Protected routes
- Automatic token refresh
- Secure logout
- Role-based access control (RBAC)
- XSS protection via React
- CSRF token support (ready)

## 📊 Mock Data

The app includes comprehensive mock data for development:
- 8 sample loan requests
- Dashboard statistics
- Time series data
- Risk distributions
- Audit logs
- Notifications

Toggle between real API and mock data in services.

## 🚦 State Management

Uses Zustand for simple, scalable state management:
```typescript
const { user, token, isDarkMode, toggleDarkMode } = useAuthStore()
```

## 🎯 API Client

Centralized Axios instance with interceptors for:
- Authentication headers
- Error handling
- Token refresh
- Request/response transformation

Located in `src/services/apiClient.ts`

## 📝 Conventions

- **Components**: PascalCase (e.g., `DashboardCard.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Types**: PascalCase with `.d.ts` or in `types/index.ts`
- **Imports**: Use `@/` alias for src imports

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3001
```

### API connection errors
- Ensure backend is running on `http://localhost:8000`
- Check VITE_API_URL in `.env`
- Check CORS settings on backend

### Dependencies issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is part of the BankFlow system.

## 🤝 Support

For issues or questions:
1. Check the documentation
2. Review the code comments
3. Check backend API documentation
4. Verify environment variables

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/)
- [React Query Docs](https://tanstack.com/query/latest)

---

**Built with ❤️ for efficient banking workflows**
=======
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
>>>>>>> 2c26bb1eb455214f77113d5d43609d94c252cf3c
