"""
Image Upload Utilities
Shared functions for image validation, processing, and deletion
"""

from django.core.files.uploadedfile import UploadedFile
from django.conf import settings
from rest_framework import serializers
from PIL import Image
import cloudinary.uploader
import io


def validate_image_file(file: UploadedFile, max_size_mb: int = 10, allowed_formats: list = None) -> None:
    """
    Validate uploaded image file
    
    Args:
        file: Uploaded file object
        max_size_mb: Maximum file size in MB
        allowed_formats: List of allowed image formats (default: ['JPEG', 'PNG', 'GIF', 'WEBP'])
    
    Raises:
        serializers.ValidationError: If validation fails
    """
    if allowed_formats is None:
        allowed_formats = ['JPEG', 'PNG', 'GIF', 'WEBP', 'JPG']
    
    # Check file size
    max_bytes = max_size_mb * 1024 * 1024
    if file.size > max_bytes:
        raise serializers.ValidationError(
            f'Image file too large. Maximum size is {max_size_mb}MB. '
            f'Your file is {file.size / (1024 * 1024):.2f}MB.'
        )
    
    # Check file type
    content_type = getattr(file, 'content_type', '')
    if content_type and not content_type.startswith('image/'):
        raise serializers.ValidationError(
            f'Invalid file type: {content_type}. Only image files are allowed.'
        )
    
    # Validate image format using PIL
    try:
        image = Image.open(file)
        image.verify()
        
        if image.format not in allowed_formats:
            raise serializers.ValidationError(
                f'Unsupported image format: {image.format}. '
                f'Allowed formats: {", ".join(allowed_formats)}'
            )
        
        # Reset file pointer after verification
        file.seek(0)
        
    except Exception as e:
        raise serializers.ValidationError(f'Invalid or corrupted image file: {str(e)}')


def delete_cloudinary_image(image_url: str) -> bool:
    """
    Delete image from Cloudinary storage
    
    Args:
        image_url: Full Cloudinary image URL
    
    Returns:
        bool: True if deletion successful, False otherwise
    """
    if not image_url:
        return False
    
    try:
        # Extract public_id from Cloudinary URL
        # Example URL: https://res.cloudinary.com/.../image/upload/v123456/folder/filename.jpg
        # We need to extract: folder/filename (without extension)
        
        parts = image_url.split('/upload/')
        if len(parts) < 2:
            return False
        
        # Get the path after /upload/
        path_after_upload = parts[1]
        
        # Remove version if present (v123456/)
        path_parts = path_after_upload.split('/')
        if path_parts[0].startswith('v'):
            path_parts = path_parts[1:]
        
        # Join back and remove file extension
        public_id = '/'.join(path_parts).rsplit('.', 1)[0]
        
        # Delete from Cloudinary
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
        
    except Exception as e:
        print(f'Error deleting image from Cloudinary: {str(e)}')
        return False


def generate_thumbnail(image_file: UploadedFile, size: tuple = (300, 300)) -> bytes:
    """
    Generate a thumbnail from uploaded image
    
    Args:
        image_file: Uploaded image file
        size: Tuple of (width, height) for thumbnail
    
    Returns:
        bytes: Thumbnail image data
    """
    try:
        image = Image.open(image_file)
        image.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = io.BytesIO()
        image.save(output, format=image.format or 'JPEG')
        output.seek(0)
        
        return output.getvalue()
        
    except Exception as e:
        print(f'Error generating thumbnail: {str(e)}')
        return None
