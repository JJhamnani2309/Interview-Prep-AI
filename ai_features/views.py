import json
import os
from dotenv import load_dotenv
load_dotenv()

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from resume.models import Resume
from .models import MCQHistory, ATSHistory, HRHistory
from .rag import retrieve_context
from groq import Groq

groq_client = Groq(api_key=os.getenv('GROQ_API_KEY', ''))

LLM_MODEL = "llama-3.1-8b-instant"


def ask_llm(prompt, temperature=0.3):
    completion = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=LLM_MODEL,
        temperature=temperature,
        response_format={"type": "json_object"},
    )
    return json.loads(completion.choices[0].message.content)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_mcqs(request):
    skills = request.data.get('skills', [])
    difficulty = request.data.get('difficulty', 'Medium')

    if not skills:
        return Response({'error': 'Skills are required to generate MCQs'}, status=400)

    context = retrieve_context(request.user.id, f"projects and work experience using {', '.join(skills)}", k=4)
    questions_per_skill = 10
    total_questions = len(skills) * questions_per_skill

    prompt = f"""
    Generate exactly {total_questions} multiple-choice questions for an interview.
    Generate {questions_per_skill} questions for EACH of these skills: {', '.join(skills)}.
    Difficulty level: {difficulty}.
    Use the following applicant context if relevant to personalize some questions:
    {context}
    
    Output exactly a JSON object with a single key "questions" containing a list of {total_questions} objects. Each object should have:
    - "question": string
    - "options": list of 4 strings
    - "correct_answer": string (must exactly match one of the options)
    """

    try:
        result = ask_llm(prompt, temperature=0.3)
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def filter_skills(request):
    """
    Receives a list of candidate skills and a target job role.
    Uses LLM to filter and return only the skills relevant to the given job role.
    """
    job_role = request.data.get('job_role', '')
    skills = request.data.get('skills', [])

    if not job_role or not skills:
        return Response({'error': 'Both job role and skills are required to filter.'}, status=400)

    prompt = f"""
    You are an expert AI recruiting assistant.
    The candidate has the following skills extracted from their resume:
    {', '.join(skills)}
    
    Please filter this list and return ONLY the skills that are highly relevant to the job role: "{job_role}".
    Provide the output in a structured format.
    
    Output exactly a JSON object with a single key "filtered_skills" containing a list of strings representing the relevant skills.
    """

    try:
        result = ask_llm(prompt, temperature=0.1)
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_mcqs(request):
    score = request.data.get('score', 0)
    total = request.data.get('total', 10)
    skills = request.data.get('skills', [])

    MCQHistory.objects.create(
        user=request.user,
        score=score,
        total=total,
        skills=skills,
    )

    return Response({'message': 'Score saved successfully'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_ats(request):
    raw_text = retrieve_context(request.user.id, "skills experience achievements education certifications projects", k=6)

    prompt = f"""
    You are an extremely harsh and brutally honest ATS (Applicant Tracking System) evaluator.
    You score like a real Fortune 500 recruiter who rejects 95% of resumes.
    Start from a base score of 40 and only add points for genuinely impressive content.

    Evaluate the resume below on these criteria and weight them:
    - Measurable achievements & quantified impact with real numbers (30%)
    - Keyword density & relevance for specific tech roles (20%)
    - Work experience quality, depth, and completeness (20%)
    - Clean formatting, no template/placeholder text (15%)
    - Education, certifications & project relevance (15%)

    STRICT DEDUCTION RULES:
    - Any placeholder text like "[Company]", "Describe your", "e.g.", "[Club Name]" → deduct 20 points
    - Missing quantified results (numbers, percentages, metrics) in ANY experience bullet → deduct 15 points
    - Generic soft skills with no proof (e.g. "team player", "hard worker") → deduct 10 points
    - Vague job descriptions without specific technologies or tools → deduct 10 points
    - No action verbs starting bullet points → deduct 5 points per occurrence
    - Resume longer than 2 pages or poorly structured → deduct 10 points
    - Missing LinkedIn, GitHub, or portfolio for tech roles → deduct 5 points
    - Spelling or grammar errors → deduct 5 points each
    - Gaps in employment with no explanation → deduct 5 points
    - Score above 70 is reserved for truly exceptional resumes with strong metrics
    - Score above 85 should be almost never given
    - Be ruthless. Most average resumes should score between 35-55.

    Resume:
    {raw_text}

    Return ONLY a valid JSON object, no explanation. Provide at least 5 actionable tips:
    {{"score": integer, "tips": ["tip1", "tip2", ...]}}
    """

    try:
        result = ask_llm(prompt, temperature=0.2)

        ATSHistory.objects.create(
            user=request.user,
            score=result.get('score', 0),
            tips=result.get('tips', []),
        )

        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hr_question(request):
    resume_snippet = retrieve_context(request.user.id, "work experience internship projects achievements challenges responsibilities", k=3)

    prompt = f"""
    Ask one challenging HR mock interview question for a candidate. 
    Make it behavioral or situational.
    Context from their resume:
    {resume_snippet}
    
    Return exactly JSON: {{"question": "the question string"}}
    """

    try:
        result = ask_llm(prompt, temperature=0.7)
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hr_submit(request):
    question = request.data.get('question', '')
    answer = request.data.get('answer', '')

    if not answer or not question:
        return Response({'error': 'Missing question or answer'}, status=400)

    prompt = f"""
    A candidate was asked this HR question: "{question}"
    They provided this answer: "{answer}"
    
    Evaluate the answer from 0-10. Provide constructive feedback.
    Return exactly JSON: {{"score": integer, "feedback": "string"}}
    """

    try:
        result = ask_llm(prompt, temperature=0.2)

        HRHistory.objects.create(
            user=request.user,
            question=question,
            answer=answer,
            score=result.get('score', 0),
            feedback=result.get('feedback', ''),
        )

        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
