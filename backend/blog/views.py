"""
Blog & Public Campaigns Views
"""

from rest_framework import generics, permissions, status, throttling
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import Category, Tag, BlogPost, Comment, Newsletter, Like, TeamMember, MediaAsset, SiteContent
from .serializers import (
    CategorySerializer, TagSerializer, BlogPostListSerializer,
    BlogPostDetailSerializer, CommentSerializer, CommentCreateSerializer,
    CommentModerationSerializer, NewsletterSerializer, NewsletterSubscribeSerializer,
    LikeSerializer, TeamMemberSerializer, MediaAssetSerializer, SiteContentSerializer
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
    Includes anti-spam logic
    """
    serializer_class = CommentCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.AnonRateThrottle, throttling.UserRateThrottle]
    
    def perform_create(self, serializer):
        # Capture IP address for spam detection
        ip_address = self.request.META.get('REMOTE_ADDR')
        user_agent = self.request.META.get('HTTP_USER_AGENT', '')
        
        # Anti-spam: check for duplicate content from same IP within last hour
        one_hour_ago = timezone.now() - timezone.timedelta(hours=1)
        is_duplicate = Comment.objects.filter(
            ip_address=ip_address,
            content=serializer.validated_data['content'],
            created_at__gte=one_hour_ago
        ).exists()
        
        if is_duplicate:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You have already posted this comment recently.")
            
        serializer.save(ip_address=ip_address, user_agent=user_agent)


class PostLikeView(generics.GenericAPIView):
    """
    Endpoint for liking/unliking a blog post
    One like per user or IP address
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LikeSerializer
    throttle_classes = [throttling.AnonRateThrottle, throttling.UserRateThrottle]

    def post(self, request, slug):
        try:
            post = BlogPost.objects.get(slug=slug, status='PUBLISHED')
        except BlogPost.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        ip_address = request.META.get('REMOTE_ADDR')
        user = request.user if request.user.is_authenticated else None

        # Check for existing like
        if user:
            existing_like = Like.objects.filter(post=post, user=user).first()
        else:
            existing_like = Like.objects.filter(post=post, ip_address=ip_address, user__isnull=True).first()

        if existing_like:
            # Unlike if already liked
            existing_like.delete()
            return Response({
                'liked': False, 
                'likes_count': post.likes.count()
            }, status=status.HTTP_200_OK)
        
        # Create new like
        Like.objects.create(post=post, user=user, ip_address=ip_address)
        return Response({
            'liked': True, 
            'likes_count': post.likes.count()
        }, status=status.HTTP_201_CREATED)


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


class CommentAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin endpoint for moderating (update/delete) comments
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


# Image Management Endpoints
from rest_framework.decorators import api_view, permission_classes


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated, IsAdminManagementOrSocialMedia])
def delete_blog_post_featured_image(request, pk):
    """Delete featured image from a blog post"""
    try:
        post = BlogPost.objects.get(pk=pk)
        
        # Check if user has permission (post author or admin/management)
        if not (request.user.is_staff or post.author == request.user):
            return Response(
                {'error': 'You do not have permission to edit this post'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not post.featured_image:
            return Response(
                {'error': 'No featured image to delete'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Import here to avoid circular import
        from accounts.image_utils import delete_cloudinary_image
        
        # Delete from Cloudinary if using cloud storage
        if hasattr(post.featured_image, 'url'):
            delete_cloudinary_image(post.featured_image.url)
        
        # Clear the field
        post.featured_image = None
        post.save()
        
        return Response({'success': True, 'message': 'Featured image deleted successfully'})
    except BlogPost.DoesNotExist:
        return Response(
            {'error': 'Blog post not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to delete image: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated, IsAdminManagementOrSocialMedia])
def delete_blog_post_og_image(request, pk):
    """Delete OG (Open Graph) image from a blog post"""
    try:
        post = BlogPost.objects.get(pk=pk)
        
        # Check if user has permission (post author or admin/management)
        if not (request.user.is_staff or post.author == request.user):
            return Response(
                {'error': 'You do not have permission to edit this post'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not post.og_image:
            return Response(
                {'error': 'No OG image to delete'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from accounts.image_utils import delete_cloudinary_image
        
        if hasattr(post.og_image, 'url'):
            delete_cloudinary_image(post.og_image.url)
        
        post.og_image = None
        post.save()
        
        return Response({'success': True, 'message': 'OG image deleted successfully'})
    except BlogPost.DoesNotExist:
        return Response(
            {'error': 'Blog post not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to delete OG image: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
from rest_framework import viewsets


class TeamMemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing team members
    """
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_active']
    ordering_fields = ['order', 'name']
    ordering = ['order']


class MediaAssetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for centralized media library management
    """
    queryset = MediaAsset.objects.all().select_related('uploaded_by')
    serializer_class = MediaAssetSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminManagementOrSocialMedia]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['source_type', 'uploaded_by']
    search_fields = ['title', 'alt_text']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=False, methods=['get'])
    def gallery(self, request):
        """Public gallery view (SAFE_METHODS)"""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class SiteContentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing site-wide dynamic content (No-Code Hub)
    """
    queryset = SiteContent.objects.all()
    serializer_class = SiteContentSerializer
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['section', 'is_active']
    search_fields = ['key', 'title', 'content']
    ordering_fields = ['section', 'key']
    ordering = ['section', 'key']
    lookup_field = 'key'
