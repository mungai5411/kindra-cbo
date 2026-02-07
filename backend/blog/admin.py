"""
Blog & Public Campaigns Admin Configuration
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Tag, BlogPost, Comment, Newsletter, TeamMember, MediaAsset, SiteContent


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order', 'is_active', 'post_count', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order', 'name')
    
    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = 'Posts'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'post_count', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('name',)
    
    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = 'Posts'


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'category', 'status', 'is_featured', 
        'author', 'view_count', 'published_at', 'created_at'
    )
    list_filter = ('status', 'is_featured', 'category', 'created_at', 'published_at')
    search_fields = ('title', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tags',)
    date_hierarchy = 'published_at'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'excerpt', 'content', 'author')
        }),
        ('Media', {
            'fields': ('featured_image', 'featured_image_alt', 'og_image')
        }),
        ('Categorization', {
            'fields': ('category', 'tags')
        }),
        ('SEO', {
            'fields': ('meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
        ('Publishing', {
            'fields': ('status', 'is_featured', 'allow_comments', 'published_at')
        }),
        ('Metrics', {
            'fields': ('view_count',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('view_count',)
    
    def save_model(self, request, obj, form, change):
        if not obj.author_id:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'post', 'status', 'created_at', 
        'moderated_by', 'moderated_at'
    )
    list_filter = ('status', 'created_at', 'moderated_at')
    search_fields = ('name', 'email', 'content', 'post__title')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Comment', {
            'fields': ('post', 'name', 'email', 'website', 'content')
        }),
        ('Moderation', {
            'fields': ('status', 'moderation_note', 'moderated_by', 'moderated_at')
        }),
        ('Metadata', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('moderated_by', 'moderated_at', 'ip_address', 'user_agent')
    
    actions = ['approve_comments', 'reject_comments', 'mark_as_spam']
    
    def approve_comments(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(
            status='APPROVED',
            moderated_by=request.user,
            moderated_at=timezone.now()
        )
        self.message_user(request, f'{count} comment(s) approved.')
    approve_comments.short_description = 'Approve selected comments'
    
    def reject_comments(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(
            status='REJECTED',
            moderated_by=request.user,
            moderated_at=timezone.now()
        )
        self.message_user(request, f'{count} comment(s) rejected.')
    reject_comments.short_description = 'Reject selected comments'
    
    def mark_as_spam(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(
            status='SPAM',
            moderated_by=request.user,
            moderated_at=timezone.now()
        )
        self.message_user(request, f'{count} comment(s) marked as spam.')
    mark_as_spam.short_description = 'Mark selected comments as spam'


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = (
        'email', 'name', 'status', 'is_verified', 
        'subscribed_at', 'source'
    )
    list_filter = ('status', 'is_verified', 'subscribed_at')
    search_fields = ('email', 'name')
    date_hierarchy = 'subscribed_at'
    ordering = ('-subscribed_at',)
    
    fieldsets = (
        ('Subscriber', {
            'fields': ('email', 'name', 'status')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verification_token', 'verified_at')
        }),
        ('Metadata', {
            'fields': ('subscribed_at', 'unsubscribed_at', 'ip_address', 'source'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('subscribed_at', 'unsubscribed_at', 'verified_at')
    
    actions = ['export_emails']
    
    def export_emails(self, request, queryset):
        """Export selected email addresses"""
        emails = queryset.filter(status='ACTIVE').values_list('email', flat=True)
        email_list = ', '.join(emails)
        self.message_user(request, f'Emails: {email_list}')
@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'order', 'is_active', 'created_at')
    list_filter = ('is_active', 'role')
    search_fields = ('name', 'role', 'bio')
    ordering = ('order', 'name')
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: auto;" />', obj.image.url)
        return "No image"
    image_preview.short_description = 'Preview'


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ('title', 'source_type', 'shelter_name', 'image_preview', 'created_at')
    list_filter = ('source_type', 'created_at')
    search_fields = ('title', 'alt_text', 'shelter_name')
    ordering = ('-created_at',)
    
    def image_preview(self, obj):
        if obj.file:
            return format_html('<img src="{}" style="width: 50px; height: auto;" />', obj.file.url)
        return "No file"
    image_preview.short_description = 'Preview'


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ('key', 'section', 'title', 'is_active', 'updated_at')
    list_filter = ('section', 'is_active')
    search_fields = ('key', 'title', 'content')
    ordering = ('section', 'key')
