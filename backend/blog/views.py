"""
Blog & Public Campaigns Views
"""

from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import Category, Tag, BlogPost, Comment, Newsletter
from .serializers import (
    CategorySerializer, TagSerializer, BlogPostListSerializer,
    BlogPostDetailSerializer, CommentSerializer, CommentCreateSerializer,
    CommentModerationSerializer, NewsletterSerializer, NewsletterSubscribeSerializer
)
from accounts.permissions import IsAdminManagementOrSocialMedia


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission: Read-only for everyone, write for staff only
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class CategoryListView(generics.ListAPIView):
    """
    Public list of active categories
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class TagListView(generics.ListAPIView):
    """
    Public list of all tags
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]


class CategoryAdminListCreateView(generics.ListCreateAPIView):
    """
    Admin view for managing all categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminManagementOrSocialMedia]


class CategoryAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin view for managing individual categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminManagementOrSocialMedia]


class TagAdminListCreateView(generics.ListCreateAPIView):
    """
    Admin view for managing all tags
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminManagementOrSocialMedia]


class TagAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin view for managing individual tags
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminManagementOrSocialMedia]


class BlogPostPublicListView(generics.ListAPIView):
    """
    Public list of published blog posts
    """
    serializer_class = BlogPostListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'tags', 'is_featured']
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'view_count']
    ordering = ['-published_at']
    
    def get_queryset(self):
        return BlogPost.objects.filter(
            status='PUBLISHED',
            published_at__lte=timezone.now()
        ).select_related('category', 'author').prefetch_related('tags')


class BlogPostPublicDetailView(generics.RetrieveAPIView):
    """
    Public detail view of a published blog post
    Increments view count on each access
    """
    serializer_class = BlogPostDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return BlogPost.objects.filter(
            status='PUBLISHED',
            published_at__lte=timezone.now()
        ).select_related('category', 'author').prefetch_related('tags')
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BlogPostAdminListCreateView(generics.ListCreateAPIView):
    """
    Admin view for managing all blog posts
    """
    queryset = BlogPost.objects.all().select_related('category', 'author').prefetch_related('tags')
    serializer_class = BlogPostDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminManagementOrSocialMedia]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category', 'is_featured', 'author']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'published_at', 'view_count']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class BlogPostAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin view for managing individual blog posts
    """
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminManagementOrSocialMedia]


class CommentListView(generics.ListAPIView):
    """
    Public list of approved comments for a blog post
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        post_slug = self.kwargs.get('post_slug')
        return Comment.objects.filter(
            post__slug=post_slug,
            status='APPROVED'
        ).select_related('post').order_by('-created_at')


class CommentCreateView(generics.CreateAPIView):
    """
    Public endpoint for creating comments (requires moderation)
    """
    serializer_class = CommentCreateSerializer
    permission_classes = [permissions.AllowAny]
    
    def perform_create(self, serializer):
        # Capture IP address for spam detection
        ip_address = self.request.META.get('REMOTE_ADDR')
        user_agent = self.request.META.get('HTTP_USER_AGENT', '')
        serializer.save(ip_address=ip_address, user_agent=user_agent)


class CommentAdminListView(generics.ListAPIView):
    """
    Admin view for all comments with filtering
    """
    queryset = Comment.objects.all().select_related('post', 'moderated_by')
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminManagementOrSocialMedia]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'post']
    ordering_fields = ['created_at', 'moderated_at']
    ordering = ['-created_at']


class CommentModerationView(generics.UpdateAPIView):
    """
    Admin endpoint for moderating comments
    """
    queryset = Comment.objects.all()
    serializer_class = CommentModerationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminManagementOrSocialMedia]
    
    def perform_update(self, serializer):
        serializer.save(
            moderated_by=self.request.user,
            moderated_at=timezone.now()
        )


class NewsletterSubscribeView(generics.CreateAPIView):
    """
    Public endpoint for newsletter subscription
    """
    serializer_class = NewsletterSubscribeSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Capture IP address
        ip_address = request.META.get('REMOTE_ADDR')
        
        # Check if email already exists
        email = serializer.validated_data['email']
        existing = Newsletter.objects.filter(email=email).first()
        
        if existing:
            if existing.status == 'UNSUBSCRIBED':
                # Reactivate subscription
                existing.status = 'ACTIVE'
                existing.name = serializer.validated_data.get('name', existing.name)
                existing.ip_address = ip_address
                existing.save()
                return Response(
                    {'message': 'Welcome back! Your subscription has been reactivated.'},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'message': 'This email is already subscribed.'},
                    status=status.HTTP_200_OK
                )
        
        # Create new subscription
        serializer.save(ip_address=ip_address, source='blog_page')
        return Response(
            {'message': 'Successfully subscribed to newsletter!'},
            status=status.HTTP_201_CREATED
        )


class NewsletterAdminListView(generics.ListAPIView):
    """
    Admin view for newsletter subscriptions
    """
    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminManagementOrSocialMedia]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'is_verified']
    search_fields = ['email', 'name']
    ordering = ['-subscribed_at']
