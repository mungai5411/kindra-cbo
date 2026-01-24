"""
Blog & Public Campaigns Models
Public-facing blog and campaign pages with visitor comments
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from accounts.models import User
import uuid


class Category(models.Model):
    """
    Blog post categories
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    
    # Display order
    order = models.IntegerField(default=0, help_text=_('Display order (lower numbers first)'))
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('category')
        verbose_name_plural = _('categories')
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Tag(models.Model):
    """
    Flexible tagging system for blog posts
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('tag')
        verbose_name_plural = _('tags')
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogPost(models.Model):
    """
    Blog posts and campaign updates
    """
    
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        PUBLISHED = 'PUBLISHED', _('Published')
        ARCHIVED = 'ARCHIVED', _('Archived')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Content
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    excerpt = models.TextField(max_length=500, blank=True, null=True, help_text=_('Brief summary for listings'))
    content = models.TextField(help_text=_('Full blog post content (supports Markdown)'))
    
    # Media
    featured_image = models.ImageField(upload_to='blog/images/', blank=True, null=True)
    featured_image_alt = models.CharField(max_length=200, blank=True, help_text=_('Alt text for accessibility'))
    
    # Categorization
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts')
    
    # SEO
    meta_description = models.CharField(max_length=160, blank=True, help_text=_('SEO meta description'))
    meta_keywords = models.CharField(max_length=255, blank=True, help_text=_('Comma-separated keywords'))
    
    # Social media
    og_image = models.ImageField(upload_to='blog/og_images/', blank=True, null=True, help_text=_('Open Graph image for social sharing'))
    
    # Status and visibility
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    is_featured = models.BooleanField(default=False, help_text=_('Show on homepage'))
    allow_comments = models.BooleanField(default=True)
    
    # Engagement metrics
    view_count = models.IntegerField(default=0)
    
    # Publishing
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='blog_posts')
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('blog post')
        verbose_name_plural = _('blog posts')
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['category']),
            models.Index(fields=['is_featured']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Comment(models.Model):
    """
    Visitor comments on blog posts with moderation
    """
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending Moderation')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')
        SPAM = 'SPAM', _('Spam')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    
    # Commenter information
    name = models.CharField(max_length=100)
    email = models.EmailField()
    website = models.URLField(blank=True)
    
    # Comment content
    content = models.TextField(max_length=1000)
    
    # Moderation
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    moderated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderated_comments')
    moderated_at = models.DateTimeField(null=True, blank=True)
    moderation_note = models.TextField(blank=True)
    
    # Spam detection
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('comment')
        verbose_name_plural = _('comments')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.name} on {self.post.title}"


class Newsletter(models.Model):
    """
    Newsletter subscriptions
    """
    
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        UNSUBSCRIBED = 'UNSUBSCRIBED', _('Unsubscribed')
        BOUNCED = 'BOUNCED', _('Bounced')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    
    # Subscription details
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    source = models.CharField(max_length=100, blank=True, help_text=_('Where they subscribed from'))
    
    class Meta:
        verbose_name = _('newsletter subscription')
        verbose_name_plural = _('newsletter subscriptions')
        ordering = ['-subscribed_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return self.email
class Like(models.Model):
    """
    Likes/Claps on blog posts to track engagement (no spam allowed)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='likes')
    
    # Optional user (for authenticated likes)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='blog_likes')
    
    # Anonymized or literal IP for guest likes and spam prevention
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('like')
        verbose_name_plural = _('likes')
        # Ensure one like per post per user OR per IP
        constraints = [
            models.UniqueConstraint(
                fields=['post', 'user'], 
                name='unique_user_post_like',
                condition=models.Q(user__isnull=False)
            ),
            models.UniqueConstraint(
                fields=['post', 'ip_address'], 
                name='unique_ip_post_like',
                condition=models.Q(user__isnull=True)
            )
        ]

    def __str__(self):
        return f"Like on {self.post.title}"


class TeamMember(models.Model):
    """
    Organization core team members (Visionaries)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=150)
    bio = models.TextField(blank=True)
    image = models.ImageField(upload_to='team/', blank=True, null=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # Social links
    linkedin = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('team member')
        verbose_name_plural = _('team members')
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class MediaAsset(models.Model):
    """
    Centralized media library for the entire system
    """
    class SourceType(models.TextChoices):
        CAMPAIGN = 'CAMPAIGN', _('Campaign')
        STORY = 'STORY', _('Story/Blog')
        SHELTER = 'SHELTER', _('Shelter')
        TEAM = 'TEAM', _('Team Member')
        USER = 'USER', _('User Profile')
        GENERAL = 'GENERAL', _('General/Other')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to='media_library/%Y/%m/')
    alt_text = models.CharField(max_length=255, blank=True)
    
    source_type = models.CharField(max_length=20, choices=SourceType.choices, default=SourceType.GENERAL)
    source_id = models.UUIDField(null=True, blank=True, help_text=_('ID of the related object (e.g. Campaign ID)'))
    
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_media')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('media asset')
        verbose_name_plural = _('media assets')
        ordering = ['-created_at']

    def __str__(self):
        return self.title or self.file.name


class SiteContent(models.Model):
    """
    Dynamic site-wide content (e.g. About page text, Mission/Vision)
    to enable "no-code" updates for non-technical admins.
    """
    class Section(models.TextChoices):
        HERO = 'HERO', _('Hero Section')
        ABOUT = 'ABOUT', _('About Section')
        MISSION_VISION = 'MISSION_VISION', _('Mission & Vision')
        STATS = 'STATS', _('Statistics')
        FOOTER = 'FOOTER', _('Footer Information')
        OTHER = 'OTHER', _('Other')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.SlugField(max_length=100, unique=True, help_text=_('Unique key for fetching content (e.g. "about-story")'))
    section = models.CharField(max_length=50, choices=Section.choices, default=Section.OTHER)
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField(blank=True, help_text=_('Main text content (supports Markdown)'))
    value = models.CharField(max_length=255, blank=True, help_text=_('Short value if needed (e.g. "50+")'))
    image = models.ImageField(upload_to='site_content/', blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('site content')
        verbose_name_plural = _('site contents')
        ordering = ['section', 'key']

    def __str__(self):
        return f"[{self.section}] {self.key}"
