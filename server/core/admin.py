from django.contrib import admin

from .models import Message, Room


class MessageAdmin(admin.ModelAdmin):
    list_display = ('text', 'time')


admin.site.register(Message, MessageAdmin)
admin.site.register(Room)
