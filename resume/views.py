import os
import json
from dotenv import load_dotenv
load_dotenv()

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from resume.models import Resume
from pypdf import PdfReader
from groq import Groq

groq_client = Groq(api_key=os.getenv('GROQ_API_KEY', ''))


def extract_text_from_pdf(file_obj):
    reader = PdfReader(file_obj)
    pages_text = []
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            pages_text.append(extracted)
    return "\n".join(pages_text)


def parse_resume_with_llm(resume_text):
    prompt = f"""
    Extract the following information from the resume text into a valid JSON object.
    Keys required:
    - "name" (string)
    - "skills" (list of strings): Extract ONLY technical and professional skills that are commonly asked about in technical interviews. Include programming languages, frameworks, databases, tools, methodologies, and domain-specific expertise. Do NOT include soft skills like "communication", "teamwork", "leadership", or generic terms like "problem solving". Focus on specific, testable skills.
    - "experience" (list of strings or summary)
    - "education" (list of strings)
    - "difficulty_level" (string: 'Easy', 'Medium', or 'Hard' based on total years of experience: <2 years=Easy, 2-5 years=Medium, >5 years=Hard).
    
    Resume Text:
    {resume_text}
    
    Output strictly JSON and nothing else.
    """
    try:
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0,
            response_format={"type": "json_object"},
        )
        raw_response = completion.choices[0].message.content
        return json.loads(raw_response)
    except Exception as e:
        print(f"Error parsing with Groq: {e}")
        return {}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_resume(request):
    if 'file' not in request.FILES:
        return Response({'error': 'No file uploaded'}, status=400)

    uploaded_file = request.FILES['file']

    if not uploaded_file.name.endswith('.pdf'):
        return Response({'error': 'Only PDF files are supported currently'}, status=400)

    raw_text = extract_text_from_pdf(uploaded_file)

    if not groq_client.api_key:
        return Response({'error': 'GROQ API KEY not configured'}, status=500)

    parsed_data = parse_resume_with_llm(raw_text)

    from ai_features.rag import embed_and_store_resume, delete_user_vectors
    delete_user_vectors(request.user.id)
    embed_and_store_resume(request.user.id, raw_text, parsed_data=parsed_data)

    Resume.objects.update_or_create(
        user=request.user,
        defaults={
            'raw_text': raw_text,
            'parsed_data': parsed_data,
            'filename': uploaded_file.name,
        },
    )

    return Response({
        'message': 'Resume uploaded and parsed successfully',
        'data': parsed_data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_parsed_resume(request):
    try:
        resume = Resume.objects.get(user=request.user)
    except Resume.DoesNotExist:
        return Response({'error': 'No resume found for user'}, status=404)

    return Response({
        'parsed_data': resume.parsed_data,
        'filename': resume.filename,
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_resume(request):
    from ai_features.models import MCQHistory, ATSHistory, HRHistory
    from ai_features.rag import delete_user_vectors

    delete_user_vectors(request.user.id)

    Resume.objects.filter(user=request.user).delete()
    MCQHistory.objects.filter(user=request.user).delete()
    ATSHistory.objects.filter(user=request.user).delete()
    HRHistory.objects.filter(user=request.user).delete()

    return Response({'message': 'All resume data deleted'})
