"""
Entry point for running the Expense Splitter API
Run from backend directory: python run.py
"""
import uvicorn
import dotenv
import os

# Load environment variables
dotenv.load_dotenv()

port = int(os.getenv("PORT", 8000))

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
