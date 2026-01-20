"""
Blog & Public Campaigns Serializers
"""

from rest_framework import serializers
from django.utils.html import strip_tags
from .models import Category, Tag, BlogPost, Comment, Newsletter, Like


class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')
    
    def get_post_count(self, obj):
        return obj.posts.filter(status='PUBLISHED').count()


class TagSerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'created_at')
    
    def get_post_count(self, obj):
        return obj.posts.filter(status='PUBLISHED').count()


class LikeSerializer(serializers.ModelSerializer):
    """
    Serializer for likes
    """
    class Meta:
        model = Like
        fields = ['id', 'post', 'user', 'ip_address', 'created_at']
        read_only_fields = ('id', 'user', 'ip_address', 'created_at')


class BlogPostListSerializer(serializers.ModelSerializer):
    """
    Serializer for blog post listings (summary view)
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    has_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image', 'featured_image_alt',
            'category', 'category_name', 'tags', 'status', 'is_featured',
            'view_count', 'author', 'author_name', 'published_at',
            'created_at', 'updated_at', 'comment_count', 'likes_count', 'has_liked'
        ]
        read_only_fields = ('id', 'slug', 'view_count', 'author', 'created_at', 'updated_at')
    
    def get_comment_count(self, obj):
        return obj.comments.filter(status='APPROVED').count()

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_has_liked(self, obj):
        request = self.context.get('request')
        if not request:
            return False
            
        if request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        
        ip_address = request.META.get('REMOTE_ADDR')
        return obj.likes.filter(ip_address=ip_address, user__isnull=True).exists()


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for full blog post detail view
    """
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=False,
        allow_null=True
    )
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(), 
        write_only=True, 
        source='tags',
        required=False
    )
    has_liked = serializers.SerializerMethodField()
    excerpt = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'view_count', 'author', 'created_at', 'updated_at')
        extra_kwargs = {
            'featured_image': {'required': False, 'allow_null': True},
            'excerpt': {'required': False, 'allow_blank': True, 'allow_null': True},
            'tag_ids': {'required': False},
        }

    def get_comment_count(self, obj):
        return obj.comments.filter(status='APPROVED').count()

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_has_liked(self, obj):
        request = self.context.get('request')
        if not request:
            return False
            
        if request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        
        ip_address = request.META.get('REMOTE_ADDR')
        return obj.likes.filter(ip_address=ip_address, user__isnull=True).exists()


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for comments
    """
    post_title = serializers.CharField(source='post.title', read_only=True)
    moderated_by_name = serializers.CharField(source='moderated_by.get_full_name', read_only=True)
    
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = (
            'id', 'status', 'moderated_by', 'moderated_at', 
            'moderation_note', 'created_at', 'updated_at'
        )


class CommentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating comments (public)
    """
    
    class Meta:
        model = Comment
        fields = ['post', 'name', 'email', 'website', 'content']

    def validate_name(self, value):
        value = strip_tags(value or '').strip()
        if not value:
            raise serializers.ValidationError('Name is required.')
        if len(value) > 100:
            raise serializers.ValidationError('Name is too long.')
        return value

    def validate_website(self, value):
        if not value:
            return value
        if len(value) > 200:
            raise serializers.ValidationError('Website URL is too long.')
        return value

    def validate_content(self, value):
        value = strip_tags(value or '').strip()
        if not value:
            raise serializers.ValidationError('Content is required.')
        if len(value) > 1000:
            raise serializers.ValidationError('Content is too long.')
        return value


class CommentModerationSerializer(serializers.ModelSerializer):
    """
    Serializer for moderating comments (admin)
    """
    
    class Meta:
        model = Comment
        fields = ['status', 'moderation_note']


class NewsletterSerializer(serializers.ModelSerializer):
    """
    Serializer for newsletter subscriptions
    """
    
    class Meta:
        model = Newsletter
        fields = '__all__'
        read_only_fields = (
            'id', 'status', 'subscribed_at', 'unsubscribed_at',
            'is_verified', 'verification_token', 'verified_at'
        )


class NewsletterSubscribeSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for public newsletter subscription
    """
    
    class Meta:
        model = Newsletter
        fields = ['email', 'name']

    def validate_name(self, value):
        value = strip_tags(value or '').strip()
        if len(value) > 100:
            raise serializers.ValidationError('Name is too long.')
        return value

