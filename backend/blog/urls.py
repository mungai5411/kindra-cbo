"""
Blog & Public Campaigns URL Configuration
"""

from django.urls import path
from .views import (
    CategoryListView, TagListView, BlogPostPublicListView, BlogPostPublicDetailView,
    CategoryAdminListCreateView, CategoryAdminDetailView,
    TagAdminListCreateView, TagAdminDetailView,
    BlogPostAdminListCreateView, BlogPostAdminDetailView,
    CommentListView, CommentCreateView, PostLikeView,
    CommentAdminListView, CommentModerationView,
    NewsletterSubscribeView, NewsletterAdminListView,
    delete_blog_post_featured_image, delete_blog_post_og_image,
)

app_name = 'blog'

urlpatterns = [
    # Public endpoints
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('tags/', TagListView.as_view(), name='tag-list'),
    path('posts/', BlogPostPublicListView.as_view(), name='post-list'),
    path('posts/<slug:slug>/', BlogPostPublicDetailView.as_view(), name='post-detail'),
    path('posts/<slug:slug>/like/', PostLikeView.as_view(), name='post-like'),
    path('posts/<slug:post_slug>/comments/', CommentListView.as_view(), name='comment-list'),
    path('comments/create/', CommentCreateView.as_view(), name='comment-create'),
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
    
    # Admin endpoints
    path('admin/categories/', CategoryAdminListCreateView.as_view(), name='admin-category-list'),
    path('admin/categories/<uuid:pk>/', CategoryAdminDetailView.as_view(), name='admin-category-detail'),
    path('admin/tags/', TagAdminListCreateView.as_view(), name='admin-tag-list'),
    path('admin/tags/<uuid:pk>/', TagAdminDetailView.as_view(), name='admin-tag-detail'),
    path('admin/posts/', BlogPostAdminListCreateView.as_view(), name='admin-post-list'),
    path('admin/posts/<uuid:pk>/', BlogPostAdminDetailView.as_view(), name='admin-post-detail'),
    path('admin/comments/', CommentAdminListView.as_view(), name='admin-comment-list'),
    path('admin/comments/<uuid:pk>/moderate/', CommentModerationView.as_view(), name='comment-moderate'),
    path('admin/newsletter/', NewsletterAdminListView.as_view(), name='admin-newsletter-list'),
    
    # Image Management
    path('admin/posts/<uuid:pk>/featured-image/', delete_blog_post_featured_image, name='delete-featured-image'),
    path('admin/posts/<uuid:pk>/og-image/', delete_blog_post_og_image, name='delete-og-image'),
]

