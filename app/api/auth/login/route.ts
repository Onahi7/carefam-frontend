import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Attempting login with backend:', `${BACKEND_URL}/api/auth/login`)
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend login error: ${response.status} - ${response.statusText}`)
      console.error('Error response:', errorText)
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Create response with token
    const res = NextResponse.json(data)
    
    // Set HTTP-only cookie with JWT token for security
    if (data.access_token) {
      res.cookies.set('access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })
    }
    
    return res
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}