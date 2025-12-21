import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
    const { message } = await req.json();
    
    const pythonPath = path.join(process.cwd(), 'AI', 'get_response.py');
    
    const pythonProcess = spawn('python3', [pythonPath, message]);

    return new Promise((resolve) => {
        pythonProcess.stdout.on('data', (data) => {
            resolve(NextResponse.json({ reply: data.toString().trim() }));
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(data.toString());
            resolve(NextResponse.json({ error: "Python error" }, { status: 500 }));
        });
    });
}