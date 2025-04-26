from pdf_kv import PDFExtractor
import os

def process_pdf_files():
    try:
        extractor = PDFExtractor()
        files_dir = "files"
        
        if not os.path.exists(files_dir):
            print("Error: files directory not found!")
            return
            
        pdf_files = [f for f in os.listdir(files_dir) if f.lower().endswith('.pdf')]
        
        if not pdf_files:
            print("No PDF files found in the files directory!")
            return
            
        print(f"\nFound {len(pdf_files)} PDF files to process.")
        
        for filename in pdf_files:
            try:
                print(f"\nProcessing {filename}...")
                result = extractor.process_new_document(filename)
                print(f"[OK] {result['message']}")
                print(f"[OK] Files saved in metadata/{result['trade_id']}/")
                print(f"[OK] Version: {result['version']}")
                
                if result['status'] == 'updated':
                    print("[OK] Changes file created with modifications")
                    print(f"[OK] Version history available in metadata/{result['trade_id']}/versions/")
                    
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")
                continue
        
        print("\nAll files processed successfully!")
        
    except Exception as e:
        print(f"Error during processing: {str(e)}")

# if __name__ == "__main__":
#     process_pdf_files()