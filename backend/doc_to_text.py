import mammoth

def extract_text_from_doc(file_path):
    with open(file_path, "rb") as doc_file:
        result = mammoth.extract_raw_text(doc_file)
        text = result.value  # The extracted text
        return text

# Example usage
file_path = r'C:\\Users\\SURBHI\\Desktop\\interest-rate-swap.docx'
text = extract_text_from_doc(file_path)

if text:
    print(text)
else:
    print("No text found.")
