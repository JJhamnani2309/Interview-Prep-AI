import os
from langchain_text_splitters import RecursiveCharacterTextSplitter

_embedding_function = None
_chroma_module = None

def get_embedding_function():
    global _embedding_function
    if _embedding_function is None:
        from langchain_community.embeddings import HuggingFaceEmbeddings
        _embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return _embedding_function

def get_chroma_class():
    global _chroma_module
    if _chroma_module is None:
        from langchain_community.vectorstores import Chroma
        _chroma_module = Chroma
    return _chroma_module

def get_chroma_client():
    db_path = os.path.join(os.getcwd(), 'chroma_db')
    Chroma = get_chroma_class()
    return Chroma(persist_directory=db_path, embedding_function=get_embedding_function())

def delete_user_vectors(user_id):
    vectorstore = get_chroma_client()
    collection = vectorstore._collection
    results = collection.get(where={"user_id": str(user_id)})
    if results and results['ids']:
        collection.delete(ids=results['ids'])

def embed_and_store_resume(user_id, raw_text, parsed_data=None):
    if not raw_text.strip():
        return False
        
    vectorstore = get_chroma_client()
    texts_to_add = []
    metadatas_to_add = []
    
    if parsed_data:
        # Skills
        skills = parsed_data.get('skills', [])
        if skills:
            texts_to_add.append("Skills: " + ", ".join(skills))
            metadatas_to_add.append({"user_id": str(user_id), "section": "skills"})
            
        # Experience
        experience = parsed_data.get('experience', [])
        if isinstance(experience, list):
            for exp in experience:
                if isinstance(exp, str):
                    texts_to_add.append(exp)
                    metadatas_to_add.append({"user_id": str(user_id), "section": "experience"})
                elif isinstance(exp, dict):
                    texts_to_add.append(str(exp))
                    metadatas_to_add.append({"user_id": str(user_id), "section": "experience"})
        elif isinstance(experience, str):
            texts_to_add.append(experience)
            metadatas_to_add.append({"user_id": str(user_id), "section": "experience"})
            
        # Education
        education = parsed_data.get('education', [])
        if isinstance(education, list):
            for edu in education:
                if isinstance(edu, str):
                    texts_to_add.append(edu)
                    metadatas_to_add.append({"user_id": str(user_id), "section": "education"})
                elif isinstance(edu, dict):
                    texts_to_add.append(str(edu))
                    metadatas_to_add.append({"user_id": str(user_id), "section": "education"})
        elif isinstance(education, str):
            texts_to_add.append(education)
            metadatas_to_add.append({"user_id": str(user_id), "section": "education"})

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = text_splitter.split_text(raw_text)
    
    for split in splits:
        texts_to_add.append(split)
        metadatas_to_add.append({"user_id": str(user_id), "section": "raw"})
    
    if texts_to_add:
        vectorstore.add_texts(texts=texts_to_add, metadatas=metadatas_to_add)
    return True

def retrieve_context(user_id, query, k=3, section=None):
    vectorstore = get_chroma_client()
    filter_dict = {"user_id": str(user_id)}
    if section:
        filter_dict["section"] = section
    docs = vectorstore.similarity_search(query, k=k, filter=filter_dict)
    return "\n\n".join([doc.page_content for doc in docs])
