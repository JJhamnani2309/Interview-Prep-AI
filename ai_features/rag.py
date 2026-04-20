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

def embed_and_store_resume(user_id, raw_text):
    if not raw_text.strip():
        return False
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = text_splitter.split_text(raw_text)
    
    if splits:
        vectorstore = get_chroma_client()
        vectorstore.add_texts(texts=splits, metadatas=[{"user_id": str(user_id)} for _ in splits])
    return True

def retrieve_context(user_id, query, k=3):
    vectorstore = get_chroma_client()
    docs = vectorstore.similarity_search(query, k=k, filter={"user_id": str(user_id)})
    return "\n\n".join([doc.page_content for doc in docs])
