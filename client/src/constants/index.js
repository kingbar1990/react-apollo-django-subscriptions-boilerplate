export const BACKEND_URL = 'http://localhost:8000'
export const MEDIA_URL = '/media/'
export const FRONTEND_URL = 'http://localhost:3000'
export const TOKEN = 'token'
export const MIN_PASSWORD_LENGTH = 8
export const DATA_PER_PAGE = 10
export const IMAGE_TYPES = [
    'gif', 
    'jpg',
    'jpeg',
    'pjpeg',
    'png',
    'svg+xml',
    'tiff',
    'vnd.microsoft.icon',
    'vnd.wap.wbmp',
    'webp'
]
export const VIDEO_TYPES = [
    'webm',
    'ogg',
    'mp4',
    'avi',
    'mov',
    'mpg',
    'mpeg',
    '3gp'
]
export const VIDEO_REGULAR_LINKS = {
    'youtube': /youtube.com\/watch\?v=\w+(&\S*)?/gi
}