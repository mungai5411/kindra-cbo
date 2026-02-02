"""
Custom Cloudinary Storage for Public Files
Forces public delivery for specific file types like reports
"""

from cloudinary_storage.storage import MediaCloudinaryStorage


class PublicMediaCloudinaryStorage(MediaCloudinaryStorage):
    """
    Custom storage class that forces public delivery for uploaded files
    Use this for files that should be publicly accessible without authentication
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Override to use 'upload' type instead of 'authenticated'
        # This makes files publicly accessible via their URL
        if hasattr(self, 'TAG'):
            # Don't override if already explicitly set
            pass
        else:
            # Force public delivery
            self.RESOURCE_TYPE = kwargs.get('resource_type', 'auto')
            self.TYPE = 'upload'  # 'upload' = public, 'authenticated' = private
