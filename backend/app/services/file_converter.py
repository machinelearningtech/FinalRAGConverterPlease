import os
import tempfile
from fastapi import UploadFile
from langchain.document_loaders import (
    PyPDFLoader, Docx2txtLoader, UnstructuredPowerPointLoader, 
    UnstructuredExcelLoader, TextLoader, CSVLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter

async def convert_file(file: UploadFile, is_pro: bool) -> dict:
    # Save the uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name

    try:
        # Determine the file type and use the appropriate loader
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension == '.pdf':
            loader = PyPDFLoader(temp_file_path)
        elif file_extension == '.docx':
            loader = Docx2txtLoader(temp_file_path)
        elif file_extension == '.pptx':
            loader = UnstructuredPowerPointLoader(temp_file_path)
        elif file_extension == '.xlsx':
            loader = UnstructuredExcelLoader(temp_file_path)
        elif file_extension == '.txt':
            loader = TextLoader(temp_file_path)
        elif file_extension == '.csv':
            loader = CSVLoader(temp_file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

        # Load the document
        documents = loader.load()

        # Split the document into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        split_docs = text_splitter.split_documents(documents)

        # Process the documents (you can add more processing here)
        result = {
            "filename": file.filename,
            "num_pages": len(documents),
            "num_chunks": len(split_docs),
            "sample_text": split_docs[0].page_content[:200] if split_docs else ""
        }

        return result

    finally:
        # Clean up the temporary file
        os.unlink(temp_file_path)
