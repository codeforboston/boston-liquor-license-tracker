import fitz  # pymupdf
import ollama

# Path to the PDF
pdf_path = r"PDFScraper/hearing_minutes.pdf"

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    return text

# Extract text
pdf_text = extract_text_from_pdf(pdf_path)

# Define a prompt for structured output
prompt = "Extract and summarize the restaurant details focusing around liquor licenses including Zip code restricted Licenses, community licenses, and other categories of licenses. Present the information in a structured format with categories including Zip code, type of license, Name, Address, and Contact Information if available."

# Send to Llama 3 with the prompt
response = ollama.chat(
    model="llama3.1",
    messages=[
        {"role": "system", "content": prompt},  # System message guides the model
        {"role": "user", "content": pdf_text[:4000]}  # Truncate if necessary
    ]
)

# Print the response
print(response["message"]["content"])
