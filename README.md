# 🌟 Kindra CBO Management System

A comprehensive web-based platform for managing Community-Based Organizations (CBOs) focused on child welfare, donations, volunteer coordination, and case management.

## 🚀 Live Demo

- **Frontend**: [https://kindra-cbo.vercel.app](https://kindra-cbo.vercel.app) *(coming soon)*
- **Backend API**: [https://kindra-backend.onrender.com](https://kindra-backend.onrender.com) *(coming soon)*
- **Admin Panel**: [https://kindra-backend.onrender.com/admin](https://kindra-backend.onrender.com/admin) *(coming soon)*

## 📋 Features

### For Admins
- **Dashboard Analytics**: Real-time insights and statistics
- **Case Management**: Track and manage child welfare cases
- **Shelter Coordination**: Manage shelter homes and resources
- **Volunteer Management**: Recruit, assign, and track volunteers
- **Donation Processing**: Handle donations via M-Pesa, PayPal, Stripe
- **Reporting**: Generate comprehensive reports
- **User Management**: Role-based access control

### For Donors
- **Secure Donations**: Multiple payment methods
- **Impact Tracking**: See where your money goes
- **Tax Receipts**: Automated email receipts
- **Transparency**: View fund allocation and impact

### For Volunteers
- **Event Management**: View and join events
- **Hour Tracking**: Log volunteer hours
- **Group Communication**: Chat with team members
- **Task Assignment**: Get assigned to specific needs

### For Public
- **Blog/News**: Stay updated on CBO activities
- **Transparency**: View public statistics
- **Easy Registration**: Quick sign-up process

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Charts**: Recharts + MUI X-Charts
- **Routing**: React Router v6
- **Animations**: Framer Motion

### Backend
- **Framework**: Django 5 + Django REST Framework
- **Authentication**: JWT (SimpleJWT)
- **Database**: PostgreSQL (production) / SQLite (development)
- **Cache**: Redis
- **Task Queue**: Celery
- **File Storage**: Cloudinary
- **Email**: SendGrid
- **Payments**: M-Pesa, PayPal, Stripe

### Infrastructure
- **Frontend Hosting**: Vercel (Free)
- **Backend Hosting**: Render (Free)
- **Database**: Neon PostgreSQL (Free)
- **Cache**: Upstash Redis (Free)
- **File Storage**: Cloudinary (Free)
- **Monitoring**: Sentry + UptimeRobot (Free)

## 🏁 Quick Start - Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp ../.env.example .env

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### Frontend Setup

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 🌐 Deployment

### Quick Deploy (30 minutes)

**Full deployment guide**: See [QUICK_START_DEPLOY.md](QUICK_START_DEPLOY.md)

**Summary**:
1. Push code to GitHub
2. Sign up for free services (Neon, Upstash, Cloudinary)
3. Deploy backend on Render
4. Deploy frontend on Vercel
5. Test and go live!

**Total Cost**: $0/month (free tier)

### Detailed Documentation
- **Deployment Guide**: `.gemini/antigravity/brain/.../deployment_guide.md`
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Quick Start**: [QUICK_START_DEPLOY.md](QUICK_START_DEPLOY.md)

## 📚 Documentation

### Project Structure
```
kindra/
├── backend/              # Django backend
│   ├── accounts/         # User authentication
│   ├── case_management/  # Case tracking
│   ├── donations/        # Payment processing
│   ├── shelter_homes/    # Shelter coordination
│   ├── volunteers/       # Volunteer management
│   ├── reporting/        # Analytics & reports
│   ├── blog/            # Blog/news
│   └── social_chat/     # Messaging
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── features/    # Feature modules
│   │   ├── store/       # Redux store
│   │   └── services/    # API services
├── nginx/               # Nginx config
├── docs/                # Documentation
└── scripts/             # Utility scripts
```

### API Documentation
- **Swagger UI**: `http://localhost:8000/api/schema/swagger-ui/`
- **ReDoc**: `http://localhost:8000/api/schema/redoc/`

## 🔒 Security Features

✅ HTTPS/SSL encryption
✅ JWT authentication with token rotation
✅ Rate limiting & DDoS protection
✅ CSRF protection
✅ XSS protection
✅ SQL injection prevention
✅ Secure password hashing (PBKDF2)
✅ Role-based access control
✅ Audit logging
✅ Secure file uploads
✅ Environment variable protection

## 🧪 Testing

### Backend Tests
```powershell
cd backend
python manage.py test
```

### Frontend Tests
```powershell
cd frontend
npm run test
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: [Your Name]
- **Organization**: Kindra CBO
- **Contact**: info@kindra.org

## 🆘 Support

- **Email**: support@kindra.org
- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/kindra-cbo/issues)

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Core authentication system
- [x] Dashboard analytics
- [x] Case management
- [x] Donation processing
- [x] Volunteer coordination
- [x] Social chat features

### Phase 2 (Planned)
- [ ] Mobile app (React Native)
- [ ] WhatsApp integration
- [ ] AI-powered case recommendations
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Blockchain donation tracking

### Phase 3 (Future)
- [ ] Grant management
- [ ] Event ticketing
- [ ] Crowdfunding campaigns
- [ ] Video calls/conferencing
- [ ] Document management system

## 📊 Statistics

- **Users**: Growing daily
- **Donations Processed**: Counting...
- **Children Helped**: Making a difference
- **Volunteers**: Building community

## 🙏 Acknowledgments

- Material-UI for the beautiful components
- Django & DRF for the robust backend
- Vercel & Render for free hosting
- All our contributors and supporters

---

**Built with ❤️ for children in need**

*Empowering CBOs to make a bigger impact*
