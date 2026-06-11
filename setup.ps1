Write-Host "Setting up Client..."
npx -y create-vite@latest client --template react
Set-Location -Path "client"
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom chart.js react-chartjs-2 lucide-react clsx tailwind-merge
Set-Location -Path ".."

Write-Host "Setting up Server..."
New-Item -ItemType Directory -Force -Path "server"
Set-Location -Path "server"
python -m venv venv
.\venv\Scripts\python.exe -m pip install fastapi uvicorn motor pydantic[email] passlib[bcrypt] python-jose python-multipart opencv-python mediapipe numpy python-dotenv
Write-Host "Setup complete."
