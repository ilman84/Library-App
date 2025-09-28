# 📚 Library Management System

A modern, responsive library management system built with Next.js 15, TypeScript, and Tailwind CSS. Features a beautiful user interface with smooth animations, comprehensive admin dashboard, and full CRUD operations for library management.

![Library App](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-0055FF?style=for-the-badge&logo=framer)

## ✨ Features

### 🔐 Authentication & Authorization

- User registration and login system
- Role-based access control (User/Admin)
- Secure JWT token authentication
- Protected routes and middleware

### 📖 Book Management

- Comprehensive book catalog with search and filtering
- Book details with cover images, descriptions, and ratings
- Category-based book organization
- Author information and book relationships
- Real-time book availability status

### 🛒 Borrowing System

- Intuitive book borrowing process
- Shopping cart functionality
- Checkout system with user information
- Loan duration selection (3, 5, or 10 days)
- Return date calculation and tracking

### 👨‍💼 Admin Dashboard

- Complete CRUD operations for books, authors, and categories
- User management and loan tracking
- Statistics and analytics overview
- Bulk operations and data management
- Responsive admin interface

### 🎨 User Experience

- Fully responsive design (Mobile & Desktop)
- Beautiful animations with Framer Motion
- Smooth transitions and hover effects
- Modern UI with ShadCN components
- Intuitive navigation and user flow

### 🔄 Real-time Features

- Live data updates with TanStack Query
- Optimistic updates for better UX
- Error handling and loading states
- Cache management and synchronization

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **ShadCN UI** - Modern component library

### State Management

- **Redux Toolkit** - Global state management
- **TanStack Query** - Server state management
- **React Context** - Authentication context

### Backend Integration

- **RESTful API** - Backend communication
- **JWT Authentication** - Secure token-based auth
- **Error Handling** - Comprehensive error management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/library-management-system.git
   cd library-management-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Update the environment variables in `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=https://your-api-url.com/api
   NEXT_PUBLIC_APP_NAME=Library Management System
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Screenshots

### Desktop View

- **Hero Section** with animated characters and floating books
- **Book Catalog** with search and filtering
- **Admin Dashboard** with comprehensive management tools

### Mobile View

- **Responsive Design** optimized for mobile devices
- **Touch-friendly Interface** with smooth interactions
- **Mobile Navigation** with hamburger menu

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── components/        # Reusable components
│   ├── checkout/          # Checkout process
│   ├── detail/            # Book detail pages
│   └── profile/           # User profile pages
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and API
├── store/                 # Redux store and slices
└── types/                 # TypeScript type definitions
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run format       # Format code with Prettier

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🎯 Key Features in Detail

### Hero Section Animation

- Floating clouds with smooth movement
- Animated characters (Girl and Boy) with different timing
- Floating books with gentle swaying motion
- Carousel text with 4 different messages

### Admin Dashboard

- **Books Management**: Add, edit, delete books with cover image upload
- **Authors Management**: Full CRUD operations for authors
- **Categories Management**: Organize books by categories
- **User Management**: View and manage user accounts
- **Loan Tracking**: Monitor active and overdue loans

### Responsive Design

- Mobile-first approach
- Breakpoints: 393px (mobile), 768px (tablet), 1024px (desktop)
- Touch-friendly interface for mobile devices
- Optimized images and performance

## 🔐 Authentication Flow

1. **Registration**: Users can create accounts with email and password
2. **Login**: Secure authentication with JWT tokens
3. **Protected Routes**: Automatic redirection for unauthorized access
4. **Role-based Access**: Different interfaces for users and admins

## 📊 API Integration

The application integrates with a RESTful API providing:

- User authentication and management
- Book catalog and search
- Author and category management
- Loan tracking and management
- Admin dashboard data

## 🎨 Design System

### Colors

- Primary: `#3b82f6` (Blue)
- Secondary: `#87CEEB` (Sky Blue)
- Background: `#E0F6FF` (Light Blue)
- Text: `#0a0d12` (Dark Gray)

### Typography

- Font Family: Quicksand (Google Fonts)
- Responsive font sizes
- Consistent spacing and hierarchy

### Components

- ShadCN UI components
- Custom styled components
- Responsive grid system
- Interactive elements with hover states

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Other Platforms

- **Netlify**: Static site deployment
- **Railway**: Full-stack deployment
- **AWS**: Container-based deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [ShadCN UI](https://ui.shadcn.com/) for beautiful components
- [TanStack Query](https://tanstack.com/query) for server state management

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

**Made with ❤️ for modern library management**
