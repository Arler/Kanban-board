from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings

import os

# Create your views here.
def get_new_board_form(request):
    html_file = open(os.path.join(settings.TEMPLATES[0]['DIRS'][0], 'board', 'new_board_form.html'), 'r')
    
    return HttpResponse(html_file.read(), content_type='text/html')

def get_board_settings_form(request):
    html_file = open(os.path.join(settings.TEMPLATES[0]['DIRS'][0], 'board', 'board_settings_form.html'), 'r')
    
    return HttpResponse(html_file.read(), content_type='text/html')